# 🔐 AURA Educacional — Política de Segurança

> Documento técnico sobre todas as camadas de segurança implementadas na plataforma.

---

## 1. Senhas

### Hash com bcrypt (rounds = 12)

Nunca armazenamos senhas em texto plano. Usamos bcrypt com **custo 12**, que torna cada hash propositalmente lento (~300ms). Isso é intencional:

```
Atacante com GPU roubando o banco:
- MD5:    9 bilhões de tentativas/segundo ← INSEGURO
- SHA256: 3 bilhões de tentativas/segundo ← INSEGURO  
- bcrypt 12: ~30 tentativas/SEGUNDO       ← SEGURO
```

### Política de senhas
- Mínimo 8 caracteres
- Ao menos 1 maiúscula, 1 minúscula, 1 número, 1 especial
- Validado com Zod no backend (frontend valida para UX, mas backend é a fonte da verdade)

---

## 2. Proteção contra Brute Force

```
Login falhado:
  Redis INCR auth:attempts:{email}   [TTL: 1 hora]
  Se >= 5 tentativas:
    Redis SET auth:locked:{email} 1  [TTL: 30 minutos]
    Resposta: HTTP 429 com tempo de espera

Login bem-sucedido:
  Redis DEL auth:attempts:{email}
  Redis DEL auth:locked:{email}
```

Além disso, adicionamos **delay aleatório** (500–1000ms) em respostas de falha para dificultar timing attacks.

---

## 3. User Enumeration (Enumeração de Usuários)

Um atacante não deve conseguir descobrir quais e-mails estão cadastrados. Para isso:

| Endpoint | Proteção |
|----------|---------|
| `POST /auth/login` | Mensagem genérica: "E-mail ou senha inválidos" |
| `POST /auth/register` | Delay de 300–500ms mesmo quando email existe |
| `POST /auth/forgot-password` | Resposta idêntica para emails existentes e inexistentes |

---

## 4. Tokens JWT

### Access Token (15 minutos)
- Armazenado no `localStorage` do cliente
- Payload: `{ sub: userId, role, email, iat, exp }`
- Validado em cada requisição autenticada
- Vida curta reduz risco se vazar

### Refresh Token (7 ou 30 dias)
- Armazenado em **cookie httpOnly** (inacessível por JavaScript → proteção XSS)
- Também salvo no Redis com TTL
- Permite revogação imediata:
  ```
  Logout → DEL auth:refresh:{userId}:*
  Troca de senha → DEL auth:refresh:{userId}:*
  Suspeita de invasão → DEL auth:refresh:{userId}:*
  ```

---

## 5. Armazenamento de Sessões em Massa

Para suportar **milhares de usuários simultâneos** de forma escalável:

### Redis como session store

```
Estrutura no Redis:
auth:refresh:{userId}:{tokenId} = <token_jwt>   TTL: 7d ou 30d
auth:attempts:{email} = <contador>              TTL: 1h
auth:locked:{email} = "1"                       TTL: 30min
rate:ip:{ip}:{endpoint} = <contador>            TTL: 1h
```

### Por que Redis e não banco de dados?

| Critério | PostgreSQL | Redis |
|----------|-----------|-------|
| Velocidade | ~2–5ms | ~0.1ms |
| Operações atômicas | Via transação | Nativo (INCR, SETNX) |
| TTL automático | Via cron job | Nativo |
| Escala horizontal | Complexo | Redis Cluster |
| Custo de consulta | Alto (auth a cada req) | Mínimo |

### Multi-instância

Com múltiplas réplicas da API (horizontal scaling):
- Access tokens são validados **localmente** (sem I/O — só verificação de assinatura JWT)
- Refresh tokens buscados no **Redis compartilhado** entre todas as instâncias
- Rate limiting no **Redis compartilhado** (contadores consistentes)
- Cada instância pode processar qualquer request de qualquer usuário

---

## 6. Headers HTTP de Segurança (via Helmet)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 7. CORS

Apenas origens explicitamente listadas são aceitas:
```typescript
const allowedOrigins = [
  'https://auraeducacional.app',
  'https://www.auraeducacional.app',
  'https://app.auraeducacional.app',
  'https://admin.auraeducacional.app',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '',
].filter(Boolean)
```

---

## 8. Rate Limiting por Endpoint

| Endpoint | Limite |
|---------|--------|
| `POST /auth/login` | 10 req/min por IP |
| `POST /auth/register` | 5 req/min por IP |
| `POST /auth/forgot-password` | 5 req/hora por IP |
| `GET /api/*` (autenticado) | 200 req/min por usuário |
| `POST /api/*` (autenticado) | 60 req/min por usuário |
| `GET /api/*` (público) | 100 req/min por IP |

---

## 9. Validação de Entrada (Zod)

**Todo** dado que chega na API é validado com Zod antes de qualquer processamento:
- Tipos corretos (string, number, email, uuid...)
- Comprimento mínimo/máximo
- Formatos (CPF, telefone, URLs)
- SQL injection: Prisma usa prepared statements por padrão — queries seguras

---

## 10. Auditoria (LoginHistory)

Cada tentativa de login (bem-sucedida ou não) é registrada:
```sql
INSERT INTO login_history (userId, ipAddress, userAgent, success, failReason, createdAt)
```

Isso permite:
- Detectar padrões suspeitos (logins de países incomuns)
- Notificar usuário de login novo
- Investigar incidentes de segurança
- Evidência forense em disputas

---

## 11. Checklist de Segurança para Deploy

- [ ] `.env` com senhas fortes (min. 32 chars aleatórios)
- [ ] `NODE_ENV=production`
- [ ] HTTPS obrigatório (Nginx + Let's Encrypt)
- [ ] PostgreSQL acessível apenas internamente (127.0.0.1)
- [ ] Redis com senha e acessível apenas internamente
- [ ] MinIO acessível apenas internamente
- [ ] Firewall: apenas portas 80 e 443 abertas externamente
- [ ] Backups automáticos do PostgreSQL (script: `infra/scripts/backup-db.sh`)
- [ ] Stripe em modo produção (não test)
- [ ] CORS configurado para domínios reais
- [ ] Rate limiting ativo
- [ ] Logs centralizados (Pino → arquivo ou serviço externo)
- [ ] Monitoramento de erros (Sentry recomendado)

---

## 12. Dados Sensíveis — O que NUNCA retornar na API

```typescript
// ❌ NUNCA retornar
user.passwordHash
user.twoFactorSecret
user.loginAttempts
user.lockedUntil
payment.gatewayData (dados brutos do Stripe)
passwordReset.token

// ✅ Sempre usar sanitizeUser() antes de retornar dados de usuário
return sanitizeUser(user)
```
