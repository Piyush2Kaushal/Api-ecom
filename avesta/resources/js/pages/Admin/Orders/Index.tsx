import { Link, router } from '@inertiajs/react';
import { Download, Search } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { Badge, Button, Pagination, StatusBadge } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { cn, formatDate, route, tierLabel } from '@/lib/utils';

export default function OrdersIndex({ orders, filters, statuses }: any) {
    const [q, setQ] = useState(filters.q ?? '');
    const go = (patch: any) => router.get(route('admin.orders.index'), { ...filters, ...patch }, { preserveState: true, replace: true });
    const tabs = [['', 'All'], ['open', 'To fulfil'], ['dispatched', 'Dispatched'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled'], ['refunded', 'Refunded']];
    return (
        <>
            <PageHeader
                title="Orders"
                description="Every order with payment, delivery and invoice details. Click an order to manage it."
                actions={<><Button variant="outline" size="sm" href={route('admin.orders.export', { ...filters, format: 'xlsx' })} external><Download className="size-4" /> Excel</Button><Button variant="outline" size="sm" href={route('admin.orders.export', { ...filters, format: 'csv' })} external><Download className="size-4" /> CSV</Button></>}
            />
            <div className="mb-4 flex flex-wrap gap-1.5">
                {tabs.map(([k, l]) => (
                    <button key={k} onClick={() => go({ status: k })} className={cn('rounded-full px-4 py-2 text-sm font-medium transition', (filters.status ?? '') === k ? 'bg-onyx text-white' : 'bg-white text-slate ring-1 ring-mist hover:text-onyx')}>{l}</button>
                ))}
            </div>
            <div className="rounded-2xl border border-mist bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b border-mist p-4">
                    <form onSubmit={(e) => { e.preventDefault(); go({ q }); }} className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order, email, PO, tracking…" className="h-10 w-72 rounded-xl border border-mist pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none" />
                    </form>
                    <select value={filters.tier ?? ''} onChange={(e) => go({ tier: e.target.value })} className="h-10 rounded-xl border border-mist px-3 pr-8 text-sm"><option value="">All price levels</option>{Object.entries(tierLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                    <select value={filters.type ?? ''} onChange={(e) => go({ type: e.target.value })} className="h-10 rounded-xl border border-mist px-3 pr-8 text-sm"><option value="">Guests & registered</option><option value="registered">Registered</option><option value="guest">Guests</option></select>
                    <input type="date" value={filters.from ?? ''} onChange={(e) => go({ from: e.target.value })} className="h-10 rounded-xl border border-mist px-3 text-sm" aria-label="From date" />
                    <input type="date" value={filters.to ?? ''} onChange={(e) => go({ to: e.target.value })} className="h-10 rounded-xl border border-mist px-3 text-sm" aria-label="To date" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-mist text-left text-[11px] font-semibold uppercase tracking-wider text-slate"><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3 text-right">Total</th></tr></thead>
                        <tbody className="divide-y divide-mist">
                            {orders.data.map((o: any) => (
                                <tr key={o.id} onClick={() => router.visit(route('admin.orders.show', o.id))} className="cursor-pointer hover:bg-porcelain/60">
                                    <td className="px-5 py-3.5"><div className="font-semibold">{o.number}</div><div className="text-xs text-slate">{formatDate(o.created_at, true)}{o.po_reference && ` · PO ${o.po_reference}`}</div></td>
                                    <td className="px-5 py-3.5"><div className="font-medium">{o.customer_label}</div><div className="flex items-center gap-1.5 text-xs text-slate">{o.user_id ? <Badge tone={o.customer_tier === 'retailer' ? 'neutral' : 'gold'}>{tierLabel[o.customer_tier]}</Badge> : <Badge>Guest</Badge>} {o.email}</div></td>
                                    <td className="tabular px-5 py-3.5 text-slate">{o.items_count}</td>
                                    <td className="px-5 py-3.5"><StatusBadge status={o.status} label={o.status_label} /></td>
                                    <td className="px-5 py-3.5 capitalize text-slate">{o.payment_status.replace('_', ' ')}</td>
                                    <td className="tabular px-5 py-3.5 text-right font-semibold">{gbp(o.grand_total)}{o.currency !== 'GBP' && <div className="text-xs font-normal text-slate">{gbp(o.grand_total, o.currency, Number(o.exchange_rate))}</div>}</td>
                                </tr>
                            ))}
                            {orders.data.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate">No orders match these filters.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <Pagination links={orders.links} className="border-t border-mist p-4" />
            </div>
        </>
    );
}
