# CLAUDE.md — Aura Educacional

Guia de orientação para qualquer agente trabalhando neste repositório.

## O que é

Plataforma de cursos livres com **assinatura mensal/anual + venda avulsa**, certificados declaratórios (LDB 9.394/96 art. 42), público-alvo educadores e profissionais brasileiros.

Identidade visual: **navy `#0F1E47` + gold `#C9A961`**, light/institucional. Logo é triângulo navy com livro aberto em gold.

## Stack

| Camada | Tecnologia |
|---|---|
| Monorepo | **Turborepo + pnpm 9** (`apps/*` e `packages/*`) |
| Frontend | **Next.js 15** (App Router) + **React 19** + **Tailwind v4** |
| Animação | Framer Motion (sutil — `whileInView`, stagger, sem glassmorphism) |
| Backend | **Hono** em **Cloud Run** (`southamerica-east1`) — Node 20 alpine |
| ORM | **Drizzle ORM** |
| Banco | **Cloud SQL Postgres 16** (Auth Proxy via Unix socket em prod, Docker em dev) |
| Auth | **Firebase Auth** (Google + email/senha). Admin SDK valida ID tokens no servidor |
| Storage | Firebase Storage / GCS — buckets `aura-files`, `aura-certificates` |
| Vídeo | **Mux** (signed playback, JWT renovado a cada 30s no player) |
| Email | **Resend** + React Email |
| Pagamentos | **Stripe** Checkout (`mode=subscription` + `mode=payment`) + Customer Portal |
| Filas | **Cloud Tasks** (cert-generation, email-dispatch, webhook-processor) |
| Cron | Cloud Scheduler |
| Hospedagem frontend | **Firebase App Hosting** (3 backends, build do source, sem Dockerfile) |
| Deploy API | **Cloud Build** (`infra/cloud-run/cloudbuild.yaml`) — só API |
| Deploy frontends | **Firebase CLI** (`firebase apphosting:rollouts:create`) |

## Estrutura

```
apps/
  web/        Next.js — landing + catálogo + checkout + verificação cert (auraeducacional.com.br)
  learn/      Next.js — área do aluno + player + certificados (app.auraeducacional.com.br)
  admin/      Next.js — CMS interno (admin.auraeducacional.com.br)
  api/        Hono — REST API (api.auraeducacional.com.br, porta 8080)
packages/
  ui/         design system (@aura/ui) — tokens navy/gold, componentes base
  db/         Drizzle schema + client + migrate + seed (@aura/db)
  types/      Zod DTOs compartilhados front/back (@aura/types)
  auth/       wrappers Firebase cliente + Admin SDK (@aura/auth)
  config/     tsconfig + tailwind preset + eslint (@aura/config)
infra/
  firebase/   firebase.json (storage.rules), .firebaserc
              apphosting.yaml por app em cada apps/<x>/apphosting.yaml
  cloud-run/  cloudbuild.yaml (só API) + setup.sh
  docker/     docker-compose.yml para Postgres local
.github/
  workflows/  ci.yml (typecheck + lint + build em PRs)
```

## Decisões arquiteturais

### 1. `course_access` separada de `enrollments`
- `enrollments` = jornada (1 row por user×course, com progresso).
- `course_access` = direito de acesso (N rows por origem: `purchase`, `gift`, `admin_grant`).
- **Assinatura NÃO materializa rows** em `course_access` — função SQL `has_course_access(user, course)` checa via subquery em `subscriptions` ativas.

### 2. Snapshots imutáveis em `certificates`
`user_name_snapshot`, `course_title_snapshot`, `workload_hours_snapshot`, `instructor_name_snapshot`, `final_score`. Certificado **nunca muda** mesmo após edição do curso.

### 3. Idempotência de webhooks
`webhook_events.event_id UNIQUE` (com `source`). Stripe/Mux retentam — sem isso, dupla concessão de acesso.

### 4. Race em complete-course
`UNIQUE (user_id, course_id) WHERE status='issued'` em `certificates`. Segundo insert falha gracefully.

### 5. Auth via Firebase ID token
- Cliente envia `Authorization: Bearer <idToken>` em todo request autenticado.
- API valida via Admin SDK com middleware `requireAuth`. Custom claims (`role`) via `requireRole('admin')`.
- Sem cookies de sessão próprios. Sem CSRF.

### 6. Geração de PDF de certificado
**Cloud Run + Puppeteer** (não App Hosting). HTML→PDF com fidelidade total. Roda no `queue-consumer`, disparado por Cloud Tasks.

### 7. App Hosting para frontends, Cloud Run para API
Frontends Next.js (`web`, `learn`, `admin`) rodam em **Firebase App Hosting** — build do source sem Dockerfile, deploy via CLI. API Hono permanece em **Cloud Run direto** por causa do Cloud SQL Auth Proxy (Unix socket), Puppeteer e controle fino de container. Mistura proposital.

> `@aura/db` não deve ser importado em nenhum frontend — toda lógica de banco passa pela API.

## Convenções de código

### TypeScript
- Strict mode + `noUncheckedIndexedAccess` + `noImplicitOverride`.
- Imports relativos dentro do pacote; alias `@/` para `src/` em apps; pacotes via `@aura/*`.

### Componentes React
- Server components por padrão. `'use client'` só quando necessário (forms, animações Framer, hooks de state).
- Componentes compartilhados em `@aura/ui` (forwardRef + cva + cn).

