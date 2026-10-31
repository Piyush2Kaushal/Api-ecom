import { useMoney } from '@/hooks/useMoney';
import { cn } from '@/lib/utils';
import type { CartSummary } from '@/types';

/** Price breakdown: tier price → discount → coupon → delivery → VAT. */
export function Totals({ summary, showShipping = true, className }: { summary: CartSummary; showShipping?: boolean; className?: string }) {
    const money = useMoney();
    const t = summary.totals;
    const vatRate = Number(t.vat_rate);
    const Row = ({ label, value, strong, accent }: { label: React.ReactNode; value: React.ReactNode; strong?: boolean; accent?: boolean }) => (
        <div className={cn('flex items-baseline justify-between gap-4', strong ? 'text-base font-semibold text-onyx' : 'text-[14px] text-carbon', accent && 'text-violet-700')}>
            <span>{label}</span>
            <span className="tabular">{value}</span>
        </div>
    );
    return (
        <div className={cn('space-y-2.5', className)}>
            <Row label={`Items (${t.item_count})`} value={money(t.items_subtotal)} />
            {t.savings > 0 && <Row label="Your savings" value={`−${money(t.savings)}`} accent />}
            {summary.coupon && t.coupon_discount > 0 && <Row label={`Coupon ${summary.coupon.code}`} value={`−${money(t.coupon_discount)}`} accent />}
            {showShipping && (
                <Row
                    label={summary.shipping_method ? `Delivery · ${summary.shipping_method.name}` : 'Delivery'}
                    value={summary.shipping_method ? (t.shipping > 0 ? money(t.shipping) : 'Free') : 'Calculated at checkout'}
                />
            )}
            <div className="my-3 border-t border-dashed border-fog" />
            <Row label="Total excl. VAT" value={money(t.net_total)} />
            <Row label={`VAT${vatRate ? ` (${vatRate}%)` : ''}`} value={money(t.vat_total)} />
            <div className="border-t border-mist pt-3">
                <Row label="Total" value={<span className="text-xl">{money(t.grand_total)}</span>} strong />
            </div>
            {t.included_vat > 0 && t.included_vat === t.vat_total && <p className="text-right text-xs text-slate">Prices include VAT</p>}
        </div>
    );
}
