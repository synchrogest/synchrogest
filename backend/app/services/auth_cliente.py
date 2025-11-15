from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional

from app.schemas.token import Token
from app.config import settings
from app.database import get_db
from app.models.clientes import Cliente
from app.utils.security import verify_password

# Novo esquema OAuth2 para clientes
oauth2_cliente = OAuth2PasswordBearer(tokenUrl="/api/auth/cliente/login")

def authenticate_cliente(db: Session, email: str, password: str) -> Optional[Cliente]:
    cliente = db.query(Cliente).filter(Cliente.email == email).first()
    if not cliente:
        return None
    if not verify_password(password, cliente.senha_hash):
        return None
    return cliente

def get_current_cliente(token: str = Depends(oauth2_cliente), db: Session = Depends(get_db)) -> Cliente:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        cliente_id_str: str = payload.get("sub")
        tipo = payload.get("tipo")
        if cliente_id_str is None or tipo != "cliente":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    try:
        cliente_id = int(cliente_id_str)
    except ValueError:
        raise credentials_exception

    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if cliente is None:
        raise credentials_exception

    return cliente
