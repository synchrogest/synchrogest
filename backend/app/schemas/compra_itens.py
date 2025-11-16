from pydantic import BaseModel
from typing import List
from datetime import datetime

class CompraItemBase(BaseModel):
    produto_id: int
    nome: str
    quantidade: int
    preco_unitario: float

class CompraItemCreate(CompraItemBase):
    pass

class CompraItemResponse(CompraItemBase):
    id: int
    class Config:
        # orm_mode = True
        from_attributes = True


class CompraClienteCreate(BaseModel):
    cliente_id: int
    itens: List[CompraItemCreate]
    valor_total: float

class CompraClienteResponse(BaseModel):
    id: int
    cliente_id: int
    data_compra: datetime
    valor_total: float
    itens: List[CompraItemResponse]
    class Config:
        # orm_mode = True
        from_attributes = True
