from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.categoria import Categoria
from app.models.usuario import Usuario
from app.schemas.categoria import CategoriaCreate, CategoriaUpdate, Categoria as CategoriaSchema
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[CategoriaSchema])
async def listar_categorias(
    skip: int = 0, 
    limit: int = 100, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas as categorias
    """
    categorias = db.query(Categoria).offset(skip).limit(limit).all()
    return categorias

@router.post("/", response_model=CategoriaSchema, status_code=status.HTTP_201_CREATED)
async def criar_categoria(
    categoria: CategoriaCreate, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cria uma nova categoria
    """
    # Verificar se já existe uma categoria com o mesmo nome
    db_categoria = db.query(Categoria).filter(Categoria.nome == categoria.nome).first()
    if db_categoria:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Categoria com este nome já existe"
        )
    
    # Criar nova categoria
    db_categoria = Categoria(
        nome=categoria.nome,
        descricao=categoria.descricao
    )
    
    db.add(db_categoria)
    db.commit()
    db.refresh(db_categoria)
    
    return db_categoria

@router.get("/{categoria_id}", response_model=CategoriaSchema)
async def obter_categoria(
    categoria_id: int, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém uma categoria pelo ID
    """
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if categoria is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    return categoria

@router.put("/{categoria_id}", response_model=CategoriaSchema)
async def atualizar_categoria(
    categoria_id: int, 
    categoria_update: CategoriaUpdate, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza uma categoria pelo ID
    """
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if categoria is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    # Verificar se o novo nome já existe (se for diferente do atual)
    if categoria_update.nome is not None and categoria_update.nome != categoria.nome:
        db_categoria = db.query(Categoria).filter(Categoria.nome == categoria_update.nome).first()
        if db_categoria:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Categoria com este nome já existe"
            )
    
    # Atualizar campos
    if categoria_update.nome is not None:
        categoria.nome = categoria_update.nome
    
    if categoria_update.descricao is not None:
        categoria.descricao = categoria_update.descricao
    
    db.commit()
    db.refresh(categoria)
    
    return categoria

@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
async def excluir_categoria(
    categoria_id: int, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exclui uma categoria pelo ID
    """
    categoria = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if categoria is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    # Verificar se existem produtos associados a esta categoria
    if categoria.produtos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível excluir categoria com produtos associados"
        )
    
    db.delete(categoria)
    db.commit()
    
    return None
