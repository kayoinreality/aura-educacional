# Aura Educacional - Guia de Deploy

## Estrategia recomendada

Para o estado atual do projeto, o melhor caminho e:

- manter o monorepo
- publicar o frontend publico no Cloudflare Pages
- subir o backend/API na VPS
- manter PostgreSQL, Redis e rotinas internas na VPS

Isso preserva o compartilhamento de `packages/*` sem separar repositorios antes da hora.

## Estrutura usada no deploy

```text
frontend/web    -> site publico
frontend/admin  -> console administrativo
backend/api     -> API principal
packages/*      -> codigo compartilhado
```

## Frontend no Cloudflare Pages

### Variaveis de ambiente

No projeto do Cloudflare Pages, configure:

```bash
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

Enquanto a VPS nao estiver no ar, o frontend pode ser publicado, mas login, checkout,
area do aluno e certificados so vao funcionar completamente quando a API estiver acessivel.

### Configuracao recomendada do projeto

Use estas referencias ao criar o Pages project:

- Framework preset: `Next.js`
- Production branch: `main`
- Root directory: `/`
- Build command: `npm install && npm --workspace @aura/web run cf:build`
- Build output directory: `frontend/web/.vercel/output/static`

Como este e um monorepo, mantenha o repositório inteiro conectado ao Pages e deixe o build
rodar a partir da raiz.

### Observacao sobre Next.js

O frontend atual consome a API externa e usa rotas dinamicas. Por isso, a configuracao de
producao depende do dominio final da API e do CORS correto no backend.

## Backend na VPS

### Variaveis de ambiente de producao

Antes de subir a API, ajuste o `.env` com valores reais, por exemplo:

```bash
NODE_ENV=production
APP_URL=https://seu-projeto.pages.dev
API_URL=https://api.seu-dominio.com
CORS_ORIGINS=https://seu-projeto.pages.dev,https://www.seu-dominio.com
COOKIE_DOMAIN=
```

Use `COOKIE_DOMAIN` apenas se for realmente compartilhar o cookie entre subdominios do mesmo
dominio raiz. Se o frontend estiver em `pages.dev`, deixe esse campo vazio.

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

No painel do dominio, adicione:

```text
A    @      -> IP_DO_SERVIDOR
A    www    -> IP_DO_SERVIDOR
A    api    -> IP_DO_SERVIDOR
```

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
curl https://api.seu-dominio.com/health
```

### 6. Ver logs

```bash
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs api --tail=50
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs postgres --tail=50
docker compose --env-file infra/docker/.env -f infra/docker/docker-compose.yml logs redis --tail=50
```

## Checklist rapido de producao

- frontend publicado no Cloudflare Pages
- `NEXT_PUBLIC_API_URL` apontando para a API real
- backend com `NODE_ENV=production`
- `APP_URL` e `API_URL` corretos
- `CORS_ORIGINS` contendo o dominio do frontend
- HTTPS ativo na API
- Stripe webhook apontando para a URL publica da API
- Google OAuth com dominios autorizados de producao
