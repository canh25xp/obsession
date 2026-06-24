# syntax=docker/dockerfile:1

#####################################
# 1. Dependencies — install node_modules
#####################################
FROM node:22-alpine AS deps
WORKDIR /app

# Needed for some native deps on Alpine; cheap to include
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci

#####################################
# 2. Builder — build the Next.js app
#####################################
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1

# Requires outbound network access to fonts.googleapis.com / fonts.gstatic.com
# at build time, since this project uses next/font/google.
RUN npm run build

#####################################
# 3. Runner — minimal production image
#####################################
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Run as a non-root user
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Public assets (static images/video served from /public)
COPY --from=builder /app/public ./public

# Standalone server output (next.config.ts has output: "standalone")
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
