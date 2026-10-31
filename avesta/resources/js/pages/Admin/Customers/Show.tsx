import { Link, router, useForm } from '@inertiajs/react';
import { Download, Trash2 } from 'lucide-react';
import { PageHeader } from '@/layouts/AdminLayout';
import { Badge, Button, Card, Checkbox, Input, Select, StatusBadge, Switch, Textarea } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { formatDate, route, tierLabel } from '@/lib/utils';

export default function CustomerShow({ customer, orders, invoices, stats, guest, linkedUser }: any) {
    const form = useForm({
        first_name: customer.first_name ?? '', last_name: customer.last_name ?? '', email: customer.email, phone: customer.phone ?? '', tier: customer.tier,
        company_name: customer.company_name ?? '', vat_number: customer.vat_number ?? '', company_number: customer.company_number ?? '',
        is_active: customer.is_active ?? true, admin_notes: customer.admin_notes ?? '', verified: !!customer.email_verified_at, notify_tier: true,
    });
    const name = guest ? customer.label : `${customer.first_name} ${customer.last_name ?? ''}`;
    return (
        <>
            <PageHeader
                back={{ href: route('admin.customers.index', guest ? { type: 'guests' } : {}), label: 'Customers' }}
                title={<span className="flex flex-wrap items-center gap-3">{name} {guest ? <Badge>Guest</Badge> : <Badge tone={customer.tier === 'retailer' ? 'neutral' : 'gold'}>{tierLabel[customer.tier]}</Badge>}</span>}
                description={`${customer.email}${guest ? '' : ` · Customer since ${formatDate(customer.created_at)}`}`}
                actions={!guest && <Button variant="outline" size="sm" onClick={() => confirm('Delete this customer? Their orders and invoices are kept.') && router.delete(route('admin.customers.destroy', customer.id))}><Trash2 className="size-4" /> Delete</Button>}
            />
            {guest && linkedUser && <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">This guest has since registered as <Link href={route('admin.customers.show', linkedUser.id)} className="font-semibold underline">{linkedUser.first_name} {linkedUser.last_name}</Link>. Their guest orders were linked to the account.</div>}
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[['Paid orders', stats.orders], ['Total spent', gbp(stats.spent)], ['Total saved', gbp(stats.saved)], ['Last order', formatDate(stats.last_order)]].map(([l, v]) => (
                    <div key={l} className="rounded-2xl border border-mist bg-white p-4"><div className="text-xs text-slate">{l}</div><div className="tabular mt-1.5 text-xl font-semibold">{v}</div></div>
                ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
                <div className="space-y-4">
                    <Card title={`Order history (${orders.length})`} padded={false}>
                        {orders.length === 0 ? <p className="p-5 text-sm text-slate">No orders yet.</p> : (
                            <table className="w-full text-sm">
                                <thead><tr className="border-b border-mist text-left text-[11px] font-semibold uppercase tracking-wider text-slate"><th className="px-5 py-3">Order</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Total</th></tr></thead>
                                <tbody className="divide-y divide-mist">
                                    {orders.map((o: any) => (
                                        <tr key={o.id} onClick={() => router.visit(route('admin.orders.show', o.id))} className="cursor-pointer hover:bg-porcelain/60">
                                            <td className="px-5 py-3"><div className="font-semibold">{o.number}</div><div className="text-xs text-slate">{formatDate(o.created_at, true)}{o.po_reference && ` · PO ${o.po_reference}`} · {tierLabel[o.customer_tier]} prices</div></td>
                                            <td className="tabular px-5 py-3">{o.items_count}</td>
                                            <td className="px-5 py-3"><StatusBadge status={o.status} label={o.status_label} /></td>
                                            <td className="tabular px-5 py-3 text-right font-semibold">{gbp(o.grand_total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                    <Card title="Invoices" padded={false}>
                        {invoices.length === 0 ? <p className="p-5 text-sm text-slate">No invoices yet.</p> : (
                            <ul className="divide-y divide-mist">
                                {invoices.map((i: any) => (
                                    <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                                        <span><span className="font-semibold">{i.number}</span> {i.type === 'credit_note' && <Badge tone="warning">Credit</Badge>}<span className="ml-2 text-slate">Order {i.order?.number} · {formatDate(i.issued_at)}</span></span>
                                        <span className="flex items-center gap-3"><span className="tabular font-semibold">{gbp(i.amount)}</span><a href={route('admin.invoices.download', i.id)} className="text-slate hover:text-onyx"><Download className="size-4" /></a></span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Card>
                    {!guest && customer.trade_applications?.length > 0 && (
                        <Card title="Trade applications" padded={false}>
                            <ul className="divide-y divide-mist">
                                {customer.trade_applications.map((a: any) => (
                                    <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                                        <span><span className="font-semibold">{tierLabel[a.requested_tier]}</span> — {a.company_name} <span className="text-slate">· {formatDate(a.created_at)}</span></span>
                                        <span className="flex items-center gap-2"><StatusBadge status={a.status} />{a.status === 'pending' && <Link href={route('admin.approvals.index')} className="text-xs font-semibold text-violet-700">Review</Link>}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                    {!guest && customer.addresses?.length > 0 && (
                        <Card title="Saved addresses">
                            <div className="grid gap-3 sm:grid-cols-2">
                                {customer.addresses.map((a: any) => <div key={a.id} className="rounded-xl bg-porcelain p-3 text-sm"><div className="font-semibold">{a.label || `${a.first_name} ${a.last_name ?? ''}`}</div><div className="text-slate">{a.line1}, {a.city} {a.postcode}</div></div>)}
                            </div>
                        </Card>
                    )}
                </div>
                {!guest ? (
                    <Card title="Account">
                        <form onSubmit={(e) => { e.preventDefault(); form.put(route('admin.customers.update', customer.id), { preserveScroll: true }); }} className="space-y-4">
                            <div className="rounded-2xl bg-violet-50 p-4">
                                <Select label="Price level / account type" value={form.data.tier} onChange={(e) => form.setData('tier', e.target.value)} options={Object.entries(tierLabel).map(([v, l]) => ({ value: v, label: l }))} help="Changes the prices this customer sees immediately." />
                                {form.data.tier !== customer.tier && <Checkbox className="mt-3" checked={form.data.notify_tier} onChange={(v) => form.setData('notify_tier', v)} label="Email the customer about this change" />}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="First name" value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} error={form.errors.first_name} />
                                <Input label="Last name" value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} />
                            </div>
                            <Input label="Email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                            <Input label="Phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                            <Input label="Company" value={form.data.company_name} onChange={(e) => form.setData('company_name', e.target.value)} />
                            <div className="grid grid-cols-2 gap-3">
                                <Input label="VAT no." value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} />
                                <Input label="Company no." value={form.data.company_number} onChange={(e) => form.setData('company_number', e.target.value)} />
                            </div>
                            <Switch checked={form.data.verified} onChange={(v) => form.setData('verified', v)} label="Email verified" />
                            <Switch checked={form.data.is_active} onChange={(v) => form.setData('is_active', v)} label="Account active" description="Disabled customers cannot sign in." />
                            <Textarea label="Internal notes" rows={3} value={form.data.admin_notes} onChange={(e) => form.setData('admin_notes', e.target.value)} />
                            <Button block loading={form.processing}>Save customer</Button>
                        </form>
                    </Card>
                ) : (
                    <Card title="Guest details">
                        <dl className="space-y-2 text-sm">
                            {[['Name', `${customer.first_name ?? ''} ${customer.last_name ?? ''}`], ['Email', customer.email], ['Phone', customer.phone], ['First seen', formatDate(customer.created_at)]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-slate">{k}</dt><dd className="font-medium">{v || '—'}</dd></div>)}
                        </dl>
                        <p className="mt-4 text-xs text-slate">If this guest registers with the same email, their past orders link to their new account automatically.</p>
                    </Card>
                )}
            </div>
        </>
    );
}
