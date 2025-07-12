# Use the official Node.js runtime as the base image
FROM node:22-alpine AS base

# Install dependencies for development
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies (including dev dependencies for development)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Development stage
FROM base AS development
WORKDIR /app

# Install dependencies needed for Prisma and PostgreSQL
RUN apk add --no-cache libc6-compat openssl

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

# Copy application code
COPY . .

# Generate Prisma client again in case of schema changes
RUN npx prisma generate

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Default development command
CMD ["npm", "run", "dev"]

# Production builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Database initialization stage
FROM base AS init
WORKDIR /app

# Install dependencies needed for database operations
RUN apk add --no-cache libc6-compat openssl postgresql-client

# Copy dependencies and Prisma files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY package.json ./
COPY scripts ./scripts
COPY src/data ./src/data

# Ensure scripts are executable
RUN chmod +x scripts/init-db.sh

# Default init command
CMD ["./scripts/init-db.sh"]

# Production runner stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

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

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 