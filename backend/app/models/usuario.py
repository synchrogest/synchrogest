from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from sqlalchemy.dialects.postgresql import ENUM as PGEnum

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    nivel_acesso = Column(String(20), default="usuario", nullable=False)
    # nivel_acesso = Column(PGEnum("admin", "usuario", "visualizacao", name="nivel_acesso_enum", create_type=True),
    # default="usuario", nullable=False)
    ativo = Column(Boolean, default=True)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    ultimo_login = Column(DateTime, nullable=True)

    # @property
    # def is_admin(self):
    #     return self.nivel_acesso == "admin"

    
    # Relacionamentos
    movimentacoes = relationship("Movimentacao", back_populates="usuario")
    # projetos_responsavel = relationship("Projeto", back_populates="responsavel")
    # projetos_colaborador = relationship("ProjetoColaborador", back_populates="usuario")

