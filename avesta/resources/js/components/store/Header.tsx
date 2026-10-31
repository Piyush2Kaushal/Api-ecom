import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Heart, Mail, Menu, Phone, Search, ShoppingBag, User, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Drawer } from '@/components/ui';
import { useMoney } from '@/hooks/useMoney';
import { useShared } from '@/hooks/useShared';
import { api, cn, route } from '@/lib/utils';
import type { CategoryNode, ProductCard } from '@/types';
import { useCart } from './CartContext';
import { Logo } from './Logo';

function AnnouncementBar() {
    const { settings, currency } = useShared();
    const [hidden, setHidden] = useState(false);
    useEffect(() => setHidden(sessionStorage.getItem('ann_closed') === settings.announcement_text), [settings.announcement_text]);
    const showAnn = settings.announcement_enabled && settings.announcement_text && !hidden;
    const currencies = settings.currencies ?? [];

    return (
        <div className="relative z-50 bg-onyx text-white">
            <div className="container-x flex h-9 items-center justify-between gap-4 text-[12px]">
                <div className="hidden items-center gap-5 text-white/60 lg:flex">
                    {settings.company_email && (
                        <a href={`mailto:${settings.company_email}`} className="flex items-center gap-1.5 transition hover:text-white">
                            <Mail className="size-3.5" />
                            {settings.company_email}
                        </a>
                    )}
                    {settings.company_phone && (
                        <a href={`tel:${settings.company_phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 transition hover:text-white">
                            <Phone className="size-3.5" />
                            {settings.company_phone}
                        </a>
                    )}
                </div>
                <div className="flex-1 truncate text-center font-medium tracking-wide lg:flex-none">
                    {showAnn &&
                        (settings.announcement_link ? (
                            <Link href={settings.announcement_link} className="text-white/90 transition hover:text-white">
                                {settings.announcement_text}
                            </Link>
                        ) : (
                            <span className="text-white/90">{settings.announcement_text}</span>
                        ))}
                </div>
                <div className="flex items-center gap-3">
                    {currencies.length > 1 && (
                        <select
                            value={currency}
                            onChange={(e) => router.post(route('currency'), { currency: e.target.value }, { preserveScroll: true })}
                            className="rounded-md border-0 bg-transparent py-0 pr-6 pl-1 text-[12px] text-white/70 focus:ring-0"
                            aria-label="Currency"
                        >
                            {currencies.map((c) => (
                                <option key={c.code} value={c.code} className="text-onyx">
                                    {c.symbol} {c.code}
                                </option>
                            ))}
                        </select>
                    )}
                    {showAnn && (
                        <button
                            onClick={() => {
                                sessionStorage.setItem('ann_closed', settings.announcement_text);
                                setHidden(true);
                            }}
                            className="text-white/40 hover:text-white"
                            aria-label="Dismiss announcement"
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function MegaPanel({ cat, onClose }: { cat: CategoryNode; onClose: () => void }) {
    // No grandchildren anywhere → show compact tiles instead of empty columns.
    const flat = cat.children.every((c) => c.children.length === 0);
    const renderDeep = (nodes: CategoryNode[], level: number) =>
        nodes.length > 0 && (
            <ul className={cn('space-y-1.5', level > 3 && 'mt-1.5 border-l border-mist pl-3')}>
                {nodes.map((n) => (
                    <li key={n.id}>
                        <Link href={route('category.show', n.slug)} onClick={onClose} className={cn('block text-[13.5px] transition hover:text-violet-700', level > 3 ? 'text-slate' : 'text-carbon')}>
                            {n.name}
                        </Link>
                        {renderDeep(n.children, level + 1)}
                    </li>
                ))}
            </ul>
        );

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-full border-t border-mist bg-white shadow-[0_30px_60px_-30px_rgb(10_10_15/0.25)]"
        >
            <div className={cn('container-x grid grid-cols-12', flat ? 'gap-8 py-7' : 'gap-10 py-10')}>
                {flat ? (
                    <div className="col-span-9">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="eyebrow">Browse {cat.name}</div>
                            <span className="tabular text-[12px] text-slate">{cat.children.length} categories</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-3">
                            {cat.children.map((c) => (
                                <Link
                                    key={c.id}
                                    href={route('category.show', c.slug)}
                                    onClick={onClose}
                                    className="group flex items-center gap-3.5 rounded-2xl bg-white p-2.5 pr-4 ring-1 ring-mist transition-all duration-300 hover:-translate-y-0.5 hover:bg-violet-50/40 hover:shadow-soft hover:ring-violet-200"
                                >
                                    <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-white to-porcelain ring-1 ring-mist">
                                        {c.image_url ? (
                                            <img src={c.image_url} alt="" className="size-11 object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <span className="font-display text-lg font-semibold text-violet-600">{c.name.charAt(0)}</span>
                                        )}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-[14px] font-semibold leading-snug text-onyx transition-colors group-hover:text-violet-700">{c.name}</span>
                                        <span className="mt-0.5 block text-[12px] text-slate">Shop now</span>
                                    </span>
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-porcelain text-slate transition-all duration-300 group-hover:bg-violet-600 group-hover:text-white">
                                        <ArrowRight className="size-3.5" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                <div className="col-span-9 grid grid-cols-3 gap-x-10 gap-y-8 xl:grid-cols-4">
                    {cat.children.map((c) => (
                        <div key={c.id}>
                            <Link href={route('category.show', c.slug)} onClick={onClose} className="group mb-3 flex items-center gap-1 text-[13px] font-semibold uppercase tracking-[0.08em] text-onyx">
                                {c.name}
                                <ChevronRight className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                            </Link>
                            {renderDeep(c.children, 3)}
                        </div>
                    ))}
                </div>
                )}
                <Link href={route('category.show', cat.slug)} onClick={onClose} className="group relative col-span-3 flex flex-col overflow-hidden rounded-3xl bg-noir p-6 text-white ring-1 ring-white/5">
                    <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-violet-500/30 blur-3xl transition-opacity duration-500 group-hover:opacity-80" />
                    <div className="eyebrow relative text-violet-300">Shop all</div>
                    <div className="relative mt-2 font-display text-2xl font-semibold">{cat.name}</div>
                    {cat.image_url && <img src={cat.image_url} alt="" className={cn('relative mx-auto my-3 object-contain drop-shadow-[0_12px_24px_rgb(0_0_0/0.45)] transition duration-700 group-hover:scale-105', flat ? 'h-24' : 'h-36')} />}
                    <div className="relative mt-auto inline-flex w-fit items-center gap-2 rounded-full bg-white/10 py-1.5 pl-4 pr-1.5 text-sm font-semibold ring-1 ring-white/15 backdrop-blur transition group-hover:bg-white group-hover:text-onyx">
                        Explore
                        <span className="flex size-7 items-center justify-center rounded-full bg-violet-600 text-white">
                            <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                        </span>
                    </div>
                </Link>
            </div>
        </motion.div>
    );
}

function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
    const money = useMoney();
    const [q, setQ] = useState('');
    const [res, setRes] = useState<{ products: ProductCard[]; categories: { name: string; slug: string }[]; brands: { name: string; slug: string }[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) setTimeout(() => input.current?.focus(), 80);
    }, [open]);
    useEffect(() => {
        if (q.trim().length < 2) return setRes(null);
        setLoading(true);
        const t = setTimeout(() => {
            api(route('search.suggest', { q }))
                .then(setRes)
                .finally(() => setLoading(false));
        }, 220);
        return () => clearTimeout(t);
    }, [q]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!q.trim()) return;
        onClose();
        router.get(route('shop'), { q });
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div className="fixed inset-0 z-[60] bg-onyx/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <motion.div
                        className="fixed inset-x-0 top-0 z-[61] bg-white shadow-2xl"
                        initial={{ y: '-100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="container-x py-5 md:py-8">
                            <form onSubmit={submit} className="flex items-center gap-3 border-b-2 border-onyx pb-3">
                                <Search className="size-6 text-slate" />
                                <input
                                    ref={input}
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search cameras, kits, SKUs…"
                                    className="flex-1 border-0 bg-transparent p-0 font-display text-xl font-medium placeholder:text-ash focus:outline-none focus:ring-0 md:text-3xl"
                                    onKeyDown={(e) => e.key === 'Escape' && onClose()}
                                />
                                <button type="button" onClick={onClose} className="rounded-full p-2 text-slate hover:bg-porcelain hover:text-onyx" aria-label="Close search">
                                    <X className="size-6" />
                                </button>
                            </form>
                            <div className="max-h-[65vh] overflow-y-auto pt-6 scrollbar-thin">
                                {!res && !loading && (
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="mr-1 text-slate">Popular:</span>
                                        {['Tenvo', 'ColorVu', '4K kit', 'NVR', 'Ajax hub', 'PoE switch'].map((s) => (
                                            <button key={s} onClick={() => setQ(s)} className="rounded-full border border-mist px-3.5 py-1.5 transition hover:border-onyx">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {loading && <div className="text-sm text-slate">Searching…</div>}
                                {res && !loading && (
                                    <div className="grid gap-8 md:grid-cols-12">
                                        <div className="md:col-span-8">
                                            <div className="eyebrow mb-3 text-slate">Products</div>
                                            {res.products.length === 0 && <p className="text-sm text-slate">No products match “{q}”.</p>}
                                            <ul className="grid gap-2 sm:grid-cols-2">
                                                {res.products.map((p) => (
                                                    <li key={p.id}>
                                                        <Link href={route('product.show', p.slug)} onClick={onClose} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-porcelain">
                                                            <span className="size-14 shrink-0 rounded-xl bg-porcelain p-1.5">{p.image && <img src={p.image} alt="" className="size-full object-contain" />}</span>
                                                            <span className="min-w-0">
                                                                <span className="line-clamp-1 text-sm font-medium">{p.name}</span>
                                                                <span className="tabular text-sm text-slate">{money(p.price.price)}</span>
                                                            </span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                            {res.products.length > 0 && (
                                                <button onClick={submit as any} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700">
                                                    See all results <ArrowRight className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="space-y-6 md:col-span-4">
                                            {res.categories.length > 0 && (
                                                <div>
                                                    <div className="eyebrow mb-3 text-slate">Categories</div>
                                                    {res.categories.map((c) => (
                                                        <Link key={c.slug} href={route('category.show', c.slug)} onClick={onClose} className="block py-1.5 text-sm hover:text-violet-700">
                                                            {c.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                            {res.brands.length > 0 && (
                                                <div>
                                                    <div className="eyebrow mb-3 text-slate">Brands</div>
                                                    {res.brands.map((b) => (
                                                        <Link key={b.slug} href={route('brand.show', b.slug)} onClick={onClose} className="block py-1.5 text-sm hover:text-violet-700">
                                                            {b.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { nav, auth, settings } = useShared();
    const [stack, setStack] = useState<CategoryNode[]>([]);
    useEffect(() => {
        if (!open) setTimeout(() => setStack([]), 300);
    }, [open]);
    const current = stack[stack.length - 1];
    const items = current ? current.children : nav?.categories ?? [];

    return (
        <Drawer open={open} onClose={onClose} side="left" width="max-w-[380px]" title={<Logo withTagline={false} />}>
            <div className="flex min-h-full flex-col">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={current?.id ?? 'root'} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} transition={{ duration: 0.25 }} className="px-3 py-3">
                        {current && (
                            <>
                                <button onClick={() => setStack((s) => s.slice(0, -1))} className="mb-1 flex items-center gap-1 px-3 py-2 text-sm text-slate">
                                    <ChevronLeft className="size-4" /> Back
                                </button>
                                <Link href={route('category.show', current.slug)} onClick={onClose} className="mb-2 flex items-center justify-between rounded-2xl bg-violet-50 px-4 py-3.5 text-[15px] font-semibold text-violet-800">
                                    Shop all {current.name} <ArrowRight className="size-4" />
                                </Link>
                            </>
                        )}
                        {items.map((c) =>
                            c.children.length ? (
                                <button key={c.id} onClick={() => setStack((s) => [...s, c])} className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-left text-[15px] font-medium hover:bg-porcelain">
                                    {c.name}
                                    <ChevronRight className="size-4 text-ash" />
                                </button>
                            ) : (
                                <Link key={c.id} href={route('category.show', c.slug)} onClick={onClose} className="block rounded-xl px-3 py-3.5 text-[15px] font-medium hover:bg-porcelain">
                                    {c.name}
                                </Link>
                            ),
                        )}
                        {!current && (
                            <div className="mt-3 border-t border-mist pt-3">
                                <Link href={route('brands')} onClick={onClose} className="block rounded-xl px-3 py-3 text-[15px] hover:bg-porcelain">Brands</Link>
                                {nav?.header_links.map((l) => (
                                    <Link key={l.url} href={l.url} onClick={onClose} className="block rounded-xl px-3 py-3 text-[15px] hover:bg-porcelain">
                                        {l.label}
                                    </Link>
                                ))}
                                <Link href={route('contact')} onClick={onClose} className="block rounded-xl px-3 py-3 text-[15px] hover:bg-porcelain">Contact</Link>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
                <div className="mt-auto space-y-3 border-t border-mist p-5">
                    {auth?.user ? (
                        <Link href={route('account.dashboard')} onClick={onClose} className="flex items-center gap-3 rounded-2xl bg-porcelain p-3.5">
                            <span className="flex size-10 items-center justify-center rounded-full bg-onyx text-sm font-semibold text-white">{auth.user.first_name[0]}</span>
                            <span>
                                <span className="block text-sm font-semibold">{auth.user.name}</span>
                                <span className="text-xs capitalize text-slate">{auth.user.tier} account</span>
                            </span>
                        </Link>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            <Link href={route('login')} onClick={onClose} className="rounded-xl border border-mist py-3 text-center text-sm font-semibold">Sign in</Link>
                            <Link href={route('register')} onClick={onClose} className="rounded-xl bg-onyx py-3 text-center text-sm font-semibold text-white">Register</Link>
                        </div>
                    )}
                    <div className="space-y-1 text-[13px] text-slate">
                        <a href={`tel:${settings.company_phone}`} className="flex items-center gap-2"><Phone className="size-3.5" /> {settings.company_phone}</a>
                        <a href={`mailto:${settings.company_email}`} className="flex items-center gap-2"><Mail className="size-3.5" /> {settings.company_email}</a>
                    </div>
                </div>
            </div>
        </Drawer>
    );
}

export function Header() {
    const { nav, auth, cartCount } = useShared();
    const { setOpen } = useCart();
    const { url } = usePage();
    const [mega, setMega] = useState<number | null>(null);
    const [search, setSearch] = useState(false);
    const [mobile, setMobile] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    useEffect(() => setMega(null), [url]);

    const enter = (id: number) => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setMega(id), 90);
    };
    const leave = () => {
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setMega(null), 140);
    };
    const active = nav?.categories.find((c) => c.id === mega);

    return (
        <>
            <AnnouncementBar />
            <header className={cn('sticky top-0 z-40 transition-all duration-300', scrolled || mega ? 'glass border-b border-mist/80 shadow-[0_1px_0_rgb(10_10_15/0.02)]' : 'border-b border-transparent bg-white')} onMouseLeave={leave}>
                <div className="container-x flex h-16 items-center gap-3 sm:h-[72px] sm:gap-6">
                    <button onClick={() => setMobile(true)} className="-ml-2 rounded-xl p-2 xl:hidden" aria-label="Open menu">
                        <Menu className="size-6" />
                    </button>
                    <Logo className="shrink-0" />
                    <nav className="mx-auto hidden h-full items-center xl:flex" aria-label="Main">
                        {nav?.categories.map((c) => (
                            <div key={c.id} className="h-full" onMouseEnter={() => (c.children.length ? enter(c.id) : setMega(null))}>
                                <Link
                                    href={route('category.show', c.slug)}
                                    className={cn('relative flex h-full items-center gap-1 whitespace-nowrap px-2.5 text-[13.5px] font-medium tracking-[-0.005em] transition-colors 2xl:px-3.5', mega === c.id ? 'text-violet-700' : 'text-carbon hover:text-onyx')}
                                >
                                    {c.name}
                                    {c.children.length > 0 && <ChevronDown className={cn('size-3.5 opacity-50 transition', mega === c.id && 'rotate-180')} />}
                                    <span className={cn('absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-violet-600 transition-transform duration-300', mega === c.id ? 'scale-x-100' : 'scale-x-0')} />
                                </Link>
                            </div>
                        ))}
                        {nav?.header_links.map((l) => (
                            <Link key={l.url} href={l.url} onMouseEnter={() => setMega(null)} className="hidden h-full items-center whitespace-nowrap px-2.5 text-[13.5px] font-medium text-carbon transition hover:text-onyx 2xl:flex 2xl:px-3.5">
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="ml-auto flex items-center gap-0.5 xl:ml-0">
                        <IconBtn label="Search" onClick={() => setSearch(true)}>
                            <Search className="size-[20px]" />
                        </IconBtn>
                        <IconBtn label="Wishlist" href={auth?.user ? route('account.wishlist') : route('login')} className="hidden sm:flex">
                            <Heart className="size-[20px]" />
                        </IconBtn>
                        <IconBtn label="Account" href={auth?.user ? route('account.dashboard') : route('login')}>
                            <User className="size-[20px]" />
                            {auth?.user && auth.user.tier !== 'retailer' && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-gold ring-2 ring-white" />}
                        </IconBtn>
                        <IconBtn label="Basket" onClick={() => setOpen(true)}>
                            <ShoppingBag className="size-[20px]" />
                            {!!cartCount && (
                                <motion.span key={cartCount} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="tabular absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white">
                                    {cartCount}
                                </motion.span>
                            )}
                        </IconBtn>
                    </div>
                </div>
                <AnimatePresence>{active && <MegaPanel key={active.id} cat={active} onClose={() => setMega(null)} />}</AnimatePresence>
            </header>
            <SearchPanel open={search} onClose={() => setSearch(false)} />
            <MobileMenu open={mobile} onClose={() => setMobile(false)} />
        </>
    );
}

function IconBtn({ children, label, href, onClick, className }: { children: React.ReactNode; label: string; href?: string; onClick?: () => void; className?: string }) {
    const cls = cn('relative flex size-10 sm:size-11 items-center justify-center rounded-full text-carbon transition hover:bg-porcelain hover:text-onyx', className);
    return href ? (
        <Link href={href} className={cls} aria-label={label}>
            {children}
        </Link>
    ) : (
        <button onClick={onClick} className={cls} aria-label={label}>
            {children}
        </button>
    );
}
