import { Link, router } from '@inertiajs/react';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from '@/components/store/Breadcrumbs';
import { ProductGrid } from '@/components/store/ProductCard';
import { Button, Checkbox, Drawer, EmptyState, Pagination } from '@/components/ui';
import { useMoney } from '@/hooks/useMoney';
import { cn, route } from '@/lib/utils';
import type { ProductCard } from '@/types';
import { PackageSearch } from 'lucide-react';

interface Props {
    context: {
        title: string;
        subtitle?: string | null;
        description?: string | null;
        type: 'shop' | 'category' | 'brand';
        banner?: string | null;
        logo?: string | null;
        exclusive?: boolean;
        breadcrumbs?: { name: string; slug: string }[];
        children?: { name: string; slug: string; image_url: string | null }[];
    };
    products: ProductCard[];
    pagination: { current: number; last: number; total: number; from: number | null; to: number | null; links: any[] };
    facets: { brands: { name: string; slug: string; count: number }[]; specs: Record<string, { value: string; count: number }[]>; price: { min: number; max: number } };
    filters: { q?: string; brand: string[]; spec: Record<string, string[]>; min?: string; max?: string; in_stock: boolean; sale: boolean; sort: string };
}

const sorts = [
    { value: 'featured', label: 'Featured' },
    { value: 'bestselling', label: 'Best selling' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: low to high' },
    { value: 'price_desc', label: 'Price: high to low' },
    { value: 'name', label: 'Name A–Z' },
];

function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-mist py-5">
            <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left text-[12px] font-semibold uppercase tracking-[0.14em]">
                {title}
                <ChevronDown className={cn('size-4 text-slate transition', open && 'rotate-180')} />
            </button>
            {open && <div className="mt-4 space-y-3">{children}</div>}
        </div>
    );
}

