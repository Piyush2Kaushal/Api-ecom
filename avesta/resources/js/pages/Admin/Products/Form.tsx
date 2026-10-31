import { router, useForm } from '@inertiajs/react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { FileField, GalleryField, ImageField, MultiSelect, RichText } from '@/components/admin/Fields';
import { Badge, Button, Card, Input, Label, Select, Switch, Textarea } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { cn, route } from '@/lib/utils';

const tiers = [
    { key: 'retail', label: 'Retailer', hint: 'Guests & normal customers' },
    { key: 'trade', label: 'Trader', hint: 'Approved installers' },
    { key: 'wholesale', label: 'Wholesaler', hint: 'Approved resellers' },
] as const;

function finalPrice(base: number, type: string, value: number) {
    if (!base || type === 'none' || !value) return base;
    return type === 'percent' ? base * (1 - Math.min(value, 100) / 100) : Math.max(0, base - value);
}

export default function ProductForm({ product, categories, brands, vatRate, defaultVatMode, specLabels }: any) {
    const editing = !!product.id;
    const form = useForm({
        name: product.name ?? '',
        slug: product.slug ?? '',
        sku: product.sku ?? '',
        brand_id: product.brand_id ? String(product.brand_id) : '',
        category_id: product.category_id ? String(product.category_id) : '',
        extra_category_ids: (product.extra_category_ids ?? []).map(String) as string[],
        short_description: product.short_description ?? '',
        description: product.description ?? '',
        key_features: (product.key_features?.length ? product.key_features : ['']) as string[],
        retail_price: product.retail_price ?? '',
        retail_discount_type: product.retail_discount_type ?? 'none',
        retail_discount_value: product.retail_discount_value ?? '',
        trade_price: product.trade_price ?? '',
        trade_discount_type: product.trade_discount_type ?? 'none',
        trade_discount_value: product.trade_discount_value ?? '',
        wholesale_price: product.wholesale_price ?? '',
        wholesale_discount_type: product.wholesale_discount_type ?? 'none',
        wholesale_discount_value: product.wholesale_discount_value ?? '',
        discount_starts_at: product.discount_starts_at ?? '',
        discount_ends_at: product.discount_ends_at ?? '',
        vat_mode: product.vat_mode ?? 'default',
        track_stock: product.track_stock ?? true,
        stock_qty: product.stock_qty ?? 0,
        allow_backorder: product.allow_backorder ?? false,
        low_stock_threshold: product.low_stock_threshold ?? '',
        weight: product.weight ?? '',
        option_name: product.option_name ?? '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        is_new: product.is_new ?? false,
        sort_order: product.sort_order ?? 0,
        meta_title: product.meta_title ?? '',
        meta_description: product.meta_description ?? '',
        images: (product.images ?? []).map((i: any) => ({ path: i.path, alt: i.alt })),
        specs: (product.specs?.length ? product.specs.map((s: any) => ({ label: s.label, value: s.value })) : [{ label: '', value: '' }]) as { label: string; value: string }[],
        files: (product.files ?? []).map((f: any) => ({ title: f.title, path: f.path })) as { title: string; path: string }[],
        variants: (product.variants ?? []).map((v: any) => ({ id: v.id, value: v.value, sku: v.sku ?? '', price_adjustment: v.price_adjustment ?? 0, stock_qty: v.stock_qty ?? 0, image: v.image, is_active: v.is_active })) as any[],
    });
    const [hasVariants, setHasVariants] = useState(form.data.variants.length > 0);
    const d = form.data as any;
    const e = form.errors as Record<string, string>;
    const effectiveVat = d.vat_mode === 'default' ? defaultVatMode : d.vat_mode;

    const submit = (ev?: React.FormEvent) => {
        ev?.preventDefault();
        form.transform((data: any) => ({
            ...data,
            brand_id: data.brand_id || null,
            category_id: data.category_id || null,
            variants: hasVariants ? data.variants : [],
            option_name: hasVariants ? data.option_name || 'Option' : null,
            specs: data.specs.filter((s: any) => s.label && s.value),
            key_features: data.key_features.filter(Boolean),
        }));
        editing ? form.put(route('admin.products.update', product.id), { preserveScroll: true }) : form.post(route('admin.products.store'));
    };

    const vatPreview = (amount: number) => {
        const r = Number(vatRate) / 100;
        if (effectiveVat === 'excluded') return `${gbp(amount)} + ${gbp(amount * r)} VAT = ${gbp(amount * (1 + r))} at checkout`;
        if (effectiveVat === 'included') return `includes ${gbp(amount - amount / (1 + r))} VAT`;
        return 'no VAT';
    };

    const listSet = (key: string, i: number, patch: any) => form.setData(key as any, d[key].map((x: any, j: number) => (j === i ? (typeof patch === 'object' ? { ...x, ...patch } : patch) : x)));

    return (
        <form onSubmit={submit}>
            <PageHeader
                back={{ href: route('admin.products.index'), label: 'Products' }}
                title={editing ? product.name : 'New product'}
                description={editing ? `SKU ${product.sku}` : 'Fill in the details below. Only the name, SKU and retailer price are required.'}
                actions={
                    <>
                        {editing && <Button variant="outline" size="sm" href={route('product.show', product.slug)} external><ExternalLink className="size-4" /> View on site</Button>}
                        <Button size="sm" loading={form.processing}>{editing ? 'Save changes' : 'Create product'}</Button>
                    </>
                }
            />
            {Object.keys(e).length > 0 && <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-100">Please fix the highlighted fields: {Object.values(e).slice(0, 3).join(' ')}</div>}

            <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
                <div className="space-y-4">
                    <Card title="Basic information">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Input label="Product name" required value={d.name} onChange={(ev) => form.setData('name', ev.target.value)} error={e.name} wrapperClassName="sm:col-span-2" />
                            <Input label="SKU / product code" required value={d.sku} onChange={(ev) => form.setData('sku', ev.target.value.toUpperCase())} error={e.sku} />
                            <Input label="URL slug" value={d.slug} onChange={(ev) => form.setData('slug', ev.target.value)} help="Leave empty to create from the name." error={e.slug} />
                            <Textarea label="Short description" rows={2} value={d.short_description} onChange={(ev) => form.setData('short_description', ev.target.value)} help="Shown in search results and Google." wrapperClassName="sm:col-span-2" />
                        </div>
                    </Card>

                    <Card title="Images">
                        <GalleryField value={d.images} onChange={(v) => form.setData('images', v as any)} />
                    </Card>

                    <Card title="Prices" action={<span className="text-xs text-slate">Original price is shown crossed out when a discount is set</span>}>
                        <div className="space-y-3">
                            {tiers.map((t) => {
                                const base = parseFloat(d[`${t.key}_price`]) || 0;
                                const type = d[`${t.key}_discount_type`];
                                const value = parseFloat(d[`${t.key}_discount_value`]) || 0;
                                const fallback = t.key !== 'retail' && !d[`${t.key}_price`];
                                const final = finalPrice(base, type, value);
                                return (
                                    <div key={t.key} className={cn('grid items-start gap-3 rounded-2xl border p-4 md:grid-cols-[150px_1fr_1fr_1fr_1.3fr]', t.key === 'retail' ? 'border-violet-200 bg-violet-50/30' : 'border-mist')}>
                                        <div>
                                            <div className="font-semibold">{t.label}</div>
                                            <div className="text-xs text-slate">{t.hint}</div>
                                        </div>
                                        <Input label="Price" type="number" step="0.01" min={0} prefix="£" required={t.key === 'retail'} placeholder={fallback ? 'Uses retailer' : '0.00'} value={d[`${t.key}_price`] ?? ''} onChange={(ev) => form.setData(`${t.key}_price` as any, ev.target.value)} error={e[`${t.key}_price`]} />
                                        <Select label="Discount" value={type} onChange={(ev) => form.setData(`${t.key}_discount_type` as any, ev.target.value)} options={[{ value: 'none', label: 'No discount' }, { value: 'percent', label: '% off' }, { value: 'fixed', label: '£ off' }]} />
                                        <Input label="Amount" type="number" step="0.01" min={0} disabled={type === 'none'} suffix={type === 'percent' ? '%' : type === 'fixed' ? '£' : undefined} value={type === 'none' ? '' : d[`${t.key}_discount_value`] ?? ''} onChange={(ev) => form.setData(`${t.key}_discount_value` as any, ev.target.value)} error={e[`${t.key}_discount_value`]} />
                                        <div>
                                            <Label>Customer sees</Label>
                                            <div className="flex min-h-11 flex-col justify-center rounded-xl bg-white px-3.5 py-2 ring-1 ring-mist">
                                                {fallback ? (
                                                    <span className="text-sm text-slate">Same as retailer</span>
                                                ) : (
                                                    <>
                                                        <span className="tabular flex items-baseline gap-2">
                                                            <span className="text-base font-semibold">{gbp(final)}</span>
                                                            {final < base && <span className="text-xs text-ash line-through">{gbp(base)}</span>}
                                                        </span>
                                                        {base > 0 && <span className="text-[11px] text-slate">{vatPreview(final)}</span>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            <Input type="datetime-local" label="Discount starts (optional)" value={d.discount_starts_at} onChange={(ev) => form.setData('discount_starts_at', ev.target.value)} help="Leave both empty for discounts that are always on." />
                            <Input type="datetime-local" label="Discount ends (optional)" value={d.discount_ends_at} onChange={(ev) => form.setData('discount_ends_at', ev.target.value)} error={e.discount_ends_at} />
                        </div>
                    </Card>

                    <Card title="Description">
                        <RichText value={d.description} onChange={(v) => form.setData('description', v)} placeholder="Describe the product…" />
                        <div className="mt-6">
                            <Label>Key features (bullet points)</Label>
                            <div className="space-y-2">
                                {d.key_features.map((f: string, i: number) => (
                                    <div key={i} className="flex gap-2">
                                        <input value={f} onChange={(ev) => listSet('key_features', i, ev.target.value)} placeholder="e.g. 24/7 full-colour night vision" className="h-10 flex-1 rounded-xl border border-mist px-3.5 text-sm focus:border-violet-500 focus:outline-none" />
                                        <button type="button" onClick={() => form.setData('key_features', d.key_features.filter((_: any, j: number) => j !== i))} className="px-2 text-ash hover:text-danger" aria-label="Remove"><Trash2 className="size-4" /></button>
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={() => form.setData('key_features', [...d.key_features, ''])} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700"><Plus className="size-4" /> Add feature</button>
                        </div>
                    </Card>

                    <Card title="Specifications" action={<span className="text-xs text-slate">Used for filters on category pages</span>}>
                        <datalist id="spec-labels">{specLabels.map((l: string) => <option key={l} value={l} />)}</datalist>
                        <div className="space-y-2">
                            {d.specs.map((s: any, i: number) => (
                                <div key={i} className="flex gap-2">
                                    <input list="spec-labels" value={s.label} onChange={(ev) => listSet('specs', i, { label: ev.target.value })} placeholder="Label, e.g. Resolution" className="h-10 w-2/5 rounded-xl border border-mist px-3.5 text-sm focus:border-violet-500 focus:outline-none" />
                                    <input value={s.value} onChange={(ev) => listSet('specs', i, { value: ev.target.value })} placeholder="Value, e.g. 5MP" className="h-10 flex-1 rounded-xl border border-mist px-3.5 text-sm focus:border-violet-500 focus:outline-none" />
                                    <button type="button" onClick={() => form.setData('specs', d.specs.filter((_: any, j: number) => j !== i))} className="px-2 text-ash hover:text-danger" aria-label="Remove"><Trash2 className="size-4" /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={() => form.setData('specs', [...d.specs, { label: '', value: '' }])} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700"><Plus className="size-4" /> Add specification</button>
                    </Card>

                    <Card title="Options (e.g. colour)" action={<Switch checked={hasVariants} onChange={(v) => { setHasVariants(v); if (v && !d.variants.length) form.setData('variants', [{ value: '', sku: '', price_adjustment: 0, stock_qty: 0, image: null, is_active: true }]); }} />}>
                        {!hasVariants ? (
                            <p className="text-sm text-slate">Turn on if customers must choose an option such as colour or lens size. Each option can have its own SKU, stock, image and price difference.</p>
                        ) : (
                            <div className="space-y-3">
                                <Input label="Option name" placeholder="Colour" value={d.option_name} onChange={(ev) => form.setData('option_name', ev.target.value)} wrapperClassName="max-w-xs" />
                                {d.variants.map((v: any, i: number) => (
                                    <div key={i} className="grid items-end gap-3 rounded-2xl bg-porcelain/70 p-3 sm:grid-cols-[1fr_1fr_120px_100px_auto_auto]">
                                        <Input label="Value" placeholder="White" value={v.value} onChange={(ev) => listSet('variants', i, { value: ev.target.value })} error={e[`variants.${i}.value`]} />
                                        <Input label="SKU" value={v.sku} onChange={(ev) => listSet('variants', i, { sku: ev.target.value.toUpperCase() })} />
                                        <Input label="Price +/-" type="number" step="0.01" prefix="£" value={v.price_adjustment} onChange={(ev) => listSet('variants', i, { price_adjustment: ev.target.value })} />
                                        <Input label="Stock" type="number" value={v.stock_qty} onChange={(ev) => listSet('variants', i, { stock_qty: ev.target.value })} />
                                        <div className="w-16"><ImageField value={v.image} onChange={(p) => listSet('variants', i, { image: p })} aspect="aspect-square" folder="products" /></div>
                                        <button type="button" onClick={() => form.setData('variants', d.variants.filter((_: any, j: number) => j !== i))} className="mb-3 p-2 text-ash hover:text-danger" aria-label="Remove"><Trash2 className="size-4" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => form.setData('variants', [...d.variants, { value: '', sku: '', price_adjustment: 0, stock_qty: 0, image: null, is_active: true }])} className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700"><Plus className="size-4" /> Add option</button>
                                <p className="text-xs text-slate">Price +/- is added to every price level (e.g. +£1.00 for black). Total stock is the sum of all options.</p>
                            </div>
                        )}
                    </Card>

                    <Card title="Downloads (datasheets, manuals)">
                        <div className="space-y-2">
                            {d.files.map((f: any, i: number) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input value={f.title} onChange={(ev) => listSet('files', i, { title: ev.target.value })} placeholder="Title, e.g. Datasheet" className="h-10 flex-1 rounded-xl border border-mist px-3.5 text-sm focus:border-violet-500 focus:outline-none" />
                                    <a href={'/' + f.path} target="_blank" rel="noreferrer" className="max-w-[200px] truncate text-xs text-violet-700">{f.path.split('/').pop()}</a>
                                    <button type="button" onClick={() => form.setData('files', d.files.filter((_: any, j: number) => j !== i))} className="px-2 text-ash hover:text-danger" aria-label="Remove"><Trash2 className="size-4" /></button>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3"><FileField value={null} folder="downloads" onChange={(p, name) => p && form.setData('files', [...d.files, { title: (name ?? 'Download').replace(/\.[a-z0-9]+$/i, ''), path: p }])} /></div>
                    </Card>

                    <Card title="Search engine (SEO)">
                        <div className="space-y-4">
                            <Input label="Meta title" value={d.meta_title} onChange={(ev) => form.setData('meta_title', ev.target.value)} placeholder={d.name} />
                            <Textarea label="Meta description" rows={2} value={d.meta_description} onChange={(ev) => form.setData('meta_description', ev.target.value)} placeholder={d.short_description} />
                        </div>
                    </Card>
                </div>

                <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
                    <Card title="Visibility">
                        <div className="space-y-4">
                            <Switch checked={d.is_active} onChange={(v) => form.setData('is_active', v)} label="Visible on website" />
                            <Switch checked={d.is_featured} onChange={(v) => form.setData('is_featured', v)} label="Featured" description="Shown first and in featured sections." />
                            <Switch checked={d.is_new} onChange={(v) => form.setData('is_new', v)} label="“New” badge" />
                        </div>
                    </Card>
                    <Card title="Organise">
                        <div className="space-y-4">
                            <Select label="Brand" value={d.brand_id} onChange={(ev) => form.setData('brand_id', ev.target.value)} placeholder="No brand" options={brands.map((b: any) => ({ value: b.id, label: b.name }))} />
                            <Select label="Main category" value={d.category_id} onChange={(ev) => form.setData('category_id', ev.target.value)} placeholder="No category" options={categories.map((c: any) => ({ value: c.id, label: c.label }))} help="Any level — no need to pick the deepest one." error={e.category_id} />
                            <div>
                                <Label>Also show in</Label>
                                <MultiSelect value={d.extra_category_ids} onChange={(v) => form.setData('extra_category_ids', v)} options={categories.map((c: any) => ({ value: String(c.id), label: c.label }))} placeholder="Optional extra categories" />
                            </div>
                        </div>
                    </Card>
                    <Card title="VAT">
                        <Select value={d.vat_mode} onChange={(ev) => form.setData('vat_mode', ev.target.value)} options={[
                            { value: 'default', label: `Use store default (${defaultVatMode === 'included' ? 'included' : defaultVatMode === 'excluded' ? 'excluded' : 'no VAT'})` },
                            { value: 'included', label: 'Price includes VAT' },
                            { value: 'excluded', label: 'VAT added at checkout' },
                            { value: 'none', label: 'No VAT (0%)' },
                        ]} help={`VAT rate: ${vatRate}% (change in Settings).`} />
                    </Card>
                    <Card title="Stock & shipping">
                        <div className="space-y-4">
                            <Switch checked={d.track_stock} onChange={(v) => form.setData('track_stock', v)} label="Track stock" />
                            {d.track_stock && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input label="In stock" type="number" value={d.stock_qty} onChange={(ev) => form.setData('stock_qty', ev.target.value)} disabled={hasVariants} help={hasVariants ? 'Set per option' : undefined} />
                                        <Input label="Low stock at" type="number" placeholder="Default" value={d.low_stock_threshold} onChange={(ev) => form.setData('low_stock_threshold', ev.target.value)} />
                                    </div>
                                    <Switch checked={d.allow_backorder} onChange={(v) => form.setData('allow_backorder', v)} label="Allow orders when out of stock" />
                                </>
                            )}
                            <Input label="Weight (kg)" type="number" step="0.001" value={d.weight} onChange={(ev) => form.setData('weight', ev.target.value)} help="Used for weight-based delivery prices." />
                        </div>
                    </Card>
                    <Button block size="lg" loading={form.processing}>{editing ? 'Save changes' : 'Create product'}</Button>
                    {editing && (
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" block onClick={() => router.post(route('admin.products.duplicate', product.id))}>Duplicate</Button>
                            <Button type="button" variant="outline" block className="text-danger" onClick={() => confirm('Delete this product?') && router.delete(route('admin.products.destroy', product.id))}>Delete</Button>
                        </div>
                    )}
                    {!editing && <Badge tone="violet">Tip: you can duplicate a similar product to save time.</Badge>}
                </div>
            </div>
        </form>
    );
}
