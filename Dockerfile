# ─────────────────────────────────────────────
# Stage 1: deps  — instala solo las dependencias
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# pnpm vía corepack (mismo gestor que en desarrollo)
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────
# Stage 2: builder — compila el proyecto
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Las variables de entorno con NEXT_PUBLIC_ se incrustran en el bundle
# en tiempo de build — deben inyectarse aquí via Dokploy build args.
# Nunca coloques valores reales en este Dockerfile.
ARG NEXT_PUBLIC_POCKETBASE_URL
ENV NEXT_PUBLIC_POCKETBASE_URL=${NEXT_PUBLIC_POCKETBASE_URL}

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ─────────────────────────────────────────────
# Stage 3: runner — imagen final mínima
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Puerto expuesto — Dokploy lo mapea al 3017 del host
ENV PORT=3017

# Usuario sin privilegios
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Salida standalone de Next.js (requiere output: 'standalone' en next.config)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public          ./public

USER nextjs

EXPOSE 3017

CMD ["node", "server.js"]
