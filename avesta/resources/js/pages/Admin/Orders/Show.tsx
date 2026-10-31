import { Link, router, useForm } from '@inertiajs/react';
import { CreditCard, Download, Eye, Mail, RotateCcw, Truck, User } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { AddressBlock, OrderHistory, OrderItems, OrderTotals } from '@/components/store/OrderView';
import { Badge, Button, Card, Checkbox, Input, Modal, Select, StatusBadge, Textarea } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { formatDate, route, tierLabel } from '@/lib/utils';

export default function OrderShow({ order, statuses, customerStats, canRefundOnline }: any) {
    const status = useForm({ status: order.status, note: '', notify: true, carrier: order.carrier ?? '', tracking_number: order.tracking_number ?? '', tracking_url: order.tracking_url ?? '' });
    const notes = useForm({ admin_notes: order.admin_notes ?? '' });
    const [refundOpen, setRefundOpen] = useState(false);
    const refund = useForm({ amount: (Number(order.grand_total) - Number(order.refunded_total)).toFixed(2), reason: '', restock: true });
    const customerHref = order.user_id ? route('admin.customers.show', order.user_id) : order.guest_customer_id ? route('admin.customers.guest', order.guest_customer_id) : null;
    const refundable = Number(order.grand_total) - Number(order.refunded_total);

    return (
        <>
            <PageHeader
                back={{ href: route('admin.orders.index'), label: 'Orders' }}
                title={<span className="flex flex-wrap items-center gap-3">{order.number} <StatusBadge status={order.status} label={order.status_label} /></span>}
                description={`Placed ${formatDate(order.created_at, true)}${order.paid_at ? ` · Paid ${formatDate(order.paid_at, true)} via ${order.payment_method}` : ''}`}
                actions={
                    <>
                        {!order.paid_at && <Button size="sm" variant="outline" onClick={() => confirm('Mark this order as paid (e.g. bank transfer received)?') && router.post(route('admin.orders.paid', order.id), {}, { preserveScroll: true })}><CreditCard className="size-4" /> Mark as paid</Button>}
                        {order.paid_at && <Button size="sm" variant="outline" onClick={() => router.post(route('admin.orders.resend', order.id), {}, { preserveScroll: true })}><Mail className="size-4" /> Resend confirmation</Button>}
                        {order.paid_at && refundable > 0 && <Button size="sm" variant="outline" onClick={() => setRefundOpen(true)}><RotateCcw className="size-4" /> Refund</Button>}
                    </>
                }
            />
            <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                    <Card title={`Items (${order.items.length})`}>
                        <OrderItems order={order} />
                        <div className="mt-4 border-t border-mist pt-4"><OrderTotals order={order} /></div>
                        {order.currency !== 'GBP' && <p className="mt-3 text-xs text-slate">Charged in {order.currency} at 1 GBP = {Number(order.exchange_rate)} {order.currency}. Base amount {gbp(order.grand_total)}.</p>}
                    </Card>

                    <Card title={<span className="flex items-center gap-2"><Truck className="size-4 text-violet-600" /> Update status & delivery</span>}>
                        <form onSubmit={(e) => { e.preventDefault(); status.post(route('admin.orders.status', order.id), { preserveScroll: true, onSuccess: () => status.setData('note', '') }); }} className="grid gap-4 sm:grid-cols-2">
                            <Select label="Order status" value={status.data.status} onChange={(e) => status.setData('status', e.target.value)} options={Object.entries(statuses).map(([v, l]) => ({ value: v, label: l as string }))} />
                            <Input label="Courier" placeholder="Royal Mail, DPD, DHL…" value={status.data.carrier} onChange={(e) => status.setData('carrier', e.target.value)} />
                            <Input label="Tracking number" value={status.data.tracking_number} onChange={(e) => status.setData('tracking_number', e.target.value)} />
                            <Input label="Tracking link" placeholder="https://…" value={status.data.tracking_url} onChange={(e) => status.setData('tracking_url', e.target.value)} error={status.errors.tracking_url} />
                            <Textarea label="Note (optional, included in the email)" rows={2} value={status.data.note} onChange={(e) => status.setData('note', e.target.value)} wrapperClassName="sm:col-span-2" />
                            <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                                <Checkbox checked={status.data.notify} onChange={(v) => status.setData('notify', v)} label="Email the customer about this update" />
                                <Button loading={status.processing}>Save update</Button>
                            </div>
                            {status.data.status === 'cancelled' && order.stock_deducted && <p className="text-xs text-warning sm:col-span-2">Cancelling returns the items to stock. Refund the payment separately with the Refund button.</p>}
                        </form>
                    </Card>

                    <Card title="Timeline"><OrderHistory history={order.history} /></Card>
                </div>

                <div className="space-y-4">
                    <Card title={<span className="flex items-center gap-2"><User className="size-4 text-violet-600" /> Customer</span>} action={customerHref && <Link href={customerHref} className="text-sm font-semibold text-violet-700">Open profile</Link>}>
                        <div className="text-sm">
                            <div className="flex items-center gap-2 font-semibold">{order.customer_label} {order.user_id ? <Badge tone={order.customer_tier === 'retailer' ? 'neutral' : 'gold'}>{tierLabel[order.customer_tier]}</Badge> : <Badge>Guest</Badge>}</div>
                            <a href={`mailto:${order.email}`} className="mt-1 block text-violet-700">{order.email}</a>
                            <div className="text-slate">{order.phone}</div>
                            {customerStats && <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-porcelain p-3 text-xs"><div><div className="text-slate">Paid orders</div><div className="tabular text-base font-semibold">{customerStats.orders}</div></div><div><div className="text-slate">Total spent</div><div className="tabular text-base font-semibold">{gbp(customerStats.spent)}</div></div></div>}
                        </div>
                    </Card>
                    <Card><div className="space-y-5"><AddressBlock title="Delivery address" a={order.shipping_address} /><AddressBlock title="Billing address" a={order.billing_address} /></div></Card>
                    <Card title="Order info">
                        <dl className="space-y-2 text-sm">
                            {[['PO reference', order.po_reference], ['Delivery', order.shipping_method_name], ['Coupon', order.coupon_code], ['Courier', order.carrier], ['Tracking', order.tracking_number], ['Stripe payment', order.stripe_payment_intent], ['IP address', order.ip_address]].filter(([, v]) => v).map(([k, v]) => (
                                <div key={k} className="flex justify-between gap-3"><dt className="text-slate">{k}</dt><dd className="truncate text-right font-medium">{v}</dd></div>
                            ))}
                        </dl>
                        {order.customer_notes && <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><div className="mb-1 text-xs font-semibold uppercase">Customer note</div>{order.customer_notes}</div>}
                    </Card>
                    <Card title="Invoices">
                        {order.invoices.length === 0 ? <p className="text-sm text-slate">An invoice is created when the order is paid.</p> : (
                            <ul className="space-y-2">
                                {order.invoices.map((i: any) => (
                                    <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
                                        <span><span className="font-semibold">{i.number}</span> {i.type === 'credit_note' && <Badge tone="warning">Credit</Badge>}</span>
                                        <span className="flex gap-1">
                                            <a href={route('admin.invoices.view', i.id)} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-slate hover:bg-porcelain" title="View"><Eye className="size-4" /></a>
                                            <a href={route('admin.invoices.download', i.id)} className="rounded-lg p-1.5 text-slate hover:bg-porcelain" title="Download"><Download className="size-4" /></a>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                    <Card title="Internal notes">
                        <Textarea rows={3} value={notes.data.admin_notes} onChange={(e) => notes.setData('admin_notes', e.target.value)} placeholder="Only visible to admins" />
                        <Button size="sm" variant="dark" className="mt-3" loading={notes.processing} onClick={() => notes.post(route('admin.orders.notes', order.id), { preserveScroll: true })}>Save note</Button>
                    </Card>
                </div>
            </div>

            <Modal open={refundOpen} onClose={() => setRefundOpen(false)} title="Refund order" description={`Up to ${gbp(refundable)} can be refunded.`} footer={<><Button variant="ghost" onClick={() => setRefundOpen(false)}>Cancel</Button><Button variant="danger" loading={refund.processing} onClick={() => refund.post(route('admin.orders.refund', order.id), { preserveScroll: true, onSuccess: () => setRefundOpen(false) })}>Refund {gbp(refund.data.amount)}</Button></>}>
                <div className="space-y-4">
                    <Input label="Amount (£)" type="number" step="0.01" value={refund.data.amount} onChange={(e) => refund.setData('amount', e.target.value)} error={refund.errors.amount} />
                    <Input label="Reason" value={refund.data.reason} onChange={(e) => refund.setData('reason', e.target.value)} placeholder="e.g. Item returned" />
                    <Checkbox checked={refund.data.restock} onChange={(v) => refund.setData('restock', v)} label="Return items to stock" />
                    <p className="text-xs text-slate">{canRefundOnline ? 'The money is returned to the customer\'s card through Stripe automatically.' : 'This order was not paid through Stripe — refund the customer manually; we will record it and issue a credit note.'}</p>
                </div>
            </Modal>
        </>
    );
}
