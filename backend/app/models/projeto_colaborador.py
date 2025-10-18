from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base

class ProjetoColaborador(Base):
    __tablename__ = "projeto_colaboradores"
    
    id = Column(Integer, primary_key=True, index=True)
    projeto_id = Column(Integer, ForeignKey("projetos.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    
    # Relacionamentos
    projeto = relationship("Projeto", back_populates="colaboradores")
    usuario = relationship("Usuario", back_populates="projetos_colaborador")
    
    # Restrição de unicidade
    __table_args__ = (UniqueConstraint('projeto_id', 'usuario_id', name='uq_projeto_usuario'),)
