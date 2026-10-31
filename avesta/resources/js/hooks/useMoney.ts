import { useCallback } from 'react';
import { useShared } from './useShared';

/** Formats GBP amounts in the visitor's chosen currency. */
export function useMoney() {
    const { settings, currency } = useShared();
    const current = settings?.currencies?.find((c) => c.code === currency) ?? { code: 'GBP', symbol: '£', rate: 1 };

    return useCallback(
        (amount: number | string | null | undefined, opts: { code?: string; rate?: number } = {}) => {
            const rate = opts.rate ?? current.rate ?? 1;
            const code = opts.code ?? current.code ?? 'GBP';
            const value = Number(amount ?? 0) * rate;
            return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code, minimumFractionDigits: 2 }).format(value);
        },
        [current.code, current.rate],
    );
}

export function gbp(amount: number | string | null | undefined, code = 'GBP', rate = 1) {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: code }).format(Number(amount ?? 0) * rate);
}
