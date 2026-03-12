# -----------------------------------------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
# Skip postinstall (prisma generate) until builder stage where schema exists
RUN npm ci --ignore-scripts

# -----------------------------------------------------------------------------
# Stage 2: Build
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate (uses schema from COPY .)
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Runner (production)
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma for migrations/seed at runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
RUN npm install prisma tsx bcryptjs --no-save

# Wait script (retry until prisma db push succeeds)
RUN echo '#!/bin/sh' > /app/wait.sh && \
    echo 'for i in 1 2 3 4 5 6 7 8 9 10; do npx prisma db push --accept-data-loss 2>/dev/null && exit 0; sleep 2; done; exit 1' >> /app/wait.sh && \
    chmod +x /app/wait.sh

RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY docker-entrypoint.sh ./
RUN chmod +x /app/docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
