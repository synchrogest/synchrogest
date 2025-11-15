from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime

class CompraCliente(Base):
    __tablename__ = "compra_clientes"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    data_compra = Column(DateTime, default=datetime.utcnow)
    valor_total = Column(Float, nullable=False)

    # Relacionamento com itens da compra
    itens = relationship("CompraItem", back_populates="compra", cascade="all, delete-orphan")
    cliente = relationship("Cliente", back_populates="compras")
