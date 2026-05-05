# Dinero Backend

Repositório responsável pelo desenvolvimento do backend do Projeto Integrador Dinero.

## Pré-requisitos

- Node.js 20+
- npm
- Docker

## Como rodar localmente (Windows/PowerShell)

1. Entre na pasta do backend:

```powershell
cd .\dinero
```

2. Crie o arquivo de ambiente:

```powershell
Copy-Item .env.example .env
```

3. Instale as dependências:

```powershell
npm install
```

4. Suba os bancos PostgreSQL:

```powershell
docker compose up -d
```

5. Gere os clients do Prisma:

```powershell
npm run prisma:generate:all
```

6. Aplique as migrations:

```powershell
npm run prisma:migrate:all
```

7. Suba todos os microsserviços:

```powershell
npm run start:all
```

## Rodar serviços individualmente

```powershell
npm run start:identity
npm run start:financial
npm run start:portfolio
npm run start:openfinance
```

## Health checks

- Identity: http://localhost:3001/v1/identity/health
- Financial: http://localhost:3002/v1/financial/health
- Portfolio: http://localhost:3003/v1/portfolio/health
- OpenFinance: http://localhost:3004/v1/openfinance/health