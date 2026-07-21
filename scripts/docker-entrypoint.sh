#!/bin/sh
set -e

UPLOADS="${UPLOADS_DIR:-/app/uploads}"
mkdir -p "$UPLOADS"

# Volume mounts are often root-owned; fix before dropping privileges.
if [ "$(id -u)" = "0" ]; then
  chown -R nextjs:nodejs "$UPLOADS" || true
  echo "[deploy] Starting application..."
  exec su-exec nextjs "$@"
fi

echo "[deploy] Starting application..."
exec "$@"
