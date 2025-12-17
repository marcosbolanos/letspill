#!/bin/sh
set -e

# Construct DATABASE_URL from individual environment variables
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

echo "Running database migrations..."
echo "Database host: $DB_HOST"

# Run drizzle-kit migrate
pnpm drizzle-kit migrate

echo "Migrations completed successfully!"
