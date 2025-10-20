# SYNCHROGEST - Sistema de Gestão

Este repositório contém o código-fonte completo da aplicação SynchroGest, incluindo o frontend (React) e o backend (FastAPI), organizado para ambiente de desenvolvimento simulando um projeto real para ser utilizados por Testers e QA`s.
---
## Estrutura do Projeto

```
synchrogest/
|── .venv
├── frontend/      # Código-fonte do Frontend (React)
|   ├── node_modules
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── .env.local # variáveis de ambiente
|   ├── package-lock.json 
│   └── package.json
├── backend/       # Código-fonte do Backend (FastAPI)
|   ├── alembic    # Migração e criação de banco de dados
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
---
# TESTES DE API

## Testar com Swagger

Acesso: https://synchrogest-app.onrender.com/docs

### Instruções para Autorização

1. Clique em: Authoraze
1.1 Preencha usaename: user@synchrogest.com
1.2 Preencha password: user1234
1.3 Clique em Authoraze para validar as credenciais

### Instruções para autenticação:

1. EX: Use o endpoint `POST /api/auth/login` para fazer login com **email** e **senha**.
1.1 username: user@synchrogest.com
1.2 password: user1234
2. Retorna: "access_token": EX: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzUwNDIwNzA1fQ.Y2mI1sva7UHn5ah2HJVO4XzU6UrQNxFEtPyRb5OlvL8",
  "token_type": "bearer"

## Testar com Postman

Acesse no navegador: https://synchrogest-app.onrender.com/docs (Swagger)
Clique em: openapi.json
Salve como synchrogestapi.json
“Importar” > “Arquivo” > (importe do diretório escolhido para armazenar, o arquivo: synchrogestapi.json )

### Instruções para autenticação:

POST https://synchrogest-app.onrender.com/docs#/Autentica%C3%A7%C3%A3o/login_for_access_token_api_auth_login_post
O corpo da requisição não será JSON, e sim do tipo x-www-form-urlencoded.
Vá até a aba “Body”.
Selecione x-www-form-urlencoded.
Adicione dois campos:
Key → username → value: usuário = 'user@synchrogest.com'
Key → password → value: senha = 'user1234'
Clique em "SEND" e aparecerá o <token> da requisição e status 200.
"token_type": bearer 

---
# TESTES MANUAIS

Testers e QA podem explorar ações como:

### Fluxos de Usuário

* Login/logout com diferentes níveis de acesso (admin, usuario, visualizacao)

* Cadastro de novos usuários, edição e desativação

* Verificar restrições de acesso para cada nível de usuário

### Gestão de Projetos

* Criar, editar e deletar projetos

* Adicionar/Remover colaboradores

* Associar produtos aos projetos e verificar quantidade correta

* Exportar listas de produtos por projeto

* Movimentações e Gerenciamento

* Registrar movimentações de produtos

* Validar cálculos de estoque e relatórios

* Testar filtros de busca e paginação

### Front-End

* Testar todos os botões e formulários

* Verificar responsividade da aplicação

* Testar integração com backend e mensagens de erro

* Testes de Segurança

* Testar endpoints protegidos com token JWT válido e inválido

* Verificar falhas de autenticação e autorização

* Testar tentativas de injeção e dados inválidos

* Validação de Dados

* Inserir dados inválidos e validar mensagens de erro

* Testar limites de campos (strings, números, datas)

* Testar consistência entre frontend e backend

### CI/CD

* Testar pipelines de deploy (Render ou GitHub Actions)

* Validar build do frontend (npm install && npm run build)

* Validar build do backend (pip install -r requirements.txt && alembic upgrade head)

* Testar deploy em staging e produção

* Validar logs de erro e alertas em casos de falha

---
# EXEMPLOS DE TESTES SYNCHROGEST

## 1. API - Login (Autenticação)

Objetivo: Verificar se o endpoint de login retorna token válido.

Endpoint: POST /api/auth/login

Método: POST

Body: x-www-form-urlencoded

username: user@synchrogest.com

password: user1234

### Passos:

Abrir Postman/Swagger.

Inserir dados do usuário e enviar requisição.

Resultado Esperado:
```
{
  "access_token": "<token_jwt_valido>",
  "token_type": "bearer"
}
```
Validação:

Código HTTP 200

access_token presente e formato JWT válido

## 2. FRONTEND - Formulário de Cadastro de Usuário

Objetivo: Testar criação de novo usuário via frontend.

Passos:

Acessar página de cadastro: /usuarios/cadastro.

Preencher campos:

Nome: Teste QA

Email: qa@test.com

Senha: senha1234

Clicar em Salvar

Resultado Esperado:

Mensagem: Usuário criado com sucesso

Usuário aparece na lista de usuários

Validação:

Verificar tabela usuarios no banco de dados

Confirmação visual no frontend

## 3. FLUXO DE USUÁRIO - Login/Admin

Objetivo: Verificar acesso restrito por nível de usuário.

Passos:

Login com usuário nível usuario → tentar acessar página /admin.

Login com usuário nível admin → acessar página /admin.

Resultado Esperado:

Usuário normal: mensagem de acesso negado.

Admin: acesso liberado e visualização completa do painel.

Validação:

Status HTTP 403 ou redirecionamento correto

Elementos da UI correspondem ao nível do usuário

## 4. GESTÃO DE PROJETOS

Objetivo: Testar criação, edição e associação de produtos.

Passos:

Criar projeto Projeto QA.

Adicionar produto Produto Teste com quantidade 10.

Editar quantidade para 15.

Remover produto.

Resultado Esperado:

Produto adicionado e atualizado corretamente

Produto removido da lista de projeto

Validação:

Consultar banco: tabela projeto_produtos

Comparar valores com entradas feitas

## 5. MOVIMENTAÇÕES DE ESTOQUE

Objetivo: Registrar movimentação de produtos e validar cálculo.

Passos:

Selecionar produto Produto Teste.

Inserir movimentação: tipo entrada, quantidade 20.

Inserir movimentação: tipo saída, quantidade 5.

Resultado Esperado:

Quantidade final = 15

Validação:

Conferir campo estoque_atual no banco de dados

Relatórios refletem movimentação corretamente

## 6. SEGURANÇA - Token JWT Inválido

Objetivo: Testar proteção de endpoints com token inválido.

Passos:

Enviar requisição para endpoint protegido /api/projetos com token inválido:

Authorization: Bearer token_errado

Resultado Esperado:

Código HTTP: 401

Mensagem: Unauthorized

Validação:

Endpoint não retorna dados confidenciais

Logs do backend registram tentativa de acesso inválido
---
## Este projeto utiliza licença MIT
