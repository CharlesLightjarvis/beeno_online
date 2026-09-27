# ---------- Stage 1: build frontend assets ----------
FROM node:22-alpine AS assets

WORKDIR /app

# APP_NAME is baked into the client bundle via VITE_APP_NAME.
ARG APP_NAME=Beeno
ENV VITE_APP_NAME="${APP_NAME}"
# No PHP binary here: reuse the wayfinder routes committed in the repo.
ENV WAYFINDER_SKIP_GENERATE=1

COPY package.json ./
RUN npm install --no-audit --no-fund

COPY . .
RUN npm run build

# ---------- Stage 2: PHP runtime with Nginx Unit ----------
FROM unit:1.34.1-php8.3

RUN apt update && apt install -y \
    curl unzip git libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev libssl-dev \
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

EXPOSE 8000

CMD ["unitd", "--no-daemon"]
