#!/bin/bash
set -e

echo "🔍 === CONTAINER DEBUGGING INFORMATION ==="
echo "📂 Current working directory: $(pwd)"
echo "📋 Directory contents:"
ls -la

echo ""
echo "🌍 Environment variables:"
echo "PORT: $PORT"
echo "NODE_ENV: $NODE_ENV"
echo "DATABASE_URL: ${DATABASE_URL:0:50}... (truncated)"

echo ""
echo "📁 Checking important directories:"
echo "dist/ contents:"
ls -la dist/ || echo "dist/ directory not found"

echo "dist/src/ contents:"
ls -la dist/src/ || echo "dist/src/ directory not found"

echo "node_modules/.prisma/ contents:"
ls -la node_modules/.prisma/ || echo "node_modules/.prisma/ directory not found"

echo ""
echo "🗄️ Database migrations status:"
npx prisma migrate status || echo "Failed to check migration status"

echo ""
echo "🚀 Starting database migrations..."
npx prisma migrate deploy

echo ""
echo "🎯 Starting application on port: ${PORT:-3001}"
echo "📍 App will be available on: 0.0.0.0:${PORT:-3001}"

echo ""
echo "🔄 Executing: yarn start:prod"
exec yarn start:prod