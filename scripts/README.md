# Scripts Directory

This directory contains utility scripts for data management and database operations.

## Database Initialization

### `init-db.sh`

Docker database initialization script that runs migrations and prepares the database.

**Purpose:**
- Waits for PostgreSQL to be ready
- Runs Prisma migrations (`prisma migrate deploy`)
- Prepares the database for seeding

**Usage:**
This script is automatically executed by Docker Compose. You don't need to run it manually.

---

## Prerequisites

All scripts require:
- Node.js and npm installed
- Dependencies installed: `npm install`
- For database scripts: PostgreSQL running and `DATABASE_URL` set in `.env`
