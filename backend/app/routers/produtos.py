from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import desc

from app.database import get_db
from app.models.produto import Produto
from app.models.categoria import Categoria
from app.models.usuario import Usuario
# from app.schemas.produto import ProdutoCreate, ProdutoUpdate, Produto as ProdutoSchema
from app.schemas.produto import ProdutoCreate, ProdutoUpdate, Produto as ProdutoSchema, ProdutoStats
from app.services.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ProdutoSchema])
async def listar_produtos(
    skip: int = 0, 
    limit: int = 100,
    categoria_id: Optional[int] = None,
    search: Optional[str] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todos os produtos com opções de filtro
    """
    query = db.query(Produto)
    
    # Aplicar filtros se fornecidos
    if categoria_id:
        query = query.filter(Produto.categoria_id == categoria_id)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Produto.nome.ilike(search_term)) | 
            (Produto.codigo_sku.ilike(search_term)) |
            (Produto.descricao.ilike(search_term))
        )
    
    # Ordenar por nome
    query = query.order_by(Produto.nome)
    
    # Aplicar paginação
    produtos = query.offset(skip).limit(limit).all()
    return produtos

@router.post("/", response_model=ProdutoSchema, status_code=status.HTTP_201_CREATED)
async def criar_produto(
    produto: ProdutoCreate, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cria um novo produto
    """
    # Verificar se a categoria existe
    categoria = db.query(Categoria).filter(Categoria.id == produto.categoria_id).first()
    if not categoria:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoria não encontrada"
        )
    
    # Verificar se já existe um produto com o mesmo código SKU
    db_produto = db.query(Produto).filter(Produto.codigo_sku == produto.codigo_sku).first()
    if db_produto:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Produto com este código SKU já existe"
        )
    
    # Criar novo produto
    db_produto = Produto(
        nome=produto.nome,
        codigo_sku=produto.codigo_sku,
        descricao=produto.descricao,
        categoria_id=produto.categoria_id,
        unidade_medida=produto.unidade_medida,
        preco_custo=produto.preco_custo,
        preco_venda=produto.preco_venda,
        quantidade=0,  # Quantidade inicial é zero
        quantidade_minima=produto.quantidade_minima,
        quantidade_maxima=produto.quantidade_maxima,
        imagem_url=produto.imagem_url
    )
    
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    
    return db_produto

@router.get("/baixo-estoque", response_model=List[ProdutoSchema])
async def listar_produtos_baixo_estoque(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista produtos com estoque abaixo do mínimo
    """
    produtos = db.query(Produto).filter(Produto.quantidade < Produto.quantidade_minima).all()
    return produtos

@router.get("/{produto_id}", response_model=ProdutoSchema)
async def obter_produto(
    produto_id: int, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém um produto pelo ID
    """
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if produto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    return produto

@router.put("/{produto_id}", response_model=ProdutoSchema)
async def atualizar_produto(
    produto_id: int, 
    produto_update: ProdutoUpdate, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza um produto pelo ID
    """
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if produto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    # Verificar se a categoria existe (se for atualizada)
    if produto_update.categoria_id is not None:
        categoria = db.query(Categoria).filter(Categoria.id == produto_update.categoria_id).first()
        if not categoria:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoria não encontrada"
            )
    
    # Verificar se o novo código SKU já existe (se for diferente do atual)
    if produto_update.codigo_sku is not None and produto_update.codigo_sku != produto.codigo_sku:
        db_produto = db.query(Produto).filter(Produto.codigo_sku == produto_update.codigo_sku).first()
        if db_produto:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Produto com este código SKU já existe"
            )
    
    # Atualizar campos
    for key, value in produto_update.dict(exclude_unset=True).items():
        setattr(produto, key, value)
    
    db.commit()
    db.refresh(produto)
    
    return produto

@router.delete("/{produto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def excluir_produto(
    produto_id: int, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Exclui um produto pelo ID
    """
    produto = db.query(Produto).filter(Produto.id == produto_id).first()
    if produto is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )
    
    # Verificar se existem movimentações ou projetos associados a este produto
    if produto.movimentacoes or produto.projeto_produtos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível excluir produto com movimentações ou projetos associados"
        )
    
    db.delete(produto)
    db.commit()
    
    return None

    # Inserido novo endpoint a baixo

@router.get("/stats", response_model=ProdutoStats)
async def get_produto_stats(
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retorna estatísticas sobre os produtos.
    """
    total_produtos = db.query(Produto).count()  # Esta linha indentada
    total_estoque_baixo = db.query(Produto).filter(Produto.quantidade < Produto.quantidade_minima).count() # Esta linha indentada
    return ProdutoStats(total_produtos=total_produtos, total_estoque_baixo=total_estoque_baixo) # Esta linha indentada