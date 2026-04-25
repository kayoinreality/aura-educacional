# Aura Educacional

Plataforma de cursos livres com catálogo público, autenticação de alunos, pagamento online, área de estudos, avaliação final e emissão de certificado digital.

## Visão geral

O projeto está organizado como monorepo e separa claramente os subdomínios da plataforma:

- `www` / raiz: experiência pública, catálogo, checkout e certificados públicos
- `app`: ambiente de aprendizagem do aluno
- `admin`: painel administrativo e operação interna
- `api`: backend Fastify compartilhado pelos frontends

Principais fluxos já implementados:
- página pública de apresentação da plataforma
- catálogo de cursos com categorias e páginas de detalhes
- cadastro e login de alunos
- autenticação com Google
- inscrição e pagamento com Stripe
- área do aluno com progresso de estudos
- avaliação final por curso
- emissão e validação de certificados

## Estrutura

```text
aura-educacional/
  backend/
    api/        # API Fastify + Prisma + Redis + Stripe
  frontend/
    web/        # site público, catálogo, checkout e certificados públicos
    learning/   # ambiente do aluno para estudos, progresso e avaliação
    admin/      # aplicação administrativa separada
  packages/     # tipos, utilitários e componentes compartilhados
  infra/        # docker, serviços locais e arquivos de suporte
  docs/         # documentação complementar
```

## Stack

- Frontend: Next.js 14
- Backend: Fastify
- Banco de dados: PostgreSQL
- ORM: Prisma
- Cache e tokens: Redis
- Pagamentos: Stripe
- Login social: Google Identity Services
- Infra local: Docker Compose
- Monorepo: npm workspaces + Turborepo

## Requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Suba os serviços locais:

```bash
npm run docker:dev:up
```

3. Gere o Prisma, aplique migrations e popule o banco:

```bash
npm run db:generate:api
npm run db:migrate:api
npm run db:seed:api
```

4. Inicie a API:

```bash
npm run dev:api
```

5. Em outro terminal, inicie o frontend público:

```bash
npm run dev:web
```

6. Inicie o ambiente do aluno:

```bash
npm run dev:learning
```

7. Se quiser iniciar também o painel administrativo:

```bash
npm run dev:admin
```

## Endereços locais

- site público: `http://localhost:3000`
- API: `http://127.0.0.1:3001`
- admin: `http://localhost:3002`
- ambiente do aluno: `http://localhost:3003`
- PostgreSQL: `127.0.0.1:5432`
- Redis: `127.0.0.1:6379`
- pgAdmin: `http://127.0.0.1:5050`

## Subdomínios

Mapeamento recomendado para produção:

```text
auraeducacional.app               -> frontend/web
www.auraeducacional.app           -> frontend/web
app.auraeducacional.app           -> frontend/learning
admin.auraeducacional.app         -> frontend/admin
api.auraeducacional.app           -> backend/api
```

Em desenvolvimento, os mesmos papéis ficam em portas locais:

```text
localhost:3000 -> web
localhost:3003 -> learning
localhost:3002 -> admin
127.0.0.1:3001 -> api
```

## Scripts principais

```bash
npm run dev
npm run build
npm run dev:web
npm run dev:learning
npm run dev:api
npm run dev:admin
npm run docker:dev:up
npm run docker:dev:down
npm run db:migrate:api
npm run db:seed:api
```

## Variáveis de ambiente

Use `.env.example` como base. Os grupos mais importantes são:

- aplicação, URLs e subdomínios
- PostgreSQL e Redis
- JWT e cookies
- Google OAuth
- Stripe
- SMTP e armazenamento

No frontend público, as variáveis mais relevantes são:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_LEARNING_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

No frontend de aprendizagem, as variáveis mais relevantes são:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`

No backend, as mais relevantes são:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `CORS_ORIGINS`

## Deploy

Estratégia atual:

- frontend público no Cloudflare Pages
- frontend de aprendizagem no subdomínio `app`
- frontend administrativo no subdomínio `admin`
- backend em VPS própria
- monorepo mantido em um único repositório

Guias complementares:

- `docs/DEPLOYMENT.md`
- `docs/SECURITY.md`

## Observações

- A área pública não depende da área administrativa para navegação do aluno.
- O ambiente do aluno agora fica em `frontend/learning`, separado do site público.
- O frontend possui conteúdo de fallback para demonstração quando a API pública ainda não está disponível.
- O CORS do backend já foi preparado para produção com frontend e API em origens separadas.
