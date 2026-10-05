# ---------- Stage 1: build frontend assets ----------
FROM node:22-alpine AS assets

WORKDIR /app

# Public Vite values are baked into the client bundle during the image build.
# Coolify must provide these as build variables for production Reverb.
ARG APP_NAME=Beeno
ARG VITE_REVERB_APP_KEY
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT=443
ARG VITE_REVERB_SCHEME=https
ENV VITE_APP_NAME="${APP_NAME}"
ENV VITE_REVERB_APP_KEY="${VITE_REVERB_APP_KEY}"
ENV VITE_REVERB_HOST="${VITE_REVERB_HOST}"
ENV VITE_REVERB_PORT="${VITE_REVERB_PORT}"
ENV VITE_REVERB_SCHEME="${VITE_REVERB_SCHEME}"
# No PHP binary here: reuse the wayfinder routes committed in the repo.
ENV WAYFINDER_SKIP_GENERATE=1

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- Stage 2: PHP runtime with Nginx Unit ----------
# PHP 8.4: the composer.lock requires >=8.4.1 (Symfony 8 components),
# matching the local Herd PHP 8.4 used to generate the lock file.
FROM unit:1.34.1-php8.4

RUN apt update && apt install -y \
    curl unzip git supervisor libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libssl-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pcntl opcache pdo pdo_mysql intl zip gd exif ftp bcmath \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/zz-custom.ini \
    && echo "opcache.jit=tracing" >> /usr/local/etc/php/conf.d/zz-custom.ini \
    && echo "opcache.jit_buffer_size=128M" >> /usr/local/etc/php/conf.d/zz-custom.ini \
    && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/zz-custom.ini \
    && echo "upload_max_filesize=30M" >> /usr/local/etc/php/conf.d/zz-custom.ini \
    && echo "post_max_size=35M" >> /usr/local/etc/php/conf.d/zz-custom.ini

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

WORKDIR /var/www/html

RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache

COPY . .
COPY --from=assets /app/public/build ./public/build

# --no-dev: production image must not ship dev dependencies.
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction \
    && chown -R unit:unit storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY unit.json /docker-entrypoint.d/unit.json
COPY supervisord.conf /etc/supervisor/conf.d/beenoonline.conf

EXPOSE 80 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl --fail http://127.0.0.1/up || exit 1

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/beenoonline.conf"]
