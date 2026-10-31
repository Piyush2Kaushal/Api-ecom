import { Link } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, Clock, FileText, Package, PiggyBank, Wallet, XCircle } from 'lucide-react';
import { Badge, Button, Card, StatusBadge } from '@/components/ui';
import { useMoney } from '@/hooks/useMoney';
import { formatDate, route, tierLabel } from '@/lib/utils';

export default function Dashboard({ stats, recentOrders, application, profile }: any) {
    const money = useMoney();
    const tiles = [
        { label: 'Orders', value: stats.orders, icon: Package },
        { label: 'Total spent', value: money(stats.spent), icon: Wallet },
        { label: 'Total saved', value: money(stats.saved), icon: PiggyBank },
        { label: 'In progress', value: stats.open, icon: Clock },
    ];
    return (
        <div className="space-y-6">
            {application && application.status !== 'approved' && (
                <div className={`flex flex-wrap items-start gap-4 rounded-3xl p-5 ${application.status === 'rejected' ? 'bg-red-50 ring-1 ring-red-100' : 'bg-gold-soft ring-1 ring-[#eadcb8]'}`}>
                    {application.status === 'rejected' ? <XCircle className="size-6 text-danger" /> : <Clock className="size-6 text-[#8a6a22]" />}
                    <div className="flex-1">
                        <div className="font-semibold">{application.status === 'rejected' ? `${tierLabel[application.requested_tier]} application not approved` : `${tierLabel[application.requested_tier]} application under review`}</div>
                        <p className="mt-1 text-sm text-carbon">
                            {application.status === 'rejected'
                                ? `Reason: ${application.rejection_reason}. You can update your details and re-apply.`
                                : 'You are seeing retail prices for now. We will email you as soon as your account is upgraded — usually within one working day.'}
                        </p>
                    </div>
                    {application.status === 'rejected' && <Button size="sm" variant="dark" href={route('account.trade')}>Re-apply</Button>}
                </div>
            )}
            {profile.tier !== 'retailer' && (
                <div className="flex items-center gap-4 rounded-3xl bg-onyx p-5 text-white">
                    <BadgeCheck className="size-7 text-gold" />
                    <div className="flex-1">
                        <div className="font-semibold">{tierLabel[profile.tier]} pricing is active</div>
                        <div className="text-sm text-white/60">Your {profile.tier === 'trader' ? 'trade' : 'wholesale'} prices are shown across the store.</div>
                    </div>
                    <Button variant="gold" size="sm" href={route('account.quick-order')}>Quick order</Button>
                </div>
            )}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {tiles.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-2xl border border-mist bg-white p-5">
                        <Icon className="size-5 text-violet-600" strokeWidth={1.75} />
                        <div className="tabular mt-4 text-2xl font-semibold tracking-tight">{value}</div>
                        <div className="text-[13px] text-slate">{label}</div>
                    </div>
                ))}
            </div>
            <Card title="Recent orders" action={<Link href={route('account.orders')} className="text-sm font-semibold text-violet-700">View all</Link>} padded={false}>
                {recentOrders.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate">No orders yet. <Link href={route('shop')} className="font-semibold text-violet-700">Start shopping →</Link></div>
                ) : (
                    <ul className="divide-y divide-mist">
                        {recentOrders.map((o: any) => (
                            <li key={o.id}>
                                <Link href={route('account.orders.show', o.number)} className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-porcelain/60">
                                    <div className="min-w-[120px] flex-1">
                                        <div className="font-semibold">{o.number}</div>
                                        <div className="text-xs text-slate">{formatDate(o.created_at)} · {o.items_count} item(s){o.po_reference && ` · PO ${o.po_reference}`}</div>
                                    </div>
                                    <StatusBadge status={o.status} label={o.status_label} />
                                    <div className="tabular w-24 text-right font-semibold">{money(o.grand_total)}</div>
                                    <ArrowRight className="size-4 text-ash" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
            <div className="grid gap-4 md:grid-cols-3">
                {[
                    { title: 'Invoices', text: 'Download VAT invoices for every order.', href: route('account.invoices'), icon: FileText },
                    { title: 'Addresses', text: 'Save site and billing addresses.', href: route('account.addresses'), icon: Package },
                    { title: 'Trade account', text: profile.tier === 'retailer' ? 'Apply for trade or wholesale prices.' : 'View your trade status.', href: route('account.trade'), icon: BadgeCheck },
                ].map((c) => (
                    <Link key={c.title} href={c.href} className="group rounded-2xl border border-mist bg-white p-5 transition hover:border-violet-200">
                        <c.icon className="size-5 text-violet-600" />
                        <div className="mt-3 font-semibold">{c.title}</div>
                        <div className="text-sm text-slate">{c.text}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
