# Multi-stage build para Cloud Run.
# - Estágio 1: instala deps + builda a API
# - Estágio 2: imagem mínima de runtime

FROM node:20-alpine AS builder
WORKDIR /repo

# pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Copia manifests + lockfile
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

# Instala apenas as deps necessárias para a API
RUN pnpm install --frozen-lockfile=false --prefer-offline

# Build
RUN pnpm --filter @aura/api build

# -----------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
RUN addgroup -S app && adduser -S app -G app

COPY --from=builder --chown=app:app /repo/apps/api/dist ./dist
COPY --from=builder --chown=app:app /repo/apps/api/package.json ./
COPY --from=builder --chown=app:app /repo/node_modules ./node_modules
COPY --from=builder --chown=app:app /repo/packages ./packages

USER app
EXPOSE 8080

CMD ["node", "dist/index.js"]
