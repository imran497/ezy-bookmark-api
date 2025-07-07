#!/bin/bash

echo "🎬 Starting EzyBookmark API..."
echo "⏰ Timestamp: $(date)"
echo "🌍 Environment: NODE_ENV=${NODE_ENV:-production}"
echo "🔌 Port: ${PORT:-3001}"

# Run migrations if enabled
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "🗄️ Running database migrations..."
  timeout 60 npx prisma migrate deploy
  migration_exit_code=$?
  if [ $migration_exit_code -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
  elif [ $migration_exit_code -eq 124 ]; then
    echo "⏰ Migration timed out after 60 seconds - continuing anyway"
  else
    echo "❌ Database migrations failed (exit code: $migration_exit_code) - continuing anyway"
  fi
else
  echo "⏭️  Skipping migrations (RUN_MIGRATIONS not set to true)"
fi

echo "🚀 Starting application..."
exec node dist/src/main.js