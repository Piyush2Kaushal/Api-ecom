import { router } from '@inertiajs/react';
import { ChevronRight, FolderPlus, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { ImageField } from '@/components/admin/Fields';
import { Badge, Button, Drawer, Input, Select, Switch, Textarea } from '@/components/ui';
import { cn, route } from '@/lib/utils';

const blank = { name: '', slug: '', parent_id: '' as any, description: '', image: null as string | null, banner: null as string | null, is_active: true, show_in_menu: true, show_on_home: false, meta_title: '', meta_description: '' };

export default function Categories({ tree, options, maxDepth }: any) {
    const [open, setOpen] = useState<Record<number, boolean>>(() => Object.fromEntries(tree.map((c: any) => [c.id, true])));
    const [editing, setEditing] = useState<any | null>(null);
    const [data, setData] = useState<any>(blank);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [drag, setDrag] = useState<{ id: number; parent: number | null } | null>(null);

    const edit = (c?: any, parentId?: number) => {
        setErrors({});
        setData(c ? { ...blank, ...Object.fromEntries(Object.keys(blank).map((k) => [k, c[k] ?? (blank as any)[k]])), parent_id: c.parent_id ?? '' } : { ...blank, parent_id: parentId ?? '' });
        setEditing(c ?? { parent_id: parentId });
    };
    const save = () => {
        setSaving(true);
        const payload = { ...data, parent_id: data.parent_id || null };
        const opts = { preserveScroll: true, onSuccess: () => setEditing(null), onError: setErrors, onFinish: () => setSaving(false) };
        editing?.id ? router.put(route('admin.categories.update', editing.id), payload, opts) : router.post(route('admin.categories.store'), payload, opts);
    };
    const reorder = (siblings: any[], from: number, to: number) => {
        const ids = siblings.map((s) => s.id);
        const [m] = ids.splice(ids.indexOf(from), 1);
        ids.splice(ids.indexOf(to), 0, m);
        router.post(route('admin.categories.reorder'), { ids }, { preserveScroll: true });
    };

    const Node = ({ c, siblings }: { c: any; siblings: any[] }) => (
        <li>
            <div
                draggable
                onDragStart={(e) => { e.stopPropagation(); setDrag({ id: c.id, parent: c.parent_id }); }}
                onDragOver={(e) => drag?.parent === c.parent_id && e.preventDefault()}
                onDrop={(e) => { e.stopPropagation(); if (drag && drag.id !== c.id && drag.parent === c.parent_id) reorder(siblings, drag.id, c.id); setDrag(null); }}
                className="group flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-porcelain"
                style={{ paddingLeft: (c.depth - 1) * 26 + 8 }}
            >
                <GripVertical className="size-4 shrink-0 cursor-grab text-ash opacity-0 group-hover:opacity-100" />
                <button onClick={() => setOpen({ ...open, [c.id]: !open[c.id] })} className={cn('rounded p-0.5 text-slate', !c.children.length && 'invisible')} aria-label="Toggle">
                    <ChevronRight className={cn('size-4 transition', open[c.id] && 'rotate-90')} />
                </button>
                <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-porcelain">{c.image_url && <img src={c.image_url} alt="" className="size-6 object-contain" />}</span>
                <button onClick={() => edit(c)} className="min-w-0 flex-1 text-left">
                    <span className={cn('font-medium', !c.is_active && 'text-ash line-through')}>{c.name}</span>
                    <span className="ml-2 text-xs text-slate">Level {c.depth} · {c.products_count} products</span>
                </button>
                <div className="flex items-center gap-1">
                    {c.show_on_home && <Badge tone="violet">Home</Badge>}
                    {!c.show_in_menu && <Badge>Hidden in menu</Badge>}
                    {c.depth < maxDepth && <button onClick={() => edit(undefined, c.id)} className="rounded-lg p-1.5 text-slate hover:bg-white hover:text-violet-700" title="Add sub-category"><FolderPlus className="size-4" /></button>}
                    <button onClick={() => edit(c)} className="rounded-lg p-1.5 text-slate hover:bg-white hover:text-onyx" title="Edit"><Pencil className="size-4" /></button>
                    <button onClick={() => confirm(`Delete “${c.name}”? Its products and sub-categories move up one level.`) && router.delete(route('admin.categories.destroy', c.id), { preserveScroll: true })} className="rounded-lg p-1.5 text-slate hover:bg-white hover:text-danger" title="Delete"><Trash2 className="size-4" /></button>
                </div>
            </div>
            {open[c.id] && c.children.length > 0 && <ul>{c.children.map((ch: any) => <Node key={ch.id} c={ch} siblings={c.children} />)}</ul>}
        </li>
    );

    return (
        <>
            <PageHeader title="Categories" description={`Build your category tree up to ${maxDepth} levels deep. Products can be placed at any level. Drag to reorder within the same level.`} actions={<Button size="sm" onClick={() => edit()}><Plus className="size-4" /> Add category</Button>} />
            <div className="rounded-2xl border border-mist bg-white p-3">
                {tree.length === 0 ? <p className="p-8 text-center text-sm text-slate">No categories yet.</p> : <ul>{tree.map((c: any) => <Node key={c.id} c={c} siblings={tree} />)}</ul>}
            </div>
            <Drawer open={!!editing} onClose={() => setEditing(null)} width="max-w-xl" title={editing?.id ? 'Edit category' : 'New category'} footer={<div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={saving}>Save category</Button></div>}>
                <div className="space-y-4 p-5">
                    <Input label="Name" required value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} error={errors.name} />
                    <Select label="Parent category" value={String(data.parent_id ?? '')} onChange={(e) => setData({ ...data, parent_id: e.target.value })} placeholder="— Top level —" options={options.filter((o: any) => o.depth < maxDepth && o.id !== editing?.id).map((o: any) => ({ value: o.id, label: o.label }))} error={errors.parent_id} />
                    <Input label="URL slug" value={data.slug} onChange={(e) => setData({ ...data, slug: e.target.value })} help="Leave empty to create from the name." error={errors.slug} />
                    <Textarea label="Description" rows={3} value={data.description ?? ''} onChange={(e) => setData({ ...data, description: e.target.value })} />
                    <div className="grid grid-cols-2 gap-4">
                        <ImageField label="Image (menu & tiles)" value={data.image} onChange={(v) => setData({ ...data, image: v })} folder="categories" aspect="aspect-square" />
                        <ImageField label="Banner (optional)" value={data.banner} onChange={(v) => setData({ ...data, banner: v })} folder="categories" aspect="aspect-square" />
                    </div>
                    <div className="space-y-3 rounded-2xl border border-mist p-4">
                        <Switch checked={data.is_active} onChange={(v) => setData({ ...data, is_active: v })} label="Visible on website" />
                        <Switch checked={data.show_in_menu} onChange={(v) => setData({ ...data, show_in_menu: v })} label="Show in main menu" />
                        <Switch checked={data.show_on_home} onChange={(v) => setData({ ...data, show_on_home: v })} label="Show in homepage “Shop by category”" />
                    </div>
                    <Input label="SEO title" value={data.meta_title ?? ''} onChange={(e) => setData({ ...data, meta_title: e.target.value })} />
                    <Textarea label="SEO description" rows={2} value={data.meta_description ?? ''} onChange={(e) => setData({ ...data, meta_description: e.target.value })} />
                </div>
            </Drawer>
        </>
    );
}
