from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Log(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    acao = Column(String(50), nullable=False)
    tabela_afetada = Column(String(50), nullable=True)
    registro_id = Column(Integer, nullable=True)
    dados_antigos = Column(JSON, nullable=True)
    dados_novos = Column(JSON, nullable=True)
    data_hora = Column(DateTime, default=datetime.utcnow)
    ip = Column(String(50), nullable=True)
    
    # Relacionamentos
    usuario = relationship("Usuario")
