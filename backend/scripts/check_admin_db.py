"""
Script para verificar os dados do usuário administrador no banco de dados.
"""
import sys
from pathlib import Path

# Adicionar o diretório raiz ao path para importações
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.usuario import Usuario

# def verificar_admin():
#     """
#     Verifica e imprime os dados do usuário administrador.
#     """
#     db = SessionLocal()
#     try:
#         admin = db.query(Usuario).filter(Usuario.email == "admin@synchrogest.com").first()
#         if admin:
#             print("--- Dados do Usuário Administrador ---")
#             print(f"ID: {admin.id}")
#             print(f"Nome: {admin.nome}")
#             print(f"Email: {admin.email}")
#             print(f"Nível de Acesso: {admin.nivel_acesso}")
#             print(f"Ativo: {admin.ativo}")
#             print(f"Data Criação: {admin.data_criacao}")
#             print(f"Último Login: {admin.ultimo_login}")
#             print(f"Senha Hash (primeiros 10 chars): {admin.senha_hash[:10]}...")
#         else:
#             print("Usuário administrador (admin@synchrogest.com) NÃO encontrado no banco de dados.")
#     finally:
#         db.close()

    # ... importações e funções como já está ...

from app.utils.security import verify_password

def verificar_admin():
    db = SessionLocal()
    try:
        admin = db.query(Usuario).filter(Usuario.email == "admin@synchrogest.com").first()
        if admin:
            print("--- Dados do Usuário Administrador ---")
            print(f"ID: {admin.id}")
            print(f"Nome: {admin.nome}")
            print(f"Email: {admin.email}")
            print(f"Nível de Acesso: {admin.nivel_acesso}")
            print(f"Ativo: {admin.ativo}")
            print(f"Data Criação: {admin.data_criacao}")
            print(f"Último Login: {admin.ultimo_login}")
            print(f"Senha Hash (primeiros 10 chars): {admin.senha_hash[:10]}...")

            # Verificação do formato do hash
            if not admin.senha_hash.startswith("$2b$") and not admin.senha_hash.startswith("$2a$"):
                print("⚠️ AVISO: O campo senha_hash não parece ser um hash bcrypt válido.")

            # Teste de verificação de senha
            senha_teste = "Torden22"  # ajuste conforme necessário
            if verify_password(senha_teste, admin.senha_hash):
                print("🔐 A senha admin123 É válida para este hash.")
            else:
                print("❌ A senha admin123 NÃO É válida para este hash.")

            # Verificações adicionais
            if not admin.ativo:
                print("⚠️ O usuário está INATIVO.")
            if admin.nivel_acesso not in ["admin", "user"]:
                print("⚠️ Nível de acesso não reconhecido:", admin.nivel_acesso)

        else:
            print("Usuário administrador (admin@synchrogest.com) NÃO encontrado no banco de dados.")
    finally:
        db.close()


if __name__ == "__main__":
    verificar_admin()

