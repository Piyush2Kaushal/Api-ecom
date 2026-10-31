import { clsx, type ClassValue } from 'clsx';
import { route as ziggyRoute } from 'ziggy-js';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

declare global {
    // eslint-disable-next-line no-var
    var Ziggy: any;
}

/** Laravel named routes in the browser (via @routes / Ziggy). */
export function route(name: string, params?: any, absolute = false): string {
    return ziggyRoute(name, params, absolute, (globalThis as any).Ziggy) as unknown as string;
}

export function formatDate(value?: string | null, withTime = false) {
    if (!value) return '—';
    const d = new Date(value);
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
}

export function plural(n: number, word: string, pluralWord?: string) {
    return `${n} ${n === 1 ? word : pluralWord ?? word + 's'}`;
}

export const tierLabel: Record<string, string> = {
    retailer: 'Retailer',
    trader: 'Trader',
    wholesaler: 'Wholesaler',
};

export function csrf(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null)?.content ?? '';
}

/** JSON fetch with CSRF + session cookies, for small background requests. */
export async function api<T = any>(url: string, options: { method?: string; body?: any } = {}): Promise<T> {
    const xsrf = decodeURIComponent(document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? '');
    const res = await fetch(url, {
        method: options.method ?? 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': xsrf,
        },
        credentials: 'same-origin',
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw Object.assign(new Error(data?.message ?? 'Request failed'), { status: res.status, data });
    return data as T;
}
