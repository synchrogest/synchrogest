from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, usuarios, categorias, produtos, movimentacoes, projetos, gerenciamento

# IMPORTANTE: criação automática de tabelas
from app.database import Base, engine
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SynchroGest API",
    description="API para o sistema de gestão SynchroGest",
    version="1.0.0"
    # swagger_ui_init_oauth=None  # REMOVE os campos de OAuth2 client_id/client_secret
)

# Configuração de CORS
origins = [
    # "https://synchro-gest.render.app" #Colocar aqui o CORS CORRETO.
    "https://app-synchrogest.onrender.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",

]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["Usuários"])
app.include_router(categorias.router, prefix="/api/categorias", tags=["Categorias"])
app.include_router(produtos.router, prefix="/api/produtos", tags=["Produtos"])
app.include_router(movimentacoes.router, prefix="/api/movimentacoes", tags=["Movimentações"])
app.include_router(projetos.router, prefix="/api/projetos", tags=["Projetos"])
app.include_router(gerenciamento.router, prefix="/api/gerenciamento", tags=["Gerenciamento"])

@app.get("/api/test")
def test_api():
    return {"message": "API funcionando corretamente!"}

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do SynchroGest!"}
