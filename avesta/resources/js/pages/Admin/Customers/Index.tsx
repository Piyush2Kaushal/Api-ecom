import { Link, router } from '@inertiajs/react';
import { Download, Search } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { Badge, Button, Pagination } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { cn, formatDate, route, tierLabel } from '@/lib/utils';

export default function CustomersIndex({ customers, type, filters, counts }: any) {
    const [q, setQ] = useState(filters.q ?? '');
    const go = (patch: any) => router.get(route('admin.customers.index'), { type, ...filters, ...patch }, { preserveState: true, replace: true });
    const guests = type === 'guests';
    return (
        <>
            <PageHeader title="Customers" description="Registered customers and guests who checked out without an account." actions={<><Button variant="outline" size="sm" href={route('admin.customers.export', { format: 'xlsx' })} external><Download className="size-4" /> Excel</Button><Button variant="outline" size="sm" href={route('admin.customers.export', { format: 'csv' })} external><Download className="size-4" /> CSV</Button></>} />
            <div className="mb-4 flex gap-1.5">
                {[['registered', `Registered (${counts.registered})`], ['guests', `Guests (${counts.guests})`]].map(([k, l]) => (
                    <button key={k} onClick={() => router.get(route('admin.customers.index'), { type: k })} className={cn('rounded-full px-4 py-2 text-sm font-medium transition', type === k ? 'bg-onyx text-white' : 'bg-white text-slate ring-1 ring-mist hover:text-onyx')}>{l}</button>
                ))}
            </div>
            <div className="rounded-2xl border border-mist bg-white">
                <div className="flex flex-wrap gap-3 border-b border-mist p-4">
                    <form onSubmit={(e) => { e.preventDefault(); go({ q }); }} className="relative">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate" />
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, company, phone" className="h-10 w-72 rounded-xl border border-mist pl-9 pr-3 text-sm focus:border-violet-500 focus:outline-none" />
                    </form>
                    {!guests && (
                        <>
                            <select value={filters.tier ?? ''} onChange={(e) => go({ tier: e.target.value })} className="h-10 rounded-xl border border-mist px-3 pr-8 text-sm"><option value="">All account types</option>{Object.entries(tierLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
                            <select value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} className="h-10 rounded-xl border border-mist px-3 pr-8 text-sm"><option value="">Any status</option><option value="unverified">Email not verified</option><option value="disabled">Disabled</option></select>
                        </>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-mist text-left text-[11px] font-semibold uppercase tracking-wider text-slate"><th className="px-5 py-3">Customer</th><th className="px-5 py-3">{guests ? 'Phone' : 'Type'}</th><th className="px-5 py-3">Orders</th><th className="px-5 py-3">Spent</th><th className="px-5 py-3">{guests ? 'Last order' : 'Joined'}</th></tr></thead>
                        <tbody className="divide-y divide-mist">
                            {customers.data.map((c: any) => (
                                <tr key={c.id} onClick={() => router.visit(guests ? route('admin.customers.guest', c.id) : route('admin.customers.show', c.id))} className="cursor-pointer hover:bg-porcelain/60">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <span className={cn('flex size-9 items-center justify-center rounded-full text-xs font-bold', guests ? 'bg-porcelain text-slate' : 'bg-violet-50 text-violet-700')}>{guests ? 'G' : (c.first_name?.[0] ?? '?')}</span>
                                            <div>
                                                <div className="font-semibold">{guests ? c.label : c.name} {guests && c.user_id && <Badge tone="success">Now registered</Badge>}</div>
                                                <div className="text-xs text-slate">{guests ? `${c.first_name ?? ''} ${c.last_name ?? ''} · ` : ''}{c.email}{!guests && c.company_name && ` · ${c.company_name}`}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        {guests ? <span className="text-slate">{c.phone ?? '—'}</span> : (
                                            <div className="flex flex-wrap gap-1">
                                                <Badge tone={c.tier === 'retailer' ? 'neutral' : 'gold'}>{tierLabel[c.tier]}</Badge>
                                                {c.pending_application && <Badge tone="warning">{tierLabel[c.pending_application.requested_tier]} pending</Badge>}
                                                {!c.email_verified_at && <Badge>Unverified</Badge>}
                                                {!c.is_active && <Badge tone="danger">Disabled</Badge>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="tabular px-5 py-3.5">{c.orders_count}</td>
                                    <td className="tabular px-5 py-3.5 font-semibold">{gbp(c.spent ?? 0)}</td>
                                    <td className="px-5 py-3.5 text-slate">{formatDate(guests ? c.last_order_at : c.created_at)}</td>
                                </tr>
                            ))}
                            {customers.data.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate">No customers found.</td></tr>}
                        </tbody>
                    </table>
                </div>
                <Pagination links={customers.links} className="border-t border-mist p-4" />
            </div>
        </>
    );
}
