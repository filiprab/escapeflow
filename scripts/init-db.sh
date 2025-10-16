#!/bin/sh
set -e

echo "Starting database initialization..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "[-] PostgreSQL is unavailable - sleeping"
  sleep 2
done

# Always run migrations first (safe to run on existing databases)
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Check if seeding is needed
echo "Checking if seeding is needed..."
CVE_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM cves;" 2>/dev/null || echo "0")

if [ "$CVE_COUNT" -gt 0 ]; then
  echo "Database already has $CVE_COUNT CVEs. Skipping seeding."
else
  echo "No CVE data found. Running seeding..."
  npm run db:seed
fi

echo "[+] Database initialization completed successfully!"

# Verify the setup
echo "Verifying database setup..."
FINAL_CVE_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM cves;" || echo "0")
FINAL_TABLES_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" || echo "0")

echo "Final status:"
echo "   - Tables: $FINAL_TABLES_COUNT"
echo "   - CVEs: $FINAL_CVE_COUNT"

if [ "$FINAL_CVE_COUNT" -gt 0 ] && [ "$FINAL_TABLES_COUNT" -gt 0 ]; then
  echo "[+] Database initialization verification passed!"
else
  echo "[-] Database initialization verification failed!"
  exit 1
fi