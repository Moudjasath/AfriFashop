FROM php:8.4-cli-alpine

# Dépendances système
RUN apk add --no-cache \
    bash \
    git \
    unzip \
    libpq-dev \
    icu-dev \
    libzip-dev \
    oniguruma-dev \
    libsodium-dev

# Extensions PHP
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    intl \
    zip \
    opcache \
    mbstring

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copier le projet
COPY . .

# Installer les dépendances sans scripts Symfony (env pas encore disponible)
RUN composer install --no-dev --optimize-autoloader --no-scripts \
    && composer dump-autoload --optimize

# Préparer les dossiers runtime
RUN mkdir -p config/jwt var/cache var/log \
    && chmod -R 777 var

# Entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 10000

ENTRYPOINT ["docker-entrypoint.sh"]
