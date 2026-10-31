import { Link, router } from '@inertiajs/react';
import { ShoppingBag, Trash2, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Drawer, QuantityStepper, Spinner } from '@/components/ui';
import { useMoney } from '@/hooks/useMoney';
import { api, route } from '@/lib/utils';
import type { CartSummary } from '@/types';
import { useCart } from './CartContext';
import { FreeShippingBar } from './FreeShippingBar';

export function CartDrawer() {
    const { open, setOpen, version } = useCart();
    const money = useMoney();
    const [summary, setSummary] = useState<CartSummary | null>(null);
    const [busy, setBusy] = useState<number | null>(null);

    const load = () => api<CartSummary>(route('cart.summary')).then(setSummary).catch(() => {});
    useEffect(() => {
        if (open) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, version]);

    const update = async (id: number, quantity: number) => {
        setBusy(id);
        try {
            const s = await api<CartSummary>(route('cart.update', id), { method: 'PATCH', body: { quantity } });
            setSummary(s);
            router.reload({ only: ['cartCount'] });
        } finally {
            setBusy(null);
        }
    };

    const lines = summary?.lines ?? [];
    return (
        <Drawer
            open={open}
            onClose={() => setOpen(false)}
            title={
                <span className="flex items-center gap-2">
                    Your basket {summary && <span className="tabular rounded-full bg-porcelain px-2 py-0.5 text-xs text-slate">{summary.totals.item_count}</span>}
                </span>
            }
            footer={
                lines.length > 0 && summary ? (
                    <div className="space-y-3">
                        <div className="flex items-baseline justify-between">
                            <span className="text-sm text-slate">Subtotal</span>
                            <span className="tabular text-lg font-semibold">{money(summary.totals.items_subtotal)}</span>
                        </div>
                        {summary.totals.savings > 0 && (
                            <div className="flex justify-between text-sm font-medium text-violet-700">
                                <span>You save</span>
                                <span className="tabular">{money(summary.totals.savings)}</span>
                            </div>
                        )}
                        <p className="text-xs text-slate">Delivery and VAT are calculated at checkout.</p>
                        <div className="grid grid-cols-2 gap-2.5">
                            <Button variant="outline" href={route('cart')} onClick={() => setOpen(false)}>
                                View basket
                            </Button>
                            <Button href={route('checkout')} onClick={() => setOpen(false)}>
                                Checkout
                            </Button>
                        </div>
                    </div>
                ) : undefined
            }
        >
            {!summary ? (
                <div className="flex h-60 items-center justify-center">
                    <Spinner />
                </div>
            ) : lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-8 py-20 text-center">
                    <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                        <ShoppingBag className="size-7" />
                    </div>
                    <h3 className="text-lg font-semibold">Your basket is empty</h3>
                    <p className="mt-1.5 text-sm text-slate">Explore cameras, kits and alarms from the brands installers trust.</p>
                    <Button className="mt-6" href={route('shop')} onClick={() => setOpen(false)}>
                        Start shopping
                    </Button>
                </div>
            ) : (
                <div>
                    {summary.free_shipping && (
                        <div className="border-b border-mist px-5 py-4">
                            <FreeShippingBar info={summary.free_shipping} />
                        </div>
                    )}
                    <ul className="divide-y divide-mist">
                        {lines.map((l) => (
                            <li key={l.id} className="flex gap-4 px-5 py-4">
                                <Link href={route('product.show', l.slug)} onClick={() => setOpen(false)} className="size-20 shrink-0 overflow-hidden rounded-xl bg-porcelain p-2">
                                    {l.image && <img src={l.image} alt="" className="size-full object-contain" />}
                                </Link>
                                <div className="min-w-0 flex-1">
                                    <Link href={route('product.show', l.slug)} onClick={() => setOpen(false)} className="line-clamp-2 text-sm font-medium leading-snug hover:text-violet-700">
                                        {l.name}
                                    </Link>
                                    {l.variant_label && <div className="mt-0.5 text-xs text-slate">{l.variant_label}</div>}
                                    {l.issue && <div className="mt-1 text-xs font-medium text-danger">{l.issue}</div>}
                                    <div className="mt-2.5 flex items-center justify-between gap-2">
                                        <QuantityStepper size="sm" value={l.quantity} max={l.available} onChange={(q) => update(l.id, q)} />
                                        <div className="text-right">
                                            <div className="tabular text-sm font-semibold">{money(l.line_amount)}</div>
                                            {l.line_original > l.line_amount && <div className="tabular text-xs text-ash line-through">{money(l.line_original)}</div>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => update(l.id, 0)} disabled={busy === l.id} className="self-start p-1 text-ash transition hover:text-danger" aria-label="Remove">
                                    <Trash2 className="size-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Drawer>
    );
}
