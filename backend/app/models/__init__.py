# from app.models.usuario import Usuario
# from app.models.categoria import Categoria
# from app.models.produto import Produto
# from app.models.movimentacao import Movimentacao
# from app.models.projeto import Projeto
# from app.models.projeto_colaborador import ProjetoColaborador
# from app.models.projeto_produto import ProjetoProduto
# from app.models.log import Log

from app.models.usuario import Usuario
from app.models.categoria import Categoria
from app.models.produto import Produto
from app.models.movimentacao import Movimentacao
from app.models.projeto import Projeto
from app.models.projeto_colaborador import ProjetoColaborador
from app.models.projeto_produto import ProjetoProduto
from app.models.log import Log
from app.models.gerenciamento import Gerenciamento, GerenciamentoItem, GerenciamentoAcao, GerenciamentoChecklist, GerenciamentoPermissao

# Exportar todos os modelos para facilitar importações
__all__ = [
    "Usuario",
    "Categoria",
    "Produto",
    "Movimentacao",
    "Projeto",
    "ProjetoColaborador",
    "ProjetoProduto",
    "Log"
]
