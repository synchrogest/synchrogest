from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import Token, Usuario as UsuarioSchema
from app.services.auth import authenticate_user, get_current_user
from app.utils.security import create_access_token
from app.config import settings


router = APIRouter()

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Endpoint para autenticação de usuários e geração de token JWT
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Atualizar último login
    user.ultimo_login = datetime.utcnow()
    db.commit()
    
    # Criar token de acesso
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UsuarioSchema)
async def read_users_me(current_user: Usuario = Depends(get_current_user)):
    """
    Endpoint para obter informações do usuário autenticado
    """
    return current_user


@router.post("/verify-admin")
async def verify_admin_credentials(
    credentials: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Endpoint para verificar credenciais de administrador
    """
    user = authenticate_user(db, credentials.username, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Verificar se o usuário é administrador
    if user.nivel_acesso != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores",
        )
    
    return {"status": "success", "message": "Credenciais de administrador verificadas com sucesso"}
