import { Link } from '@inertiajs/react';
import { Mail } from 'lucide-react';
import { PageHeader } from '@/layouts/AdminLayout';
import { EmptyState, Pagination } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { formatDate, route, tierLabel } from '@/lib/utils';
import { ShoppingBag } from 'lucide-react';

export default function AbandonedCarts({ carts }: any) {
    return (
        <>
            <PageHeader title="Abandoned baskets" description="Baskets with items left for over an hour without checking out. Reach out to customers who left an email — a quick message often wins the sale." />
            {carts.data.length === 0 ? <EmptyState icon={<ShoppingBag className="size-6" />} title="No abandoned baskets" /> : (
                <div className="overflow-x-auto rounded-2xl border border-mist bg-white">
                    <table className="w-full text-sm">
                        <thead><tr className="border-b border-mist text-left text-[11px] font-semibold uppercase tracking-wider text-slate"><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Value (retail)</th><th className="px-5 py-3">Last activity</th><th className="px-5 py-3" /></tr></thead>
                        <tbody className="divide-y divide-mist">
                            {carts.data.map((c: any) => (
                                <tr key={c.id}>
                                    <td className="px-5 py-3">{c.user_id ? <Link href={route('admin.customers.show', c.user_id)} className="font-semibold hover:text-violet-700">{c.customer}</Link> : <span className="font-semibold">{c.customer}</span>}<div className="text-xs text-slate">{c.email ?? 'No email captured'} · {tierLabel[c.tier]}</div></td>
                                    <td className="px-5 py-3 text-slate">{c.items.map((i: any) => `${i.quantity}× ${i.name}`).join(', ')}</td>
                                    <td className="tabular px-5 py-3 font-semibold">{gbp(c.value)}</td>
                                    <td className="px-5 py-3 text-slate">{formatDate(c.updated_at, true)}</td>
                                    <td className="px-5 py-3 text-right">{c.email && <a href={`mailto:${c.email}?subject=${encodeURIComponent('Your Avesta basket')}`} className="inline-flex items-center gap-1.5 font-semibold text-violet-700"><Mail className="size-4" /> Email</a>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Pagination links={carts.links} className="border-t border-mist p-4" />
                </div>
            )}
        </>
    );
}
