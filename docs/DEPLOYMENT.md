# Aura Educacional - Guia de Deploy

## Estrategia recomendada

Para o estado atual do projeto, o melhor caminho e:

- manter o monorepo
- publicar os frontends no Cloudflare Pages, um projeto por subdominio
- subir somente o backend/API e servicos internos na VPS
- manter PostgreSQL, Redis e rotinas internas na VPS

Isso preserva o compartilhamento de `packages/*` sem separar repositorios antes da hora.

## Estrutura usada no deploy

```text
frontend/web       -> site publico em auraeducacional.app
frontend/learning  -> area do aluno em app.auraeducacional.app
frontend/admin     -> console administrativo em admin.auraeducacional.app
backend/api        -> API principal em api.auraeducacional.app
packages/*         -> codigo compartilhado
```

## Frontends no Cloudflare Pages

Crie tres projetos Pages apontando para o mesmo repositorio GitHub e branch `main`.
Como o projeto e um monorepo, mantenha o root directory como `/` e troque apenas o
workspace usado no build.

### Site publico

```text
Project name: aura-educacional
Custom domains: auraeducacional.app, www.auraeducacional.app
Framework preset: Next.js
Production branch: main
Root directory: /
Build command: npm install && npm --workspace @aura/web run cf:build
Build output directory: frontend/web/.vercel/output/static
```

Variaveis:

```bash
NEXT_PUBLIC_API_URL=https://api.auraeducacional.app
NEXT_PUBLIC_LEARNING_URL=https://app.auraeducacional.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

### Area do aluno

```text
Project name: aura-learning
Custom domain: app.auraeducacional.app
Framework preset: Next.js
Production branch: main
Root directory: /
Build command: npm install && npm --workspace @aura/learning run cf:build
Build output directory: frontend/learning/.vercel/output/static
```

Variaveis:

```bash
NEXT_PUBLIC_API_URL=https://api.auraeducacional.app
NEXT_PUBLIC_SITE_URL=https://auraeducacional.app
```

### Admin

```text
Project name: aura-admin
Custom domain: admin.auraeducacional.app
Framework preset: Next.js
Production branch: main
Root directory: /
Build command: npm install && npm --workspace @aura/admin run cf:build
Build output directory: frontend/admin/.vercel/output/static
```

Variaveis:

```bash
NEXT_PUBLIC_API_URL=https://api.auraeducacional.app
```

O Cloudflare Pages deve continuar usando Git integration. Assim, cada push na `main`
gera deploy automatico dos tres projetos.

## Backend na VPS

### Variaveis de ambiente de producao

Antes de subir a API, ajuste o `.env` com valores reais, por exemplo:

```bash
NODE_ENV=production
APP_URL=https://auraeducacional.app
API_URL=https://api.auraeducacional.app
CORS_ORIGINS=https://auraeducacional.app,https://www.auraeducacional.app,https://app.auraeducacional.app,https://admin.auraeducacional.app
COOKIE_DOMAIN=.auraeducacional.app
```

Use `COOKIE_DOMAIN=.auraeducacional.app` para compartilhar o cookie de refresh entre
os subdominios do site, app do aluno e admin.

### CORS e autenticacao cross-origin

O backend precisa aceitar:

- a origem do frontend publicado
- `credentials: include`
- cookie `refresh_token` com `SameSite=None` e `Secure=true` em producao quando frontend e API
  estiverem em origens diferentes

Esses ajustes ja foram implementados no projeto.

## Deploy na VPS - passo a passo

### 1. Preparar o servidor

```bash
apt update && apt upgrade -y
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER
apt install docker-compose-plugin -y

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. Configurar DNS

No Cloudflare DNS, os frontends devem ser ligados pelos Custom Domains do Pages.
Para a API na VPS, adicione:

```text
A    api    -> IP_DO_SERVIDOR
```

Nao aponte `@`, `www`, `app` ou `admin` para a VPS se eles estiverem no Pages.

### 3. Clonar e configurar

```bash
cd /opt
git clone https://github.com/seu-usuario/aura-educacional.git
cd aura-educacional

cp .env.example .env
nano .env
```

Para gerar secrets seguros:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Subir infraestrutura e aplicar banco

```bash
npm install
npm run docker:up
npm run db:migrate:api
npm run db:seed:api
```

### 5. Validar a API

```bash
curl https://api.auraeducacional.app/health
```

### 6. Ver logs

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs api --tail=50
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs postgres --tail=50
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs redis --tail=50
```

## Checklist rapido de producao

- tres frontends publicados no Cloudflare Pages
- `NEXT_PUBLIC_API_URL` apontando para a API real
- `NEXT_PUBLIC_LEARNING_URL` apontando para `https://app.auraeducacional.app`
- backend com `NODE_ENV=production`
- `APP_URL` e `API_URL` corretos
- `CORS_ORIGINS` contendo site publico, learning e admin
- HTTPS ativo na API
- Stripe webhook apontando para a URL publica da API
- Google OAuth com dominios autorizados de producao
