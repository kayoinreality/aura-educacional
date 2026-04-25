FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json turbo.json ./
COPY frontend/learning/package.json frontend/learning/package.json
COPY packages packages
RUN npm ci --workspace @aura/learning --include-workspace-root

FROM deps AS builder
COPY frontend/learning frontend/learning
RUN npm --workspace @aura/learning run build

FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/frontend/learning ./frontend/learning
COPY --from=builder /app/packages ./packages
WORKDIR /app/frontend/learning
EXPOSE 3003
CMD ["npm", "run", "start"]
