import '../css/app.css';

import { ReactQueryProvider } from '@/lib/reactQuery';
import { createInertiaApp } from '@inertiajs/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/stock/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Fireshot';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ReactQueryProvider>
                <App {...props} />
                <ReactQueryDevtools initialIsOpen={false} />
            </ReactQueryProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