export default function Listing({ context, products, pagination, facets, filters }: Props) {
    const money = useMoney();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [price, setPrice] = useState({ min: filters.min ?? '', max: filters.max ?? '' });
    useEffect(() => setPrice({ min: filters.min ?? '', max: filters.max ?? '' }), [filters.min, filters.max]);

    const apply = (patch: Partial<Props['filters']>) => {
        const next: any = { ...filters, ...patch };
        const query: Record<string, any> = {};
        if (next.q) query.q = next.q;
        if (next.brand?.length) query.brand = next.brand;
        if (next.min) query.min = next.min;
        if (next.max) query.max = next.max;
        if (next.in_stock) query.in_stock = 1;
        if (next.sale) query.sale = 1;
        if (next.sort && next.sort !== 'featured') query.sort = next.sort;
        const spec = Object.fromEntries(Object.entries(next.spec ?? {}).filter(([, v]) => (v as string[]).length));
        if (Object.keys(spec).length) query.spec = spec;
        router.get(window.location.pathname, query, { preserveState: true, preserveScroll: true, replace: true, only: ['products', 'pagination', 'filters'] });
    };

    const toggleIn = (list: string[] = [], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
    const spec = (filters.spec ?? {}) as Record<string, string[]>;

    const chips = useMemo(() => {
        const c: { label: string; clear: () => void }[] = [];
        filters.brand?.forEach((b) => c.push({ label: facets.brands.find((x) => x.slug === b)?.name ?? b, clear: () => apply({ brand: filters.brand.filter((x) => x !== b) }) }));
        Object.entries(spec).forEach(([label, vals]) => vals.forEach((v) => c.push({ label: `${label}: ${v}`, clear: () => apply({ spec: { ...spec, [label]: vals.filter((x) => x !== v) } }) })));
        if (filters.min || filters.max) c.push({ label: `${filters.min ? money(filters.min) : 'Any'} – ${filters.max ? money(filters.max) : 'Any'}`, clear: () => apply({ min: '', max: '' }) });
        if (filters.in_stock) c.push({ label: 'In stock', clear: () => apply({ in_stock: false }) });
        if (filters.sale) c.push({ label: 'On sale', clear: () => apply({ sale: false }) });
        return c;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, facets]);

    const filterPanel = (
        <div>
            <FilterGroup title="Availability">
                <Checkbox checked={filters.in_stock} onChange={(v) => apply({ in_stock: v })} label="In stock only" />
                <Checkbox checked={filters.sale} onChange={(v) => apply({ sale: v })} label="On sale" />
            </FilterGroup>
            {facets.brands.length > 1 && (
                <FilterGroup title="Brand">
                    {facets.brands.map((b) => (
                        <Checkbox
                            key={b.slug}
                            checked={filters.brand?.includes(b.slug)}
                            onChange={() => apply({ brand: toggleIn(filters.brand, b.slug) })}
                            label={
                                <span className="flex w-full justify-between gap-3">
                                    {b.name} <span className="tabular text-xs text-ash">{b.count}</span>
                                </span>
                            }
                        />
                    ))}
                </FilterGroup>
            )}
            {facets.price.max > 0 && (
                <FilterGroup title="Price">
                    <form
                        className="flex items-center gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            apply({ min: price.min, max: price.max });
                        }}
                    >
                        <input type="number" min={0} placeholder={String(facets.price.min)} value={price.min} onChange={(e) => setPrice({ ...price, min: e.target.value })} className="h-10 w-full rounded-xl border border-mist px-3 text-sm focus:border-violet-500 focus:outline-none" aria-label="Minimum price" />
                        <span className="text-slate">–</span>
                        <input type="number" min={0} placeholder={String(facets.price.max)} value={price.max} onChange={(e) => setPrice({ ...price, max: e.target.value })} className="h-10 w-full rounded-xl border border-mist px-3 text-sm focus:border-violet-500 focus:outline-none" aria-label="Maximum price" />
                        <button className="h-10 shrink-0 rounded-xl bg-onyx px-3 text-xs font-semibold text-white">Go</button>
                    </form>
                </FilterGroup>
            )}
            {Object.entries(facets.specs).map(([label, values]) => (
                <FilterGroup key={label} title={label} defaultOpen={values.length <= 8}>
                    {values.map((v) => (
                        <Checkbox
                            key={v.value}
                            checked={spec[label]?.includes(v.value) ?? false}
                            onChange={() => apply({ spec: { ...spec, [label]: toggleIn(spec[label], v.value) } })}
                            label={
                                <span className="flex w-full justify-between gap-3">
                                    {v.value} <span className="tabular text-xs text-ash">{v.count}</span>
                                </span>
                            }
                        />
                    ))}
                </FilterGroup>
            ))}
        </div>
    );

    const dark = context.type === 'brand' && context.exclusive;
    const crumbs =
        context.type === 'category'
            ? (context.breadcrumbs ?? []).map((b) => ({ label: b.name, href: route('category.show', b.slug) }))
            : context.type === 'brand'
              ? [{ label: 'Brands', href: route('brands') }, { label: context.title }]
              : [{ label: context.title }];

    return (
        <>
            <section className={cn('relative overflow-hidden', dark ? 'bg-noir text-white' : 'border-b border-mist bg-white')}>
                {dark && context.banner && <img src={context.banner} alt="" className="absolute inset-0 size-full object-cover opacity-80" />}
                {dark && <div className="absolute inset-0 bg-gradient-to-r from-onyx via-onyx/70 to-transparent" />}
                {!dark && (
                    <>
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_120%_at_100%_0%,rgb(91_43_217/0.10),transparent_60%),radial-gradient(35%_90%_at_0%_100%,rgb(200_165_90/0.08),transparent_70%)]" />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgb(10_10_15/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(10_10_15/0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
                    </>
                )}
                <div className={cn('container-x relative', dark ? 'py-16 md:py-24' : 'py-6 md:py-8')}>
                    <Breadcrumbs items={crumbs} tone={dark ? 'dark' : 'light'} />
                    <div className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-3', dark ? 'mt-5' : 'mt-3')}>
                        <div className="max-w-2xl">
                            {dark && <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-gold ring-1 ring-gold/30">Exclusive brand</div>}
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className={cn('font-display font-semibold tracking-tight', dark ? 'text-[44px] leading-none md:text-[64px]' : 'text-[28px] leading-tight md:text-[36px]')}>{context.title}</h1>
                                {!dark && (
                                    <span className="tabular inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[12px] font-semibold text-violet-700 ring-1 ring-violet-100">
                                        <span className="size-1.5 rounded-full bg-violet-500" />
                                        {pagination.total} products
                                    </span>
                                )}
                            </div>
                            {context.subtitle && <p className={cn('mt-2 text-[14.5px] leading-relaxed md:text-[15px]', dark ? 'text-white/65' : 'text-slate')}>{context.subtitle}</p>}
                            {dark && context.description && context.description !== context.subtitle && <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/50">{context.description}</p>}
                        </div>
                        {dark && <div className="tabular text-sm text-white/60">{pagination.total} products</div>}
                    </div>
                    {!!context.children?.length && (
                        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 py-1.5 scrollbar-none">
                            {context.children.map((c) => (
                                <Link key={c.slug} href={route('category.show', c.slug)} className="group flex shrink-0 items-center gap-2.5 rounded-full bg-white py-1 pl-1 pr-4 text-[13px] font-medium shadow-[0_1px_2px_rgb(10_10_15/0.05)] ring-1 ring-mist transition duration-300 hover:text-violet-700 hover:shadow-soft hover:ring-violet-300">
                                    <span className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-white to-porcelain ring-1 ring-mist">{c.image_url && <img src={c.image_url} alt="" className="size-6 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110" />}</span>
                                    {c.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <div className="container-x py-6 md:py-8">
                <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[20px] bg-white px-5 py-1 ring-1 ring-mist scrollbar-none [&>div>div:last-child]:border-b-0">{filterPanel}</div>
                    </aside>
                    <div>
                        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-porcelain/70 px-3 py-2 ring-1 ring-mist/70">
                            <div className="flex flex-wrap items-center gap-2">
                                <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileOpen(true)}>
                                    <SlidersHorizontal className="size-4" /> Filters {chips.length > 0 && <span className="tabular rounded-full bg-violet-600 px-1.5 text-[10px] text-white">{chips.length}</span>}
                                </Button>
                                {chips.map((c) => (
                                    <button key={c.label} onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 transition hover:bg-violet-100">
                                        {c.label} <X className="size-3" />
                                    </button>
                                ))}
                                {chips.length > 1 && (
                                    <button onClick={() => apply({ brand: [], spec: {}, min: '', max: '', in_stock: false, sale: false })} className="text-xs font-semibold text-slate underline underline-offset-2">
                                        Clear all
                                    </button>
                                )}
                                {chips.length === 0 && !filters.q && (
                                    <span className="tabular hidden pl-1 text-[13px] text-slate lg:inline">
                                        Showing <b className="font-semibold text-onyx">{pagination.from ?? 0}–{pagination.to ?? 0}</b> of {pagination.total}
                                    </span>
                                )}
                                {filters.q && <span className="text-sm text-slate">for “{filters.q}”</span>}
                            </div>
                            <label className="flex items-center gap-2 text-sm text-slate">
                                Sort
                                <span className="relative">
                                    <select value={filters.sort} onChange={(e) => apply({ sort: e.target.value })} className="h-9 appearance-none rounded-xl border border-mist bg-white pl-3 pr-9 text-sm font-medium text-onyx focus:border-violet-500 focus:outline-none">
                                        {sorts.map((s) => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2" />
                                </span>
                            </label>
                        </div>

                        {products.length === 0 ? (
                            <EmptyState icon={<PackageSearch className="size-6" />} title="No products found" text="Try removing a filter or searching for something else." action={<Button variant="outline" href={route('shop')}>Browse all products</Button>} />
                        ) : (
                            <ProductGrid products={products} variant="premium" className="xl:grid-cols-4" />
                        )}
                        <div className="mt-12 flex flex-col items-center gap-3">
                            <Pagination links={pagination.links} />
                            {pagination.total > 0 && (
                                <div className="tabular text-xs text-slate">
                                    Showing {pagination.from}–{pagination.to} of {pagination.total}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Filters" side="left" footer={<Button block onClick={() => setMobileOpen(false)}>Show {pagination.total} products</Button>}>
                <div className="px-5">{filterPanel}</div>
            </Drawer>
        </>
    );
}
