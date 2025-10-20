from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, usuarios, categorias, produtos, movimentacoes, projetos, gerenciamento
from app.database import Base, engine

# 🔹 Criação automática das tabelas
Base.metadata.create_all(bind=engine)

# 🔹 Inicialização da aplicação
app = FastAPI(
    title="SynchroGest API",
    description="API para o sistema de gestão SynchroGest",
    version="1.0.0",
)

# 🔹 Configuração de CORS (deve vir ANTES dos routers)
origins = [
    "https://app-synchrogest.onrender.com",  # frontend hospedado no Render
    "http://localhost:3000",                 # ambiente local
    "http://127.0.0.1:3000",                 # localhost alternativo
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # ✅ use a variável já declarada
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔹 Rotas principais (depois do middleware)
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["Usuários"])
app.include_router(categorias.router, prefix="/api/categorias", tags=["Categorias"])
app.include_router(produtos.router, prefix="/api/produtos", tags=["Produtos"])
app.include_router(movimentacoes.router, prefix="/api/movimentacoes", tags=["Movimentações"])
app.include_router(projetos.router, prefix="/api/projetos", tags=["Projetos"])
app.include_router(gerenciamento.router, prefix="/api/gerenciamento", tags=["Gerenciamento"])

# 🔹 Rotas de teste e status
@app.get("/api/test")
def test_api():
    return {"message": "✅ API funcionando corretamente!"}

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do SynchroGest!"}
