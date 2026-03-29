# 🌳 AURA Educacional — Documentação do Projeto

> Plataforma de cursos livres e certificados digitais. Arquitetura escalável em monorepo com Next.js 14, Fastify, PostgreSQL e Redis.

---

## 📋 Índice

1. [Visão Geral da Arquitetura](#arquitetura)
2. [Estrutura de Pastas](#estrutura)
3. [Stack Tecnológica](#stack)
4. [Segurança & Autenticação](#segurança)
5. [Banco de Dados](#banco-de-dados)
6. [Infraestrutura](#infraestrutura)
7. [Como Rodar Localmente](#local)
8. [Variáveis de Ambiente](#env)
9. [Roadmap de Implementação](#roadmap)
10. [Padrões de Código](#padrões)

---

## 🏗️ Arquitetura {#arquitetura}

O projeto usa **monorepo com Turborepo**, permitindo compartilhar código entre os apps de forma eficiente.

```
                    ┌─────────────────────────────────┐
                    │          NGINX (Proxy)           │
                    │    SSL termination + Routing     │
                    └──────┬────────────────┬──────────┘
                           │                │
              ┌────────────▼──┐      ┌──────▼────────────┐
              │  Web (Next.js) │      │   API (Fastify)    │
              │   :3000        │      │   :3001            │
              │  Landing Page  │      │  REST API          │
              │  Dashboard     │      │  Auth, Cursos      │
              │  Checkout      │      │  Pagamentos        │
              └────────────────┘      └──────┬────────────┘
                                             │
                    ┌────────────────────────┼───────────────┐
                    │                        │               │
             ┌──────▼──────┐         ┌───────▼────┐  ┌──────▼──────┐
             │  PostgreSQL  │         │   Redis    │  │   MinIO     │
             │  Dados        │         │  Cache     │  │  Arquivos   │
             │  Usuários    │         │  Sessões   │  │  Vídeos     │
             │  Cursos      │         │  Filas     │  │  Certs PDF  │
             └─────────────┘         └────────────┘  └─────────────┘
```

### Fluxo de Autenticação

```
Usuário ──POST /auth/login──▶ API
                               │
                    ┌──────────▼──────────┐
                    │ 1. Verifica bloqueio │ ◀── Redis (rate limit)
                    │ 2. Busca no DB      │ ◀── PostgreSQL
                    │ 3. bcrypt.compare() │
                    │ 4. Gera JWT + Cookie│
                    │ 5. Registra log     │ ──▶ PostgreSQL (audit)
                    └──────────┬──────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
     Access Token        Refresh Token        Cookie
     (15 min)            (7 dias)             httpOnly
     localStorage        Redis               /auth/refresh
```

---

## 📁 Estrutura de Pastas {#estrutura}

```
aura-educacional/
│
├── apps/
│   ├── web/                    # Front-end Next.js 14
│   │   └── src/
│   │       ├── app/            # App Router (pages, layouts, loading)
│   │       ├── components/
│   │       │   ├── ui/         # Botões, inputs, modais, badges
│   │       │   ├── layout/     # Navbar, Footer, Sidebar
│   │       │   ├── sections/   # Hero, Categories, Courses, CTA
│   │       │   ├── forms/      # LoginForm, RegisterForm, CheckoutForm
│   │       │   ├── course/     # CourseCard, CoursePlayer, CourseProgress
│   │       │   ├── certificate/ # CertificatePreview, CertificateCard
│   │       │   └── auth/       # AuthGuard, UserMenu
│   │       ├── hooks/          # useAuth, useCourse, useCart, useSubscription
│   │       ├── lib/            # axios client, nextauth config, queryClient
│   │       ├── store/          # Zustand: authStore, cartStore, uiStore
│   │       ├── types/          # TypeScript interfaces
│   │       └── utils/          # formatters, validators, constants
│   │
│   ├── admin/                  # Painel administrativo (Next.js)
│   │   └── src/
│   │       └── app/
│   │           ├── dashboard/  # KPIs, gráficos, resumo
│   │           ├── users/      # Gerenciar alunos e instrutores
│   │           ├── courses/    # Criar e editar cursos
│   │           ├── payments/   # Pagamentos e assinaturas
│   │           └── settings/   # Configurações da plataforma
│   │
│   └── api/                    # Back-end Fastify
│       └── src/
│           ├── modules/
│           │   ├── auth/       # Login, registro, JWT, OAuth
│           │   ├── users/      # CRUD usuários, perfil
│           │   ├── courses/    # CRUD cursos, módulos, aulas
│           │   ├── enrollments/ # Matrículas e progresso
│           │   ├── certificates/ # Geração e verificação de PDFs
│           │   ├── payments/   # Stripe, PIX, boleto
│           │   ├── notifications/ # E-mail e push
│           │   └── analytics/  # Métricas e relatórios
│           ├── config/         # Fastify plugins, cors, helmet
│           ├── middleware/      # Auth guard, rate limit, roles
│           ├── utils/          # mailer, logger, storage, pdf
│           └── database/
│               ├── schema.prisma
│               ├── migrations/
│               └── seeds/
│
├── packages/
│   ├── ui/                     # Componentes compartilhados (Design System)
│   ├── types/                  # TypeScript types compartilhados
│   ├── utils/                  # Utilitários compartilhados
│   ├── config/                 # ESLint, Tailwind, TSConfig base
│   └── db/                     # Prisma client singleton
│
├── infra/
│   ├── docker/
│   │   └── docker-compose.yml
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── sites/
│   └── scripts/
│       ├── backup-db.sh
│       ├── deploy.sh
│       └── init.sql
│
├── docs/
│   ├── README.md               # Este arquivo
│   ├── SECURITY.md             # Políticas de segurança detalhadas
│   ├── API.md                  # Documentação da API (OpenAPI)
│   ├── DATABASE.md             # Diagrama ER e decisões de schema
│   └── DEPLOYMENT.md           # Guia de deploy passo a passo
│
├── package.json                # Monorepo root
├── turbo.json                  # Turborepo pipeline
├── .env.example                # Template de variáveis
└── .gitignore
```

---

## 🛠️ Stack Tecnológica {#stack}

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Frontend** | Next.js 14 (App Router) | SSR, SEO, performance, ecosystem |
| **Estilo** | Tailwind CSS + Framer Motion | Produtividade + animações |
| **State** | Zustand + React Query | Leve, simples, poderoso |
| **Backend** | Fastify | 2x mais rápido que Express, TypeScript nativo |
| **ORM** | Prisma | Type-safe, migrações, DX excelente |
| **Banco** | PostgreSQL 16 | Confiável, ACID, JSON support |
| **Cache/Sessões** | Redis 7 | Rate limiting, sessões, filas |
| **Filas** | BullMQ | E-mails assíncronos, geração de PDF |
| **Storage** | MinIO (S3-compat) | Self-hosted ou migra para AWS S3 |
| **Pagamento** | Stripe | PIX, cartão, assinatura, webhooks |
| **Auth** | NextAuth v5 + JWT | Sessions + OAuth Google |
| **Email** | Nodemailer + Resend | Templates HTML, entregabilidade |
| **PDF** | PDFKit | Geração de certificados customizados |
| **Infra** | Docker + Nginx | Portável, fácil de escalar |
| **Monorepo** | Turborepo | Cache inteligente, builds paralelos |

---

## 🔐 Segurança & Autenticação {#segurança}

### Senhas

- Hash com **bcrypt rounds=12** (intencionalmente lento para dificultar brute force)
- Validação de força: maiúscula + minúscula + número + especial + min. 8 chars
- Histórico de senhas (futuro: impedir reutilização das últimas 5)

### Proteção contra Brute Force

```
Tentativa de login
      │
      ▼
Redis: verificar bloqueio?
      │
   Bloqueado ──▶ HTTP 429 + mensagem de tempo
      │
   Livre ──▶ verificar senha
              │
          Errada ──▶ incrementar contador (Redis, TTL 1h)
              │          │
              │      5+ erros ──▶ bloquear por 30 min
              │
          Correta ──▶ resetar contador ──▶ emitir tokens
```

### Tokens JWT

| Token | Validade | Armazenamento | Renovação |
|-------|----------|---------------|-----------|
| Access Token | 15 minutos | `localStorage` (client) | Via refresh |
| Refresh Token | 7 dias (30 se "Lembrar") | Cookie `httpOnly` + Redis | Manual |

- Access token curto reduz janela de exposição se vazar
- Refresh token em cookie `httpOnly` é inacessível por JavaScript (XSS protection)
- Todos os refresh tokens ficam no Redis → revogação imediata possível (logout, senha alterada, suspeita de invasão)

### Outras Medidas

- **Rate limiting** por IP e por usuário (via `@fastify/rate-limit`)
- **Helmet** para headers HTTP de segurança (CSP, HSTS, XFO)
- **CORS** configurado apenas para origens confiáveis
- **Input sanitization** via Zod em todos os endpoints
- **Soft delete** em usuários (dados nunca apagados permanentemente)
- **Audit log** de logins (LoginHistory) com IP, user agent, sucesso/falha
- **Mensagens genéricas** em login/cadastro (evita user enumeration)
- **Delay constante** em respostas de auth (evita timing attacks)

### Armazenamento de Login em Massa (Escala)

Para suportar **10.000+ usuários simultâneos**:

```
Estratégia de Sessões Escalável
================================

1. Stateless JWT (sem estado no servidor)
   - Access token validado apenas pela assinatura
   - Não precisa de DB lookup a cada requisição

2. Redis Cluster para refresh tokens
   - Sharding automático por userId
   - Replicação para alta disponibilidade
   - TTL automático (sem acúmulo de tokens expirados)

3. Rate limit distribuído
   - Contador no Redis (não na memória do processo)
   - Funciona com múltiplas instâncias da API

4. Horizontal scaling
   - API stateless = pode ter N réplicas
   - Load balancer distribui as requisições
   - Redis compartilhado entre todas as instâncias

Tabelas no PostgreSQL para auditoria/histórico:
- login_history: trilha de auditoria permanente
- sessions: sessões ativas (next-auth)
- password_resets: tokens de uso único com TTL

Redis para operações em tempo real:
- auth:refresh:{userId}:{id} → token (TTL = 7d)
- auth:attempts:{email} → contador (TTL = 1h)
- auth:locked:{email} → flag de bloqueio (TTL = 30min)
- rate:login:{ip} → contador por IP (TTL = 1h)
```

---

## 🗄️ Banco de Dados {#banco-de-dados}

### Principais Entidades

```
User (1) ──────── (N) Enrollment ──────── (N) Course
  │                        │                    │
  ├── Account (OAuth)      └── Certificate      ├── Module
  ├── Session                                   │     └── Lesson
  ├── Subscription                              ├── Category
  ├── Payment                                   ├── Review
  ├── LessonProgress                            └── Coupon
  └── LoginHistory
```

### Índices Importantes

Todos os campos de busca frequente têm índice:
- `users.email` (login)
- `users.cpf` (cadastro)
- `courses.slug` (URL amigável)
- `enrollments.[userId, courseId]` (unique — impede duplicata)
- `certificates.code` (verificação pública)
- `login_history.userId + createdAt` (auditoria)

---

## 🚀 Como Rodar Localmente {#local}

### Pré-requisitos

- Node.js 20+
- Docker + Docker Compose
- npm 10+

### Passo a passo

```bash
# 1. Clonar e instalar dependências
git clone https://github.com/seu-usuario/aura-educacional.git
cd aura-educacional
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com seus valores reais

# 3. Subir banco, Redis e MinIO
npm run docker:up

# 4. Rodar migrações e seed inicial
npm run db:migrate
npm run db:seed

# 5. Iniciar todos os apps em modo dev
npm run dev
# Web:   http://localhost:3000
# API:   http://localhost:3001
# Admin: http://localhost:3002
```

---

## 🗺️ Roadmap de Implementação {#roadmap}

### Fase 1 — MVP (4–6 semanas)
- [x] Estrutura base do projeto
- [x] Schema do banco de dados
- [x] Sistema de autenticação (login, registro, reset de senha)
- [ ] Listagem e página de cursos
- [ ] Sistema de matrícula
- [ ] Checkout com Stripe (cartão + PIX)
- [ ] Player de vídeo (YouTube embed ou Mux)
- [ ] Progresso de aulas
- [ ] Geração de certificado PDF

### Fase 2 — Crescimento (2–3 meses)
- [ ] Painel admin completo
- [ ] Sistema de assinaturas (Pro + Elite)
- [ ] Cupons de desconto
- [ ] Sistema de avaliações
- [ ] Notificações por e-mail
- [ ] Login social (Google)

### Fase 3 — Escala (3–6 meses)
- [ ] App mobile (React Native)
- [ ] Multi-tenant (vender para outras escolas)
- [ ] Analytics avançado
- [ ] Afiliados e comissões
- [ ] Integrações EAD (SCORM)
- [ ] CDN para vídeos (Cloudflare Stream)

---

## 📐 Padrões de Código {#padrões}

### Commits (Conventional Commits)
```
feat: adicionar sistema de cupons
fix: corrigir bug no upload de certificado
docs: atualizar README com instruções de deploy
refactor: extrair lógica de pagamento para service
test: adicionar testes para auth module
```

### Nomenclatura
- **Arquivos**: `kebab-case` (ex: `auth.service.ts`)
- **Componentes React**: `PascalCase` (ex: `CourseCard.tsx`)
- **Variáveis/funções**: `camelCase`
- **Constantes**: `UPPER_SNAKE_CASE`
- **Tabelas DB**: `snake_case` (ex: `login_history`)
- **Rotas API**: `/kebab-case` (ex: `/auth/forgot-password`)

### Estrutura de Resposta da API
```json
// Sucesso
{ "data": { ... }, "message": "OK" }

// Erro
{ "error": "Mensagem legível", "code": "MACHINE_READABLE", "details": {} }

// Lista paginada
{ "data": [...], "meta": { "total": 100, "page": 1, "perPage": 20, "lastPage": 5 } }
```
