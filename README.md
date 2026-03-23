# Backend Banco - Django + DRF

Projeto backend bancário com arquitetura separada em `core` e `api`, seguindo princípios de responsabilidade única (SOLID) para regras de negócio.

## Stack

- Django + Django REST Framework
- JWT (`simplejwt`)
- OpenAPI/Swagger (`drf-spectacular`)
- Redis cache (`django-redis`)
- PostgreSQL
- Docker / Docker Compose

## Arquitetura

```text
Backend/
├── core/
│   ├── services/             # Regras de negócio
│   └── utils/                # Utilitários (documento, geração de conta)
├── api/
│   ├── authentication/       # Cadastro e JWT
│   ├── customers/            # Dados do cliente
│   ├── accounts/             # Dados da conta
│   ├── transactions/         # Depósito, PIX, transferências, extrato
│   └── loans/                # Simulação e crédito de empréstimo
└── setup/                    # Configuração global do projeto
```

## Etapa 1 - Subir infraestrutura e aplicação

```bash
docker compose up --build
```

Esse comando:
- sobe PostgreSQL;
- sobe Redis;
- executa `makemigrations`, `migrate` e inicia servidor em `http://localhost:8000`.

## Etapa 2 - Endpoints e autenticação

### 1) Cadastrar cliente (gera agência e conta automaticamente)
`POST /api/v1/auth/register/`

Exemplo:
```json
{
  "username": "cliente1",
  "password": "SenhaForte123",
  "full_name": "Cliente Teste",
  "document": "12345678901"
}
```

### 2) Obter JWT
`POST /api/v1/auth/token/`

```json
{
  "username": "cliente1",
  "password": "SenhaForte123"
}
```

### 3) Refresh token
`POST /api/v1/auth/token/refresh/`

## Etapa 3 - Operações bancárias

Use `Authorization: Bearer <access_token>`.

- `GET /api/v1/customers/me/` - dados do cliente
- `GET /api/v1/accounts/me/` - dados da conta (cacheado)
- `GET /api/v1/transactions/statement/` - extrato (cacheado)
- `POST /api/v1/transactions/deposit/` - depósito
- `POST /api/v1/transactions/pix/` - PIX interno
- `POST /api/v1/transactions/transfer/internal/` - transferência interna
- `POST /api/v1/transactions/transfer/external/` - transferência para outro banco

## Etapa 4 - Empréstimo

- `POST /api/v1/loans/simulate/` - simulação com taxa mensal fixa
- `POST /api/v1/loans/credit/` - crédito em conta (lança transação)

## Etapa 5 - Documentação

- Schema OpenAPI: `GET /api/schema/`
- Swagger UI: `GET /api/docs/`

## Comandos úteis

```bash
# parar containers
docker compose down

# remover volumes (limpa banco)
docker compose down -v

# executar migrations manualmente
docker compose exec web python manage.py migrate

# criar superusuário
docker compose exec web python manage.py createsuperuser
```
