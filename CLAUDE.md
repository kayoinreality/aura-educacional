# CLAUDE.md — Aura Educacional

Guia de orientação para qualquer agente trabalhando neste repositório. Lê isto **antes** de explorar o código.

## O que é

Plataforma de cursos livres com **assinatura mensal/anual + venda avulsa de cursos**, certificados de horas declaratórios (LDB 9.394/96 art. 42), público-alvo educadores e profissionais brasileiros.

Identidade visual: **navy `#0F1E47` + gold `#C9A961`**, light/institucional. Não é dark mode. Logo é triângulo navy com livro aberto em gold.

## Stack (não trocar sem motivo forte)

| Camada | Tecnologia |
|---|---|
| Monorepo | **Turborepo + pnpm 9** (workspaces em `apps/*` e `packages/*`) |
| Frontend | **Next.js 15** (App Router) + **React 19** + **Tailwind v4** |
| Animação | Framer Motion (sutil — `whileInView`, stagger, sem glassmorphism) |
| Backend | **Hono** em **Cloud Run** (`southamerica-east1`) — Node 20 alpine, container |
| ORM | **Drizzle ORM** (`drizzle-orm` + `drizzle-kit`) |
| Banco | **Cloud SQL Postgres 16** (Auth Proxy via Unix socket em prod, Docker em dev) |
| Auth | **Firebase Auth** (Google + email/senha). Admin SDK valida ID tokens no servidor |
| Storage | Firebase Storage / GCS — buckets `aura-files`, `aura-certificates` |
| Vídeo | **Mux** (signed playback, JWT renovado a cada 30s no player) |
| Email | **Resend** + React Email (templates JSX) |
| Pagamentos | **Stripe** Checkout (assinatura `mode=subscription` + avulso `mode=payment`) + Customer Portal |
| Filas | **Cloud Tasks** (cert-generation, email-dispatch, webhook-processor) |
| Cron | Cloud Scheduler |
| Hospedagem frontend | **Firebase Hosting** com rewrites para Cloud Run |
| CI/CD | Cloud Build (`infra/cloud-run/cloudbuild.yaml`) |

## Estrutura

```
apps/
  web/        Next.js — landing pública + catálogo + checkout + verificação cert (auraeducacional.com.br)
  learn/      Next.js — área do aluno + player + certificados (app.auraeducacional.com.br)
  admin/      Next.js — CMS interno (admin.auraeducacional.com.br)
  api/        Hono — REST API (api.auraeducacional.com.br, porta 8080)
packages/
  ui/         design system (@aura/ui) — tokens navy/gold, Logo, Button, Card, Section, Container, Badge, Input
  db/         Drizzle schema + client + migrate + seed (@aura/db)
  types/      Zod DTOs compartilhados front/back (@aura/types)
  auth/       wrappers Firebase cliente + Admin SDK (@aura/auth)
  config/     tsconfig + tailwind preset + eslint compartilhados (@aura/config)
infra/
  firebase/   firebase.json (hosting rewrites para Cloud Run), storage.rules, .firebaserc
  cloud-run/  cloudbuild.yaml + setup.sh (idempotente)
  docker/     docker-compose.yml para Postgres local
```

## Decisões arquiteturais (não revogar sem discussão)

### 1. `course_access` separada de `enrollments`
- `enrollments` = jornada (1 row por user×course, com progresso).
- `course_access` = direito de acesso (N rows por origem: `purchase`, `gift`, `admin_grant`).
- **Assinatura NÃO materializa rows** em `course_access`. Em vez disso, função SQL `has_course_access(user, course)` checa via subquery em `subscriptions` ativas.
- Vantagem: catálogo cresce sem inflar tabela; cancelamento é instantâneo; compras avulsas preservadas vitaliciamente.

### 2. Snapshots imutáveis em `certificates`
Campos `user_name_snapshot`, `course_title_snapshot`, `workload_hours_snapshot`, `instructor_name_snapshot`, `final_score`. Certificado **nunca muda** mesmo se curso for editado depois. Crítico para verificação pública confiável.

### 3. Idempotência de webhooks
`webhook_events.event_id UNIQUE` (com `source`). Stripe/Mux retentam — sem isso, dia 1 tem dupla concessão de acesso.

### 4. Race em complete-course
`UNIQUE (user_id, course_id) WHERE status='issued'` em `certificates`. Aluno clica 2× → segundo insert falha gracefully.

### 5. Auth via Firebase ID token
- Cliente envia `Authorization: Bearer <idToken>` em todo request autenticado.
- API valida via Admin SDK em todo request com middleware `requireAuth`.
- Usuário "shadow" no Postgres (`users.firebase_uid` UNIQUE).
- Custom claims (`role`) escritos via Admin SDK; checados com `requireRole('admin')`.
- **Sem cookies de sessão próprios**. Sem CSRF.

### 6. Geração de PDF de certificado
**Cloud Run + Puppeteer** (não Workers). HTML→PDF com fidelidade total (CSS, web fonts, gradientes). Designer mexe sem dev intervention. Roda no `queue-consumer` endpoint, disparado por Cloud Tasks.

## Convenções de código

