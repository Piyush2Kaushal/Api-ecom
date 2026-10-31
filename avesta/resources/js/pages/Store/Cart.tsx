import { Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Bookmark, FileDown, Lock, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { FreeShippingBar } from '@/components/store/FreeShippingBar';
import { ProductCard } from '@/components/store/ProductCard';
import { Totals } from '@/components/store/Totals';
import { Button, EmptyState, QuantityStepper } from '@/components/ui';
import { useMoney } from '@/hooks/useMoney';
import { useShared } from '@/hooks/useShared';
import { route } from '@/lib/utils';
import type { CartSummary, ProductCard as Card } from '@/types';

export default function Cart({ summary, suggested }: { summary: CartSummary; suggested: Card[] }) {
    const money = useMoney();
    const { auth } = useShared();
    const coupon = useForm({ code: '' });
    const opts = { preserveScroll: true, preserveState: true };

    const setQty = (id: number, quantity: number) => router.patch(route('cart.update', id), { quantity }, opts);
    const remove = (id: number) => router.delete(route('cart.remove', id), opts);
    const toggleSave = (id: number) => router.post(route('cart.save', id), {}, opts);

    if (!summary.lines.length && !summary.saved.length) {
        return (
            <div className="container-x py-16 md:py-24">
                <EmptyState icon={<ShoppingBag className="size-6" />} title="Your basket is empty" text="Discover cameras, recorders, alarms and complete kits." action={<Button href={route('shop')}>Start shopping</Button>} />
                {suggested.length > 0 && (
                    <div className="mt-16">
                        <h2 className="mb-6 text-2xl font-semibold">Popular right now</h2>
                        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{suggested.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="container-x py-10 md:py-14">
            <h1 className="font-display text-[34px] font-semibold tracking-tight md:text-[44px]">Your basket</h1>
            <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
                <div>
                    {summary.free_shipping && summary.lines.length > 0 && (
                        <div className="mb-6 rounded-2xl bg-porcelain p-5">
                            <FreeShippingBar info={summary.free_shipping} />
                        </div>
                    )}
                    {summary.has_issues && (
                        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-100">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                            Some items need attention before you can check out — adjust the quantity or remove them.
                        </div>
                    )}
                    <ul className="divide-y divide-mist border-y border-mist">
                        {summary.lines.map((l) => (
                            <li key={l.id} className="flex gap-4 py-6 sm:gap-6">
                                <Link href={route('product.show', l.slug)} className="size-24 shrink-0 rounded-2xl bg-porcelain p-3 sm:size-32">
                                    {l.image && <img src={l.image} alt="" className="size-full object-contain" />}
                                </Link>
                                <div className="flex min-w-0 flex-1 flex-col">
                                    <div className="flex justify-between gap-4">
                                        <div className="min-w-0">
                                            {l.brand && <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-600">{l.brand}</div>}
                                            <Link href={route('product.show', l.slug)} className="mt-0.5 line-clamp-2 font-medium leading-snug hover:text-violet-700">{l.name}</Link>
                                            <div className="mt-1 text-xs text-slate">SKU {l.sku}{l.variant_label && ` · ${l.variant_label}`}</div>
                                            <div className="tabular mt-1.5 text-sm">
                                                {money(l.unit_price)} {l.unit_original > l.unit_price && <span className="ml-1 text-xs text-ash line-through">{money(l.unit_original)}</span>}
                                                <span className="ml-2 text-xs text-slate">{l.vat_mode === 'excluded' ? '+ VAT' : l.vat_mode === 'none' ? 'No VAT' : 'inc. VAT'}</span>
                                            </div>
                                            {l.issue && <div className="mt-1.5 text-xs font-semibold text-danger">{l.issue}</div>}
                                        </div>
                                        <div className="tabular text-right font-semibold">
                                            {money(l.line_amount)}
                                            {l.line_original > l.line_amount && <div className="text-xs font-normal text-ash line-through">{money(l.line_original)}</div>}
                                        </div>
                                    </div>
                                    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-4">
                                        <QuantityStepper size="sm" value={l.quantity} max={l.available} onChange={(q) => setQty(l.id, q)} />
                                        <button onClick={() => toggleSave(l.id)} className="flex items-center gap-1.5 text-[13px] text-slate hover:text-onyx"><Bookmark className="size-3.5" /> Save for later</button>
                                        <button onClick={() => remove(l.id)} className="flex items-center gap-1.5 text-[13px] text-slate hover:text-danger"><Trash2 className="size-3.5" /> Remove</button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {summary.saved.length > 0 && (
                        <div className="mt-10">
                            <h2 className="mb-4 text-lg font-semibold">Saved for later ({summary.saved.length})</h2>
                            <ul className="grid gap-3 sm:grid-cols-2">
                                {summary.saved.map((l) => (
                                    <li key={l.id} className="flex items-center gap-4 rounded-2xl border border-mist p-3">
                                        <div className="size-16 shrink-0 rounded-xl bg-porcelain p-2">{l.image && <img src={l.image} alt="" className="size-full object-contain" />}</div>
                                        <div className="min-w-0 flex-1">
                                            <div className="line-clamp-1 text-sm font-medium">{l.name}</div>
                                            <div className="tabular text-sm text-slate">{money(l.unit_price)}</div>
                                            <div className="mt-1 flex gap-3 text-xs">
                                                <button onClick={() => toggleSave(l.id!)} className="font-semibold text-violet-700">Move to basket</button>
                                                <button onClick={() => remove(l.id!)} className="text-slate hover:text-danger">Remove</button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {summary.lines.length > 0 && (
                    <aside>
                        <div className="sticky top-28 space-y-4">
                            <div className="rounded-3xl border border-mist p-6">
                                <h2 className="mb-5 text-lg font-semibold">Order summary</h2>
                                {summary.coupon ? (
                                    <div className="mb-5 flex items-center justify-between rounded-xl bg-violet-50 px-3.5 py-2.5 text-sm">
                                        <span className="flex items-center gap-2 font-semibold text-violet-800"><Tag className="size-4" /> {summary.coupon.code}</span>
                                        <button onClick={() => router.delete(route('cart.coupon.remove'), opts)} className="text-violet-700 hover:text-onyx" aria-label="Remove coupon"><X className="size-4" /></button>
                                    </div>
                                ) : (
                                    <form
                                        className="mb-5"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            coupon.post(route('cart.coupon'), { ...opts, onSuccess: () => coupon.reset() });
                                        }}
                                    >
                                        <div className="flex gap-2">
                                            <input value={coupon.data.code} onChange={(e) => coupon.setData('code', e.target.value.toUpperCase())} placeholder="Coupon code" className="h-11 min-w-0 flex-1 rounded-xl border border-mist px-3.5 text-sm uppercase tracking-wide placeholder:normal-case placeholder:tracking-normal focus:border-violet-500 focus:outline-none" aria-label="Coupon code" />
                                            <Button variant="outline" loading={coupon.processing}>Apply</Button>
                                        </div>
                                        {coupon.errors.code && <p className="mt-1.5 text-xs font-medium text-danger">{coupon.errors.code}</p>}
                                    </form>
                                )}
                                {summary.coupon_error && <p className="mb-4 text-xs font-medium text-danger">{summary.coupon_error}</p>}
                                <Totals summary={summary} showShipping={false} />
                                <p className="mt-3 text-xs text-slate">Delivery options are shown at checkout.</p>
                                <Button href={route('checkout')} size="lg" block className="mt-6" disabled={summary.has_issues}>
                                    <Lock className="size-4" /> Secure checkout <ArrowRight className="size-4" />
                                </Button>
                                {auth?.user && (
                                    <a href={route('cart.quote')} className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-slate hover:text-onyx">
                                        <FileDown className="size-4" /> Download pro-forma quote (PDF)
                                    </a>
                                )}
                            </div>
                            <p className="px-2 text-center text-xs text-slate">Payments are processed securely by Stripe. We never store your card details.</p>
                        </div>
                    </aside>
                )}
            </div>
            {suggested.length > 0 && (
                <div className="mt-20">
                    <h2 className="mb-6 text-2xl font-semibold">Complete your installation</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-6 md:grid-cols-4">{suggested.map((p) => <ProductCard key={p.id} product={p} />)}</div>
                </div>
            )}
        </div>
    );
}
