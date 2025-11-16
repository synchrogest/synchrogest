from pydantic import BaseModel
from typing import List
from datetime import datetime

class CompraItem(BaseModel):
    produto_id: int
    nome: str
    quantidade: int
    preco_unitario: float


class CompraClienteCreate(BaseModel):
    itens: List[CompraItem]
    total: float  # Usado no backend — substitui valor_total

class CompraItemResponse(BaseModel):
    produto_id: int
    nome: str
    quantidade: int
    preco_unitario: float

    class Config:
        # orm_mode = True
        from_attributes = True

class CompraClienteResponse(BaseModel):
    id: int
    cliente_id: int
    data_compra: datetime
    itens: List[CompraItemResponse]
    valor_total: float

    class Config:
        # orm_mode = True
        from_attributes = True


class CompraCliente(BaseModel):
    id: int
    total: float
    data_compra: datetime

    class Config:
        # orm_mode = True
        from_attributes = True
