from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MovimentacaoBase(BaseModel):
    produto_id: int
    tipo: str  # "entrada" ou "saida"
    quantidade: int
    observacoes: Optional[str] = None
    projeto_id: Optional[int] = None

class MovimentacaoCreate(MovimentacaoBase):
    pass

class MovimentacaoUpdate(BaseModel):
    observacoes: Optional[str] = None

class Movimentacao(MovimentacaoBase):
    id: int
    usuario_id: int
    data: datetime
    
    class Config:
        orm_mode = True
