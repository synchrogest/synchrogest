from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PagamentoBase(BaseModel):
    compra_id: int
    cliente_id: int
    metodo: str
    valor: float

class PagamentoCreate(PagamentoBase):
    pass

class PagamentoUpdate(BaseModel):
    status: Optional[str] = None
    metodo: Optional[str] = None

class PagamentoResponse(PagamentoBase):
    id: int
    status: str
    data_criacao: datetime

    class Config:
        # orm_mode = True
        from_attributes = True
