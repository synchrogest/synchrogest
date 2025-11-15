
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.routers import auth, usuarios, categorias, produtos, movimentacoes, clientes
from app.routers.compra_clientes import router as compra_clientes_router
from app.routers.cliente_publico import router as cliente_publico_router

# Models
from app.routers.auth_cliente import router as auth_cliente_router
from app.models.clientes import Cliente
from app.models.compra_clientes import CompraCliente
from app.models.compra_itens import CompraItem

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
    "https://app-synchrogest.onrender.com",  # frontend hospedado no Render
    "https://biscoito-pet-house.onrender.com", # Biscoito Pet House - frontend público
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5500",   # Biscoito Pet House local
    "http://localhost:5500",   # variação local

    #"https://synchrogest-app.onrender.com",   # Backend Render
    #"https://synchrogest-frontend.onrender.com",  # Caso tenha o frontend também no Render
    #"https://biscoito-pet-house.onrender.com"     # Exemplo: site frontend público
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["Usuários"])
app.include_router(categorias.router, prefix="/api/categorias", tags=["Categorias"])
app.include_router(produtos.router, prefix="/api/produtos", tags=["Produtos"])
app.include_router(movimentacoes.router, prefix="/api/movimentacoes", tags=["Movimentações"])

# # Rotas cliente
app.include_router(auth_cliente_router, prefix="/api/auth/clientes", tags=["AuthCliente"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["Clientes"])
app.include_router(compra_clientes_router, prefix="/api/compras", tags=["Compras"])
app.include_router(cliente_publico_router, prefix="/api/public/clientes", tags=["CadastroCliente"])


@app.get("/api/test")
def test_api():
    return {"message": "API funcionando corretamente!"}

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do SynchroGest!"}
