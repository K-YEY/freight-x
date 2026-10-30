import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import { LanguageProvider } from './Context/LanguageContext';
import { CurrencyProvider } from './Context/CurrencyContext';

const appName = import.meta.env.VITE_APP_NAME || 'Twenty CRM';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <LanguageProvider>
                <CurrencyProvider>
                    <App {...props} />
                </CurrencyProvider>
            </LanguageProvider>
        );
    },
    progress: {
        color: '#18181b',
        showSpinner: false,
    },
});
