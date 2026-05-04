# Arquitetura — Aura Educacional

## Visão geral

```
                       ┌─────────────────────────────────────┐
                       │  Firebase Hosting (CDN edge global) │
                       │  rewrites por subdomínio:           │
                       │   auraeducacional.com.br      → web │
                       │   app.auraeducacional.com.br  → learn │
                       │   admin.auraeducacional.com.br → admin │
                       └─────────────────┬───────────────────┘
                                         │ rewrite
                       ┌─────────────────▼───────────────────┐
                       │   Cloud Run (southamerica-east1)    │
                       │ ─ aura-web      (Next.js SSR)       │
                       │ ─ aura-learn    (Next.js SSR)       │
                       │ ─ aura-admin    (Next.js SSR)       │
                       │ ─ aura-api      (Hono API)          │
                       └────┬───────┬───────┬──────────────┬─┘
                            │       │       │              │
                            ▼       ▼       ▼              ▼
                   ┌──────────┐ ┌──────┐ ┌──────────┐ ┌────────┐
                   │ Cloud SQL│ │ GCS  │ │  Firebase│ │  Cloud │
                   │ Postgres │ │ R/W  │ │   Auth   │ │  Tasks │
                   │ + Auth   │ │      │ │          │ │        │
                   │  Proxy   │ │      │ │          │ │        │
                   └──────────┘ └──────┘ └──────────┘ └────┬───┘
                                                          │
                                                  ┌───────┴────────┐
                                                  ▼                ▼
                                       ┌──────────────┐ ┌──────────────┐
                                       │ /internal/   │ │ Cloud        │
                                       │ generate-cert│ │ Scheduler    │
                                       │ (Puppeteer)  │ │ (cron jobs)  │
                                       └──────┬───────┘ └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Mux + Resend │
                                       └──────────────┘
```

## Apps

| App | Porta | Domínio | Responsabilidade |
|-----|-------|---------|-----------------|
| `web` | 3000 | auraeducacional.com.br | Landing, catálogo, checkout, verificação pública de certificado |
| `learn` | 3001 | app.auraeducacional.com.br | Área do aluno: dashboard, player, certificados, conta |
| `admin` | 3002 | admin.auraeducacional.com.br | CMS: cursos, alunos, pedidos, certificados, cupons |
| `api` | 8080 | api.auraeducacional.com.br | REST API (Hono) — webhooks, business logic, queue dispatching |

## Fluxos críticos

### 1. Onboarding e login
1. Usuário entra em `auraeducacional.com.br/cadastro` ou clica em "Entrar".
2. Firebase Auth (cliente) → login com Google ou email/senha.
3. Cliente envia ID token para `POST /auth/sync` na API.
4. API valida token via Admin SDK e cria/atualiza row em `users` (firebaseUid como link).
5. Sessão futura: cliente chama API com `Authorization: Bearer <idToken>` (token rotaciona automaticamente).

### 2. Compra (assinatura ou avulsa)
1. Aluno escolhe plano em `/precos` ou curso em `/cursos/[slug]`.
2. Cliente chama `POST /checkout/subscription` ou `POST /checkout/course`.
3. API cria `Stripe Checkout Session` e retorna URL.
4. Aluno é redirecionado para Stripe e paga.
5. Stripe envia webhook `checkout.session.completed` para `POST /webhooks/stripe`.
6. API valida HMAC, registra em `webhook_events` (idempotência), enfileira processamento em `webhook-processor` queue.
7. Worker processa: cria `subscription` ou `order` + `course_access` (para compra avulsa) + envia email.
8. Aluno é redirecionado para `app.auraeducacional.com.br/auth/handoff?session=...` que ativa a sessão e o leva ao curso.

### 3. Estudo + progresso
1. App `learn` carrega aulas via `GET /courses/:slug` (com auth).
2. Player usa Mux Player com signed JWT (renovado a cada 30s).
3. Cliente faz `PUT /learning/progress` com debounce de 10s + onPause + onEnded.
4. API atualiza `lesson_progress` (upsert por `UNIQUE (user_id, lesson_id)`).

