# Deployment

## Pré-requisitos

1. Conta Google Cloud com billing habilitado.
2. CLI: `gcloud`, `firebase`, `pnpm`, `docker`, `psql`.
3. Domínio (auraeducacional.com.br) com DNS gerenciável.

## 1. Setup do projeto GCP

```bash
gcloud auth login
gcloud projects create auraeducacional --name="Aura Educacional"
gcloud config set project auraeducacional
# vincula billing pelo console: https://console.cloud.google.com/billing

export PROJECT_ID=auraeducacional
./infra/cloud-run/setup.sh
```

O script habilita APIs, cria Artifact Registry, service accounts, buckets GCS e queues do Cloud Tasks.

## 2. Cloud SQL Postgres

```bash
gcloud sql instances create aura-postgres \
  --database-version=POSTGRES_16 \
  --tier=db-custom-1-3840 \
  --region=southamerica-east1 \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup-start-time=03:00

gcloud sql users create aura_app \
  --instance=aura-postgres \
  --password=$(openssl rand -base64 24)

gcloud sql databases create aura --instance=aura-postgres
```

Salve a senha gerada. Monte a `DATABASE_URL` no formato:

```
postgresql://aura_app:<senha>@/aura?host=/cloudsql/auraeducacional:southamerica-east1:aura-postgres
```

## 3. Secrets

```bash
echo -n "<DATABASE_URL>" | gcloud secrets create aura-database-url --data-file=-
echo -n "sk_live_..."    | gcloud secrets create stripe-secret --data-file=-
echo -n "whsec_..."      | gcloud secrets create stripe-webhook-secret --data-file=-
echo -n "<MUX_TOKEN_SECRET>" | gcloud secrets create mux-token-secret --data-file=-
echo -n "re_..."         | gcloud secrets create resend-api-key --data-file=-
```

Conceda acesso à service account do Cloud Run:

```bash
for secret in aura-database-url stripe-secret stripe-webhook-secret mux-token-secret resend-api-key; do
  gcloud secrets add-iam-policy-binding $secret \
    --member=serviceAccount:aura-api-sa@auraeducacional.iam.gserviceaccount.com \
    --role=roles/secretmanager.secretAccessor
done
```

## 4. Firebase

```bash
cd infra/firebase
firebase login
firebase projects:addfirebase auraeducacional   # se ainda não fez
firebase use auraeducacional

# Cria hosting sites para cada subdomínio
firebase hosting:sites:create aura-web-prod
firebase hosting:sites:create aura-learn-prod
firebase hosting:sites:create aura-admin-prod
```

No console do Firebase:
1. **Authentication** → habilita Google + Email/Password.
2. **Authorized domains** → adiciona auraeducacional.com.br, app.*, admin.*.
3. **Storage** → cria buckets `aura-files` e `aura-certificates` (ou aponta para os criados via gsutil).

Pega as credenciais do Firebase Web SDK (Settings → Your apps → Web) e preenche `.env` com `NEXT_PUBLIC_FIREBASE_*`.

## 5. Migrations + seed

Em dev local, rode migration apontando para Cloud SQL via Auth Proxy:

```bash
cloud_sql_proxy -instances=auraeducacional:southamerica-east1:aura-postgres=tcp:5432 &
DATABASE_URL_LOCAL="postgresql://aura_app:<senha>@localhost:5432/aura" pnpm db:migrate
DATABASE_URL_LOCAL="postgresql://aura_app:<senha>@localhost:5432/aura" pnpm db:seed
```

## 6. Deploy via Cloud Build

```bash
gcloud builds submit --config infra/cloud-run/cloudbuild.yaml
```

O pipeline builda 4 imagens, sobe para Artifact Registry e faz deploy em Cloud Run.

## 7. Firebase Hosting (rewrites para Cloud Run)

```bash
cd infra/firebase
firebase deploy --only hosting
```

Aponta DNS:
- `auraeducacional.com.br` → A/AAAA do Firebase Hosting (web)
- `app.auraeducacional.com.br` → idem (learn)
- `admin.auraeducacional.com.br` → idem (admin)
- `api.auraeducacional.com.br` → CNAME do Cloud Run (mapeamento direto via `gcloud run domain-mappings create`)

## 8. Webhooks externos

- **Stripe Dashboard** → Developers → Webhooks → endpoint `https://api.auraeducacional.com.br/webhooks/stripe`. Eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`, `charge.refunded`.
- **Mux Dashboard** → Settings → Webhooks → endpoint `https://api.auraeducacional.com.br/webhooks/mux`.

## 9. Verificação

```bash
curl https://api.auraeducacional.com.br/health
# → { "status": "ok", "service": "aura-api", ... }

curl https://auraeducacional.com.br
# → HTML da landing
```

## 10. Monitoring

- Cloud Logging: `gcloud logging read 'resource.type=cloud_run_revision'`.
- Sentry: configure DSN em `apps/web` e `apps/api`.
- Uptime check: Cloud Monitoring → Synthetic monitors apontando para `/health` da API.
