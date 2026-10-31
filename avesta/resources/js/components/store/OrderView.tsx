import { CheckCircle2, Circle, Package, Truck } from 'lucide-react';
import { gbp } from '@/hooks/useMoney';
import { cn, formatDate } from '@/lib/utils';

export function orderMoney(order: any) {
    return (v: any) => gbp(v, order.currency ?? 'GBP', Number(order.exchange_rate ?? 1));
}

export function OrderItems({ order }: { order: any }) {
    const m = orderMoney(order);
    return (
        <ul className="divide-y divide-mist">
            {order.items.map((i: any) => (
                <li key={i.id} className="flex gap-4 py-4">
                    <div className="size-16 shrink-0 rounded-xl bg-porcelain p-2">{i.image_url && <img src={i.image_url} alt="" className="size-full object-contain" />}</div>
                    <div className="min-w-0 flex-1 text-sm">
                        <div className="font-medium leading-snug">{i.name}</div>
                        <div className="mt-0.5 text-xs text-slate">
                            SKU {i.sku}
                            {i.variant_label && ` · ${i.variant_label}`} · Qty {i.quantity}
                        </div>
                        <div className="tabular mt-1 text-xs text-slate">
                            {m(i.unit_price)} each {Number(i.unit_original_price) > Number(i.unit_price) && <span className="line-through">{m(i.unit_original_price)}</span>}
                        </div>
                    </div>
                    <div className="tabular text-right text-sm font-semibold">
                        {m(i.line_total)}
                        <div className="text-[11px] font-normal text-slate">{i.vat_mode === 'none' ? 'No VAT' : `VAT ${m(i.line_vat)}`}</div>
                    </div>
                </li>
            ))}
        </ul>
    );
}

export function OrderTotals({ order }: { order: any }) {
    const m = orderMoney(order);
    const Row = ({ l, v, strong }: { l: string; v: string; strong?: boolean }) => (
        <div className={cn('flex justify-between', strong ? 'border-t border-mist pt-3 text-base font-semibold' : 'text-sm text-carbon')}>
            <span>{l}</span>
            <span className="tabular">{v}</span>
        </div>
    );
    return (
        <div className="space-y-2">
            <Row l="Items" v={m(order.items_subtotal)} />
            {Number(order.coupon_discount) > 0 && <Row l={`Coupon ${order.coupon_code}`} v={`−${m(order.coupon_discount)}`} />}
            <Row l={`Delivery${order.shipping_method_name ? ` · ${order.shipping_method_name}` : ''}`} v={Number(order.shipping_total) > 0 ? m(order.shipping_total) : 'Free'} />
            <Row l="Total excl. VAT" v={m(order.net_total)} />
            <Row l="VAT" v={m(order.vat_total)} />
            <Row l="Total" v={m(order.grand_total)} strong />
            {Number(order.refunded_total) > 0 && <Row l="Refunded" v={`−${m(order.refunded_total)}`} />}
            {Number(order.savings_total) > 0 && <p className="pt-1 text-right text-xs font-medium text-violet-700">You saved {m(order.savings_total)}</p>}
        </div>
    );
}

const countries: Record<string, string> = { GB: 'United Kingdom', IE: 'Ireland', FR: 'France', DE: 'Germany', NL: 'Netherlands', BE: 'Belgium', ES: 'Spain', IT: 'Italy', PT: 'Portugal', US: 'United States', AE: 'United Arab Emirates' };

export function AddressBlock({ title, a }: { title: string; a: any }) {
    if (!a) return null;
    return (
        <div className="text-sm leading-relaxed">
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">{title}</div>
            <div className="font-medium">{a.first_name} {a.last_name}</div>
            {a.company && <div>{a.company}</div>}
            <div>{a.line1}</div>
            {a.line2 && <div>{a.line2}</div>}
            <div>{a.city} {a.postcode}</div>
            {a.county && <div>{a.county}</div>}
            <div>{countries[a.country] ?? a.country}</div>
            {a.phone && <div className="text-slate">{a.phone}</div>}
        </div>
    );
}

const steps = [
    { key: 'paid', label: 'Order confirmed', icon: CheckCircle2 },
    { key: 'processing', label: 'Preparing', icon: Package },
    { key: 'dispatched', label: 'Dispatched', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

export function OrderProgress({ order }: { order: any }) {
    if (['cancelled', 'refunded', 'failed', 'pending_payment'].includes(order.status)) {
        return <div className="rounded-2xl bg-porcelain p-4 text-sm">Status: <strong>{order.status_label}</strong></div>;
    }
    const idx = Math.max(0, steps.findIndex((s) => s.key === (order.status === 'partially_refunded' ? 'delivered' : order.status)));
    return (
        <ol className="grid grid-cols-4 gap-2">
            {steps.map((s, i) => (
                <li key={s.key} className="relative">
                    <div className={cn('h-1 rounded-full', i <= idx ? 'bg-violet-600' : 'bg-mist')} />
                    <div className={cn('mt-3 flex items-center gap-1.5 text-xs font-semibold sm:text-sm', i <= idx ? 'text-onyx' : 'text-ash')}>
                        {i <= idx ? <s.icon className="size-4 text-violet-600" /> : <Circle className="size-4" />}
                        <span className="truncate">{s.label}</span>
                    </div>
                </li>
            ))}
        </ol>
    );
}

export function OrderHistory({ history }: { history: any[] }) {
    if (!history?.length) return null;
    return (
        <ol className="space-y-4 border-l border-mist pl-5">
            {history.map((h) => (
                <li key={h.id} className="relative">
                    <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-violet-600 ring-4 ring-white" />
                    <div className="text-sm font-medium capitalize">{h.status.replace(/_/g, ' ')}</div>
                    {h.note && <div className="text-sm text-slate">{h.note}</div>}
                    <div className="text-xs text-ash">{formatDate(h.created_at, true)}</div>
                </li>
            ))}
        </ol>
    );
}
