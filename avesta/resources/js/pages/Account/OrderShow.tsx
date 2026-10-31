import { Link, router } from '@inertiajs/react';
import { ArrowLeft, FileDown, RotateCcw } from 'lucide-react';
import { AddressBlock, OrderHistory, OrderItems, OrderProgress, OrderTotals } from '@/components/store/OrderView';
import { Button, Card, StatusBadge } from '@/components/ui';
import { formatDate, route } from '@/lib/utils';

export default function OrderShow({ order }: any) {
    return (
        <div className="space-y-5">
            <Link href={route('account.orders')} className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-onyx"><ArrowLeft className="size-4" /> All orders</Link>
            <div className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-mist bg-white p-6">
                <div>
                    <div className="flex items-center gap-3"><h2 className="text-2xl font-semibold">{order.number}</h2><StatusBadge status={order.status} label={order.status_label} /></div>
                    <div className="mt-1 text-sm text-slate">Placed {formatDate(order.created_at, true)}{order.po_reference && ` · PO ${order.po_reference}`}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {order.invoices.map((i: any) => (
                        <Button key={i.id} variant="outline" size="sm" href={route('account.invoices.download', i.id)} external><FileDown className="size-4" /> {i.type === 'credit_note' ? 'Credit note' : 'Invoice'}</Button>
                    ))}
                    <Button size="sm" variant="dark" onClick={() => router.post(route('account.orders.reorder', order.number))}><RotateCcw className="size-4" /> Buy again</Button>
                </div>
            </div>
            <div className="rounded-3xl border border-mist bg-white p-6">
                <OrderProgress order={order} />
                {order.tracking_number && (
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-porcelain p-4 text-sm">
                        <span>{order.carrier} tracking: <strong>{order.tracking_number}</strong></span>
                        {order.tracking_url && <Button size="sm" href={order.tracking_url} external>Track parcel</Button>}
                    </div>
                )}
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                <Card title="Items">
                    <OrderItems order={order} />
                    <div className="mt-4 border-t border-mist pt-4"><OrderTotals order={order} /></div>
                </Card>
                <div className="space-y-5">
                    <Card><div className="space-y-5"><AddressBlock title="Delivery" a={order.shipping_address} /><AddressBlock title="Billing" a={order.billing_address} /></div></Card>
                    <Card title="Timeline"><OrderHistory history={order.history} /></Card>
                </div>
            </div>
        </div>
    );
}
