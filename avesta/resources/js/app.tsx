import '../css/app.css';
import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AccountLayout from './layouts/AccountLayout';
import AdminLayout from './layouts/AdminLayout';
import StoreLayout from './layouts/StoreLayout';

const pages = import.meta.glob('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => title,
    resolve: async (name) => {
        const loader = pages[`./pages/${name}.tsx`];
        if (!loader) throw new Error(`Page not found: ${name}`);
        return ((await loader()) as any).default;
    },
    layout: (name: string) => {
        if (name === 'Admin/Login') return undefined;
        if (name.startsWith('Admin/')) return AdminLayout;
        if (name.startsWith('Account/')) return [StoreLayout, AccountLayout];
        return StoreLayout;
    },
    setup({ el, App, props }) {
        createRoot(el!).render(<App {...props} />);
    },
    progress: { color: '#5B2BD9', delay: 150 },
});
