from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
print("🚀 DATABASE_URL carregada:", settings.DATABASE_URL)


# Criar engine do SQLAlchemy
engine = create_engine(
    settings.DATABASE_URL, connect_args={"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)

# Criar sessão local
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Criar base para os modelos
Base = declarative_base()

# Função para obter a sessão do banco de dados
def get_db():
    """
    Função de dependência para obter uma sessão do banco de dados.
    Garante que a sessão seja fechada após o uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
        
# from sqlalchemy import create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from app.config import settings
# import ssl

# print("🚀 DATABASE_URL carregada:", settings.DATABASE_URL)

# # 🔧 Corrige URL antiga
# if settings.DATABASE_URL.startswith("postgres://"):
#     settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql://", 1)

# # 🧠 Força SSL com contexto compatível
# connect_args = {}
# if "render.com" in settings.DATABASE_URL:
#     ssl_context = ssl.create_default_context()
#     ssl_context.check_hostname = False
#     ssl_context.verify_mode = ssl.CERT_NONE
#     connect_args = {"sslmode": "require", "sslrootcert": None, "ssl": ssl_context}

# # 🚀 Cria engine
# engine = create_engine(
#     settings.DATABASE_URL,
#     connect_args=connect_args
# )

# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()
