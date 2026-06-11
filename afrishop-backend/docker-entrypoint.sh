#!/bin/sh
set -e

echo "==> Décodage des clés JWT..."
mkdir -p config/jwt
printf '%s' "$JWT_SECRET_KEY" | base64 -d > config/jwt/private.pem
printf '%s' "$JWT_PUBLIC_KEY"  | base64 -d > config/jwt/public.pem
chmod 600 config/jwt/private.pem config/jwt/public.pem

echo "==> Cache Symfony..."
APP_ENV=prod php bin/console cache:clear --no-warmup
APP_ENV=prod php bin/console cache:warmup

echo "==> Mise à jour du schéma base de données..."
APP_ENV=prod php bin/console doctrine:schema:update --force --no-interaction

echo "==> Démarrage du serveur sur le port ${PORT:-10000}..."
exec php -S "0.0.0.0:${PORT:-10000}" public/index.php
