from sqlalchemy import Column, Integer, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class ProjetoProduto(Base):
    __tablename__ = "projeto_produtos"
    
    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    quantidade = Column(Integer, nullable=False)
    observacao = Column(Text, nullable=True)
    
    # Relacionamentos
    projeto = relationship("Projeto", back_populates="produtos")
    produto = relationship("Produto", back_populates="projeto_produtos")
    
    # Restrição de unicidade
    __table_args__ = (UniqueConstraint('projeto_id', 'produto_id', name='uq_projeto_produto'),)
