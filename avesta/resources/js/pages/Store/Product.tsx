import { Link, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { Star as StarIcon, BadgeCheck, Check, Download, FileText, Heart, Loader2, MessageCircleQuestion, RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Breadcrumbs } from '@/components/store/Breadcrumbs';
import { useCart } from '@/components/store/CartContext';
import { Price } from '@/components/store/Price';
import { ProductCard } from '@/components/store/ProductCard';
import { SectionHeading } from '@/components/store/SectionHeading';
import { Button, Input, Modal, QuantityStepper, Stars, Textarea } from '@/components/ui';
import { useMoney } from '@/hooks/useMoney';
import { useShared } from '@/hooks/useShared';
import { cn, route } from '@/lib/utils';
import type { PriceInfo, ProductCard as Card } from '@/types';

interface Variant { id: number; value: string; sku: string | null; image: string | null; price: PriceInfo; in_stock: boolean; available: number | null }
interface Detail extends Card {
    description: string | null;
    key_features: string[];
    specs: { label: string; value: string }[];
    files: { title: string; url: string }[];
    images: { url: string; alt: string }[];
    option_name: string;
    variants: Variant[];
    available: number | null;
    low_stock: boolean;
    breadcrumbs: { name: string; slug: string }[];
}

function Gallery({ images, active, setActive, name }: { images: { url: string; alt: string }[]; active: number; setActive: (i: number) => void; name: string }) {
    const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
    const current = images[active];
    return (
        <div className="mx-auto flex w-full max-w-[640px] flex-col-reverse gap-3 md:flex-row">
            {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto scrollbar-none md:flex-col">
                    {images.map((img, i) => (
                        <button key={i} onClick={() => setActive(i)} className={cn('size-[64px] shrink-0 overflow-hidden rounded-xl bg-white p-1.5 transition', i === active ? 'ring-2 ring-violet-500 shadow-soft' : 'ring-1 ring-mist opacity-70 hover:opacity-100 hover:ring-fog')} aria-label={`Image ${i + 1}`}>
                            <img src={img.url} alt="" className="size-full object-contain mix-blend-multiply" />
                        </button>
                    ))}
                </div>
            )}
            <div
                className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-[28px] bg-[radial-gradient(70%_70%_at_50%_45%,#ffffff_0%,#f7f7f9_100%)] ring-1 ring-mist"
                onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
                onMouseLeave={() => setZoom(null)}
            >
                <AnimatePresence mode="wait">
                    {current && (
                        <motion.img
                            key={current.url}
                            src={current.url}
                            alt={current.alt || name}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: zoom ? 1.8 : 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            style={{ transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : 'center' }}
                            className="absolute inset-0 size-full object-contain p-[12%] mix-blend-multiply"
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function Product({ product, related, together, reviews, reviewStats, canReview }: { product: Detail; related: Card[]; together: Card[]; reviews: any[]; reviewStats: { average: number; count: number }; canReview: boolean }) {
    const { auth, wishlistIds, settings } = useShared();
    const { add } = useCart();
    const money = useMoney();
    const [qty, setQty] = useState(1);
    const [variantId, setVariantId] = useState<number | null>(product.variants.length === 1 ? product.variants[0].id : null);
    const [active, setActive] = useState(0);
    const [adding, setAdding] = useState<'idle' | 'busy' | 'done'>('idle');
    const [tab, setTab] = useState<'description' | 'specs' | 'downloads' | 'reviews'>('description');
    const [ask, setAsk] = useState(false);
    const buyRef = useRef<HTMLDivElement>(null);
    const [showSticky, setShowSticky] = useState(false);

    const variant = product.variants.find((v) => v.id === variantId) ?? null;
    const price = variant?.price ?? product.price;
    const inStock = variant ? variant.in_stock : product.in_stock;
    const available = variant ? variant.available : product.available;
    const needsVariant = product.variants.length > 0 && !variant;
    const wished = wishlistIds?.includes(product.id);
    const isRetail = !auth?.user || auth.user.tier === 'retailer';

    useEffect(() => {
        if (variant?.image) {
            const idx = product.images.findIndex((i) => i.url === variant.image);
            if (idx >= 0) setActive(idx);
        }
    }, [variant, product.images]);

    useEffect(() => {
        const el = buyRef.current;
        if (!el) return;
        const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const images = useMemo(() => {
        const list = [...product.images];
        product.variants.forEach((v) => v.image && !list.find((i) => i.url === v.image) && list.push({ url: v.image, alt: v.value }));
        return list;
    }, [product]);

    const addToCart = async () => {
        if (needsVariant) return;
        setAdding('busy');
        const ok = await add(product.id, qty, variantId);
        setAdding(ok ? 'done' : 'idle');
        if (ok) setTimeout(() => setAdding('idle'), 1800);
    };

    const notify = useForm({ email: '' });
    const question = useForm({ name: auth?.user?.name ?? '', email: auth?.user?.email ?? '', phone: '', message: '' });
    const review = useForm({ rating: 5, title: '', body: '' });

    const tabs = [
        { key: 'description', label: 'Overview', show: !!product.description || product.key_features.length > 0 },
        { key: 'specs', label: 'Specifications', show: product.specs.length > 0 },
        { key: 'downloads', label: 'Downloads', show: product.files.length > 0 },
        { key: 'reviews', label: `Reviews (${reviewStats.count})`, show: settings.reviews_enabled },
    ].filter((t) => t.show) as { key: typeof tab; label: string }[];

    return (
        <>
            <div className="container-x pt-6 md:pt-8">
                <Breadcrumbs items={[...product.breadcrumbs.map((b) => ({ label: b.name, href: route('category.show', b.slug) })), { label: product.name }]} />
            </div>

            <section className="container-x grid gap-8 py-6 lg:grid-cols-12 lg:gap-12 lg:py-8">
                <div className="lg:col-span-6">
                    <div className="lg:sticky lg:top-28">
                        <Gallery images={images} active={active} setActive={setActive} name={product.name} />
                    </div>
                </div>

                <div className="lg:col-span-6 xl:pr-6">
                    <div className="flex flex-wrap items-center gap-2">
                        {product.brand && (
                            <Link href={route('brand.show', product.brand.slug)} className="text-[12px] font-semibold uppercase tracking-[0.16em] text-violet-600 hover:text-violet-800">
                                {product.brand.name}
                            </Link>
                        )}
                        {product.brand?.is_exclusive && <span className="rounded-full bg-onyx px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Exclusive</span>}
                        {product.is_new && <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700">New</span>}
                    </div>
                    <h1 className="mt-2.5 font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] md:text-[32px]">{product.name}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate">
                        <span className="rounded-md bg-porcelain px-2 py-0.5 ring-1 ring-mist">SKU: <span className="font-medium text-carbon">{variant?.sku || product.sku}</span></span>
                        {reviewStats.count > 0 && (
                            <button onClick={() => setTab('reviews')} className="flex items-center gap-1.5">
                                <Stars value={reviewStats.average} /> {reviewStats.average} ({reviewStats.count})
                            </button>
                        )}
                    </div>

                    <div className="relative mt-6 overflow-hidden rounded-[24px] bg-white p-5 shadow-[0_1px_2px_rgb(10_10_15/0.04),0_12px_40px_-20px_rgb(36_16_79/0.18)] ring-1 ring-mist md:p-6">
                        <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-violet-100/50 blur-3xl" />
                        <Price price={price} vatMode={product.vat_mode} size="xl" showVat showSaving />
                        <div className="mt-3 flex items-center gap-2 text-[13px]">
                            {inStock ? (
                                <>
                                    <span className="size-2 rounded-full bg-success" />
                                    <span className="font-medium text-success">In stock</span>
                                    {settings.show_stock_qty && available !== null && available <= 10 && <span className="text-slate">— only {available} left</span>}
                                </>
                            ) : (
                                <>
                                    <span className="size-2 rounded-full bg-danger" />
                                    <span className="font-medium text-danger">Out of stock</span>
                                </>
                            )}
                        </div>

                        {product.variants.length > 0 && (
                            <div className="mt-6">
                                <div className="mb-2.5 text-[13px] font-medium">
                                    {product.option_name}: <span className="text-slate">{variant?.value ?? 'Choose one'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setVariantId(v.id)}
                                            disabled={!v.in_stock}
                                            className={cn(
                                                'rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through',
                                                variantId === v.id ? 'border-onyx bg-onyx text-white' : 'border-mist hover:border-onyx',
                                            )}
                                        >
                                            {v.value}
                                            {v.price.price !== product.price.price && <span className="ml-1.5 text-xs opacity-60">{money(v.price.price)}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={buyRef} className="mt-6">
                            {inStock ? (
                                <div className="flex gap-3">
                                    <QuantityStepper value={qty} onChange={setQty} max={available} />
                                    <Button size="md" className="h-11 flex-1" onClick={addToCart} loading={adding === 'busy'} disabled={needsVariant} variant={adding === 'done' ? 'dark' : 'primary'}>
                                        {adding === 'done' ? (
                                            <>
                                                <Check className="size-4" /> Added
                                            </>
                                        ) : needsVariant ? (
                                            `Choose ${product.option_name.toLowerCase()}`
                                        ) : (
                                            <>
                                                <ShoppingBag className="size-4" /> Add to basket
                                            </>
                                        )}
                                    </Button>
                                    <button
                                        onClick={() => (auth?.user ? router.post(route('wishlist.toggle', product.id), {}, { preserveScroll: true, only: ['wishlistIds', 'flash'] }) : router.visit(route('login')))}
                                        className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl border transition', wished ? 'border-violet-200 bg-violet-50 text-violet-600' : 'border-mist hover:border-onyx')}
                                        aria-label="Wishlist"
                                    >
                                        <Heart className={cn('size-5', wished && 'fill-current')} />
                                    </button>
                                </div>
                            ) : (
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        notify.post(route('product.notify', product.id), { preserveScroll: true, onSuccess: () => notify.reset() });
                                    }}
                                    className="rounded-2xl bg-porcelain p-4"
                                >
                                    <div className="mb-3 text-sm font-medium">Email me when it is back in stock</div>
                                    <div className="flex gap-2">
                                        <Input type="email" required placeholder="you@company.co.uk" value={notify.data.email} onChange={(e) => notify.setData('email', e.target.value)} wrapperClassName="flex-1" error={notify.errors.email} />
                                        <Button variant="dark" loading={notify.processing}>Notify me</Button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {isRetail && (
                            <Link href={auth?.user ? route('account.trade') : route('register', { type: 'trader' })} className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-gold-soft px-4 py-3 text-[13px] transition hover:brightness-[0.98]">
                                <span><strong className="font-semibold">Installer or reseller?</strong> <span className="text-carbon">Unlock trade pricing.</span></span>
                                <span className="font-semibold text-[#8a6a22]">Apply →</span>
                            </Link>
                        )}
                    </div>

                    <ul className="mt-5 grid grid-cols-2 gap-2.5 text-[12.5px]">
                        {[
                            { icon: Truck, text: settings.free_shipping_active ? `Free UK delivery over ${money(settings.free_shipping_threshold)}` : 'Fast UK delivery' },
                            { icon: ShieldCheck, text: 'Full manufacturer warranty' },
                            { icon: RotateCcw, text: '30-day returns on unused items' },
                            { icon: BadgeCheck, text: 'Secure checkout with Stripe' },
                        ].map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-2.5 rounded-2xl bg-porcelain/70 px-3 py-2.5 font-medium text-carbon ring-1 ring-mist/70">
                                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-mist">
                                    <Icon className="size-4" strokeWidth={1.75} />
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>

                    {product.key_features.length > 0 && (
                        <div className="mt-8 border-t border-mist pt-6">
                            <div className="mb-3 text-[13px] font-semibold uppercase tracking-[0.1em]">Key features</div>
                            <ul className="space-y-2">
                                {product.key_features.slice(0, 6).map((f) => (
                                    <li key={f} className="flex gap-2.5 text-[14px] text-carbon">
                                        <Check className="mt-0.5 size-4 shrink-0 text-violet-600" /> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button onClick={() => setAsk(true)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">
                        <MessageCircleQuestion className="size-4" /> Ask a question about this product
                    </button>
                </div>
            </section>

            {tabs.length > 0 && (
                <section className="border-t border-mist">
                    <div className="container-x">
                        <div className="-mx-4 flex gap-1 overflow-x-auto px-4 scrollbar-none">
                            {tabs.map((t) => (
                                <button key={t.key} onClick={() => setTab(t.key)} className={cn('relative shrink-0 px-4 py-5 text-[14px] font-semibold transition', tab === t.key ? 'text-onyx' : 'text-slate hover:text-onyx')}>
                                    {t.label}
                                    {tab === t.key && <motion.span layoutId="tab-underline" className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-violet-600" />}
                                </button>
                            ))}
                        </div>
                        <div className="max-w-4xl py-10">
                            {tab === 'description' && (
                                <div>
                                    {product.description && <div className="prose-avesta" dangerouslySetInnerHTML={{ __html: product.description }} />}
                                    {product.key_features.length > 6 && (
                                        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                                            {product.key_features.map((f) => (
                                                <li key={f} className="flex gap-2.5 text-[14px]"><Check className="mt-0.5 size-4 shrink-0 text-violet-600" /> {f}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                            {tab === 'specs' && (
                                <dl className="overflow-hidden rounded-2xl border border-mist">
                                    {product.specs.map((s, i) => (
                                        <div key={i} className={cn('grid grid-cols-[40%_1fr] gap-4 px-5 py-3.5 text-[14px]', i % 2 === 0 && 'bg-porcelain/70')}>
                                            <dt className="text-slate">{s.label}</dt>
                                            <dd className="font-medium">{s.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            )}
                            {tab === 'downloads' && (
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {product.files.map((f) => (
                                        <li key={f.url}>
                                            <a href={f.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-mist p-4 transition hover:border-violet-300 hover:bg-violet-50/40">
                                                <FileText className="size-5 text-violet-600" />
                                                <span className="flex-1 text-sm font-medium">{f.title}</span>
                                                <Download className="size-4 text-slate" />
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {tab === 'reviews' && (
                                <div className="grid gap-10 md:grid-cols-[240px_1fr]">
                                    <div>
                                        <div className="font-display text-5xl font-semibold">{reviewStats.count ? reviewStats.average : '—'}</div>
                                        <Stars value={reviewStats.average} size={18} className="mt-2" />
                                        <div className="mt-1 text-sm text-slate">{reviewStats.count} verified review{reviewStats.count === 1 ? '' : 's'}</div>
                                        <p className="mt-4 text-xs text-slate">Only verified buyers can leave a review.</p>
                                    </div>
                                    <div className="space-y-6">
                                        {canReview && (
                                            <form
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    review.post(route('product.review', product.id), { preserveScroll: true, onSuccess: () => review.reset() });
                                                }}
                                                className="space-y-3 rounded-2xl bg-porcelain p-5"
                                            >
                                                <div className="text-sm font-semibold">Write a review</div>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((n) => (
                                                        <button type="button" key={n} onClick={() => review.setData('rating', n)} aria-label={`${n} stars`}>
                                                            <StarIcon className={cn('size-6 transition', n <= review.data.rating ? 'fill-gold text-gold' : 'fill-mist text-mist')} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <Input placeholder="Title" value={review.data.title} onChange={(e) => review.setData('title', e.target.value)} />
                                                <Textarea placeholder="What did you think?" value={review.data.body} onChange={(e) => review.setData('body', e.target.value)} />
                                                <Button variant="dark" size="sm" loading={review.processing}>Submit review</Button>
                                            </form>
                                        )}
                                        {reviews.length === 0 && <p className="text-sm text-slate">No reviews yet.</p>}
                                        {reviews.map((r) => (
                                            <article key={r.id} className="border-b border-mist pb-6">
                                                <div className="flex items-center justify-between">
                                                    <Stars value={r.rating} />
                                                    <span className="text-xs text-slate">{r.date}</span>
                                                </div>
                                                {r.title && <h4 className="mt-2 font-semibold">{r.title}</h4>}
                                                {r.body && <p className="mt-1.5 text-[14px] leading-relaxed text-carbon">{r.body}</p>}
                                                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate">
                                                    {r.author} · <BadgeCheck className="size-3.5 text-success" /> Verified buyer
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {together.length > 0 && (
                <section className="bg-porcelain py-14 md:py-20">
                    <div className="container-x">
                        <SectionHeading title="Frequently bought together" />
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
                            {together.map((p) => <ProductCard key={p.id} product={p} variant="premium" />)}
                        </div>
                    </div>
                </section>
            )}

            {related.length > 0 && (
                <section className="py-12 md:py-16">
                    <div className="container-x">
                        <SectionHeading eyebrow="More to explore" title="You may also like" />
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 lg:gap-5">
                            {related.slice(0, 10).map((p) => <ProductCard key={p.id} product={p} variant="premium" />)}
                        </div>
                    </div>
                </section>
            )}

            <AnimatePresence>
                {showSticky && inStock && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="fixed inset-x-0 bottom-0 z-40 border-t border-mist bg-white/95 backdrop-blur-xl">
                        <div className="container-x flex items-center gap-4 py-3">
                            {images[0] && <img src={images[0].url} alt="" className="hidden size-12 rounded-xl bg-porcelain object-contain p-1 sm:block" />}
                            <div className="min-w-0 flex-1">
                                <div className="hidden truncate text-sm font-medium sm:block">{product.name}</div>
                                <div className="tabular text-[15px] font-semibold">{money(price.price)}</div>
                            </div>
                            <Button onClick={addToCart} loading={adding === 'busy'} disabled={needsVariant}>
                                {adding === 'busy' ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
                                {needsVariant ? `Choose ${product.option_name.toLowerCase()}` : 'Add to basket'}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Modal
                open={ask}
                onClose={() => setAsk(false)}
                title="Ask about this product"
                description={product.name}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setAsk(false)}>Cancel</Button>
                        <Button
                            loading={question.processing}
                            onClick={() =>
                                question.post(route('product.question', product.id), {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        setAsk(false);
                                        question.reset('message');
                                    },
                                })
                            }
                        >
                            Send question
                        </Button>
                    </>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Name" required value={question.data.name} onChange={(e) => question.setData('name', e.target.value)} error={question.errors.name} />
                    <Input label="Email" type="email" required value={question.data.email} onChange={(e) => question.setData('email', e.target.value)} error={question.errors.email} />
                    <Input label="Phone (optional)" value={question.data.phone} onChange={(e) => question.setData('phone', e.target.value)} wrapperClassName="sm:col-span-2" />
                    <Textarea label="Your question" required value={question.data.message} onChange={(e) => question.setData('message', e.target.value)} error={question.errors.message} wrapperClassName="sm:col-span-2" />
                </div>
            </Modal>
        </>
    );
}
