# Build stages use Bun for faster installs and TypeScript execution
FROM oven/bun:1-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Generate Prisma client
RUN bunx prisma generate

# Production builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client and build
RUN bunx prisma generate
RUN bun run build

# Database initialization stage
FROM base AS init
WORKDIR /app

# Install dependencies needed for database operations
RUN apk add --no-cache libc6-compat openssl postgresql-client

# Add non-root user first
RUN addgroup --system --gid 1001 dbuser
RUN adduser --system --uid 1001 dbuser

# Copy dependencies and Prisma files with proper ownership
COPY --from=deps --chown=dbuser:dbuser /app/node_modules ./node_modules
COPY --from=deps --chown=dbuser:dbuser /app/prisma ./prisma
COPY --chown=dbuser:dbuser package.json ./
COPY --chown=dbuser:dbuser scripts ./scripts
COPY --chown=dbuser:dbuser src ./src
COPY --chown=dbuser:dbuser prisma/seed.ts ./prisma/

# Ensure scripts are executable
RUN chmod +x /app/scripts/init-db.sh

# Set the user to dbuser before running the init script
USER dbuser

# Default init command
CMD ["sh", "/app/scripts/init-db.sh"]

# Production runner stage — uses Node since Next.js standalone outputs a Node server
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install production dependencies for Prisma
RUN apk add --no-cache libc6-compat openssl

COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]