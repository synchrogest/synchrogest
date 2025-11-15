from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.clientes import Cliente
from app.schemas.clientes import ClienteCreate, ClienteResponse
from app.utils.security import get_password_hash

router = APIRouter()

@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def registrar_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    """
    Cadastro público de cliente com senha.
    """
    # Verificar se o email já está cadastrado
    existente = db.query(Cliente).filter(Cliente.email == cliente.email).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado.")

    # Gerar hash da senha
    senha_hash = get_password_hash(cliente.senha)

    # Criar novo cliente no banco
    novo_cliente = Cliente(**cliente.dict(exclude={"senha"}), senha_hash=senha_hash)
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)

    return novo_cliente


