#!/bin/bash

echo "🎬 === ENTRYPOINT SCRIPT STARTED ==="
echo "⏰ Timestamp: $(date)"
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
ls -la dist/ || echo "❌ dist/ directory not found"

echo "dist/src/ contents:"
ls -la dist/src/ || echo "❌ dist/src/ directory not found"

echo "node_modules/.prisma/ contents:"
ls -la node_modules/.prisma/ || echo "❌ node_modules/.prisma/ directory not found"

echo ""
echo "🗄️ Skipping migration status check (can hang in production)"
echo "🚀 Starting database migrations with timeout..."

# Run migration deploy with timeout
timeout 60 npx prisma migrate deploy
migration_exit_code=$?

if [ $migration_exit_code -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
elif [ $migration_exit_code -eq 124 ]; then
    echo "⏰ Migration timed out after 60 seconds - continuing anyway"
else
    echo "❌ Database migrations failed (exit code: $migration_exit_code) - continuing anyway"
fi

echo ""
echo "🎯 Starting application on port: ${PORT:-3001}"
echo "📍 App will be available on: 0.0.0.0:${PORT:-3001}"

echo ""
echo "🔄 Executing: yarn start:prod"
exec yarn start:prod