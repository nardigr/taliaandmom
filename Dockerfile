# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCKER_BUILD=1
ENV NODE_OPTIONS=--max-old-space-size=1536
RUN npx prisma generate
# Coolify injects DATABASE_URL at build time — migrate before Next collects page data.
RUN npx prisma migrate deploy
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV UPLOADS_DIR=/app/uploads
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

RUN apk add --no-cache curl su-exec \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /app/uploads \
  && chown nextjs:nodejs /app/uploads

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
# Explicit sharp native binaries for image uploads (standalone trace can miss them).
COPY --from=builder /app/scripts/docker-entrypoint.sh ./docker-entrypoint.sh

# Install sharp natively in the runner (more reliable than copying from builder).
RUN npm install --omit=dev --no-save sharp@0.35.3 \
  && chmod +x ./docker-entrypoint.sh \
  && chown -R nextjs:nodejs /app/uploads /app/node_modules

# Entrypoint starts as root to chown the uploads volume, then drops to nextjs.
USER root
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
