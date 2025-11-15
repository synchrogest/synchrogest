from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.clientes import Cliente as ClienteModel
from app.schemas.clientes import ClienteCreate, ClienteUpdate, ClienteResponse as ClienteSchema
from app.models.usuario import Usuario
from app.services.auth import get_current_user
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

# ----------------------------
# LISTAR CLIENTES
# ----------------------------
@router.get("/", response_model=List[ClienteSchema])
async def listar_clientes(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todos os clientes com opção de filtro por nome ou email
    """
    query = db.query(ClienteModel)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (ClienteModel.nome.ilike(search_term)) | (ClienteModel.email.ilike(search_term))
        )

    clientes = query.offset(skip).limit(limit).all()
    return clientes

# ----------------------------
# CRIAR CLIENTE
# ----------------------------
@router.post("/", response_model=ClienteSchema, status_code=status.HTTP_201_CREATED)
async def criar_cliente(
    cliente: ClienteCreate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cria um novo cliente.
    Apenas usuários autenticados podem criar clientes.
    """
    # Verificar se o email já existe
    db_cliente = db.query(ClienteModel).filter(ClienteModel.email == cliente.email).first()
    if db_cliente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Já existe um cliente com este email.")

    # Hash da senha
    hashed_password = pwd_context.hash(cliente.senha)

    novo_cliente = ClienteModel(**cliente.dict(exclude={"senha"}), senha_hash=hashed_password)
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)

    return novo_cliente

# ----------------------------
# OBTER CLIENTE POR ID
# ----------------------------
@router.get("/{cliente_id}", response_model=ClienteSchema)
async def obter_cliente(
    cliente_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cliente = db.query(ClienteModel).filter(ClienteModel.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")
    return cliente

# ----------------------------
# ATUALIZAR CLIENTE
# ----------------------------
@router.put("/{cliente_id}", response_model=ClienteSchema)
async def atualizar_cliente(
    cliente_id: int,
    cliente_update: ClienteUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cliente = db.query(ClienteModel).filter(ClienteModel.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")

    # Verificar se o novo email já está sendo usado
    if cliente_update.email and cliente_update.email != cliente.email:
        existe_email = db.query(ClienteModel).filter(ClienteModel.email == cliente_update.email).first()
        if existe_email:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado para outro cliente.")

    # Atualiza campos
    update_data = cliente_update.dict(exclude_unset=True)
    if "senha" in update_data and update_data["senha"]:
        update_data["senha_hash"] = pwd_context.hash(update_data.pop("senha"))

    for key, value in update_data.items():
        setattr(cliente, key, value)

    db.commit()
    db.refresh(cliente)
    return cliente

# ----------------------------
# DELETAR CLIENTE
# ----------------------------
@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deletar_cliente(
    cliente_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    cliente = db.query(ClienteModel).filter(ClienteModel.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")

    db.delete(cliente)
    db.commit()
    return None
