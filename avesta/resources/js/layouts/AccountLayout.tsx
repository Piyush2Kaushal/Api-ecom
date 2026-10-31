import { Link, router, usePage } from '@inertiajs/react';
import { Building2, ClipboardList, FileText, Heart, LayoutDashboard, LogOut, MapPin, MessageSquare, Package, Settings, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useShared } from '@/hooks/useShared';
import { cn, route, tierLabel } from '@/lib/utils';

const items = [
    { label: 'Overview', route: 'account.dashboard', icon: LayoutDashboard },
    { label: 'Orders', route: 'account.orders', icon: Package },
    { label: 'Invoices', route: 'account.invoices', icon: FileText },
    { label: 'Purchase orders', route: 'account.purchase-orders', icon: ClipboardList },
    { label: 'Quick order', route: 'account.quick-order', icon: Zap },
    { label: 'Wishlist', route: 'account.wishlist', icon: Heart },
    { label: 'Addresses', route: 'account.addresses', icon: MapPin },
    { label: 'Trade account', route: 'account.trade', icon: Building2 },
    { label: 'Enquiries', route: 'account.enquiries', icon: MessageSquare },
    { label: 'Profile & settings', route: 'account.profile', icon: Settings },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
    const { auth } = useShared();
    const { url } = usePage();
    const user = auth?.user;
    const isActive = (name: string) => {
        const path = new URL(route(name), window.location.origin).pathname;
        return path === '/account' ? url === '/account' : url.startsWith(path);
    };

    return (
        <div className="bg-porcelain/60">
            <div className="container-x py-8 md:py-12">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="eyebrow">My account</div>
                        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Hello, {user?.first_name}</h1>
                    </div>
                    {user && (
                        <div className="flex items-center gap-2">
                            <span className={cn('rounded-full px-3 py-1.5 text-xs font-semibold', user.tier === 'retailer' ? 'bg-white text-carbon ring-1 ring-mist' : 'bg-onyx text-gold')}>
                                {tierLabel[user.tier]} account
                            </span>
                            {user.pending_tier && <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">{tierLabel[user.pending_tier]} pending approval</span>}
                        </div>
                    )}
                </div>
                <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
                    <aside>
                        <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-2 scrollbar-none lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
                            {items.map(({ label, route: r, icon: Icon }) => (
                                <Link
                                    key={r}
                                    href={route(r)}
                                    className={cn(
                                        'flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition',
                                        isActive(r) ? 'bg-white text-onyx shadow-soft ring-1 ring-mist' : 'text-slate hover:bg-white hover:text-onyx',
                                    )}
                                >
                                    <Icon className={cn('size-[18px]', isActive(r) && 'text-violet-600')} />
                                    {label}
                                </Link>
                            ))}
                            <button onClick={() => router.post(route('logout'))} className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate transition hover:bg-white hover:text-danger">
                                <LogOut className="size-[18px]" />
                                Sign out
                            </button>
                        </nav>
                    </aside>
                    <div className="min-w-0">{children}</div>
                </div>
            </div>
        </div>
    );
}
