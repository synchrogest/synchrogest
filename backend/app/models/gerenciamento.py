from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base

class Gerenciamento(Base):
    __tablename__ = "gerenciamentos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    data_criacao = Column(DateTime, default=datetime.now)
    data_inicio = Column(DateTime, nullable=True)
    data_conclusao = Column(DateTime, nullable=True)
    criado_por = Column(Integer, ForeignKey("usuarios.id"))
    status = Column(Float, default=0)  # Porcentagem de conclusão (0-1)
    publico = Column(Boolean, default=True)

    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="gerenciamentos")
    itens = relationship("GerenciamentoItem", back_populates="gerenciamento", cascade="all, delete-orphan")
    acoes = relationship("GerenciamentoAcao", back_populates="gerenciamento", cascade="all, delete-orphan")
    permissoes = relationship("GerenciamentoPermissao", back_populates="gerenciamento", cascade="all, delete-orphan")


class GerenciamentoItem(Base):
    __tablename__ = "gerenciamento_itens"

    id = Column(Integer, primary_key=True, index=True)
    gerenciamento_id = Column(Integer, ForeignKey("gerenciamentos.id"))
    nome = Column(String(255), nullable=False)
    ordem = Column(Integer, default=0)
    
    # Relacionamentos
    gerenciamento = relationship("Gerenciamento", back_populates="itens")
    checklists = relationship("GerenciamentoChecklist", back_populates="item", cascade="all, delete-orphan")


class GerenciamentoAcao(Base):
    __tablename__ = "gerenciamento_acoes"

    id = Column(Integer, primary_key=True, index=True)
    gerenciamento_id = Column(Integer, ForeignKey("gerenciamentos.id"))
    nome = Column(String(255), nullable=False)
    ordem = Column(Integer, default=0)
    
    # Relacionamentos
    gerenciamento = relationship("Gerenciamento", back_populates="acoes")
    checklists = relationship("GerenciamentoChecklist", back_populates="acao", cascade="all, delete-orphan")


class GerenciamentoChecklist(Base):
    __tablename__ = "gerenciamento_checklists"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("gerenciamento_itens.id"))
    acao_id = Column(Integer, ForeignKey("gerenciamento_acoes.id"))
    concluido = Column(Boolean, default=False)
    ativo = Column(Boolean, default=True)  # Se false, o checklist está desabilitado
    data_conclusao = Column(DateTime, nullable=True)
    concluido_por = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    
    # Relacionamentos
    item = relationship("GerenciamentoItem", back_populates="checklists")
    acao = relationship("GerenciamentoAcao", back_populates="checklists")
    usuario = relationship("Usuario")


class GerenciamentoPermissao(Base):
    __tablename__ = "gerenciamento_permissoes"

    id = Column(Integer, primary_key=True, index=True)
    gerenciamento_id = Column(Integer, ForeignKey("gerenciamentos.id"))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    pode_editar = Column(Boolean, default=False)
    
    # Relacionamentos
    gerenciamento = relationship("Gerenciamento", back_populates="permissoes")
    usuario = relationship("Usuario")
