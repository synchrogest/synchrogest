
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, usuarios, categorias, produtos, movimentacoes, projetos, gerenciamento

# IMPORTANTE: criação automática de tabelas
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
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://synchrogest-backend.onrender.com/"
    # "https://synchro-gest.render.app" #Colocar aqui o CORS CORRETO.
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # ✅ use a variável já declarada
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

# # Rotas cliente
app.include_router(auth_cliente_router, prefix="/api/auth/clientes", tags=["AuthCliente"])
app.include_router(clientes.router, prefix="/api/clientes", tags=["Clientes"])
app.include_router(compra_clientes_router, prefix="/api/compras", tags=["Compras"])
app.include_router(cliente_publico_router, prefix="/api/public/clientes", tags=["CadastroCliente"])


# 🔹 Rotas de teste e status
@app.get("/api/test")
def test_api():
    return {"message": "✅ API funcionando corretamente!"}

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do SynchroGest!"}
