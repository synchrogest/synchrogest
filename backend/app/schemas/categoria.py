from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CategoriaBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None

class Categoria(CategoriaBase):
    id: int
    
    class Config:
        orm_mode = True
