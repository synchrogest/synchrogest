from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    nivel_acesso = Column(Enum("admin", "usuario", "visualizacao"), default="usuario")
    ativo = Column(Boolean, default=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    ultimo_login = Column(DateTime, nullable=True)

    # @property
    # def is_admin(self):
    #     return self.nivel_acesso == "admin"

    
    # Relacionamentos
    movimentacoes = relationship("Movimentacao", back_populates="usuario")
    projetos_responsavel = relationship("Projeto", back_populates="responsavel")
    projetos_colaborador = relationship("ProjetoColaborador", back_populates="usuario")
    gerenciamentos = relationship("Gerenciamento", back_populates="usuario")

