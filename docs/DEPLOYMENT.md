# 🚀 AURA Educacional — Guia de Deploy

## Opções de Hospedagem Recomendadas

### Opção A — VPS (Recomendado para início)
**Custo: R$60–150/mês | Escala: até ~5.000 alunos ativos**

| Serviço | Provedor | Custo |
|---------|----------|-------|
| VPS 4vCPU / 8GB RAM | Hetzner CX31 ou Contabo | ~R$80/mês |
| Domínio .com.br | Registro.br | ~R$40/ano |
| E-mail transacional | Resend.com | Grátis até 3k/mês |
| Pagamentos | Stripe | 3.4% + R$0,40 por transação |

**Setup mínimo recomendado:**
- Ubuntu 24.04 LTS
- Docker + Docker Compose
- Nginx (já no compose)
- Let's Encrypt (já no compose)

### Opção B — Cloud Gerenciada (Escala futura)
**Para quando superar 5.000+ alunos:**

| Componente | Serviço |
|-----------|---------|
| API | Railway, Render ou ECS |
| Banco | Neon (Postgres serverless) ou RDS |
| Redis | Upstash Redis |
| Storage | AWS S3 + CloudFront |
| Vídeos | Mux ou Cloudflare Stream |
| Email | Amazon SES |

---

## Deploy na VPS — Passo a Passo

### 1. Preparar o servidor

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Instalar Docker Compose
apt install docker-compose-plugin -y

# Configurar firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 2. Configurar DNS

No painel do seu domínio, adicione:
```
A    @              → IP_DO_SERVIDOR
A    www            → IP_DO_SERVIDOR
A    api            → IP_DO_SERVIDOR
```
Aguarde propagação (até 24h, geralmente minutos).

### 3. Clonar e configurar

```bash
cd /opt
git clone https://github.com/seu-usuario/aura-educacional.git
cd aura-educacional

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Preencher todos os valores

# Gerar secrets seguros
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Execute 3x e use os valores para JWT_SECRET, JWT_REFRESH_SECRET, NEXTAUTH_SECRET
```

### 4. Build e subir

```bash
# Subir infraestrutura
npm run docker:up

# Aguardar postgres e redis ficarem saudáveis
docker compose -f infra/docker/docker-compose.yml ps

# Rodar migrações
npm run db:migrate

# Rodar seed inicial (admin user + categorias)
npm run db:seed
```

### 5. Obter certificado SSL

```bash
# Primeiro, certifique-se que Nginx está rodando
docker compose -f infra/docker/docker-compose.yml run certbot
```

### 6. Verificar tudo

```bash
# Checar saúde dos serviços
curl https://api.aura-educacional.com.br/health

# Checar logs
docker compose logs api --tail=50
docker compose logs web --tail=50
```

---

## Backups Automáticos

Configure um cron para backup diário do banco:

```bash
# No servidor, editar crontab
crontab -e

# Adicionar:
0 3 * * * /opt/aura-educacional/infra/scripts/backup-db.sh >> /var/log/aura-backup.log 2>&1
```

---

## Monitoramento Recomendado

- **Uptime**: BetterUptime (gratuito) ou UptimeRobot
- **Erros**: Sentry (plano free generoso)
- **Logs**: Logtail ou Grafana Loki
- **Métricas**: Grafana + Prometheus (avançado)
