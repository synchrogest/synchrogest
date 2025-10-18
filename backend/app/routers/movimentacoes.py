from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import desc

from app.database import get_db
from app.models.movimentacao import Movimentacao
from app.models.produto import Produto
from app.models.projeto import Projeto
from app.models.usuario import Usuario
from app.schemas.movimentacao import MovimentacaoCreate, MovimentacaoUpdate, Movimentacao as MovimentacaoSchema
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[MovimentacaoSchema])
async def listar_movimentacoes(
    skip: int = 0, 
    limit: int = 100,
    produto_id: Optional[int] = None,
    tipo: Optional[str] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    projeto_id: Optional[int] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todas as movimentações com opções de filtro
    """
    query = db.query(Movimentacao)
    
    # Aplicar filtros se fornecidos
    if produto_id:
        query = query.filter(Movimentacao.produto_id == produto_id)
    
    if tipo:
        query = query.filter(Movimentacao.tipo == tipo)
    
    if data_inicio:
        query = query.filter(Movimentacao.data >= datetime.combine(data_inicio, datetime.min.time()))
    
    if data_fim:
        query = query.filter(Movimentacao.data <= datetime.combine(data_fim, datetime.max.time()))
    
    if projeto_id:
        query = query.filter(Movimentacao.projeto_id == projeto_id)
    
    # Ordenar por data (mais recente primeiro)
    query = query.order_by(desc(Movimentacao.data))
    
    # Aplicar paginação
    movimentacoes = query.offset(skip).limit(limit).all()
    return movimentacoes

@router.post("/", response_model=MovimentacaoSchema, status_code=status.HTTP_201_CREATED)
async def criar_movimentacao(
    movimentacao: MovimentacaoCreate, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cria uma nova movimentação de estoque
    """
    # Verificar se o produto existe
    produto = db.query(Produto).filter(Produto.id == movimentacao.produto_id).first()
    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    # Verificar se o projeto existe (se fornecido)
    if movimentacao.projeto_id:
        projeto = db.query(Projeto).filter(Projeto.id == movimentacao.projeto_id).first()
        if not projeto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Projeto não encontrado"
            )
    
    # Verificar se a quantidade é válida
    if movimentacao.quantidade <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A quantidade deve ser maior que zero"
        )
    
    # Verificar estoque disponível para saídas
    if movimentacao.tipo == "saida" and produto.quantidade < movimentacao.quantidade:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estoque insuficiente. Disponível: {produto.quantidade}"
        )
    
    # Criar nova movimentação
    db_movimentacao = Movimentacao(
        produto_id=movimentacao.produto_id,
        usuario_id=current_user.id,
        tipo=movimentacao.tipo,
        quantidade=movimentacao.quantidade,
        data=datetime.utcnow(),
        observacoes=movimentacao.observacoes,
        projeto_id=movimentacao.projeto_id
    )
    
    # Atualizar estoque do produto
    if movimentacao.tipo == "entrada":
        produto.quantidade += movimentacao.quantidade
    else:  # saida
        produto.quantidade -= movimentacao.quantidade
    
    db.add(db_movimentacao)
    db.commit()
    db.refresh(db_movimentacao)
    
    return db_movimentacao

@router.get("/{movimentacao_id}", response_model=MovimentacaoSchema)
async def obter_movimentacao(
    movimentacao_id: int, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém uma movimentação pelo ID
    """
    movimentacao = db.query(Movimentacao).filter(Movimentacao.id == movimentacao_id).first()
    if movimentacao is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimentação não encontrada"
        )
    
    return movimentacao

@router.put("/{movimentacao_id}", response_model=MovimentacaoSchema)
async def atualizar_movimentacao(
    movimentacao_id: int, 
    movimentacao_update: MovimentacaoUpdate, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza uma movimentação pelo ID (apenas observações)
    """
    movimentacao = db.query(Movimentacao).filter(Movimentacao.id == movimentacao_id).first()
    if movimentacao is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimentação não encontrada"
        )
    
    # Apenas permitir atualizar observações
    if movimentacao_update.observacoes is not None:
        movimentacao.observacoes = movimentacao_update.observacoes
    
    db.commit()
    db.refresh(movimentacao)
    
    return movimentacao

@router.delete("/{movimentacao_id}", status_code=status.HTTP_204_NO_CONTENT)
async def excluir_movimentacao(
    movimentacao_id: int, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exclui uma movimentação pelo ID e reverte o estoque
    """
    # Verificar se o usuário é administrador
    if current_user.nivel_acesso != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem excluir movimentações"
        )
    
    movimentacao = db.query(Movimentacao).filter(Movimentacao.id == movimentacao_id).first()
    if movimentacao is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Movimentação não encontrada"
        )
    
    # Reverter o estoque
    produto = db.query(Produto).filter(Produto.id == movimentacao.produto_id).first()
    if movimentacao.tipo == "entrada":
        produto.quantidade -= movimentacao.quantidade
    else:  # saida
        produto.quantidade += movimentacao.quantidade
    
    db.delete(movimentacao)
    db.commit()
    
    return None

@router.get("/recentes/", response_model=List[MovimentacaoSchema])
async def listar_movimentacoes_recentes(
    limit: int = 5, # Padrão para 5 mais recentes
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista as últimas N movimentações registradas.
    """
    movimentacoes = db.query(Movimentacao).order_by(desc(Movimentacao.data)).limit(limit).all()
    return movimentacoes
