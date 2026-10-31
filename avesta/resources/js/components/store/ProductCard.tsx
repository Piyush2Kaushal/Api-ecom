import { Link, router } from '@inertiajs/react';
import { Heart, Plus, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Stars } from '@/components/ui';
import { useShared } from '@/hooks/useShared';
import { cn, route } from '@/lib/utils';
import type { ProductCard as Card } from '@/types';
import { useCart } from './CartContext';
import { Price } from './Price';

export function ProductCard({ product, tone = 'light', className }: { product: Card; tone?: 'light' | 'dark'; className?: string }) {
    const { add } = useCart();
    const { auth, wishlistIds } = useShared();
    const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
    const href = route('product.show', product.slug);
    const wished = wishlistIds?.includes(product.id);

    const quickAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (product.has_variants) return router.visit(href);
        setState('busy');
        const ok = await add(product.id, 1);
        setState(ok ? 'done' : 'idle');
        if (ok) setTimeout(() => setState('idle'), 1600);
    };

    const toggleWish = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!auth?.user) return router.visit(route('login'));
        router.post(route('wishlist.toggle', product.id), {}, { preserveScroll: true, preserveState: true, only: ['wishlistIds', 'flash'] });
    };

    const dark = tone === 'dark';
    return (
        <article className={cn('group relative flex flex-col', className)}>
            <div
                className={cn(
                    'relative aspect-square overflow-hidden rounded-2xl transition-shadow duration-500',
                    dark ? 'bg-white/[0.04] ring-1 ring-white/10' : 'bg-porcelain group-hover:shadow-lift',
                )}
            >
                <Link href={href} className="absolute inset-0" aria-label={product.name}>
                    {product.image ? (
                        <>
                            <img src={product.image} alt={product.name} loading="lazy" decoding="async" className={cn('absolute inset-0 size-full object-contain p-[12%] transition-all duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.04]', product.image_alt && 'group-hover:opacity-0')} />
                            {product.image_alt && <img src={product.image_alt} alt="" loading="lazy" className="absolute inset-0 size-full object-contain p-[12%] opacity-0 transition-all duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.04] group-hover:opacity-100" />}
                        </>
                    ) : (
                        <span className="absolute inset-0 flex items-center justify-center text-xs text-ash">No image</span>
                    )}
                </Link>
                <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
                    {product.brand?.is_exclusive && <span className="rounded-full bg-onyx px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Exclusive</span>}
                    {product.price.has_discount && <span className="tabular rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold text-white">−{Math.round(product.price.percent_off)}%</span>}
                    {product.is_new && <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-onyx shadow-sm">New</span>}
                </div>
                {!product.in_stock && <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-xl bg-white/90 py-2 text-center text-xs font-semibold text-slate backdrop-blur">Out of stock</div>}

                <button
                    onClick={toggleWish}
                    aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                    className={cn('absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-105', wished ? 'text-violet-600' : 'text-carbon [@media(hover:hover)]:opacity-0 group-hover:opacity-100')}
                >
                    <Heart className={cn('size-4', wished && 'fill-current')} />
                </button>

                {product.in_stock && (
                    <button
                        onClick={quickAdd}
                        disabled={state === 'busy'}
                        aria-label={product.has_variants ? 'Choose options' : 'Add to basket'}
                        className={cn(
                            'absolute bottom-3 right-3 flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-lg transition-all duration-500 ease-[var(--ease-premium)]',
                            '[@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:opacity-0 group-hover:translate-y-0 group-hover:opacity-100',
                            state === 'done' ? 'bg-success text-white' : 'bg-onyx text-white hover:bg-violet-600',
                        )}
                    >
                        {state === 'busy' ? <Loader2 className="size-4 animate-spin" /> : state === 'done' ? <Check className="size-4" /> : <Plus className="size-4" />}
                        <span className="hidden sm:inline">{state === 'done' ? 'Added' : product.has_variants ? 'Options' : 'Add'}</span>
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col pt-4">
                {product.brand && <div className={cn('mb-1 text-[11px] font-semibold uppercase tracking-[0.14em]', dark ? 'text-violet-300' : 'text-violet-600')}>{product.brand.name}</div>}
                <Link href={href} className={cn('line-clamp-2 text-[14.5px] font-medium leading-snug transition-colors', dark ? 'text-white hover:text-violet-200' : 'text-onyx hover:text-violet-700')}>
                    {product.name}
                </Link>
                {product.rating && (
                    <div className="mt-1.5 flex items-center gap-1.5">
                        <Stars value={product.rating} size={12} />
                        <span className="text-[11px] text-slate">{product.rating}</span>
                    </div>
                )}
                <div className="mt-auto pt-2.5">
                    <Price price={product.price} size="sm" className={dark ? '[&>span:first-child]:text-white' : undefined} />
                </div>
            </div>
        </article>
    );
}

export function ProductGrid({ products, className }: { products: Card[]; className?: string }) {
    return (
        <div className={cn('grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4', className)}>
            {products.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    );
}
