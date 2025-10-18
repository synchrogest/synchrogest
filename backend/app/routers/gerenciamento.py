from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional
from datetime import datetime
from fastapi.security import OAuth2PasswordBearer
from fastapi.security.oauth2 import OAuth2
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from starlette.requests import Request
from starlette.status import HTTP_401_UNAUTHORIZED
from fastapi.security.utils import get_authorization_scheme_param

from app.database import get_db
from app.models import gerenciamento as models
from app.schemas import gerenciamento as schemas
from app.services.auth import get_current_active_user, check_admin_user as get_current_admin_user
from app.models.usuario import Usuario

# Classe para OAuth2 opcional (não exige autenticação)
class OAuth2PasswordBearerOptional(OAuth2):
    def __init__(self, tokenUrl: str, auto_error: bool = False):
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": {}})
        super().__init__(flows=flows, auto_error=auto_error)

    async def __call__(self, request: Request):
        authorization = request.headers.get("Authorization")
        scheme, param = get_authorization_scheme_param(authorization)
        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=HTTP_401_UNAUTHORIZED,
                    detail="Not authenticated",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            else:
                return None
        return param

# Instância do esquema OAuth2 opcional
oauth2_scheme_optional = OAuth2PasswordBearerOptional(tokenUrl="token", auto_error=False)

# Função para obter usuário atual de forma opcional
def get_current_user_optional(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme_optional)
):
    """Versão opcional do get_current_user que não lança exceção se o token não for fornecido"""
    if not token:
        return None
    try:
        return get_current_active_user(db=db, token=token)
    except:
        return None

# Configuração do router sem dependência global de autenticação
router = APIRouter(
    tags=["gerenciamento"],
    # Removida a dependência global para permitir acesso público a algumas rotas
    # dependencies=[Depends(get_current_active_user)],
    responses={404: {"description": "Not found"}},
)

# Funções auxiliares
def calcular_status_gerenciamento(db: Session, gerenciamento_id: int):
    """Calcula o status do gerenciamento baseado nos checklists concluídos vs. total de checklists ativos"""
    # Buscar todos os checklists ativos
    checklists = db.query(models.GerenciamentoChecklist).join(
        models.GerenciamentoItem, models.GerenciamentoItem.id == models.GerenciamentoChecklist.item_id
    ).filter(
        models.GerenciamentoItem.gerenciamento_id == gerenciamento_id,
        models.GerenciamentoChecklist.ativo == True
    ).all()
    
    if not checklists:
        return 0.0
    
    # Contar checklists concluídos
    concluidos = sum(1 for c in checklists if c.concluido)
    
    # Calcular porcentagem
    status = concluidos / len(checklists)
    
    # Atualizar o status no gerenciamento
    gerenciamento = db.query(models.Gerenciamento).filter(models.Gerenciamento.id == gerenciamento_id).first()
    if gerenciamento:
        gerenciamento.status = status
        db.commit()
    
    return status

def verificar_permissao_edicao(db: Session, gerenciamento_id: int, usuario_id: int):
    """Verifica se o usuário tem permissão para editar o gerenciamento"""
    # Administradores sempre têm permissão
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    # if usuario and usuario.is_admin:
    if usuario and usuario.nivel_acesso == "admin":
        return True
    
    # Verificar se é o criador
    gerenciamento = db.query(models.Gerenciamento).filter(models.Gerenciamento.id == gerenciamento_id).first()
    if gerenciamento and gerenciamento.criado_por == usuario_id:
        return True
    
    # Verificar permissões específicas
    permissao = db.query(models.GerenciamentoPermissao).filter(
        models.GerenciamentoPermissao.gerenciamento_id == gerenciamento_id,
        models.GerenciamentoPermissao.usuario_id == usuario_id,
        models.GerenciamentoPermissao.pode_editar == True
    ).first()
    
    return permissao is not None

