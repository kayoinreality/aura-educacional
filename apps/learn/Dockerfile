FROM node:20-alpine AS base
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* turbo.json ./
COPY packages ./packages
COPY apps/learn ./apps/learn
RUN pnpm install --frozen-lockfile=false --prefer-offline

FROM deps AS builder
RUN pnpm --filter @aura/learn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder --chown=app:app /repo/apps/learn/.next/standalone ./
COPY --from=builder --chown=app:app /repo/apps/learn/.next/static ./apps/learn/.next/static
COPY --from=builder --chown=app:app /repo/apps/learn/public ./apps/learn/public
USER app
EXPOSE 8080
CMD ["node", "apps/learn/server.js"]
