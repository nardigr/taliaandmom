#!/bin/sh
set -e

# Migrations run during image build (Dockerfile). Runtime Prisma CLI is not
# bundled fully in the standalone image, so we start the app directly.

if [ -n "$UPLOADS_DIR" ] && [ ! -d "$UPLOADS_DIR" ]; then
  mkdir -p "$UPLOADS_DIR"
fi

echo "[deploy] Starting application..."
exec "$@"
