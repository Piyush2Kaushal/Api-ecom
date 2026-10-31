import { Link, router } from '@inertiajs/react';
import { Download, Eye, Search } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { Badge, Pagination } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { formatDate, route } from '@/lib/utils';

export default function Invoices({ invoices, filters }: any) {
    const [q, setQ] = useState(filters.q ?? '');
    return (
        <>
            <PageHeader title="Invoices" description="VAT invoices are created automatically when an order is paid. Credit notes are created for refunds." />
            <div className="rounded-2xl border border-mist bg-white">
                <div className="flex flex-wrap gap-3 border-b border-mist p-4">
                    <form onSubmit={(e) => { e.preventDefault(); router.get(route('admin.invoices.index'), { ...filters, q }, { preserveState: true }); }} className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Invoice, order or email" className="h-10 w-64 rounded-xl border border-mist pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none" />
                    </form>
                    <select value={filters.type ?? ''} onChange={(e) => router.get(route('admin.invoices.index'), { ...filters, type: e.target.value }, { preserveState: true })} className="h-10 rounded-xl border border-mist px-3 pr-8 text-sm">
                        <option value="">All documents</option><option value="invoice">Invoices</option><option value="credit_note">Credit notes</option>
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-mist text-left text-[11px] font-semibold uppercase tracking-wider text-slate"><th className="px-5 py-3">Number</th><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3" /></tr></thead>
                        <tbody className="divide-y divide-mist">
                            {invoices.data.map((i: any) => (
                                <tr key={i.id} className="hover:bg-porcelain/60">
                                    <td className="px-5 py-3 font-semibold">{i.number} {i.type === 'credit_note' && <Badge tone="warning">Credit</Badge>}</td>
                                    <td className="px-5 py-3"><Link href={route('admin.orders.show', i.order_id)} className="text-violet-700">{i.order?.number}</Link></td>
                                    <td className="px-5 py-3 text-slate">{i.order?.customer_label} · {i.order?.email}</td>
                                    <td className="px-5 py-3 text-slate">{formatDate(i.issued_at)}</td>
                                    <td className="tabular px-5 py-3 text-right font-semibold">{gbp(i.amount, i.order?.currency, Number(i.order?.exchange_rate ?? 1))}</td>
                                    <td className="whitespace-nowrap px-5 py-3 text-right">
                                        <a href={route('admin.invoices.view', i.id)} target="_blank" rel="noreferrer" className="inline-flex rounded-lg p-2 text-slate hover:bg-porcelain" title="View"><Eye className="size-4" /></a>
                                        <a href={route('admin.invoices.download', i.id)} className="inline-flex rounded-lg p-2 text-slate hover:bg-porcelain" title="Download"><Download className="size-4" /></a>
                                    </td>
                                </tr>
                            ))}
                            {invoices.data.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate">No invoices yet.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <Pagination links={invoices.links} className="border-t border-mist p-4" />
            </div>
        </>
    );
}
