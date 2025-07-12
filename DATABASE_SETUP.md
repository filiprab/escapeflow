# Database Setup Guide

This guide explains how to set up PostgreSQL persistence for EscapeFlow using Docker.

## Quick Start

### 1. Local Development (Recommended)

```bash
# Start PostgreSQL container only
npm run db:up

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed the database with CVE data
npm run db:seed

# Start the Next.js app locally
npm run dev
```

### 2. Development with Docker

```bash
# Start both app and database in development mode
npm run docker:dev

# View logs
npm run docker:logs
```

### 3. Production Deployment

```bash
# Build and start production containers
npm run docker:prod

# View logs
npm run docker:logs
```

## Environment Configuration

The `.env` file contains all necessary configuration:

```env
# PostgreSQL Database Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=escapeflow
POSTGRES_USER=escapeflow
POSTGRES_PASSWORD=escapeflow_dev_password

# Database URLs
DATABASE_URL="postgresql://escapeflow:escapeflow_dev_password@localhost:5432/escapeflow?schema=public"
DATABASE_URL_DOCKER="postgresql://escapeflow:escapeflow_dev_password@postgres:5432/escapeflow?schema=public"
```

## Available Scripts

### Database Management
- `npm run db:up` - Start PostgreSQL container only
- `npm run db:down` - Stop all containers
- `npm run db:logs` - View PostgreSQL logs
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with CVE data
- `npm run db:reset` - Reset database (destructive)
- `npm run db:studio` - Open Prisma Studio GUI

### Docker Management
- `npm run docker:up` - Start full stack (app + database)
- `npm run docker:down` - Stop all containers
- `npm run docker:build` - Rebuild containers
- `npm run docker:logs` - View all container logs

## Database Schema

The PostgreSQL database includes:

### CVE Tables
- `cves` - Main CVE records
- `cve_descriptions` - CVE descriptions (multilingual)
- `cve_references` - Reference URLs
- `cve_affected_products` - Affected products and versions
- `cve_labels` - Custom labels (OS, components)
- `cve_metrics` - CVSS scores and metrics
- `cve_problem_types` - CWE mappings

### Attack Surface Tables
- `target_components` - Browser components (V8, GPU, etc.)
- `exploitation_techniques` - Attack techniques
- `technique_cve_links` - Many-to-many CVE-technique relationships

## API Endpoints

With the database running, the following API endpoints are available:

- `GET /api/cves` - List CVEs with filtering and pagination
- `GET /api/cves?type=filters` - Get available filter options
- `GET /api/cves/[cveId]` - Get individual CVE details
- `DELETE /api/cves/[cveId]` - Delete CVE (admin)

## Development Workflow

1. **Start Database**: `npm run db:up`
2. **Run Migrations**: `npm run db:migrate` (first time only)
3. **Seed Data**: `npm run db:seed` (first time only)
4. **Start App**: `npm run dev`
5. **Make Schema Changes**: Edit `prisma/schema.prisma` → `npm run db:migrate`

## Production Deployment

For production, update the environment variables:

```env
NODE_ENV=production
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
NEXTAUTH_SECRET=your-secure-secret
NEXTAUTH_URL=https://your-domain.com
```

## Troubleshooting

### Database Connection Issues
- Ensure Docker is running
- Check if port 5432 is available
- Verify `.env` configuration

### Migration Errors
- Stop containers: `npm run docker:down`
- Remove volumes: `docker volume rm escapeflow_postgres_data`
- Restart: `npm run db:up && npm run db:migrate`

### Prisma Client Issues
- Regenerate client: `npm run db:generate`
- Clear node_modules: `rm -rf node_modules && npm install`