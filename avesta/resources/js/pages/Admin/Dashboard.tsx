import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, BadgeCheck, GraduationCap, MessageSquare, Package, ShoppingCart, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '@/layouts/AdminLayout';
import { Card, StatusBadge } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { cn, formatDate, route, tierLabel } from '@/lib/utils';

const tierColor: Record<string, string> = { retailer: '#5B2BD9', trader: '#C8A55A', wholesaler: '#0A0A0F' };

export default function Dashboard({ kpis, chart, tierSplit, recentOrders, toFulfil, pending, topProducts, lowStock }: any) {
    const tiles = [
        { label: 'Revenue today', value: gbp(kpis.today), sub: `${kpis.today_orders} order(s)` },
        { label: 'This week', value: gbp(kpis.week) },
        { label: 'This month', value: gbp(kpis.month), sub: `${kpis.month_orders} orders`, change: kpis.month_change },
        { label: 'Avg. order value (30d)', value: gbp(kpis.aov) },
    ];
    const totalTier = tierSplit.reduce((s: number, t: any) => s + Number(t.total), 0) || 1;
    return (
        <>
            <PageHeader title="Dashboard" description={`Welcome back. Here's how the store is doing — ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}.`} />
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {tiles.map((t) => (
                    <div key={t.label} className="rounded-2xl border border-mist bg-white p-5">
                        <div className="text-[13px] text-slate">{t.label}</div>
                        <div className="tabular mt-2 text-[26px] font-semibold tracking-tight">{t.value}</div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-slate">
                            {t.change != null && (
                                <span className={cn('inline-flex items-center gap-0.5 font-semibold', t.change >= 0 ? 'text-success' : 'text-danger')}>
                                    {t.change >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}{Math.abs(t.change)}%
                                </span>
                            )}
                            {t.sub}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
                {[
                    { label: 'To fulfil', value: toFulfil, href: route('admin.orders.index', { status: 'open' }), icon: ShoppingCart, alert: toFulfil > 0 },
                    { label: 'Trade approvals', value: pending.approvals, href: route('admin.approvals.index'), icon: BadgeCheck, alert: pending.approvals > 0 },
                    { label: 'New enquiries', value: pending.enquiries, href: route('admin.enquiries.index', { status: 'new' }), icon: MessageSquare, alert: pending.enquiries > 0 },
                    { label: 'Training requests', value: pending.training, href: route('admin.training.index', { status: 'new' }), icon: GraduationCap, alert: pending.training > 0 },
                    { label: 'Customers', value: kpis.customers, href: route('admin.customers.index'), icon: Users, sub: `${kpis.trade_customers} trade · +${kpis.new_customers} this month` },
                ].map((a) => (
                    <Link key={a.label} href={a.href} className={cn('group rounded-2xl border bg-white p-4 transition hover:shadow-soft', a.alert ? 'border-violet-200' : 'border-mist')}>
                        <div className="flex items-center justify-between">
                            <a.icon className={cn('size-5', a.alert ? 'text-violet-600' : 'text-slate')} />
                            {a.alert && <span className="size-2 rounded-full bg-violet-600" />}
                        </div>
                        <div className="tabular mt-3 text-xl font-semibold">{a.value}</div>
                        <div className="text-xs text-slate">{a.sub ?? a.label}</div>
                    </Link>
                ))}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <Card title="Sales — last 30 days" className="xl:col-span-2">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chart} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                                <defs>
                                    {Object.entries(tierColor).map(([k, c]) => (
                                        <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.28} /><stop offset="100%" stopColor={c} stopOpacity={0} /></linearGradient>
                                    ))}
                                </defs>
                                <CartesianGrid stroke="#EEEEF2" vertical={false} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9A9AA5' }} tickLine={false} axisLine={false} interval={4} />
                                <YAxis tick={{ fontSize: 11, fill: '#9A9AA5' }} tickLine={false} axisLine={false} tickFormatter={(v) => `£${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                                <Tooltip formatter={(v: any, n: any) => [gbp(v), tierLabel[n] ?? n]} contentStyle={{ borderRadius: 12, border: '1px solid #E7E7EC', fontSize: 12 }} />
                                {Object.entries(tierColor).map(([k, c]) => <Area key={k} type="monotone" dataKey={k} stackId="1" stroke={c} strokeWidth={2} fill={`url(#g-${k})`} />)}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate">
                        {Object.entries(tierColor).map(([k, c]) => <span key={k} className="flex items-center gap-1.5"><span className="size-2.5 rounded-full" style={{ background: c }} /> {tierLabel[k]}</span>)}
                    </div>
                </Card>
                <Card title="This month by customer type">
                    {tierSplit.length === 0 ? <p className="text-sm text-slate">No sales yet this month.</p> : (
                        <div className="space-y-4">
                            {tierSplit.map((t: any) => (
                                <div key={t.customer_tier}>
                                    <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{tierLabel[t.customer_tier]}</span><span className="tabular">{gbp(t.total)} · {t.orders}</span></div>
                                    <div className="h-2 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full" style={{ width: `${(Number(t.total) / totalTier) * 100}%`, background: tierColor[t.customer_tier] }} /></div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="mt-6 border-t border-mist pt-4">
                        <div className="mb-3 text-sm font-semibold">Top products (30 days)</div>
                        {topProducts.length === 0 ? <p className="text-sm text-slate">No sales yet.</p> : (
                            <ul className="space-y-2.5">
                                {topProducts.map((p: any) => (
                                    <li key={p.name} className="flex items-center justify-between gap-3 text-sm"><span className="truncate">{p.name}</span><span className="tabular shrink-0 text-slate">{p.qty} · {gbp(p.revenue)}</span></li>
                                ))}
                            </ul>
                        )}
                    </div>
                </Card>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <Card title="Recent orders" className="xl:col-span-2" padded={false} action={<Link href={route('admin.orders.index')} className="text-sm font-semibold text-violet-700">All orders</Link>}>
                    {recentOrders.length === 0 ? <p className="p-5 text-sm text-slate">No orders yet.</p> : (
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-mist">
                                {recentOrders.map((o: any) => (
                                    <tr key={o.id} className="hover:bg-porcelain/60">
                                        <td className="px-5 py-3"><Link href={route('admin.orders.show', o.id)} className="font-semibold hover:text-violet-700">{o.number}</Link><div className="text-xs text-slate">{formatDate(o.created_at, true)}</div></td>
                                        <td className="px-5 py-3">{o.customer_label}<div className="text-xs capitalize text-slate">{o.user_id ? o.customer_tier : 'Guest'}</div></td>
                                        <td className="px-5 py-3"><StatusBadge status={o.status} label={o.status_label} /></td>
                                        <td className="tabular px-5 py-3 text-right font-semibold">{gbp(o.grand_total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
                <Card title={<span className="flex items-center gap-2"><AlertTriangle className="size-4 text-warning" /> Low stock</span>} padded={false} action={<Link href={route('admin.products.index', { stock: 'low' })} className="text-sm font-semibold text-violet-700">View all</Link>}>
                    {lowStock.length === 0 ? <p className="p-5 text-sm text-slate">All products are well stocked.</p> : (
                        <ul className="divide-y divide-mist">
                            {lowStock.map((p: any) => (
                                <li key={p.id}><Link href={route('admin.products.edit', p.id)} className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-porcelain/60"><span className="min-w-0"><span className="block truncate font-medium">{p.name}</span><span className="text-xs text-slate">{p.sku}</span></span><span className={cn('tabular shrink-0 rounded-lg px-2 py-0.5 text-xs font-bold', p.stock_qty <= 0 ? 'bg-red-50 text-danger' : 'bg-amber-50 text-amber-700')}>{p.stock_qty}</span></Link></li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </>
    );
}

export { Package };
