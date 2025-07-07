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
echo "🗄️ Database migrations status:"
if npx prisma migrate status; then
    echo "✅ Migration status check successful"
else
    echo "❌ Failed to check migration status - continuing anyway"
fi

echo ""
echo "🚀 Starting database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ Database migrations failed - but continuing to start app"
fi

echo ""
echo "🎯 Starting application on port: ${PORT:-3001}"
echo "📍 App will be available on: 0.0.0.0:${PORT:-3001}"

echo ""
echo "🔄 Executing: yarn start:prod"
exec yarn start:prod