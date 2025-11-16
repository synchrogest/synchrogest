from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Pagamento(Base):
    __tablename__ = "pagamentos"

    id = Column(Integer, primary_key=True, index=True)
    compra_id = Column(Integer, ForeignKey("compra_clientes.id"), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    metodo = Column(String(50), nullable=False)  # ex: "cartao", "pix", "boleto"
    # status = Column(Enum("pendente", "aprovado", "recusado", name="status_enum", native_enum=False), default="pendente")
    status = Column(String(20), default="pendente")
    valor = Column(Float, nullable=False)
    data_criacao = Column(DateTime, default=datetime.utcnow)

    compra = relationship("CompraCliente", back_populates="pagamento")
    cliente = relationship("Cliente", back_populates="pagamentos")
