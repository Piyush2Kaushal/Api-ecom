import { Link, router } from '@inertiajs/react';
import { ClipboardList, FileDown, Search } from 'lucide-react';
import { useState } from 'react';
import { EmptyState, Pagination, StatusBadge } from '@/components/ui';
import { useMoney } from '@/hooks/useMoney';
import { formatDate, route } from '@/lib/utils';

export default function PurchaseOrders({ orders, filters }: any) {
    const money = useMoney();
    const [q, setQ] = useState(filters.q ?? '');
    return (
        <div className="rounded-3xl border border-mist bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mist p-5">
                <div>
                    <h2 className="text-lg font-semibold">Purchase orders</h2>
                    <p className="text-sm text-slate">Orders placed with your PO reference. Add a PO number at checkout.</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); router.get(route('account.purchase-orders'), { q }, { preserveState: true }); }} className="relative">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search PO number" className="h-10 w-56 rounded-xl border border-mist pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none" />
                </form>
            </div>
            {orders.data.length === 0 ? (
                <div className="p-6"><EmptyState icon={<ClipboardList className="size-6" />} title="No purchase orders yet" text="Enter your PO reference at checkout and it will be tracked here and printed on your invoice." /></div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left text-xs uppercase tracking-wider text-slate"><tr className="border-b border-mist"><th className="px-5 py-3 font-medium">PO reference</th><th className="px-5 py-3 font-medium">Order</th><th className="px-5 py-3 font-medium">Date</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 text-right font-medium">Total</th><th className="px-5 py-3" /></tr></thead>
                        <tbody className="divide-y divide-mist">
                            {orders.data.map((o: any) => (
                                <tr key={o.id}>
                                    <td className="px-5 py-4 font-semibold">{o.po_reference}</td>
                                    <td className="px-5 py-4"><Link href={route('account.orders.show', o.number)} className="text-violet-700">{o.number}</Link></td>
                                    <td className="px-5 py-4 text-slate">{formatDate(o.created_at)}</td>
                                    <td className="px-5 py-4"><StatusBadge status={o.status} label={o.status_label} /></td>
                                    <td className="tabular px-5 py-4 text-right font-semibold">{money(o.grand_total)}</td>
                                    <td className="px-5 py-4 text-right">{o.invoices?.[0] && <a href={route('account.invoices.download', o.invoices[0].id)} className="inline-flex items-center gap-1 text-violet-700"><FileDown className="size-4" /> Invoice</a>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination links={orders.links} className="p-5" />
        </div>
    );
}
