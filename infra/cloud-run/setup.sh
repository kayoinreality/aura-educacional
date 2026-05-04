#!/usr/bin/env bash
# Setup inicial do projeto GCP para Aura Educacional.
# Idempotente: pode rodar várias vezes.
#
# Pré-requisito: gcloud autenticado e PROJECT_ID exportado.
#   $ export PROJECT_ID=auraeducacional
#   $ gcloud config set project $PROJECT_ID

set -euo pipefail

PROJECT_ID="${PROJECT_ID:?defina PROJECT_ID}"
REGION="${REGION:-southamerica-east1}"

echo "=> Habilitando APIs"
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  cloudtasks.googleapis.com \
  storage.googleapis.com \
  firebase.googleapis.com \
  identitytoolkit.googleapis.com

echo "=> Artifact Registry: criando repo 'aura' (se não existir)"
gcloud artifacts repositories describe aura --location="$REGION" 2>/dev/null \
  || gcloud artifacts repositories create aura \
      --repository-format=docker \
      --location="$REGION"

echo "=> Cloud SQL Postgres (manual — confirme antes de criar):"
echo "   gcloud sql instances create aura-postgres \\"
echo "     --database-version=POSTGRES_16 \\"
echo "     --tier=db-custom-1-3840 \\"
echo "     --region=$REGION \\"
echo "     --storage-size=10GB \\"
echo "     --storage-auto-increase"

echo "=> Service accounts"
for sa in aura-api-sa aura-web-sa aura-learn-sa aura-admin-sa; do
  gcloud iam service-accounts describe "$sa@$PROJECT_ID.iam.gserviceaccount.com" 2>/dev/null \
    || gcloud iam service-accounts create "$sa" --display-name="$sa"
done

echo "=> Buckets GCS"
for bucket in "aura-files" "aura-certificates"; do
  gsutil ls -b "gs://$bucket" 2>/dev/null \
    || gsutil mb -l "$REGION" "gs://$bucket"
done

echo "=> Cloud Tasks queues"
for q in cert-generation email-dispatch webhook-processor; do
  gcloud tasks queues describe "$q" --location="$REGION" 2>/dev/null \
    || gcloud tasks queues create "$q" --location="$REGION"
done

echo "✅ Setup base concluído."
echo ""
echo "Próximos passos manuais:"
echo "  1. Crie o instance Cloud SQL (comando comentado acima)"
echo "  2. Crie os secrets no Secret Manager:"
echo "     - aura-database-url, stripe-secret, stripe-webhook-secret"
echo "     - mux-token-secret, resend-api-key, firebase-service-account"
echo "  3. Configure Firebase Auth (Google + Email/Password) em https://console.firebase.google.com"
echo "  4. Conecte os domínios em Firebase Hosting (web/learn/admin)"
