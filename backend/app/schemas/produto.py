from pydantic import BaseModel, Field, condecimal
from typing import Optional, List
from datetime import datetime

class ProdutoBase(BaseModel):
    nome: str
    codigo_sku: str
    descricao: Optional[str] = None
    categoria_id: int
    unidade_medida: str
    preco_custo: condecimal(ge=0, decimal_places=2)
    preco_venda: condecimal(ge=0, decimal_places=2)
    quantidade_minima: int = 0
    quantidade_maxima: Optional[int] = None
    imagem_url: Optional[str] = None

class ProdutoCreate(ProdutoBase):
    pass

class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    codigo_sku: Optional[str] = None
    descricao: Optional[str] = None
    categoria_id: Optional[int] = None
    unidade_medida: Optional[str] = None
    preco_custo: Optional[condecimal(ge=0, decimal_places=2)] = None
    preco_venda: Optional[condecimal(ge=0, decimal_places=2)] = None
    quantidade_minima: Optional[int] = None
    quantidade_maxima: Optional[int] = None
    imagem_url: Optional[str] = None

class Produto(ProdutoBase):
    id: int
    quantidade: int
    data_criacao: datetime
    data_atualizacao: datetime
    
    class Config:
        orm_mode = True


class ProdutoStats(BaseModel):
    total_produtos: int
    total_estoque_baixo: int

    class Config:
        orm_mode = True