### 4. Certificado
1. Aluno completa todas as aulas obrigatórias e quiz final passa.
2. Cliente chama `POST /courses/:id/complete`.
3. API valida (`has_course_access`, progresso 100%, `passed=true`).
4. Insert em `certificates` com `status='generating'` e `code` único (UNIQUE evita race).
5. Enfileira em `cert-generation` queue.
6. Worker (endpoint `/internal/generate-cert` no Cloud Run com Puppeteer):
   - Renderiza template HTML do certificado com snapshot dos dados.
   - Gera PDF (high fidelity, fontes web, gradientes).
   - Calcula SHA-256.
   - Upload para `gs://aura-certificates/<code>.pdf`.
   - Update `certificates` com `pdf_url`, `pdf_hash_sha256`, `status='issued'`.
   - Enfileira email "certificate_ready" via `email-dispatch`.
7. Verificação pública: `GET /public/certificates/:code` (sem auth) retorna snapshots + signed URL temporária do PDF + incrementa `verification_count`.

## Decisões arquiteturais

### Acesso ao curso: `course_access` separada de `enrollments`
- `enrollments` (1 row por user×course): jornada do aluno, progresso, status.
- `course_access` (N rows por user×course): direito de acesso por origem (`source`).
  - Compra avulsa → row com `source='purchase'`, `expires_at=null` (lifetime).
  - Gift / admin grant → row com `source='gift'|'admin_grant'`.
  - Assinatura → **não materializada**. Função `has_course_access` verifica via subquery em `subscriptions` ativas.

**Por quê:** catálogo cresce sem inflar tabela; cancelamento de assinatura é instantâneo (não precisa update em massa); compras avulsas preservadas mesmo se assinatura cair.

### Snapshots no `certificates`
Campos `user_name_snapshot`, `course_title_snapshot`, `workload_hours_snapshot`, `instructor_name_snapshot`, `final_score` garantem que o certificado é **imutável** mesmo se curso for editado/excluído ou usuário renomeado depois. Crítico para verificação pública confiável.

### Idempotência de webhooks
`webhook_events.event_id UNIQUE` (com `source`). Stripe e Mux retentam — sem isso, dia 1 tem dupla concessão de acesso.

### Race em `complete-course`
`UNIQUE (user_id, course_id) WHERE status='issued'` em `certificates`. Aluno clica 2× rápido → segundo insert falha gracefully com `ON CONFLICT DO NOTHING`.

### Sessão / Auth
ID Token do Firebase Auth (rotaciona a cada hora) é enviado no header `Authorization`. API valida via Admin SDK em todo request autenticado. Sem cookies de sessão próprios.

### Integração Postgres ↔ Cloud Run
Em produção, conexão via Cloud SQL Auth Proxy (Unix socket). Pool pequeno (max 10) por instância. Cloud Run escala instâncias horizontalmente.

## Regiões

Tudo em **southamerica-east1** (São Paulo) para minimizar latência com usuários BR. Firebase Hosting é multi-region por padrão (CDN global na borda).

## Limites e dimensionamento

- Cloud Run: cold start ~500ms-2s. `min-instances=1` no `aura-api` evita cold no caminho crítico de webhooks.
- Cloud SQL: tier inicial `db-custom-1-3840` (1 vCPU, 3.75 GB). Upgrade vertical conforme tração.
- Mux: cobrança por minuto entregue. Negociar volume após 1k h/mês.
- Resend: 3k emails/mês free, depois $20/mês para 50k.

## Custos estimados (mês 1, ~500 alunos ativos)

| Serviço | Mensal |
|---|---|
| Cloud Run (4 services) | ~$10–20 |
| Cloud SQL Postgres (tier inicial) | ~$25 |
| Cloud Storage (50 GB) | ~$1 |
| Firebase Auth + Hosting | $0 (free tier) |
| Cloud Tasks + Scheduler | ~$1 |
| Mux Video (100h storage + 1k delivery) | $80–150 |
| Resend (10k emails) | $20 |
| Stripe | 4.99% + R$0.39/transação (BR) |
| **Fixos aproximados** | **~$140–200/mês** + Stripe variável |
