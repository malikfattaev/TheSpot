# syntax=docker/dockerfile:1
#
# Single image definition for both Next.js apps in the monorepo.
# Pick the target app with the `APP` build argument (`web` or `erp`).
# On Railway, set an `APP` service variable — Railway forwards service
# variables as Docker build arguments automatically.

ARG APP=web

# ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
# `openssl` and `libc6-compat` are required by the Prisma query engine.
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ──────────────────────────────────────────────────────────────────
# Install dependencies against the workspace manifests only, so this
# layer is cached until a package.json or the lockfile changes.
FROM base AS deps
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/erp/package.json ./apps/erp/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/config/package.json ./packages/config/package.json
# Schema is needed because @thespot/db runs `prisma generate` on install.
COPY packages/db/prisma ./packages/db/prisma
RUN npm ci

# ──────────────────────────────────────────────────────────────────
FROM base AS builder
ARG APP
# Public env baked into the client bundle at build time.
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run db:generate
RUN npm run build --workspace @thespot/${APP}

# ──────────────────────────────────────────────────────────────────
FROM base AS runner
ARG APP
ENV NODE_ENV=production
ENV APP=${APP}
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# `output: 'standalone'` traces the whole monorepo from the root, so the
# server entrypoint keeps the apps/<app>/server.js workspace path.
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP}/public ./apps/${APP}/public

USER nextjs
EXPOSE 3000
# Railway injects PORT; the standalone server reads it from the environment.
CMD ["sh", "-c", "node apps/${APP}/server.js"]
