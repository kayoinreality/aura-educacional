# Segurança & LGPD

## Autenticação

- **Firebase Auth** é a fonte de verdade. Senhas nunca trafegam pela API.
- **ID tokens** rotacionam a cada hora (Firebase). API valida via Admin SDK em todo request com `requireAuth`.
- **Email verification** obrigatório para acesso ao app `learn`. Firebase envia o email automaticamente.
- **Google OAuth** habilitado (signin frictionless).

## Autorização

- Custom claims no Firebase token (`role: "admin" | "instructor" | "student"`) — escritos via `setUserClaims` do Admin SDK.
- API checa role com middleware `requireRole('admin')`.
- App `admin` valida no servidor (server component) que o usuário tem role admin antes de renderizar.

## Webhooks

- **Stripe**: HMAC validado em `constructEvent`. Sem secret correto → 400.
- **Mux**: HMAC com `MUX_WEBHOOK_SECRET` (a implementar antes de produção).
- **Idempotência**: `webhook_events.event_id UNIQUE`. Reprocesso retorna `{ duplicate: true }`.

## Segredos

- Todos os secrets em **Secret Manager**, montados como env vars no Cloud Run via `--set-secrets`.
- **Nunca** commitar `.env` (gitignored).
- Service accounts com **least privilege** (só os scopes necessários).

## Rate limiting

- Cloud Run tem rate limiting nativo via concurrency.
- Endpoints sensíveis (webhook, login, `complete-course`) terão rate-limit por IP via middleware Hono — implementar antes de produção pública.

## LGPD

### Dados pessoais coletados
- Email, nome, avatar (de Google/cadastro).
- CPF e data de nascimento (opcional, necessário para certificado nominal).
- IP e user-agent (em `login_history`).
- Stripe customer ID (financeiro).

### Direitos do titular
- **Acesso**: `/conta/dados` — exporta tudo em JSON via `GET /user/export`.
- **Correção**: `/conta/perfil` — usuário edita seus dados.
- **Exclusão**: `POST /user/delete` → soft delete (`users.deleted_at`). Job cron purga após 30 dias se não cancelado. Certificados emitidos são preservados (snapshots permanecem para verificação pública, conforme termos).
- **Portabilidade**: idem export.
- **Revogação de consentimento**: opt-out de marketing emails — flag em `metadata`.

### Encarregado de dados (DPO)
Email: `lgpd@auraeducacional.com.br` — registrar no termo de privacidade.

### Cookies
- Apenas essenciais (sessão Firebase) por padrão.
- Banner de consentimento para analytics/marketing antes de carregar GA/pixel.

### Retenção
- Certificados: indefinido (interesse legítimo de verificação pública).
- Pagamentos/orders: 5 anos (obrigação fiscal).
- Logs de login: 12 meses.
- Conta excluída: 30 dias para purge total (exceto rastros legais).

## Reembolso

- 7 dias garantidos por lei (CDC art. 49). Botão "Solicitar reembolso" no `app.auraeducacional.com.br/conta` redireciona para Customer Portal Stripe.
- Reembolso automatiza revogação de `course_access` via webhook `charge.refunded`.

## Infra

- Cloud SQL com IP privado em VPC (sem exposição pública).
- HTTPS em todos os endpoints (Cloud Run + Firebase Hosting fornecem certs gerenciados).
- Backups diários do Cloud SQL com retenção de 7 dias.
- Buckets GCS com Uniform bucket-level access + IAM.

## Vulnerabilidades comuns mitigadas

- **SQL injection**: Drizzle ORM (queries parametrizadas).
- **XSS**: React escapa por padrão. `secureHeaders` middleware no Hono.
- **CSRF**: SameSite=Lax em cookies. API requer `Authorization` header (não Cookie) → CSRF não se aplica.
- **CORS**: whitelist de origins.
- **Open redirect**: `success_url` Stripe é validado pela própria Stripe.
- **IDOR**: toda query filtra por `userId` derivado do token.

## Pendências de segurança antes de produção

- [ ] Implementar HMAC validation no webhook Mux (atualmente apenas registra).
- [ ] Adicionar rate limit Hono em rotas sensíveis.
- [ ] Configurar Sentry com PII scrubbing.
- [ ] Implementar 2FA opcional para admins (Firebase Auth tem suporte).
- [ ] Pen test antes do soft launch.
