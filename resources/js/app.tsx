import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const pages = import.meta.glob('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Direct match first
        const directKey = `./pages/${name}.tsx`;
        if (pages[directKey]) {
            const page = pages[directKey];
            return typeof page === 'function' ? page() : page;
        }

        // Case-insensitive match for linux / mixed-casing compatibility
        const targetClean = name.toLowerCase().replace(/^\/+/, '');
        for (const [path, page] of Object.entries(pages)) {
            const cleanPath = path
                .replace(/^\.\/pages\//i, '')
                .replace(/\.tsx$/, '')
                .toLowerCase();

            if (cleanPath === targetClean) {
                return typeof page === 'function' ? page() : page;
            }
        }

        throw new Error(`Page not found: ${name}`);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#7C4DFF',
    },
});

// =========================================================================
// REGISTER PWA SERVICE WORKER
// =========================================================================
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('[PWA] Service Worker registered with scope:', registration.scope);
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    if (installingWorker) {
                        installingWorker.onstatechange = () => {
                            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[PWA] Versi baru LAPAK tersedia.');
                            }
                        };
                    }
                };
            })
            .catch((error) => {
                console.warn('[PWA] Service Worker registration failed:', error);
            });
    });
}

