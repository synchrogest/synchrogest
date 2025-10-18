from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, Usuario as UsuarioSchema
from app.services.auth import get_current_user, check_admin_user
from app.utils.security import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[UsuarioSchema])
async def listar_usuarios(
    skip: int = 0, 
    limit: int = 100, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lista todos os usuários (apenas para administradores)
    """
    usuarios = db.query(Usuario).offset(skip).limit(limit).all()
    return usuarios

@router.post("/", response_model=UsuarioSchema, status_code=status.HTTP_201_CREATED)
async def criar_usuario(
    usuario: UsuarioCreate, 
    current_user: Usuario = Depends(check_admin_user),
    db: Session = Depends(get_db)
):
    """
    Cria um novo usuário (apenas para administradores)
    """
    # Verificar se o email já existe
    db_user = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já registrado"
        )
    
    # Criar novo usuário
    hashed_password = get_password_hash(usuario.senha)
    db_user = Usuario(
        nome=usuario.nome,
        email=usuario.email,
        senha_hash=hashed_password,
        nivel_acesso=usuario.nivel_acesso
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/{usuario_id}", response_model=UsuarioSchema)
async def obter_usuario(
    usuario_id: int, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Obtém um usuário pelo ID
    """
    # Verificar permissões (apenas admin ou o próprio usuário)
    if current_user.nivel_acesso != "admin" and current_user.id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão negada"
        )
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    return usuario

@router.put("/{usuario_id}", response_model=UsuarioSchema)
async def atualizar_usuario(
    usuario_id: int, 
    usuario_update: UsuarioUpdate, 
    current_user: Usuario = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Atualiza um usuário pelo ID
    """
    # Verificar permissões (apenas admin ou o próprio usuário)
    if current_user.nivel_acesso != "admin" and current_user.id != usuario_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permissão negada"
        )
    
    # Apenas admin pode alterar nível de acesso
    if usuario_update.nivel_acesso is not None and current_user.nivel_acesso != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem alterar nível de acesso"
        )
    
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Atualizar campos
    if usuario_update.nome is not None:
        usuario.nome = usuario_update.nome
    
    if usuario_update.email is not None:
        # Verificar se o novo email já existe
        if usuario.email != usuario_update.email:
            db_user = db.query(Usuario).filter(Usuario.email == usuario_update.email).first()
            if db_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email já registrado"
                )
        usuario.email = usuario_update.email
    
    if usuario_update.senha is not None:
        usuario.senha_hash = get_password_hash(usuario_update.senha)
    
    if usuario_update.nivel_acesso is not None:
        usuario.nivel_acesso = usuario_update.nivel_acesso
    
    if usuario_update.ativo is not None:
        usuario.ativo = usuario_update.ativo
    
    db.commit()
    db.refresh(usuario)
    
    return usuario

@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def desativar_usuario(
    usuario_id: int, 
    current_user: Usuario = Depends(check_admin_user),
    db: Session = Depends(get_db)
):
    """
    Desativa um usuário pelo ID (apenas para administradores)
    """
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado"
        )
    
    # Não permitir desativar o próprio usuário
    if usuario.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível desativar o próprio usuário"
        )
    
    usuario.ativo = False
    db.commit()
    
    return None
