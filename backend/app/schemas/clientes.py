from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ----------------------------
# SCHEMA BASE
# ----------------------------
class ClienteBase(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    cep: Optional[str] = None
    cidade: Optional[str] = None
    pais: Optional[str] = None

# ----------------------------
# CRIAÇÃO DE CLIENTE
# ----------------------------
class ClienteCreate(ClienteBase):
    senha: str  # usado apenas na criação, será hasheada

# ----------------------------
# ATUALIZAÇÃO DE CLIENTE
# ----------------------------
class ClienteUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    senha: Optional[str] = None  # senha opcional para atualização
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    cep: Optional[str] = None
    cidade: Optional[str] = None
    pais: Optional[str] = None

# ----------------------------
# SCHEMA DE RESPOSTA
# ----------------------------
class ClienteResponse(ClienteBase):
    id: int
    data_criacao: datetime
    data_atualizacao: datetime

    model_config = {
        "from_attributes": True  # Pydantic v2 substitui orm_mode
    }
