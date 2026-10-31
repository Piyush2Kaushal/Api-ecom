import { useMoney } from '@/hooks/useMoney';
import { useShared } from '@/hooks/useShared';
import { cn } from '@/lib/utils';
import type { PriceInfo } from '@/types';

const vatLabel = { included: 'inc. VAT', excluded: '+ VAT', none: 'No VAT' } as const;

export function Price({
    price,
    vatMode,
    size = 'md',
    showVat = false,
    showSaving = false,
    className,
}: {
    price: PriceInfo;
    vatMode?: 'included' | 'excluded' | 'none';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showVat?: boolean;
    showSaving?: boolean;
    className?: string;
}) {
    const money = useMoney();
    const { auth } = useShared();
    const isTrade = auth?.user && auth.user.tier !== 'retailer';
    const sizes = {
        sm: 'text-[15px]',
        md: 'text-[17px]',
        lg: 'text-2xl',
        xl: 'text-[34px] leading-none',
    };
    return (
        <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
            <span className={cn('tabular font-semibold tracking-tight text-onyx', sizes[size])}>{money(price.price)}</span>
            {price.has_discount && <span className={cn('tabular text-ash line-through', size === 'xl' ? 'text-lg' : 'text-[13px]')}>{money(price.original)}</span>}
            {showSaving && price.has_discount && (
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">Save {money(price.original - price.price)}</span>
            )}
            {showVat && vatMode && <span className="text-xs font-medium text-slate">{vatLabel[vatMode]}</span>}
            {isTrade && size !== 'sm' && (
                <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8a6a22]">{auth!.user!.tier === 'trader' ? 'Trade' : 'Wholesale'} price</span>
            )}
        </div>
    );
}
