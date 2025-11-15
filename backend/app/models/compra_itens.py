from sqlalchemy import Column, Integer, Float, ForeignKey, String
from sqlalchemy.orm import relationship
from app.database import Base

class CompraItem(Base):
    __tablename__ = "compra_itens"

    id = Column(Integer, primary_key=True, index=True)
    compra_id = Column(Integer, ForeignKey("compra_clientes.id"), nullable=False)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    nome = Column(String(255), nullable=False)  # VARCHAR precisa de tamanho no MySQL
    quantidade = Column(Integer, nullable=False)
    preco_unitario = Column(Float, nullable=False)

    # Relacionamento com CompraCliente
    compra = relationship("CompraCliente", back_populates="itens")
    produto = relationship("Produto")

