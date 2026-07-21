#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ] && [ -f "./node_modules/prisma/build/index.js" ]; then
  echo "[deploy] Running database migrations..."
  node ./node_modules/prisma/build/index.js migrate deploy
fi

if [ -n "$UPLOADS_DIR" ] && [ ! -d "$UPLOADS_DIR" ]; then
  mkdir -p "$UPLOADS_DIR"
fi

echo "[deploy] Starting application..."
exec "$@"
