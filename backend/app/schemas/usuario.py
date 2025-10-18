from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UsuarioBase(BaseModel):
    nome: str
    email: EmailStr
    nivel_acesso: str = "usuario"

class UsuarioCreate(UsuarioBase):
    senha: str = Field(..., min_length=6)

class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    senha: Optional[str] = Field(None, min_length=6)
    nivel_acesso: Optional[str] = None
    ativo: Optional[bool] = None

class UsuarioInDB(UsuarioBase):
    id: int
    ativo: bool
    data_criacao: Optional[datetime] = None
    ultimo_login: Optional[datetime] = None

    class Config:
        orm_mode = True

class Usuario(UsuarioInDB):
    pass

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    sub: Optional[int] = None