### Estilos
- Apenas Tailwind. Tokens em `packages/config/tailwind.preset.ts` e `@theme` em `packages/ui/src/styles.css`.
- Nunca usar cores raw — sempre via classe (`bg-navy-700`, `text-gold-500`).
- `.btn-shimmer` exclusivo no CTA principal da landing.

### Drizzle
- Schema dividido por domínio em `packages/db/src/schema/*.ts`, exportado via `index.ts`.
- `numeric` para dinheiro/porcentagens; `integer` para `*_cents`; `jsonb` para metadata.
- `onDelete` explícito em todas as FKs. Índices nomeados explicitamente.

### API (Hono)
- Rotas em `apps/api/src/routes/<domain>.ts`.
- `requireAuth` em todos os endpoints privados; `requireRole(...)` para admin.
- Validação com `zValidator('json', schema)` usando schemas de `@aura/types`.
- Webhooks: validar HMAC, registrar em `webhook_events` com idempotência, enfileirar.

### Tom institucional
- Português BR. "curso livre", "carga horária", "certificado de conclusão" (não "diploma").
- Certificado deve mencionar LDB 9.394/96 art. 42 + "sem reconhecimento MEC".
- Sem emojis em UI/textos.

## Fluxos críticos

### Onboarding
1. Login Firebase → ID token.
2. `POST /auth/sync` com Bearer token → cria/atualiza row `users`.

### Compra
1. `POST /checkout/subscription` ou `/checkout/course` → URL Stripe.
2. Webhook `checkout.session.completed` → `webhook_events` → `webhook-processor`.
3. Worker cria `subscription` ou `order` + `course_access`. Email via Resend.
4. Sucesso redireciona para `app.auraeducacional.com.br/auth/handoff?session=...`.

### Certificado
1. `POST /courses/:id/complete` → valida acesso + progresso 100% + quiz passed.
2. Insert em `certificates` (UNIQUE evita race) → enqueue `cert-generation`.
3. Worker Puppeteer gera PDF → `gs://aura-certificates` → email.
4. Verificação pública em `/certificados/[code]` (sem auth).

## Quick commands

```bash
# Dev local
docker compose -f infra/docker/docker-compose.yml up -d
pnpm db:migrate && pnpm db:seed
pnpm dev                        # turbo parallel: web, learn, admin, api

# Apps individuais
pnpm dev:web | dev:learn | dev:admin | dev:api

# Banco
pnpm db:generate | db:migrate | db:seed | db:studio

# Build / qualidade
pnpm build
pnpm typecheck
pnpm lint

# Deploy API (Cloud Run)
gcloud builds submit --config infra/cloud-run/cloudbuild.yaml

# Deploy frontends (Firebase App Hosting)
firebase apphosting:rollouts:create aura-web   --git-branch main
firebase apphosting:rollouts:create aura-learn --git-branch main
firebase apphosting:rollouts:create aura-admin --git-branch main

# Logs de um backend
firebase apphosting:backends:logs aura-web --project auraeducacional
```

## Onde NÃO mexer sem motivo

- Tokens de cor em `packages/config/tailwind.preset.ts` e `packages/ui/src/styles.css`.
- Decisão `course_access` vs `enrollments`.
- Snapshots em `certificates`.
- Idempotência de `webhook_events`.
- Arquitetura API em Cloud Run / frontends em App Hosting (decisão #7).

## Pendências conhecidas

- Handlers de webhook Stripe completos (`webhook-processor` worker).
- HMAC validation real no webhook Mux.
- Endpoint `/internal/generate-cert` com Puppeteer.
- Course Builder UI no `apps/admin`.
- Player Mux em `apps/learn` com progress tracking.
- Page `/conta` em `apps/learn` (perfil, assinatura, histórico).
- Rate limiting nos endpoints sensíveis.
- Pen test antes do soft launch.
- Sentry com PII scrubbing.
- Avaliar deploy da API via GitHub Actions (Workload Identity Federation) para uniformizar CI/CD.

## Migração App Hosting — passos pendentes (infra, fora do código)

Os arquivos de código (`apphosting.yaml`, remoção de `output: standalone`, Dockerfiles) estão planejados mas **não implementados**. Quando for executar:

1. Pré-flight: `grep -r "@aura/db" apps/web/src apps/learn/src apps/admin/src` deve retornar vazio.
2. Verificar região: `gcloud beta firebase apphosting backends list-locations --project=auraeducacional` → usar `southamerica-east1` ou fallback `us-east1`.
3. Criar `apps/{web,learn,admin}/apphosting.yaml` com `runConfig` e `env` (`NEXT_PUBLIC_*` com `availability: [BUILD, RUNTIME]`).
4. Remover `output: 'standalone'` dos 3 `next.config.mjs`.
5. Provisionar backends via `firebase apphosting:backends:create`.
6. Primeiro rollout → smoke test nas URLs `*.hosted.app`.
7. Cutover de domínios: admin → learn → web (menor blast radius primeiro).
8. Limpar: deletar Dockerfiles dos frontends, podar `cloudbuild.yaml`, deletar Cloud Run services `aura-web/learn/admin`.

## Branch e Git

- **Default branch: `main`** — autorização explícita do dono para push direto.
- Conventional Commits em português: `feat:`, `fix:`, `chore:`, `docs:`.
