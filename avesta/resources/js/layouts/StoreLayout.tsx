import type { ReactNode } from 'react';
import { CartProvider } from '@/components/store/CartContext';
import { CartDrawer } from '@/components/store/CartDrawer';
import { CookieBanner, PromoPopup, WhatsAppButton } from '@/components/store/Extras';
import { Footer } from '@/components/store/Footer';
import { Header } from '@/components/store/Header';
import { Toaster } from '@/components/store/Toaster';

export default function StoreLayout({ children }: { children: ReactNode }) {
    return (
        <CartProvider>
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
                Skip to content
            </a>
            <Header />
            <main id="main" className="min-h-[60vh]">
                {children}
            </main>
            <Footer />
            <CartDrawer />
            <Toaster />
            <CookieBanner />
            <PromoPopup />
            <WhatsAppButton />
        </CartProvider>
    );
}
