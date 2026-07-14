# Multi-stage build so the final image ships only production output,
# not devDependencies or build caches.

FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
# postinstall runs `prisma generate`, which only reads schema.prisma —
# a placeholder is enough at this stage; the real value is supplied at
# container runtime.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/placeholder"
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# A syntactically valid placeholder is enough for `prisma generate` and
# `next build` (which only statically analyzes route handlers) — the
# real DATABASE_URL is supplied at container runtime, not build time.
ENV DATABASE_URL="postgresql://user:password@localhost:5432/placeholder"
RUN npm run db:generate
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
