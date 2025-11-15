from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.clientes import Cliente
from app.schemas.usuario import Token
from app.utils.security import create_access_token
from app.services.auth_cliente import authenticate_cliente


router = APIRouter()

# @router.post("/cliente/login", response_model=Token)
@router.post("/login", response_model=Token)
def login_cliente(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    cliente = authenticate_cliente(db, form_data.username, form_data.password)
    if not cliente:
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")

    token = create_access_token(data={"sub": str(cliente.id), "tipo": "cliente"})
    return {"access_token": token, "token_type": "bearer"}
