#!/bin/sh
set -e

# Wait for PostgreSQL and apply schema (retry loop)
echo "Waiting for PostgreSQL and applying schema..."
/app/wait.sh || (echo "Could not connect to database."; exit 1)
echo "Database ready."

# Seed (optional)
echo "Seeding database..."
npx tsx prisma/seed.ts 2>/dev/null || true

echo "Starting application..."
exec node server.js
