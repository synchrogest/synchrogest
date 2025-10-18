from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()
print("Banco de dados:", os.getenv("DATABASE_URL"))
print("SECRET_KEY:", os.getenv("SECRET_KEY"))

# def get_database_url():
#     return os.getenv("DATABASE_URL", "sqlite:///./synchrogest.db") (Verificar esta função)

# load_dotenv(".env.admin") "segunda opção caso o código quebre
class Settings(BaseSettings):
    """
    Configurações da aplicação carregadas de variáveis de ambiente ou arquivo .env
    """
    # Configurações do banco de dados
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./synchrogest.db")
    
    # Configurações de segurança
    SECRET_KEY: str = os.getenv("SECRET_KEY", "temporarysecretkey123456789abcdefghijklmnopqrstuvwxyz")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Configurar base de dados Render (Supabase BD)
    # DATABASE_URL: str
    # SUPABASE_URL: str = None
    # SUPABASE_SERVICE_KEY: str = None
    
    # Configurações da aplicação
    APP_NAME: str = "SynchroGest"
    APP_VERSION: str = "0.1.0"
    APP_DESCRIPTION: str = "Sistema de Gestão de Estoque com Controle de Projetos"
    
    class Config:
        env_file = ".env"
        # env_file = ".env.admin" #segunda opção caso o código quebre
        case_sensitive = True

# Instância global das configurações
settings = Settings()