# Rotas para Gerenciamento
@router.post("/", response_model=schemas.Gerenciamento)
def criar_gerenciamento(
    gerenciamento: schemas.GerenciamentoCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Cria um novo gerenciamento"""
    try:
        db_gerenciamento = models.Gerenciamento(
            **gerenciamento.dict(),
            criado_por=current_user.id,
            data_criacao=datetime.now()
        )
        db.add(db_gerenciamento)
        db.commit()
        db.refresh(db_gerenciamento)
        return db_gerenciamento
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao criar gerenciamento: {str(e)}"
        )

@router.get("/", response_model=List[schemas.Gerenciamento])
def listar_gerenciamentos(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: Optional[Usuario] = Depends(get_current_user_optional)  # Autenticação opcional
):
    """Lista todos os gerenciamentos"""
    # Se o usuário não estiver autenticado, mostrar apenas gerenciamentos públicos
    if not current_user:
        return db.query(models.Gerenciamento).filter(models.Gerenciamento.publico == True).offset(skip).limit(limit).all()
    
    # Se for admin, mostrar todos
    if current_user.is_admin:
        return db.query(models.Gerenciamento).offset(skip).limit(limit).all()
    
    # Usuários comuns veem seus próprios gerenciamentos e os que têm permissão
    return db.query(models.Gerenciamento).filter(
        (models.Gerenciamento.criado_por == current_user.id) | 
        (models.Gerenciamento.id.in_(
            db.query(models.GerenciamentoPermissao.gerenciamento_id).filter(
                models.GerenciamentoPermissao.usuario_id == current_user.id
            )
        )) |
        (models.Gerenciamento.publico == True)  # Também mostrar os públicos
    ).offset(skip).limit(limit).all()

@router.get("/{gerenciamento_id}", response_model=schemas.GerenciamentoCompleto)
def obter_gerenciamento(
    gerenciamento_id: int, 
    db: Session = Depends(get_db),
    current_user: Optional[Usuario] = Depends(get_current_user_optional)  # Autenticação opcional
):
    """Obtém um gerenciamento específico com todos os detalhes"""
    gerenciamento = db.query(models.Gerenciamento).filter(models.Gerenciamento.id == gerenciamento_id).first()
    if not gerenciamento:
        raise HTTPException(status_code=404, detail="Gerenciamento não encontrado")
    
    # Se o gerenciamento for público, permitir acesso sem autenticação
    if gerenciamento.publico:
        return gerenciamento
    
    # Se não for público, verificar autenticação
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticação necessária para acessar este gerenciamento"
        )
    
    # Verificar se o usuário tem acesso
    if not current_user.is_admin and gerenciamento.criado_por != current_user.id:
        permissao = db.query(models.GerenciamentoPermissao).filter(
            models.GerenciamentoPermissao.gerenciamento_id == gerenciamento_id,
            models.GerenciamentoPermissao.usuario_id == current_user.id
        ).first()
        if not permissao:
            raise HTTPException(status_code=403, detail="Acesso negado a este gerenciamento")
    
    return gerenciamento

@router.put("/{gerenciamento_id}", response_model=schemas.Gerenciamento)
def atualizar_gerenciamento(
    gerenciamento_id: int, 
    gerenciamento_update: schemas.GerenciamentoUpdate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Atualiza um gerenciamento existente"""
    db_gerenciamento = db.query(models.Gerenciamento).filter(models.Gerenciamento.id == gerenciamento_id).first()
    if not db_gerenciamento:
        raise HTTPException(status_code=404, detail="Gerenciamento não encontrado")
    
    # Verificar permissão
    if not verificar_permissao_edicao(db, gerenciamento_id, current_user.id):
        raise HTTPException(status_code=403, detail="Sem permissão para editar este gerenciamento")
    
    # Atualizar campos
    update_data = gerenciamento_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_gerenciamento, key, value)
    
    try:
        db.commit()
        db.refresh(db_gerenciamento)
        return db_gerenciamento
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar gerenciamento: {str(e)}"
        )

