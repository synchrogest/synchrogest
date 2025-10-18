from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Produto(Base):
    __tablename__ = "produtos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    codigo_sku = Column(String(50), nullable=False, unique=True, index=True)
    descricao = Column(Text, nullable=True)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    unidade_medida = Column(String(20), nullable=False)
    preco_custo = Column(Numeric(10, 2), nullable=False)
    preco_venda = Column(Numeric(10, 2), nullable=False)
    quantidade = Column(Integer, default=0)
    quantidade_minima = Column(Integer, default=0)
    quantidade_maxima = Column(Integer, nullable=True)
    imagem_url = Column(String(255), nullable=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    categoria = relationship("Categoria", back_populates="produtos")
    movimentacoes = relationship("Movimentacao", back_populates="produto")
    projeto_produtos = relationship("ProjetoProduto", back_populates="produto")