### TypeScript
- Strict mode + `noUncheckedIndexedAccess` + `noImplicitOverride`.
- `module: ESNext`, `moduleResolution: Bundler`.
- Imports relativos para arquivos do mesmo pacote; alias `@/` para `src/` em apps; pacotes via `@aura/*`.

### Componentes React
- Server components por padrão. `'use client'` só quando necessário (forms, animações Framer, hooks de state).
- Componentes compartilhados em `@aura/ui` (forwardRef + cva + cn).
- Composição preferida sobre props gigantes.

### Estilos
- Apenas Tailwind (`@aura/ui/styles.css` importa `@aura/ui` via `@import 'tailwindcss'` + tokens em `@theme`).
- Tokens em `packages/config/tailwind.preset.ts` e `@theme` em `packages/ui/src/styles.css`.
- Nunca usar cores raw — sempre via classe (`bg-navy-700`, `text-gold-500`, etc).
- `.btn-shimmer` exclusivo no CTA principal da landing (não espalhar).

### Drizzle
- Schema dividido por domínio em `packages/db/src/schema/*.ts`.
- Sempre exportar via `packages/db/src/schema/index.ts`.
- Índices nomeados explicitamente.
- Use `numeric` (string) para dinheiro/porcentagens; `integer` para `*_cents`.
- Use `jsonb` para metadata flexível.
- `onDelete` explícito em todas as FKs.

### API (Hono)
- Rotas em `apps/api/src/routes/<domain>.ts`.
- Middleware: `requireAuth` (todos os privados), `requireRole(...)` (admin).
- Validação com `zValidator('json', schema)` usando schemas de `@aura/types`.
- Retorno: `c.json(...)`. Erros via `HTTPException` (capturados em `errorHandler`).
- Webhooks: validar HMAC, registrar em `webhook_events` com idempotência, enfileirar processamento real.

### Tom institucional
- Português BR. Termos: "curso livre", "carga horária", "certificado de conclusão" (não "diploma").
- Texto do certificado **deve** mencionar LDB 9.394/96 art. 42 + "sem reconhecimento MEC, válido como horas complementares".
- Sem emojis em UI/textos.

## Fluxos críticos

### Onboarding
1. Cliente faz login Firebase → recebe ID token.
2. Cliente chama `POST /auth/sync` com Bearer token → API cria/atualiza row `users` (firebase_uid).
3. Sessões futuras: ID token rotaciona automático a cada hora.

### Compra
1. `POST /checkout/subscription` ou `/checkout/course` retorna URL Stripe.
2. Stripe webhook `checkout.session.completed` → registra em `webhook_events` → enfileira em `webhook-processor`.
3. Worker cria `subscription` ou `order` + `course_access` (compras avulsas).
4. Email transacional via Resend.
5. Sucesso redireciona para `app.auraeducacional.com.br/auth/handoff?session=...`.

### Certificado
1. Aluno completa curso + passa quiz final → `POST /courses/:id/complete`.
2. API valida (`has_course_access`, progresso 100%, `passed=true`).
3. Insert em `certificates` (UNIQUE evita race) → enqueue `cert-generation`.
4. Worker (Puppeteer) gera PDF, sobe em `gs://aura-certificates`, atualiza row, enfileira email.
5. Verificação pública em `/certificados/[code]` (sem auth) — incrementa `verification_count`.

## Quick commands

```bash
# Dev local (precisa Postgres rodando)
docker compose -f infra/docker/docker-compose.yml up -d
pnpm db:migrate && pnpm db:seed
pnpm dev                   # turbo --parallel: web, learn, admin, api

# Banco
pnpm db:generate            # gera SQL a partir do schema
pnpm db:migrate
pnpm db:seed
pnpm db:studio

# Apps individuais
pnpm dev:web | dev:learn | dev:admin | dev:api

# Build
pnpm build
pnpm typecheck
pnpm lint

# Deploy (precisa gcloud autenticado em projeto auraeducacional)
gcloud builds submit --config infra/cloud-run/cloudbuild.yaml
firebase deploy --only hosting --project auraeducacional
```

## Onde NÃO mexer sem motivo

- Tokens de cor em `packages/config/tailwind.preset.ts` e `packages/ui/src/styles.css` (paleta institucional fechada).
- Decisão de `course_access` vs `enrollments` (decisão arquitetural).
- Snapshots em `certificates` (auditoria pública depende disso).
- Idempotência de `webhook_events` (sem isso, regressão financeira).

## Pendências conhecidas (a fazer nas próximas fases)

- Implementar handlers de webhook Stripe completos (`webhook-processor` worker).
- HMAC validation real no webhook Mux.
- Endpoint `/internal/generate-cert` com Puppeteer.
- Course Builder UI no `apps/admin`.
- Player Mux em `apps/learn` com progress tracking.
- Page `/conta` em `apps/learn` (perfil, dados, assinatura, histórico).
- Rate limiting nos endpoints sensíveis.
- Pen test antes do soft launch.
- Configurar Sentry com PII scrubbing.

## Branch e Git

- **Default branch: `main`** — autorização explícita do dono para push direto.
- Conventional Commits em português: `feat:`, `fix:`, `chore:`, `docs:`.
- Commit messages no formato HEREDOC com bullets quando há múltiplas mudanças.
