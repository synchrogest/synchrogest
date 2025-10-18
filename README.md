# SynchroGest - Configuração para Desenvolvimento Local

Este repositório contém o código-fonte completo da aplicação SynchroGest, incluindo o frontend (React) e o backend (FastAPI), organizado para desenvolvimento local.

## Estrutura do Projeto

```
synchrogest/
|── .venv
├── frontend/      # Código-fonte do Frontend (React)
|   ├── node_modules
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── .env.local
|   ├── package-lock.json 
│   └── package.json
├── backend/       # Código-fonte do Backend (FastAPI)
|   ├── alembic
│   ├── app/
│   ├── scripts/
│   ├── venv/
│   ├── .env  # variáveis de ambiente
│   ├── alembic.ini
|   ├── initial_data.py
│   └── requirements.txt
|── .gitignore
├── package-lock.json
└── README.md      # Este arquivo - Instruções gerais
```

## Pré-requisitos Gerais

*   Node.js (v18 ou superior) e npm (ou pnpm/yarn)
*   Python (v3.10 ou superior) e pip
*   Um servidor de banco de dados (MySQL ou PostgreSQL recomendado)
*   Git (opcional, para controle de versão)
*   Visual Studio Code (ou seu editor de código preferido)

## Passos para Configuração e Execução

### 1. Configurar o Backend (FastAPI)

Siga as instruções detalhadas no arquivo `backend/README.md` para:

a.  Navegar até o diretório `backend`.
b.  Criar e ativar um ambiente virtual Python.
c.  Instalar as dependências Python (`pip install -r requirements.txt`).
d.  Criar um arquivo `.env` a partir do `.env.example` e configurar suas variáveis (SECRET_KEY, DATABASE_URL).
e.  Configurar seu banco de dados e aplicar as migrações (`alembic upgrade head`).
f.  Opcionalmente, criar um usuário administrador (`python scripts/criar_admin.py`).

### 2. Configurar o Frontend (React)

a.  Navegue até o diretório `frontend`:
    ```bash
    cd ../frontend
    ```
b.  Instale as dependências do Node.js:
    ```bash
    npm install
    # ou: pnpm install / yarn install
    ```
c.  O arquivo `.env` já contém `DANGEROUSLY_DISABLE_HOST_CHECK=true` (útil para desenvolvimento) e o `package.json` está configurado com um proxy para `http://localhost:8000`. Nenhuma configuração adicional de URL da API é necessária para desenvolvimento local.

### 3. Executar a Aplicação

* **Intalação de dependencias**
    <!-- pip install mysql-connector-python  (instalação do banco de dados mysql) -->
    <!-- pip install --upgrade bcrypt (atualiza o pacote bcrypt) -->
    <!-- python scripts/criar_admin.py -->

    <!-- alembic revision --autogenerate -m "criação inicial das tabelas" (Gerar nova migração) -->
    <!-- alembic downgrade base (Exclui a última migração) -->
    <!-- alembic upgrade head (Aplicar no banco) -->

Você precisará de dois terminais abertos:

*   **Terminal 1 (Backend):**
    *   Navegue até `/caminho/para/synchrogest_local/backend`.
    <!-- cd C:\Users\Utilizador\Documents\SynchroGest\synchrogest\backend -->
    <!-- python -m venv venv -->
    *   Ative o ambiente virtual (`source venv/bin/activate` ou `.\venv\Scripts\activate`).
    <!-- .\venv\Scripts\Activate -->

    *   Inicie o servidor backend:
        ```bash
        uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
        ```


*   **Terminal 2 (Frontend):**
    *   Navegue até `/caminho/para/synchrogest_local/frontend`.
    <!-- cd C:\Users\Utilizador\Documents\SynchroGest\synchrogest\frontend -->
    *   Inicie o servidor de desenvolvimento do frontend:
        ```bash
        npm install
        npm start
        # ou: pnpm start / yarn start
        ```

Após iniciar ambos os servidores:

*   O **backend** estará rodando em `http://localhost:8000`.
*   O **frontend** estará acessível em `http://localhost:3000` (ou outra porta indicada pelo `npm start`).

Acesse `http://localhost:3000` no seu navegador para usar a aplicação SynchroGest localmente.

## Visual Studio Code

Você pode abrir a pasta raiz `synchrogest_local` no VS Code. Recomenda-se instalar extensões para Python e React/JavaScript para uma melhor experiência de desenvolvimento.


# TESTES

## Teste com Swagger

Acesso: http://localhost:8000/docs

### 🧪 Instruções para autenticação:

1. Use o endpoint `POST /api/auth/login` para fazer login com **email** e **senha**.
1.1 username: admin@synchrogest.com
1.2 password: admin123
2. Retorna: "access_token": EX: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzUwNDIwNzA1fQ.Y2mI1sva7UHn5ah2HJVO4XzU6UrQNxFEtPyRb5OlvL8",
  "token_type": "bearer"


## Testar no Postman

Acesse no navegador: http://localhost:8000/docs (Swagger)
Clique em: openapi.json
Salve como synchrogestapi.json
“Importar” > “Arquivo” > (importe do diretório escolhido para armazenar, o arquivo: synchrogestapi.json )

### 🧪 Instruções para autenticação:

POST http://localhost:8000/api/auth/login
O corpo da requisição não será JSON, e sim do tipo x-www-form-urlencoded.
Vá até a aba “Body”.
Selecione x-www-form-urlencoded.
Adicione dois campos:
Key → username → value: usuário = 'admin@synchrogest.com'
Key → password → value: senha = 'admin123'
Clique em "SEND" e aparecerá o <token> da requisição e status 200.
"token_type": bearer 

