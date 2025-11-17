import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';

import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        wayfinder(),
    ],
    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
});
