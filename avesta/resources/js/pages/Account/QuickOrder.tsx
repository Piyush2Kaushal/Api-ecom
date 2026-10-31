import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Zap } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { route } from '@/lib/utils';

export default function QuickOrder() {
    const form = useForm({ rows: Array.from({ length: 5 }, () => ({ sku: '', quantity: 1 })) });
    const set = (i: number, k: 'sku' | 'quantity', v: any) => form.setData('rows', form.data.rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
    const paste = (text: string) => {
        const rows = text.split(/\r?\n/).map((l) => l.split(/[\t,;]+/)).filter((p) => p[0]?.trim()).map((p) => ({ sku: p[0].trim(), quantity: Math.max(1, parseInt(p[1] ?? '1', 10) || 1) }));
        if (rows.length) form.setData('rows', rows);
    };
    return (
        <Card title={<span className="flex items-center gap-2"><Zap className="size-4 text-violet-600" /> Quick order by SKU</span>}>
            <p className="mb-5 text-sm text-slate">Type SKUs and quantities, or paste from a spreadsheet (SKU, quantity on each line).</p>
            <textarea onPaste={(e) => { e.preventDefault(); paste(e.clipboardData.getData('text')); }} placeholder="Paste here: TV-IPD5-28, 4" rows={2} className="mb-5 w-full rounded-xl border border-dashed border-fog bg-porcelain/60 p-3 text-sm focus:border-violet-500 focus:outline-none" />
            <form onSubmit={(e) => { e.preventDefault(); form.post(route('cart.quick')); }}>
                <div className="space-y-2">
                    {form.data.rows.map((r, i) => (
                        <div key={i} className="flex gap-2">
                            <input value={r.sku} onChange={(e) => set(i, 'sku', e.target.value.toUpperCase())} placeholder="SKU" className="h-11 flex-1 rounded-xl border border-mist px-3.5 text-sm uppercase focus:border-violet-500 focus:outline-none" />
                            <input type="number" min={1} value={r.quantity} onChange={(e) => set(i, 'quantity', parseInt(e.target.value || '1', 10))} className="tabular h-11 w-24 rounded-xl border border-mist px-3 text-center text-sm focus:border-violet-500 focus:outline-none" aria-label="Quantity" />
                            <button type="button" onClick={() => form.setData('rows', form.data.rows.filter((_, j) => j !== i))} className="px-2 text-ash hover:text-danger" aria-label="Remove row"><Trash2 className="size-4" /></button>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Button type="button" variant="outline" onClick={() => form.setData('rows', [...form.data.rows, { sku: '', quantity: 1 }])}><Plus className="size-4" /> Add row</Button>
                    <Button loading={form.processing}>Add all to basket</Button>
                </div>
            </form>
        </Card>
    );
}