@router.delete("/{gerenciamento_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_gerenciamento(
    gerenciamento_id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Exclui um gerenciamento"""
    db_gerenciamento = db.query(models.Gerenciamento).filter(models.Gerenciamento.id == gerenciamento_id).first()
    if not db_gerenciamento:
        raise HTTPException(status_code=404, detail="Gerenciamento não encontrado")
    
    # Apenas o criador ou administradores podem excluir
    if not current_user.is_admin and db_gerenciamento.criado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para excluir este gerenciamento")
    
    try:
        db.delete(db_gerenciamento)
        db.commit()
        return None
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir gerenciamento: {str(e)}"
        )

# Rotas para Itens
@router.post("/{gerenciamento_id}/itens", response_model=schemas.GerenciamentoItem)
def adicionar_item(
    gerenciamento_id: int, 
    item: schemas.GerenciamentoItemCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Adiciona um novo item ao gerenciamento"""
    # Verificar se o gerenciamento existe
    gerenciamento = db.query(models.Gerenciamento).filter(models.Gerenciamento.id == gerenciamento_id).first()
    if not gerenciamento:
        raise HTTPException(status_code=404, detail="Gerenciamento não encontrado")
    
    # Verificar permissão
    if not verificar_permissao_edicao(db, gerenciamento_id, current_user.id):
        raise HTTPException(status_code=403, detail="Sem permissão para editar este gerenciamento")
    
    try:
        # Criar o item
        db_item = models.GerenciamentoItem(**item.dict(), gerenciamento_id=gerenciamento_id)
        db.add(db_item)
        db.commit()
        db.refresh(db_item)
        
        # Criar checklists para cada ação existente
        acoes = db.query(models.GerenciamentoAcao).filter(
            models.GerenciamentoAcao.gerenciamento_id == gerenciamento_id
        ).all()
        
        for acao in acoes:
            checklist = models.GerenciamentoChecklist(
                item_id=db_item.id,
                acao_id=acao.id,
                ativo=True
            )
            db.add(checklist)
        
        db.commit()
        db.refresh(db_item)
        return db_item
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar item: {str(e)}"
        )

@router.put("/{gerenciamento_id}/itens/{item_id}", response_model=schemas.GerenciamentoItem)
def atualizar_item(
    gerenciamento_id: int,
    item_id: int,
    item_update: schemas.GerenciamentoItemUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Atualiza um item existente"""
    # Verificar permissão
    if not verificar_permissao_edicao(db, gerenciamento_id, current_user.id):
        raise HTTPException(status_code=403, detail="Sem permissão para editar este gerenciamento")
    
    # Buscar o item
    db_item = db.query(models.GerenciamentoItem).filter(
        models.GerenciamentoItem.id == item_id,
        models.GerenciamentoItem.gerenciamento_id == gerenciamento_id
    ).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    # Atualizar campos
    update_data = item_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
    
    try:
        db.commit()
        db.refresh(db_item)
        return db_item
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar item: {str(e)}"
        )

@router.delete("/{gerenciamento_id}/itens/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_item(
    gerenciamento_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Exclui um item"""
    # Verificar permissão
    if not verificar_permissao_edicao(db, gerenciamento_id, current_user.id):
        raise HTTPException(status_code=403, detail="Sem permissão para editar este gerenciamento")
    
    # Buscar o item
    db_item = db.query(models.GerenciamentoItem).filter(
        models.GerenciamentoItem.id == item_id,
        models.GerenciamentoItem.gerenciamento_id == gerenciamento_id
    ).first()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    try:
        db.delete(db_item)
        db.commit()
        
        # Recalcular o status do gerenciamento
        calcular_status_gerenciamento(db, gerenciamento_id)
        
        return None
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir item: {str(e)}"
        )

