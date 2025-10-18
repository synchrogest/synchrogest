
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Projeto(Base):
    __tablename__ = "projetos"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    local = Column(String(100), nullable=True)
    data_inicio = Column(Date, nullable=False)
    data_fim = Column(Date, nullable=True)
    responsavel_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    status = Column(Enum("planejamento", "em_andamento", "concluido", "cancelado"), default="planejamento")
    descricao = Column(Text, nullable=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    data_atualizacao = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    responsavel = relationship("Usuario", back_populates="projetos_responsavel")
    colaboradores = relationship("ProjetoColaborador", back_populates="projeto")
    produtos = relationship("ProjetoProduto", back_populates="projeto")
    movimentacoes = relationship("Movimentacao", back_populates="projeto")
