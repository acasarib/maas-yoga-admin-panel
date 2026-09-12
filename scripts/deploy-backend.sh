#!/usr/bin/env bash
# Auto-deploy del backend en el VPS (sin Docker, con PM2).
# Corre en /root/projects/maas-yoga, rama "backend-deploy".
# Pensado para dispararse por cron todos los dias a las 3am.
set -euo pipefail

REPO_DIR="/root/projects/maas-yoga"
BRANCH="backend-deploy"
PM2_ID=0

cd "$REPO_DIR"

git fetch origin "$BRANCH" --quiet

LOCAL=$(git rev-parse "$BRANCH")
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "$(date '+%Y-%m-%d %H:%M:%S') - sin cambios"
  exit 0
fi

echo "$(date '+%Y-%m-%d %H:%M:%S') - cambios detectados, desplegando..."

# npm install regenera este archivo con pequenas diferencias de plataforma/version,
# lo que deja cambios locales que bloquean el pull. Se descarta solo este archivo.
git checkout -- backend/package-lock.json

git pull origin "$BRANCH"

cd backend
npm install --omit=dev

pm2 restart "$PM2_ID"

echo "$(date '+%Y-%m-%d %H:%M:%S') - deploy completo"
