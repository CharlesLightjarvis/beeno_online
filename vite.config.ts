import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Space Grotesk', {
                    weights: [400, 500, 600, 700],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
            // Docker builds have no PHP binary: the committed routes under
            // resources/js/routes are used as-is when generation is skipped.
            command: process.env.WAYFINDER_SKIP_GENERATE
                ? 'echo "wayfinder: generation skipped"'
                : process.env.PROPULSE_PHP_BINARY
                    ? `"${process.env.PROPULSE_PHP_BINARY}" artisan wayfinder:generate`
                    : 'php artisan wayfinder:generate',
        }),
    ],
});
