import { Link, router } from '@inertiajs/react';
import { Copy, Download, Pencil, Plus, Search, Trash2, Upload } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { Badge, Button, Input, Modal, Pagination, Select, Switch } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { cn, route } from '@/lib/utils';

const actions = [
    { value: 'activate', label: 'Show on website' },
    { value: 'deactivate', label: 'Hide from website' },
    { value: 'feature', label: 'Mark as featured' },
    { value: 'unfeature', label: 'Remove featured' },
    { value: 'discount', label: 'Set discount…' },
    { value: 'price_adjust', label: 'Increase / decrease prices by %…' },
    { value: 'vat', label: 'Set VAT type…' },
    { value: 'category', label: 'Move to category…' },
    { value: 'add_category', label: 'Also show in category…' },
    { value: 'brand', label: 'Set brand…' },
    { value: 'stock', label: 'Set stock quantity…' },
    { value: 'track_stock', label: 'Stock tracking on / off…' },
    { value: 'delete', label: 'Delete' },
];
const vatLabel: Record<string, string> = { default: 'Store default', included: 'VAT incl.', excluded: '+ VAT', none: 'No VAT' };

export default function ProductsIndex({ products, filters, categories, brands }: any) {
    const [q, setQ] = useState(filters.q ?? '');
    const [selected, setSelected] = useState<number[]>([]);
    const [allMatching, setAllMatching] = useState(false);
    const [bulk, setBulk] = useState<string | null>(null);
    const [bulkData, setBulkData] = useState<any>({ value: '', tier: 'all', discount_type: 'percent' });
    const go = (patch: any) => router.get(route('admin.products.index'), { ...filters, ...patch }, { preserveState: true, replace: true, onSuccess: () => { setSelected([]); setAllMatching(false); } });
    const count = allMatching ? products.total : selected.length;

    const runBulk = (action: string, extra: any = {}) => {
        if (action === 'delete' && !confirm(`Delete ${count} product(s)? This cannot be undone.`)) return;
        router.post(route('admin.products.bulk'), { action, ids: selected, all_matching: allMatching, filters, ...extra }, { preserveScroll: true, onSuccess: () => { setBulk(null); setSelected([]); setAllMatching(false); } });
    };
    const chooseBulk = (a: string) => {
        if (['activate', 'deactivate', 'feature', 'unfeature', 'delete'].includes(a)) return runBulk(a);
        setBulkData({ value: a === 'track_stock' ? '1' : a === 'vat' ? 'included' : '', tier: 'all', discount_type: 'percent' });
        setBulk(a);
    };

    return (
        <>
            <PageHeader
                title="Products"
                description="Add, edit and price your products. Select several to edit them in bulk."
                actions={
                    <>
                        <Button variant="outline" size="sm" href={route('admin.products.import')}><Upload className="size-4" /> Import</Button>
                        <Button variant="outline" size="sm" href={route('admin.products.export', { ...filters, format: 'xlsx' })} external><Download className="size-4" /> Export</Button>
                        <Button size="sm" href={route('admin.products.create')}><Plus className="size-4" /> Add product</Button>
                    </>
                }
            />
            <div className="rounded-2xl border border-mist bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b border-mist p-4">
                    <form onSubmit={(e) => { e.preventDefault(); go({ q }); }} className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or SKU" className="h-10 w-60 rounded-xl border border-mist pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none" />
                    </form>
                    <select value={filters.category ?? ''} onChange={(e) => go({ category: e.target.value })} className="h-10 max-w-[220px] rounded-xl border border-mist px-3 pr-8 text-sm"><option value="">All categories</option>{categories.map((c: any) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
                    <select value={filters.brand ?? ''} onChange={(e) => go({ brand: e.target.value })} className="h-10 rounded-xl border border-mist px-3 pr-8 text-sm"><option value="">All brands</option>{brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                    <select value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} className="h-10 rounded-xl border border-mist px-3 pr-8 text-sm"><option value="">Any status</option><option value="active">Visible</option><option value="hidden">Hidden</option><option value="featured">Featured</option></select>
                    <select value={filters.stock ?? ''} onChange={(e) => go({ stock: e.target.value })} className="h-10 rounded-xl border border-mist px-3 pr-8 text-sm"><option value="">Any stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
                    <select value={filters.sort ?? 'latest'} onChange={(e) => go({ sort: e.target.value })} className="ml-auto h-10 rounded-xl border border-mist px-3 pr-8 text-sm"><option value="latest">Newest</option><option value="name">Name</option><option value="price">Price</option><option value="stock">Stock</option><option value="sales">Best selling</option></select>
                </div>

                {selected.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 border-b border-mist bg-violet-50 px-4 py-3 text-sm">
                        <span className="font-semibold text-violet-900">{count} selected</span>
                        {!allMatching && selected.length === products.data.length && products.total > products.data.length && (
                            <button onClick={() => setAllMatching(true)} className="font-semibold text-violet-700 underline">Select all {products.total} matching products</button>
                        )}
                        <select value="" onChange={(e) => e.target.value && chooseBulk(e.target.value)} className="h-9 rounded-xl border border-violet-200 bg-white px-3 pr-8 text-sm font-medium">
                            <option value="">Bulk action…</option>
                            {actions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                        </select>
                        <button onClick={() => { setSelected([]); setAllMatching(false); }} className="ml-auto text-slate hover:text-onyx">Clear</button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-mist text-left text-[11px] font-semibold uppercase tracking-wider text-slate">
                                <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded border-fog" checked={selected.length > 0 && selected.length === products.data.length} onChange={(e) => { setSelected(e.target.checked ? products.data.map((p: any) => p.id) : []); setAllMatching(false); }} aria-label="Select all" /></th>
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Retailer</th>
                                <th className="px-4 py-3">Trader</th>
                                <th className="px-4 py-3">Wholesaler</th>
                                <th className="px-4 py-3">VAT</th>
                                <th className="px-4 py-3">Stock</th>
                                <th className="px-4 py-3">Visible</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-mist">
                            {products.data.map((p: any) => (
                                <tr key={p.id} className={cn('hover:bg-porcelain/60', selected.includes(p.id) && 'bg-violet-50/40')}>
                                    <td className="px-4 py-3"><input type="checkbox" className="rounded border-fog" checked={selected.includes(p.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, p.id] : selected.filter((x) => x !== p.id))} aria-label="Select" /></td>
                                    <td className="px-4 py-3">
                                        <Link href={route('admin.products.edit', p.id)} className="flex items-center gap-3">
                                            <span className="size-12 shrink-0 overflow-hidden rounded-xl bg-porcelain">{p.image && <img src={p.image} alt="" className="size-full object-contain p-1" />}</span>
                                            <span className="min-w-0">
                                                <span className="line-clamp-1 max-w-sm font-semibold hover:text-violet-700">{p.name}</span>
                                                <span className="block text-xs text-slate">{p.sku} · {p.brand ?? 'No brand'} · {p.category ?? 'No category'}</span>
                                                {p.is_featured && <Badge tone="violet" className="mt-1">Featured</Badge>}
                                            </span>
                                        </Link>
                                    </td>
                                    {['retailer', 'trader', 'wholesaler'].map((t) => (
                                        <td key={t} className="tabular whitespace-nowrap px-4 py-3">
                                            <div className="font-semibold">{gbp(p.prices[t].price)}</div>
                                            {p.prices[t].has_discount && <div className="text-xs text-ash line-through">{gbp(p.prices[t].original)}</div>}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-xs text-slate">{vatLabel[p.vat_mode]}</td>
                                    <td className="px-4 py-3">{p.track_stock ? <span className={cn('tabular rounded-lg px-2 py-0.5 text-xs font-bold', p.stock_qty <= 0 ? 'bg-red-50 text-danger' : p.low ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>{p.stock_qty}</span> : <span className="text-xs text-slate">∞</span>}</td>
                                    <td className="px-4 py-3"><Switch size="sm" checked={p.is_active} onChange={() => router.post(route('admin.products.bulk'), { action: p.is_active ? 'deactivate' : 'activate', ids: [p.id] }, { preserveScroll: true })} /></td>
                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                        <Link href={route('admin.products.edit', p.id)} className="inline-flex rounded-lg p-2 text-slate hover:bg-porcelain hover:text-onyx" title="Edit"><Pencil className="size-4" /></Link>
                                        <button onClick={() => router.post(route('admin.products.duplicate', p.id))} className="rounded-lg p-2 text-slate hover:bg-porcelain hover:text-onyx" title="Duplicate"><Copy className="size-4" /></button>
                                        <button onClick={() => confirm(`Delete ${p.name}?`) && router.delete(route('admin.products.destroy', p.id), { preserveScroll: true })} className="rounded-lg p-2 text-slate hover:bg-red-50 hover:text-danger" title="Delete"><Trash2 className="size-4" /></button>
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && <tr><td colSpan={9} className="p-10 text-center text-slate">No products found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-mist p-4">
                    <span className="text-xs text-slate">{products.total} products</span>
                    <Pagination links={products.links} preserveScroll />
                    <select value={String(products.per_page)} onChange={(e) => go({ per_page: e.target.value })} className="h-9 rounded-xl border border-mist px-3 pr-8 text-xs">{[25, 50, 100].map((n) => <option key={n} value={n}>{n} per page</option>)}</select>
                </div>
            </div>

            <Modal open={!!bulk} onClose={() => setBulk(null)} title={actions.find((a) => a.value === bulk)?.label.replace('…', '')} description={`Applies to ${count} product(s).`} footer={<><Button variant="ghost" onClick={() => setBulk(null)}>Cancel</Button><Button onClick={() => runBulk(bulk!, bulkData)}>Apply to {count}</Button></>}>
                <div className="space-y-4">
                    {(bulk === 'discount' || bulk === 'price_adjust') && (
                        <Select label="Which prices?" value={bulkData.tier} onChange={(e) => setBulkData({ ...bulkData, tier: e.target.value })} options={[{ value: 'all', label: 'All three price levels' }, { value: 'retail', label: 'Retailer only' }, { value: 'trade', label: 'Trader only' }, { value: 'wholesale', label: 'Wholesaler only' }]} />
                    )}
                    {bulk === 'discount' && (
                        <>
                            <Select label="Discount type" value={bulkData.discount_type} onChange={(e) => setBulkData({ ...bulkData, discount_type: e.target.value })} options={[{ value: 'percent', label: 'Percentage off' }, { value: 'fixed', label: 'Fixed £ off' }, { value: 'none', label: 'Remove discount' }]} />
                            {bulkData.discount_type !== 'none' && <Input label="Discount" type="number" step="0.01" value={bulkData.value} onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })} suffix={bulkData.discount_type === 'percent' ? '%' : '£'} />}
                        </>
                    )}
                    {bulk === 'price_adjust' && <Input label="Change prices by" type="number" step="0.1" value={bulkData.value} onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })} suffix="%" help="Use a negative number to decrease, e.g. -5." />}
                    {bulk === 'vat' && <Select label="VAT type" value={bulkData.value} onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })} options={Object.entries(vatLabel).map(([v, l]) => ({ value: v, label: v === 'default' ? 'Use store default' : l }))} />}
                    {(bulk === 'category' || bulk === 'add_category') && <Select label="Category" value={bulkData.value} onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })} placeholder="Choose…" options={categories.map((c: any) => ({ value: c.id, label: c.label }))} />}
                    {bulk === 'brand' && <Select label="Brand" value={bulkData.value} onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })} placeholder="No brand" options={brands.map((b: any) => ({ value: b.id, label: b.name }))} />}
                    {bulk === 'stock' && <Input label="Stock quantity" type="number" value={bulkData.value} onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })} />}
                    {bulk === 'track_stock' && <Select label="Stock tracking" value={bulkData.value} onChange={(e) => setBulkData({ ...bulkData, value: e.target.value })} options={[{ value: '1', label: 'Track stock' }, { value: '0', label: 'Do not track stock' }]} />}
                </div>
            </Modal>
        </>
    );
}
