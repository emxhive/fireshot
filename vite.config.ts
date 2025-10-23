import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from 'tailwindcss';


export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        wayfinder({
            formVariants: true,
        }),
    ],
    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },
    esbuild: {
        jsx: 'automatic',
    },

    server: {
        host: '192.168.0.188',
        cors: true,  // ✅ so you can access from other devices on LAN/
        watch: {
            ignored: [
                '**/node_modules/**',  // heavy, never needed
                '**/vendor/**',        // Laravel PHP deps
                '**/storage/**',       // logs, cache
                '**/bootstrap/cache/**',
                '**/.git/**',
                '**/public/**',
                '**/.vscode/**',
                '**/.idea/**',
            ],
        },
    },
});
