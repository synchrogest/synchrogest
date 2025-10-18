
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.dependencies.get_db import get_db
from app.services.auth import get_current_active_user # Importar função de autenticação
from app.models.usuario import Usuario as UsuarioModel
from app.models.projeto import Projeto as ProjetoModel
from app.models.projeto_colaborador import ProjetoColaborador as ProjetoColaboradorModel
from app.models.projeto_produto import ProjetoProduto as ProjetoProdutoModel
from app.schemas import projeto as schemas_projeto # Importar schemas de projeto
# from app.schemas import projeto as schemas_projeto
from app.schemas import usuario as schemas_usuario # Importar schemas de usuário para o current_user

# router = APIRouter(
#     prefix="/projetos",
#     tags=["projetos"],
#     dependencies=[Depends(get_current_active_user)], # Adicionar dependência de autenticação
#     responses={404: {"description": "Not found"}},
# )

router = APIRouter(
    tags=["projetos"],
    dependencies=[Depends(get_current_active_user)],
    responses={404: {"description": "Not found"}},
)


# --- CRUD Projetos --- 

@router.post("/", response_model=schemas_projeto.Projeto, status_code=status.HTTP_201_CREATED)
def criar_projeto(
    projeto: schemas_projeto.ProjetoCreate,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    # Verificar se o usuário responsável existe
    responsavel = db.query(UsuarioModel).filter(UsuarioModel.id == projeto.responsavel_id).first()
    if not responsavel:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário responsável não encontrado")

    db_projeto = ProjetoModel(**projeto.model_dump())
    db.add(db_projeto)
    db.commit()
    db.refresh(db_projeto)
    return db_projeto

@router.get("/", response_model=List[schemas_projeto.Projeto])
def listar_projetos(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    responsavel_id: Optional[int] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    query = db.query(ProjetoModel)
    if status:
        query = query.filter(ProjetoModel.status == status)
    if responsavel_id:
        query = query.filter(ProjetoModel.responsavel_id == responsavel_id)
    if data_inicio:
        query = query.filter(ProjetoModel.data_inicio >= data_inicio)
    if data_fim:
        query = query.filter(ProjetoModel.data_fim <= data_fim)
        
    projetos = query.offset(skip).limit(limit).all()
    return projetos

@router.get("/{projeto_id}", response_model=schemas_projeto.Projeto)
def ler_projeto(
    projeto_id: int,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if db_projeto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
    return db_projeto

@router.put("/{projeto_id}", response_model=schemas_projeto.Projeto)
def atualizar_projeto(
    projeto_id: int,
    projeto: schemas_projeto.ProjetoUpdate,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if db_projeto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")

    # Verificar se o usuário responsável existe (se for alterado)
    if projeto.responsavel_id and projeto.responsavel_id != db_projeto.responsavel_id:
        responsavel = db.query(UsuarioModel).filter(UsuarioModel.id == projeto.responsavel_id).first()
        if not responsavel:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Novo usuário responsável não encontrado")

    update_data = projeto.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_projeto, key, value)

    db.add(db_projeto)
    db.commit()
    db.refresh(db_projeto)
    return db_projeto

@router.delete("/{projeto_id}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_projeto(
    projeto_id: int,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    # Apenas admin pode deletar?
    if current_user.nivel_acesso != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas administradores podem excluir projetos")
        
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if db_projeto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
    
    # Opcional: Deletar relações (colaboradores, produtos) antes ou configurar cascade no DB
    db.query(ProjetoColaboradorModel).filter(ProjetoColaboradorModel.projeto_id == projeto_id).delete()
    db.query(ProjetoProdutoModel).filter(ProjetoProdutoModel.projeto_id == projeto_id).delete()
    
    db.delete(db_projeto)
    db.commit()
    return

# --- Gerenciamento de Colaboradores --- 

@router.post("/{projeto_id}/colaboradores", response_model=schemas_projeto.ProjetoColaborador, status_code=status.HTTP_201_CREATED)
def adicionar_colaborador_projeto(
    projeto_id: int,
    colaborador: schemas_projeto.ProjetoColaboradorCreate,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if db_projeto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")

    db_usuario = db.query(UsuarioModel).filter(UsuarioModel.id == colaborador.usuario_id).first()
    if db_usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado")

    # Verificar se já é colaborador
    db_colaborador_existente = db.query(ProjetoColaboradorModel).filter(
        ProjetoColaboradorModel.projeto_id == projeto_id,
        ProjetoColaboradorModel.usuario_id == colaborador.usuario_id
    ).first()
    if db_colaborador_existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Usuário já é colaborador deste projeto")

    db_colaborador = ProjetoColaboradorModel(projeto_id=projeto_id, usuario_id=colaborador.usuario_id)
    db.add(db_colaborador)
    db.commit()
    db.refresh(db_colaborador)
    return db_colaborador

@router.get("/{projeto_id}/colaboradores", response_model=List[schemas_projeto.ProjetoColaborador])
async def listar_colaboradores_projeto(
    projeto_id: int,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if db_projeto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
    
    colaboradores = db.query(ProjetoColaboradorModel).filter(ProjetoColaboradorModel.projeto_id == projeto_id).all()
    return colaboradores

@router.delete("/{projeto_id}/colaboradores/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_colaborador_projeto(
    projeto_id: int,
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    db_colaborador = db.query(ProjetoColaboradorModel).filter(
        ProjetoColaboradorModel.projeto_id == projeto_id,
        ProjetoColaboradorModel.usuario_id == usuario_id
    ).first()

    if db_colaborador is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Colaborador não encontrado neste projeto")

    # Verificar se não está tentando remover o responsável
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if db_projeto and db_projeto.responsavel_id == usuario_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não é possível remover o responsável pelo projeto")

    db.delete(db_colaborador)
    db.commit()
    return

# --- Gerenciamento de Produtos no Projeto --- 

@router.post("/{projeto_id}/produtos", response_model=schemas_projeto.ProjetoProduto, status_code=status.HTTP_201_CREATED)
def adicionar_produto_projeto(
    projeto_id: int,
    produto_projeto: schemas_projeto.ProjetoProdutoCreate,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if db_projeto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")

    # Verificar se o produto existe (opcional, mas recomendado)
    # db_produto = db.query(ProdutoModel).filter(ProdutoModel.id == produto_projeto.produto_id).first()
    # if db_produto is None:
    #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")

    # Verificar se o produto já está no projeto (poderia atualizar quantidade em vez de erro?)
    db_produto_existente = db.query(ProjetoProdutoModel).filter(
        ProjetoProdutoModel.projeto_id == projeto_id,
        ProjetoProdutoModel.produto_id == produto_projeto.produto_id
    ).first()
    if db_produto_existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Produto já associado a este projeto")

    db_produto_projeto = ProjetoProdutoModel(
        projeto_id=projeto_id,
        **produto_projeto.model_dump()
    )
    db.add(db_produto_projeto)
    db.commit()
    db.refresh(db_produto_projeto)
    return db_produto_projeto

@router.get("/{projeto_id}/produtos", response_model=List[schemas_projeto.ProjetoProduto])
def listar_produtos_projeto(
    projeto_id: int,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    db_projeto = db.query(ProjetoModel).filter(ProjetoModel.id == projeto_id).first()
    if db_projeto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projeto não encontrado")
        
    produtos_projeto = db.query(ProjetoProdutoModel).filter(ProjetoProdutoModel.projeto_id == projeto_id).all()
    return produtos_projeto

@router.delete("/{projeto_id}/produtos/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_produto_projeto(
    projeto_id: int,
    produto_id: int,
    db: Session = Depends(get_db),
    current_user: schemas_usuario.Usuario = Depends(get_current_active_user)
):
    db_produto_projeto = db.query(ProjetoProdutoModel).filter(
        ProjetoProdutoModel.projeto_id == projeto_id,
        ProjetoProdutoModel.produto_id == produto_id
    ).first()

    if db_produto_projeto is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado neste projeto")

    db.delete(db_produto_projeto)
    db.commit()
    return

# print("DEBUG: Router de projetos carregado e processado.")

# @router.get("/stats", response_model=schemas_projeto.ProjetoStats)
# @router.get("/stats", response_model=schemas_projeto.ProjetoDashboardStats)
# async def get_projeto_dashboard_stats(
#     current_user: schemas_usuario.Usuario = Depends(get_current_active_user),
#     db: Session = Depends(get_db)
# ):
#     """
#     Retorna estatísticas sobre os projetos.
#     """
#     total_projetos_ativos = db.query(ProjetoModel).filter(ProjetoModel.status == "em_andamento").count()
#     # return schemas_projeto.ProjetoStats(total_projetos_ativos=total_projetos_ativos)
#     return schemas_projeto.ProjetoDashboardStats(total_projetos_ativos=total_projetos_ativos)