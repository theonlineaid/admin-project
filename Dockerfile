# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./

# Cache npm downloads across builds with BuildKit cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts --prefer-offline

# -----------------------------------------------------------------------------
# Stage 2: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Generate Prisma Client early so code changes don't bust Prisma cache
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source code
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Cache Next.js build cache (.next/cache) for fast incremental builds
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# -----------------------------------------------------------------------------
# Stage 3: Runner (production)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone output (Next.js automatically traces needed node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma schema and generated clients
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./

# Fast copy of node_modules with pre-assigned ownership (avoids slow chown -R)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Wait script (retry until prisma db push succeeds)
RUN echo '#!/bin/sh' > /app/wait.sh && \
    echo 'for i in 1 2 3 4 5 6 7 8 9 10; do npx prisma db push --accept-data-loss 2>/dev/null && exit 0; sleep 2; done; exit 1' >> /app/wait.sh && \
    chmod +x /app/wait.sh && chown nextjs:nodejs /app/wait.sh

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x /app/docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
