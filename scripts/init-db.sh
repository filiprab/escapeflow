#!/bin/sh
set -e

echo "Starting database initialization..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "[-] PostgreSQL is unavailable - sleeping"
  sleep 2
done

# Check if database is already initialized
echo "Checking if database is already initialized..."
TABLES_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null || echo "0")

if [ "$TABLES_COUNT" -gt 0 ]; then
  echo "Database already has $TABLES_COUNT tables, checking if seeding is needed..."
  
  # Check if CVE data exists
  CVE_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c "SELECT COUNT(*) FROM cves;" 2>/dev/null || echo "0")
  
  if [ "$CVE_COUNT" -gt 0 ]; then
    echo "Database already initialized with $CVE_COUNT CVEs. Skipping initialization."
    exit 0
  else
    echo "Tables exist but no CVE data found. Running seeding only..."
    npm run db:seed
    echo "[+] Database seeding completed!"
    exit 0
  fi
fi

echo "Database not initialized. Running full setup..."

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database seeding
echo "Seeding database with CVE data..."
npm run db:seed

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