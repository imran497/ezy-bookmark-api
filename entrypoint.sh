#!/bin/sh

# Wait for Supabase to be ready (optional if it's always ready)
# ./wait-for-it.sh <your-db-host>:5432 --timeout=30 -- echo "Database is up"

# Run Prisma migrations at runtime
npx prisma migrate deploy

# Start your app
yarn start:prod