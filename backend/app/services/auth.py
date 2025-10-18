from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional

from app.config import settings
from app.database import get_db
from app.models.usuario import Usuario
from app.utils.security import verify_password

# Configuração do OAuth2
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def authenticate_user(db: Session, email: str, password: str) -> Optional[Usuario]:
    """
    Autentica um usuário verificando email e senha
    """
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.senha_hash):
        return None
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Usuario:
    """
    Obtém o usuário atual a partir do token JWT
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # >>> LOG PARA DEBUG <<<
    print("🔐 TOKEN RECEBIDO no backend:", token)

    try:
        # Decodificar o token JWT
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print("🧩 PAYLOAD DECODIFICADO no backend:", payload)
        user_id_str: str = payload.get("sub") # O subject (sub) é uma string no token
        if user_id_str is None:
            # >>> LOG PARA DEBUG <<<
            print("❌ ERRO de JWTError:", e)
            raise credentials_exception
    except JWTError as e:
        raise credentials_exception

    # Buscar o usuário no banco de dados (converter ID para int)
    try:
        user_id = int(user_id_str)
    # except ValueError:
    # >>> LOG PARA DEBUG <<<
    except ValueError as e:
        print("❌ ERRO ao converter sub para int:", e)
        # Se o 'sub' não for um inteiro válido
        raise credentials_exception
        
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    # >>> LOG PARA DEBUG <<<
    print("👤 Usuário buscado no DB:", user)

    if user is None:
        raise credentials_exception
    if not user.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )

    return user

def get_current_active_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """
    Verifica se o usuário atual está ativo
    """
    # A verificação de ativo já é feita em get_current_user, mas mantemos por segurança
    if not current_user.ativo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário inativo"
        )
    return current_user

def check_admin_user(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    """
    Verifica se o usuário atual é um administrador
    """
    if current_user.nivel_acesso != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão negada. Requer privilégios de administrador."
        )
    return current_user

