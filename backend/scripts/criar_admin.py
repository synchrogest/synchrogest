# """
# Script para criar um usuário administrador inicial no sistema SynchroGest
# """
# import sys
# import os
# from pathlib import Path

# # Adicionar o diretório raiz ao path para importações
# sys.path.append(str(Path(__file__).parent.parent))

# from sqlalchemy.orm import Session
# from app.database import SessionLocal, engine, Base
# from app.models.usuario import Usuario
# from app.utils.security import get_password_hash
# from datetime import datetime

# # Criar as tabelas no banco de dados
# Base.metadata.create_all(bind=engine)

# def criar_admin():
#     """
#     Cria um usuário administrador inicial se não existir
#     """
#     db = SessionLocal()
#     try:
#         # Verificar se já existe um administrador
#         admin = db.query(Usuario).filter(Usuario.nivel_acesso == "admin").first()
#         if admin:
#             print(f"Administrador já existe: {admin.email}")
#             return
        
#         # Criar novo administrador
#         admin = Usuario(
#             nome="Administrador",
#             email="admin@synchrogest.com",
#             senha_hash=get_password_hash("admin123"),
#             nivel_acesso="admin",
#             ativo=True,
#             data_criacao=datetime.utcnow()
#         )
        
#         db.add(admin)
#         db.commit()
#         print(f"Administrador criado com sucesso: {admin.email}")
#     finally:
#         db.close()

# if __name__ == "__main__":
#     criar_admin()

"""
Script para criar ou recriar um usuário administrador no sistema SynchroGest
"""
import sys
from pathlib import Path
from datetime import datetime

# Adicionar o diretório raiz ao path para importações
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.usuario import Usuario
from app.utils.security import get_password_hash

# Criar as tabelas no banco de dados (caso ainda não existam)
Base.metadata.create_all(bind=engine)

def criar_ou_recriar_admin():
    """
    Recria um usuário administrador no banco de dados com senha atualizada.
    """
    db = SessionLocal()
    try:
        email_admin = "admin@synchrogest.com"
        senha_clara = "admin123"  # você pode trocar aqui, se desejar

        admin_existente = db.query(Usuario).filter(Usuario.email == email_admin).first()
        if admin_existente:
            print(f"🗑️ Administrador existente encontrado: {admin_existente.email} - será removido.")
            db.delete(admin_existente)
            db.commit()

        novo_admin = Usuario(
            nome="Administrador",
            email=email_admin,
            senha_hash=get_password_hash(senha_clara),
            nivel_acesso="admin",
            ativo=True,
            data_criacao=datetime.utcnow()
        )

        db.add(novo_admin)
        db.commit()
        print(f"✅ Novo administrador criado com sucesso: {email_admin}")

    finally:
        db.close()

if __name__ == "__main__":
    criar_ou_recriar_admin()

