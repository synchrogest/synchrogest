from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class GerenciamentoChecklist(BaseModel):
    id: Optional[int] = None
    item_id: int
    acao_id: int
    concluido: bool = False
    ativo: bool = True
    data_conclusao: Optional[datetime] = None
    concluido_por: Optional[int] = None

    class Config:
        from_attributes = True


class GerenciamentoChecklistCreate(BaseModel):
    item_id: int
    acao_id: int
    ativo: bool = True


class GerenciamentoChecklistUpdate(BaseModel):
    concluido: Optional[bool] = None
    ativo: Optional[bool] = None


class GerenciamentoItem(BaseModel):
    id: Optional[int] = None
    gerenciamento_id: int
    nome: str
    ordem: int = 0

    class Config:
        from_attributes = True


class GerenciamentoItemCreate(BaseModel):
    nome: str
    ordem: Optional[int] = 0


class GerenciamentoItemUpdate(BaseModel):
    nome: Optional[str] = None
    ordem: Optional[int] = None


class GerenciamentoAcao(BaseModel):
    id: Optional[int] = None
    gerenciamento_id: int
    nome: str
    ordem: int = 0

    class Config:
        from_attributes = True


class GerenciamentoAcaoCreate(BaseModel):
    nome: str
    ordem: Optional[int] = 0


class GerenciamentoAcaoUpdate(BaseModel):
    nome: Optional[str] = None
    ordem: Optional[int] = None


class GerenciamentoPermissao(BaseModel):
    id: Optional[int] = None
    gerenciamento_id: int
    usuario_id: int
    pode_editar: bool = False

    class Config:
        from_attributes = True


class GerenciamentoPermissaoCreate(BaseModel):
    usuario_id: int
    pode_editar: bool = False


class GerenciamentoPermissaoUpdate(BaseModel):
    pode_editar: Optional[bool] = None


class GerenciamentoBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_conclusao: Optional[datetime] = None


class GerenciamentoCreate(GerenciamentoBase):
    pass


class GerenciamentoUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_conclusao: Optional[datetime] = None


class Gerenciamento(GerenciamentoBase):
    id: int
    criado_por: int
    data_criacao: datetime
    status: float = 0

    class Config:
        from_attributes = True


class GerenciamentoDetalhado(Gerenciamento):
    itens: List[GerenciamentoItem] = []
    acoes: List[GerenciamentoAcao] = []
    permissoes: List[GerenciamentoPermissao] = []

    class Config:
        from_attributes = True


class GerenciamentoCompletoItem(GerenciamentoItem):
    checklists: List[GerenciamentoChecklist] = []


class GerenciamentoCompletoAcao(GerenciamentoAcao):
    checklists: List[GerenciamentoChecklist] = []


class GerenciamentoCompleto(GerenciamentoDetalhado):
    itens: List[GerenciamentoCompletoItem] = []
    acoes: List[GerenciamentoCompletoAcao] = []

    class Config:
        from_attributes = True
