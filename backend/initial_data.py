from app.database import SessionLocal
from app.models.usuario import Usuario
from app.utils.security import get_password_hash #ATENÇÃO: VERIFICAR SE ESTA É REALMENTE A ROTA DESEJADA. 

def create_admin_user():
    db = SessionLocal()
    try:
        user = Usuario(
            nome="Administrador",
            email="admin@synchrogest.com",
            senha_hash=get_password_hash("admin123"),
            nivel_acesso="admin",
            ativo=True
        )
        db.add(user)
        db.commit()
        print("Usuário admin criado com sucesso!")
    except Exception as e:
        print(f"Erro ao criar usuário: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
