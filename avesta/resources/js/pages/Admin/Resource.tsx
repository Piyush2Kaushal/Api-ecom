import { Link, router } from '@inertiajs/react';
import { Download, GripVertical, Mail, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { SchemaField, isVisible, setPath, type FieldDef } from '@/components/admin/Fields';
import { Badge, Button, Drawer, EmptyState, Pagination, StatusBadge, Switch } from '@/components/ui';
import { cn, formatDate, route } from '@/lib/utils';
import type { Paginated } from '@/types';

interface Column { key: string; label: string; type: string; sub?: string; mono?: boolean; wide?: boolean }

interface Props {
    resource: { slug: string; route: string; title: string; singular: string; description?: string | null; sortable: boolean; canCreate: boolean; canDelete: boolean; searchable: boolean };
    fields: FieldDef[];
    columns: Column[];
    filterDefs: { key: string; label: string; options: { value: string; label: string }[] }[];
    items: Paginated<any>;
    filters: Record<string, string>;
    links?: { label: string; route: string }[];
    exports?: { label: string; route: string; params?: any }[];
}

function defaults(fields: FieldDef[]) {
    let d: any = {};
    fields.forEach((f) => {
        if (f.type === 'section' || f.readonly) return;
        const v = f.default ?? (f.type === 'toggle' ? false : ['multiselect', 'tags', 'repeater'].includes(f.type) ? [] : '');
        d = setPath(d, f.name, v);
    });
    return d;
}

export default function Resource({ resource, fields, columns, filterDefs, items, filters, links, exports }: Props) {
    const [editing, setEditing] = useState<any | null>(null);
    const [data, setDataState] = useState<any>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [q, setQ] = useState(filters.q ?? '');
    const [rows, setRows] = useState(items.data);
    const [drag, setDrag] = useState<number | null>(null);
    useEffect(() => setRows(items.data), [items.data]);

    const r = (action: string, params?: any) => route(`${resource.route}.${action}`, params);
    const open = (item?: any) => {
        const base = defaults(fields);
        setErrors({});
        setDataState(item ? mergeDeep(base, item) : base);
        setEditing(item ?? {});
    };
    const setData = (path: string, v: any) => setDataState((d: any) => setPath(d, path, v));

    const save = () => {
        setSaving(true);
        const payload: any = {};
        fields.forEach((f) => {
            if (f.type === 'section' || f.readonly || !isVisible(f, data)) return;
            const keys = f.name.split('.');
            let src = data;
            keys.forEach((k) => (src = src?.[k]));
            Object.assign(payload, setPath(payload, f.name, src === '' ? null : src));
        });
        const opts = {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
            onError: (e: any) => setErrors(e),
            onFinish: () => setSaving(false),
        };
        editing?.id ? router.put(r('update', editing.id), payload, opts) : router.post(r('store'), payload, opts);
    };

    const filter = (patch: Record<string, string>) => router.get(r('index'), { ...filters, ...patch }, { preserveState: true, replace: true });
    const toggle = (item: any, field: string) => router.patch(r('toggle', item.id), { field }, { preserveScroll: true, preserveState: true });
    const destroy = (item: any) => confirm(`Delete this ${resource.singular.toLowerCase()}? This cannot be undone.`) && router.delete(r('destroy', item.id), { preserveScroll: true });
    const bulkDelete = () => confirm(`Delete ${selected.length} item(s)?`) && router.post(r('bulk_delete'), { ids: selected }, { preserveScroll: true, onSuccess: () => setSelected([]) });

    const drop = (to: number) => {
        if (drag === null || drag === to) return;
        const next = [...rows];
        const [it] = next.splice(drag, 1);
        next.splice(to, 0, it);
        setRows(next);
        setDrag(null);
        router.post(r('reorder'), { ids: next.map((x) => x.id) }, { preserveScroll: true, preserveState: true });
    };

    const cell = (item: any, c: Column) => {
        const v = item[c.key];
        switch (c.type) {
            case 'image':
                return <div className={cn('overflow-hidden rounded-xl bg-porcelain', c.wide ? 'h-12 w-20' : 'size-11')}>{v && <img src={v} alt="" className={cn('size-full', c.wide ? 'object-cover' : 'object-contain p-1')} />}</div>;
            case 'title':
                return (
                    <div className="min-w-0">
                        <div className={cn('font-semibold', c.mono && 'font-mono text-[13px]')}>{v ?? '—'}</div>
                        {c.sub && item[c.sub] && <div className="max-w-md truncate text-xs text-slate">{item[c.sub]}</div>}
                    </div>
                );
            case 'toggle':
                return <Switch size="sm" checked={!!v} onChange={() => toggle(item, c.key)} />;
            case 'bool':
                return v ? <Badge tone="success">Yes</Badge> : <Badge>No</Badge>;
            case 'badge':
                return v === true ? <Badge tone="gold">Yes</Badge> : v ? <Badge tone="violet">{String(v)}</Badge> : <span className="text-ash">—</span>;
            case 'status':
                return <StatusBadge status={v} />;
            case 'date':
                return <span className="text-slate">{formatDate(v)}</span>;
            case 'number':
                return <span className="tabular">{v ?? 0}</span>;
            case 'list':
                return <span className="text-slate">{(v ?? []).join(', ') || '—'}</span>;
            default:
                return (
                    <div className="min-w-0">
                        <div className="truncate">{v ?? '—'}</div>
                        {c.sub && item[c.sub] && <div className="max-w-xs truncate text-xs text-slate">{item[c.sub]}</div>}
                    </div>
                );
        }
    };

    return (
        <>
            <PageHeader
                title={resource.title}
                description={resource.description}
                actions={
                    <>
                        {links?.map((l) => <Button key={l.route} variant="outline" size="sm" href={route(l.route)}>{l.label}</Button>)}
                        {exports?.map((e) => <Button key={e.label} variant="outline" size="sm" href={route(e.route, e.params)} external><Download className="size-4" /> {e.label}</Button>)}
                        {resource.canCreate && <Button size="sm" onClick={() => open()}><Plus className="size-4" /> Add {resource.singular.toLowerCase()}</Button>}
                    </>
                }
            />

            <div className="rounded-2xl border border-mist bg-white">
                {(resource.searchable || filterDefs.length > 0 || selected.length > 0) && (
                    <div className="flex flex-wrap items-center gap-3 border-b border-mist p-4">
                        {resource.searchable && (
                            <form onSubmit={(e) => { e.preventDefault(); filter({ q }); }} className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" />
                                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="h-10 w-64 rounded-xl border border-mist pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none" />
                            </form>
                        )}
                        {filterDefs.map((f) => (
                            <select key={f.key} value={filters[f.key] ?? ''} onChange={(e) => filter({ [f.key]: e.target.value })} className="h-10 rounded-xl border border-mist bg-white px-3 pr-8 text-sm">
                                <option value="">All {f.label.toLowerCase()}</option>
                                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        ))}
                        {selected.length > 0 && resource.canDelete && (
                            <div className="ml-auto flex items-center gap-2">
                                <span className="text-sm text-slate">{selected.length} selected</span>
                                <Button size="sm" variant="danger" onClick={bulkDelete}><Trash2 className="size-4" /> Delete</Button>
                            </div>
                        )}
                    </div>
                )}

                {rows.length === 0 ? (
                    <div className="p-6">
                        <EmptyState title={`No ${resource.title.toLowerCase()} yet`} action={resource.canCreate && <Button onClick={() => open()}><Plus className="size-4" /> Add {resource.singular.toLowerCase()}</Button>} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-mist text-left text-[11px] font-semibold uppercase tracking-wider text-slate">
                                    <th className="w-10 px-4 py-3">
                                        {resource.canDelete && <input type="checkbox" className="rounded border-fog" checked={selected.length === rows.length} onChange={(e) => setSelected(e.target.checked ? rows.map((x) => x.id) : [])} aria-label="Select all" />}
                                    </th>
                                    {resource.sortable && <th className="w-8" />}
                                    {columns.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-mist">
                                {rows.map((item, i) => (
                                    <tr
                                        key={item.id}
                                        className={cn('transition hover:bg-porcelain/60', drag === i && 'opacity-40')}
                                        draggable={resource.sortable}
                                        onDragStart={() => setDrag(i)}
                                        onDragOver={(e) => resource.sortable && e.preventDefault()}
                                        onDrop={() => drop(i)}
                                    >
                                        <td className="px-4 py-3">
                                            {resource.canDelete && <input type="checkbox" className="rounded border-fog" checked={selected.includes(item.id)} onChange={(e) => setSelected(e.target.checked ? [...selected, item.id] : selected.filter((x) => x !== item.id))} aria-label="Select row" />}
                                        </td>
                                        {resource.sortable && <td className="cursor-grab text-ash"><GripVertical className="size-4" /></td>}
                                        {columns.map((c) => (
                                            <td key={c.key} className="px-4 py-3 align-middle" onClick={() => c.type !== 'toggle' && open(item)}>
                                                <div className={cn(c.type !== 'toggle' && 'cursor-pointer')}>{cell(item, c)}</div>
                                            </td>
                                        ))}
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            {item.mailto && <a href={item.mailto} className="mr-1 inline-flex rounded-lg p-2 text-slate hover:bg-porcelain hover:text-violet-700" title="Reply by email"><Mail className="size-4" /></a>}
                                            {item.view_url && <a href={item.view_url} target="_blank" rel="noreferrer" className="mr-1 inline-flex rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50">View</a>}
                                            <button onClick={() => open(item)} className="rounded-lg p-2 text-slate hover:bg-porcelain hover:text-onyx" aria-label="Edit"><Pencil className="size-4" /></button>
                                            {resource.canDelete && <button onClick={() => destroy(item)} className="rounded-lg p-2 text-slate hover:bg-red-50 hover:text-danger" aria-label="Delete"><Trash2 className="size-4" /></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {!resource.sortable && <Pagination links={items.links} className="border-t border-mist p-4" preserveScroll />}
            </div>
            {resource.sortable && rows.length > 1 && <p className="mt-3 text-xs text-slate">Tip: drag rows to change the order shown on the website.</p>}

            <Drawer
                open={!!editing}
                onClose={() => setEditing(null)}
                width="max-w-2xl"
                title={editing?.id ? `Edit ${resource.singular.toLowerCase()}` : `New ${resource.singular.toLowerCase()}`}
                footer={
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                        <Button onClick={save} loading={saving}>Save</Button>
                    </div>
                }
            >
                <div className="grid grid-cols-12 gap-4 p-5">
                    {fields.map((f, i) => <SchemaField key={f.name + i} field={f} data={data} setData={setData} errors={errors} />)}
                </div>
            </Drawer>
        </>
    );
}

function mergeDeep(base: any, item: any): any {
    const out: any = { ...base };
    Object.keys(item).forEach((k) => {
        const v = item[k];
        if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object') out[k] = mergeDeep(base[k], v);
        else out[k] = v ?? base[k] ?? '';
    });
    return out;
}

export { Link };
