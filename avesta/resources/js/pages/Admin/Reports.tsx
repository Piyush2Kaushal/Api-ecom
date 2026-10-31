import { router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '@/layouts/AdminLayout';
import { Button, Card, Input } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { route, tierLabel } from '@/lib/utils';

export default function Reports({ summary, byDay, byTier, byProduct, byBrand, byCoupon, filters }: any) {
    const [range, setRange] = useState(filters);
    const apply = (r = range) => router.get(route('admin.reports'), r, { preserveState: true });
    const quick = (days: number) => {
        const to = new Date();
        const from = new Date(Date.now() - (days - 1) * 864e5);
        const r = { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
        setRange(r);
        apply(r);
    };
    const kpis = [['Revenue', gbp(summary.revenue)], ['Net (excl. VAT)', gbp(summary.net)], ['VAT collected', gbp(summary.vat)], ['Orders', summary.orders], ['Items sold', summary.items], ['Discounts', gbp(summary.discounts)], ['Delivery', gbp(summary.shipping)], ['Refunds', gbp(summary.refunds)]];
    const Table = ({ head, rows }: { head: string[]; rows: any[][] }) => (
        <table className="w-full text-sm">
            <thead><tr className="border-b border-mist text-left text-[11px] font-semibold uppercase tracking-wider text-slate">{head.map((h, i) => <th key={h} className={`px-5 py-2.5 ${i ? 'text-right' : ''}`}>{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-mist">{rows.length ? rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={`px-5 py-2.5 ${j ? 'tabular text-right' : 'font-medium'}`}>{c}</td>)}</tr>) : <tr><td className="px-5 py-6 text-slate" colSpan={head.length}>No data for this period.</td></tr>}</tbody>
        </table>
    );
    return (
        <>
            <PageHeader title="Reports" description="Sales, VAT and product performance for any date range." actions={<Button variant="outline" size="sm" href={route('admin.reports', { ...filters, export: 'xlsx' })} external><Download className="size-4" /> Export products</Button>} />
            <div className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-mist bg-white p-4">
                <Input type="date" label="From" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
                <Input type="date" label="To" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
                <Button variant="dark" onClick={() => apply()}>Apply</Button>
                <div className="ml-auto flex gap-1.5">{[[7, '7 days'], [30, '30 days'], [90, '90 days'], [365, '12 months']].map(([d, l]) => <Button key={d} size="sm" variant="ghost" onClick={() => quick(d as number)}>{l}</Button>)}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {kpis.map(([l, v]) => <div key={l} className="rounded-2xl border border-mist bg-white p-4"><div className="text-xs text-slate">{l}</div><div className="tabular mt-1.5 text-xl font-semibold">{v}</div></div>)}
            </div>
            <Card title="Revenue by day" className="mt-4">
                <div className="h-64">
                    <ResponsiveContainer>
                        <BarChart data={byDay.map((d: any) => ({ ...d, total: Number(d.total) }))} margin={{ left: -10, right: 8 }}>
                            <CartesianGrid stroke="#EEEEF2" vertical={false} />
                            <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#9A9AA5' }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#9A9AA5' }} tickLine={false} axisLine={false} />
                            <Tooltip formatter={(v: any) => gbp(v)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                            <Bar dataKey="total" fill="#5B2BD9" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <Card title="By customer type" padded={false}><Table head={['Type', 'Orders', 'Revenue']} rows={byTier.map((t: any) => [tierLabel[t.customer_tier], t.orders, gbp(t.total)])} /></Card>
                <Card title="By brand" padded={false}><Table head={['Brand', 'Qty', 'Revenue']} rows={byBrand.map((b: any) => [b.brand, b.qty, gbp(b.revenue)])} /></Card>
                <Card title="Top products" padded={false}><Table head={['Product', 'Qty', 'Revenue']} rows={byProduct.map((p: any) => [p.name, p.qty, gbp(p.revenue)])} /></Card>
                <Card title="Coupons" padded={false}><Table head={['Code', 'Orders', 'Discount', 'Revenue']} rows={byCoupon.map((c: any) => [c.coupon_code, c.orders, gbp(c.discount), gbp(c.revenue)])} /></Card>
            </div>
        </>
    );
}
