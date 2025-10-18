
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

# Esquema para Colaborador do Projeto
class ProjetoColaboradorBase(BaseModel):
    usuario_id: int

class ProjetoColaboradorCreate(ProjetoColaboradorBase):
    pass

class ProjetoColaborador(ProjetoColaboradorBase):
    id: int
    projeto_id: int

    class Config:
        from_attributes = True # Anteriormente orm_mode

# Esquema para Produto do Projeto
class ProjetoProdutoBase(BaseModel):
    produto_id: int
    quantidade: int
    observacao: Optional[str] = None

class ProjetoProdutoCreate(ProjetoProdutoBase):
    pass

class ProjetoProduto(ProjetoProdutoBase):
    id: int
    projeto_id: int

    class Config:
        from_attributes = True

# Esquema Principal do Projeto
class ProjetoBase(BaseModel):
    nome: str
    local: Optional[str] = None
    data_inicio: date
    data_fim: Optional[date] = None
    responsavel_id: int
    status: str = 'planejamento'
    descricao: Optional[str] = None

class ProjetoCreate(ProjetoBase):
    pass

class ProjetoUpdate(ProjetoBase):
    pass # Pode ser mais específico se necessário

class Projeto(ProjetoBase):
    id: int
    colaboradores: List[ProjetoColaborador] = []
    produtos: List[ProjetoProduto] = []

    class Config:
        from_attributes = True

    # class ProjetoDashboardStats(BaseModel):
    #     total_projetos_ativos: int

    # class Config:
    #     from_attributes = True