# Rotas para Ações
@router.post("/{gerenciamento_id}/acoes", response_model=schemas.GerenciamentoAcao)
def adicionar_acao(
    gerenciamento_id: int, 
    acao: schemas.GerenciamentoAcaoCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Adiciona uma nova ação ao gerenciamento"""
    # Verificar se o gerenciamento existe
    gerenciamento = db.query(models.Gerenciamento).filter(models.Gerenciamento.id == gerenciamento_id).first()
    if not gerenciamento:
        raise HTTPException(status_code=404, detail="Gerenciamento não encontrado")
    
    # Verificar permissão
    if not verificar_permissao_edicao(db, gerenciamento_id, current_user.id):
        raise HTTPException(status_code=403, detail="Sem permissão para editar este gerenciamento")
    
    try:
        # Criar a ação
        db_acao = models.GerenciamentoAcao(**acao.dict(), gerenciamento_id=gerenciamento_id)
        db.add(db_acao)
        db.commit()
        db.refresh(db_acao)
        
        # Criar checklists para cada item existente
        itens = db.query(models.GerenciamentoItem).filter(
            models.GerenciamentoItem.gerenciamento_id == gerenciamento_id
        ).all()
        
        for item in itens:
            checklist = models.GerenciamentoChecklist(
                item_id=item.id,
                acao_id=db_acao.id,
                ativo=True
            )
            db.add(checklist)
        
        db.commit()
        db.refresh(db_acao)
        return db_acao
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar ação: {str(e)}"
        )

@router.put("/{gerenciamento_id}/acoes/{acao_id}", response_model=schemas.GerenciamentoAcao)
def atualizar_acao(
    gerenciamento_id: int,
    acao_id: int,
    acao_update: schemas.GerenciamentoAcaoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Atualiza uma ação existente"""
    # Verificar permissão
    if not verificar_permissao_edicao(db, gerenciamento_id, current_user.id):
        raise HTTPException(status_code=403, detail="Sem permissão para editar este gerenciamento")
    
    # Buscar a ação
    db_acao = db.query(models.GerenciamentoAcao).filter(
        models.GerenciamentoAcao.id == acao_id,
        models.GerenciamentoAcao.gerenciamento_id == gerenciamento_id
    ).first()
    
    if not db_acao:
        raise HTTPException(status_code=404, detail="Ação não encontrada")
    
    # Atualizar campos
    update_data = acao_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_acao, key, value)
    
    try:
        db.commit()
        db.refresh(db_acao)
        return db_acao
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar ação: {str(e)}"
        )

@router.delete("/{gerenciamento_id}/acoes/{acao_id}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_acao(
    gerenciamento_id: int,
    acao_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Exclui uma ação"""
    # Verificar permissão
    if not verificar_permissao_edicao(db, gerenciamento_id, current_user.id):
        raise HTTPException(status_code=403, detail="Sem permissão para editar este gerenciamento")
    
    # Buscar a ação
    db_acao = db.query(models.GerenciamentoAcao).filter(
        models.GerenciamentoAcao.id == acao_id,
        models.GerenciamentoAcao.gerenciamento_id == gerenciamento_id
    ).first()
    
    if not db_acao:
        raise HTTPException(status_code=404, detail="Ação não encontrada")
    
    try:
        db.delete(db_acao)
        db.commit()
        
        # Recalcular o status do gerenciamento
        calcular_status_gerenciamento(db, gerenciamento_id)
        
        return None
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao excluir ação: {str(e)}"
        )

# Rotas para Checklists
@router.put("/{gerenciamento_id}/checklists/{checklist_id}", response_model=schemas.GerenciamentoChecklist)
def atualizar_checklist(
    gerenciamento_id: int,
    checklist_id: int,
    checklist_update: schemas.GerenciamentoChecklistUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Atualiza um checklist existente"""
    # Verificar permissão
    if not verificar_permissao_edicao(db, gerenciamento_id, current_user.id):
        raise HTTPException(status_code=403, detail="Sem permissão para editar este gerenciamento")
    
    # Buscar o checklist
    db_checklist = db.query(models.GerenciamentoChecklist).join(
        models.GerenciamentoItem, models.GerenciamentoItem.id == models.GerenciamentoChecklist.item_id
    ).filter(
        models.GerenciamentoChecklist.id == checklist_id,
        models.GerenciamentoItem.gerenciamento_id == gerenciamento_id
    ).first()
    
    if not db_checklist:
        raise HTTPException(status_code=404, detail="Checklist não encontrado")
    
    # Atualizar campos
    update_data = checklist_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_checklist, key, value)
    
    # Se estiver marcando como concluído, registrar data e usuário
    if 'concluido' in update_data and update_data['concluido']:
        db_checklist.data_conclusao = datetime.now()
        db_checklist.concluido_por = current_user.id
    
    try:
        db.commit()
        db.refresh(db_checklist)
        
        # Recalcular o status do gerenciamento
        calcular_status_gerenciamento(db, gerenciamento_id)
        
        return db_checklist
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao atualizar checklist: {str(e)}"
        )

