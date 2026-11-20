FROM node:24.22.0-bookworm-slim AS base
WORKDIR /app

FROM base AS manifests
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

FROM manifests AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN npm ci --include=dev --workspace @portfolio/api --include-workspace-root --no-audit --no-fund
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY packages ./packages
COPY apps/api ./apps/api
# Client generation only validates the URL format. The production URL is supplied at runtime.
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build npm run db:generate \
    && npm run api:build

FROM build AS migrations
ENV NODE_ENV=production
USER node
CMD ["npm", "run", "db:deploy"]

FROM manifests AS production-dependencies
RUN npm ci --omit=dev --workspace @portfolio/api --include-workspace-root --no-audit --no-fund

FROM base AS production
ENV NODE_ENV=production API_HOST=0.0.0.0 COMMUNITY_UPLOAD_DIR=/var/lib/portfolio/uploads
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/prisma.config.ts ./
COPY --from=build /app/dist ./dist
RUN install -d -o node -g node /var/lib/portfolio/uploads
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD ["node", "-e", "const port = process.env.API_PORT || process.env.PORT || '3001'; fetch('http://127.0.0.1:' + port + '/api/v1/health/ready', { signal: AbortSignal.timeout(3500) }).then(r => { if (!r.ok) process.exitCode = 1; }).catch(() => { process.exitCode = 1; });"]
CMD ["node", "dist/apps/api/src/main.js"]
