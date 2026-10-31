import { useForm } from '@inertiajs/react';
import { FileDown, PackageSearch } from 'lucide-react';
import { AddressBlock, OrderHistory, OrderItems, OrderProgress, OrderTotals } from '@/components/store/OrderView';
import { Button, Input } from '@/components/ui';
import { formatDate, route } from '@/lib/utils';

export default function Track({ order, invoices, error, query }: { order: any; invoices: { number: string; type: string; url: string }[]; error: string | null; query: { number?: string; email?: string } }) {
    const form = useForm({ number: query.number ?? '', email: query.email ?? '' });
    return (
        <div className="container-x max-w-4xl py-12 md:py-16">
            <div className="text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><PackageSearch className="size-6" /></div>
                <h1 className="mt-5 font-display text-[34px] font-semibold tracking-tight">Track your order</h1>
                <p className="mt-2 text-slate">Enter your order number and the email used at checkout.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); form.get(route('track'), { preserveState: true }); }} className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <Input label="Order number" placeholder="AVS-100001" value={form.data.number} onChange={(e) => form.setData('number', e.target.value.toUpperCase())} required />
                <Input label="Email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required />
                <Button variant="dark" loading={form.processing}>Track</Button>
            </form>
            {error && <p className="mt-6 text-center text-sm font-medium text-danger">{error}</p>}
            {order && (
                <div className="mt-12 space-y-6">
                    <div className="rounded-3xl border border-mist p-6">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="text-lg font-semibold">{order.number}</div>
                                <div className="text-sm text-slate">Placed {formatDate(order.created_at)}</div>
                            </div>
                            {order.tracking_url && <Button href={order.tracking_url} external size="sm">Track parcel{order.carrier ? ` with ${order.carrier}` : ''}</Button>}
                        </div>
                        <OrderProgress order={order} />
                        {order.tracking_number && <p className="mt-4 text-sm text-slate">Tracking number: <span className="font-medium text-onyx">{order.tracking_number}</span></p>}
                    </div>
                    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
                        <div className="rounded-3xl border border-mist p-6">
                            <OrderItems order={order} />
                            <div className="mt-4 border-t border-mist pt-4"><OrderTotals order={order} /></div>
                        </div>
                        <div className="space-y-6 rounded-3xl border border-mist p-6">
                            <AddressBlock title="Delivery" a={order.shipping_address} />
                            {invoices.map((i) => (
                                <a key={i.number} href={i.url} className="flex items-center gap-2 text-sm font-semibold text-violet-700"><FileDown className="size-4" /> {i.type === 'credit_note' ? 'Credit note' : 'Invoice'} {i.number}</a>
                            ))}
                            <OrderHistory history={order.history} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