# Rotas para Permissões
@router.post("/{gerenciamento_id}/permissoes", response_model=schemas.GerenciamentoPermissao)
def adicionar_permissao(
    gerenciamento_id: int,
    permissao: schemas.GerenciamentoPermissaoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Adiciona uma nova permissão ao gerenciamento"""
    # Verificar se o gerenciamento existe
    gerenciamento = db.query(models.Gerenciamento).filter(models.Gerenciamento.id == gerenciamento_id).first()
    if not gerenciamento:
        raise HTTPException(status_code=404, detail="Gerenciamento não encontrado")
    
    # Apenas o criador ou administradores podem gerenciar permissões
    if not current_user.is_admin and gerenciamento.criado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para gerenciar permissões deste gerenciamento")
    
    # Verificar se o usuário existe
    usuario = db.query(Usuario).filter(Usuario.id == permissao.usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    # Verificar se já existe permissão para este usuário
    permissao_existente = db.query(models.GerenciamentoPermissao).filter(
        models.GerenciamentoPermissao.gerenciamento_id == gerenciamento_id,
        models.GerenciamentoPermissao.usuario_id == permissao.usuario_id
    ).first()
    
    if permissao_existente:
        # Atualizar permissão existente
        permissao_existente.pode_editar = permissao.pode_editar
        db.commit()
        db.refresh(permissao_existente)
        return permissao_existente
    
    try:
        # Criar nova permissão
        db_permissao = models.GerenciamentoPermissao(
            gerenciamento_id=gerenciamento_id,
            usuario_id=permissao.usuario_id,
            pode_editar=permissao.pode_editar
        )
        db.add(db_permissao)
        db.commit()
        db.refresh(db_permissao)
        return db_permissao
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao adicionar permissão: {str(e)}"
        )

@router.delete("/{gerenciamento_id}/permissoes/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_permissao(
    gerenciamento_id: int,
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)  # Mantém autenticação obrigatória
):
    """Remove uma permissão do gerenciamento"""
    # Verificar se o gerenciamento existe
    gerenciamento = db.query(models.Gerenciamento).filter(models.Gerenciamento.id == gerenciamento_id).first()
    if not gerenciamento:
        raise HTTPException(status_code=404, detail="Gerenciamento não encontrado")
    
    # Apenas o criador ou administradores podem gerenciar permissões
    if not current_user.is_admin and gerenciamento.criado_por != current_user.id:
        raise HTTPException(status_code=403, detail="Sem permissão para gerenciar permissões deste gerenciamento")
    
    # Buscar a permissão
    permissao = db.query(models.GerenciamentoPermissao).filter(
        models.GerenciamentoPermissao.gerenciamento_id == gerenciamento_id,
        models.GerenciamentoPermissao.usuario_id == usuario_id
    ).first()
    
    if not permissao:
        raise HTTPException(status_code=404, detail="Permissão não encontrada")
    
    try:
        db.delete(permissao)
        db.commit()
        return None
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao remover permissão: {str(e)}"
        )
