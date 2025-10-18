from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db

def get_db_dependency():
    """
    Dependência para obter uma sessão do banco de dados.
    Esta função é usada como dependência em rotas que precisam
    acessar o banco de dados.
    """
    return Depends(get_db)
