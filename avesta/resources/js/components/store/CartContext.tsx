import { router } from '@inertiajs/react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { route } from '@/lib/utils';
import { toast } from './Toaster';

interface CartCtx {
    open: boolean;
    setOpen: (v: boolean) => void;
    version: number;
    add: (productId: number, quantity?: number, variantId?: number | null, opts?: { openDrawer?: boolean }) => Promise<boolean>;
    refresh: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [version, setVersion] = useState(0);
    const refresh = useCallback(() => setVersion((v) => v + 1), []);

    const add = useCallback(
        (productId: number, quantity = 1, variantId: number | null = null, opts: { openDrawer?: boolean } = {}) =>
            new Promise<boolean>((resolve) => {
                router.post(
                    route('cart.add'),
                    { product_id: productId, quantity, variant_id: variantId },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        only: ['cartCount', 'flash'],
                        onSuccess: (page: any) => {
                            const ok = !page.props.flash?.error;
                            if (ok) {
                                setVersion((v) => v + 1);
                                if (opts.openDrawer !== false) setOpen(true);
                            }
                            resolve(ok);
                        },
                        onError: () => {
                            toast('Could not add to basket.', 'error');
                            resolve(false);
                        },
                    },
                );
            }),
        [],
    );

    return <Ctx.Provider value={{ open, setOpen, version, add, refresh }}>{children}</Ctx.Provider>;
}

export function useCart() {
    const c = useContext(Ctx);
    if (!c) throw new Error('useCart outside CartProvider');
    return c;
}
