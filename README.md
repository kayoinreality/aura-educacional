# Aura Educacional

Plataforma de cursos livres com assinatura e venda avulsa, certificados de horas verificáveis e CMS administrativo.

**Stack:** Next.js 15 (3 apps) + Hono em Cloud Run + Cloud SQL Postgres (Drizzle) + Firebase Auth + Mux Video + Resend + Stripe.

## Estrutura

```
aura-educacional/
├── apps/
│   ├── web/        → Landing + catálogo + checkout + verificação pública (auraeducacional.com.br)
│   ├── learn/      → Área do aluno + player de aulas + certificados (app.auraeducacional.com.br)
│   ├── admin/      → CMS interno (admin.auraeducacional.com.br)
│   └── api/        → Hono REST API (api.auraeducacional.com.br)
├── packages/
│   ├── ui/         → Design system (tokens navy+gold, Logo, Button, Card, …)
│   ├── db/         → Drizzle schema + client + migrations + seed
│   ├── types/      → Schemas Zod compartilhados front/back
│   ├── auth/       → Wrappers Firebase (cliente + Admin SDK)
│   └── config/     → tsconfig, tailwind preset, eslint compartilhados
└── infra/
    ├── firebase/   → firebase.json, .firebaserc, storage.rules
    ├── cloud-run/  → cloudbuild.yaml, setup.sh
    ├── docker/     → docker-compose para Postgres local
    └── github-actions/
```

## Quickstart (dev local)

```bash
# Pré-requisitos: Node 20+, pnpm 9+, Docker

pnpm install                  # instala todas as deps do monorepo

# Banco local
pnpm dlx docker compose -f infra/docker/docker-compose.yml up -d

# Migrações + seed
cp .env.example .env.local
pnpm db:generate              # gera SQL a partir do schema Drizzle
pnpm db:migrate
pnpm db:seed

# Sobe os 4 apps em paralelo
pnpm dev
#   web   → http://localhost:3000
#   learn → http://localhost:3001
#   admin → http://localhost:3002
#   api   → http://localhost:8080
```

## Infraestrutura (produção)

- **Frontend**: Firebase Hosting → rewrites para Cloud Run (Next.js SSR em containers).
- **API**: Hono em Cloud Run, região `southamerica-east1`.
- **Banco**: Cloud SQL Postgres 16 com Cloud SQL Auth Proxy.
- **Auth**: Firebase Auth (Google + email/senha + email link).
- **Storage**: Firebase Storage (GCS) — buckets `aura-files`, `aura-certificates`.
- **Vídeo**: Mux (signed playback, JWT por aula).
- **Email**: Resend + React Email para templates transacionais.
- **Filas**: Cloud Tasks (cert-generation, email-dispatch, webhook-processor).
- **Cron**: Cloud Scheduler.
- **Pagamentos**: Stripe (Subscription + Checkout one-time + Customer Portal).

Setup inicial do projeto GCP:

```bash
export PROJECT_ID=auraeducacional
gcloud config set project $PROJECT_ID
./infra/cloud-run/setup.sh
```

Deploy via Cloud Build:

```bash
gcloud builds submit --config infra/cloud-run/cloudbuild.yaml
```

## Modelo de produto

- **Assinatura Pro** (mensal/anual) → acesso a todo o catálogo + certificados ilimitados (7 dias grátis).
- **Cursos avulsos** → compra individual com acesso vitalício + certificado.
- **Certificado de horas** declaratório (cursos livres conforme LDB 9.394/96 art. 42), com QR code de verificação pública.

A entidade `course_access` separa **direito de acesso** de **inscrição** — compras avulsas geram rows persistentes; assinaturas são checadas dinamicamente por subquery (evita inflar tabela com 1 row por curso × assinante).

## Documentação

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — arquitetura detalhada
- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) — guia de deploy passo a passo
- [`docs/SECURITY.md`](./docs/SECURITY.md) — segurança e LGPD
- [`/root/.claude/plans/root-claude-uploads-46437ee7-280b-4640-validated-beaver.md`](./) — plano de rebuild original

## Roadmap (13 semanas para MVP em produção)

1. **Foundation** (sem 1-2) — monorepo, schema, auth, deploy pipeline ✅ *este commit*
2. **Core público** (sem 3-4) — sales page, catálogo, signup, página de curso
3. **Comércio** (sem 5-6) — Stripe Checkout (assinatura + avulso), webhooks, course_access
4. **Player** (sem 7-8) — Mux player, progresso, quiz UI
5. **Certificado** (sem 9) — geração via Puppeteer (Cloud Run), verificação pública
6. **Admin MVP** (sem 10-12) — Course Builder, gestão de alunos, pedidos, cupons, certificados
7. **Soft launch** (sem 13) — LGPD, a11y, SEO, monitoring, beta com 20-50 users reais
