import { Link, router, usePage } from '@inertiajs/react';
import {
    BarChart3, BadgeCheck, Boxes, ChevronDown, ExternalLink, FileText, FolderTree, GraduationCap, Image as ImageIcon, LayoutDashboard, LayoutTemplate,
    LogOut, Mail, Menu, MessageSquare, Package, Percent, Settings, ShoppingCart, Star, Tag, Truck, Users, X, Link2, Navigation, Megaphone, ShoppingBag, UserCog,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { LogoMark } from '@/components/store/Logo';
import { Toaster } from '@/components/store/Toaster';
import { useShared } from '@/hooks/useShared';
import { cn, route } from '@/lib/utils';

type NavItem = { label: string; route: string; icon: any; counter?: string; match?: string };
type NavGroup = { label: string; items: NavItem[] };

const groups: NavGroup[] = [
    { label: '', items: [{ label: 'Dashboard', route: 'admin.dashboard', icon: LayoutDashboard, match: '/admin' }] },
    {
        label: 'Sales',
        items: [
            { label: 'Orders', route: 'admin.orders.index', icon: ShoppingCart, counter: 'orders', match: '/admin/orders' },
            { label: 'Invoices', route: 'admin.invoices.index', icon: FileText },
            { label: 'Abandoned baskets', route: 'admin.orders.abandoned', icon: ShoppingBag },
            { label: 'Coupons', route: 'admin.coupons.index', icon: Percent },
            { label: 'Reports', route: 'admin.reports', icon: BarChart3 },
        ],
    },
    {
        label: 'Catalogue',
        items: [
            { label: 'Products', route: 'admin.products.index', icon: Package, counter: 'low_stock', match: '/admin/products' },
            { label: 'Categories', route: 'admin.categories.index', icon: FolderTree },
            { label: 'Brands', route: 'admin.brands.index', icon: Tag },
            { label: 'Reviews', route: 'admin.reviews.index', icon: Star },
        ],
    },
    {
        label: 'Customers',
        items: [
            { label: 'Customers', route: 'admin.customers.index', icon: Users, match: '/admin/customers' },
            { label: 'Trade approvals', route: 'admin.approvals.index', icon: BadgeCheck, counter: 'approvals' },
            { label: 'Enquiries', route: 'admin.enquiries.index', icon: MessageSquare, counter: 'enquiries' },
            { label: 'Training', route: 'admin.training.index', icon: GraduationCap, counter: 'training', match: '/admin/training' },
            { label: 'Newsletter', route: 'admin.newsletter.index', icon: Mail },
        ],
    },
    {
        label: 'Website',
        items: [
            { label: 'Homepage', route: 'admin.home_sections.index', icon: LayoutTemplate },
            { label: 'Hero slides', route: 'admin.hero_slides.index', icon: ImageIcon },
            { label: 'Pages', route: 'admin.pages.index', icon: FileText, match: '/admin/pages' },
            { label: 'Menus', route: 'admin.menu_items.index', icon: Navigation },
            { label: 'Popups', route: 'admin.popups.index', icon: Megaphone },
            { label: 'Redirects', route: 'admin.redirects.index', icon: Link2 },
        ],
    },
    {
        label: 'Setup',
        items: [
            { label: 'Shipping', route: 'admin.shipping_zones.index', icon: Truck, match: '/admin/shipping' },
            { label: 'Settings', route: 'admin.settings', icon: Settings },
            { label: 'Admin account', route: 'admin.account', icon: UserCog },
        ],
    },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { admin, counters, settings } = useShared();
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    useEffect(() => setOpen(false), [url]);
    useEffect(() => {
        const h = document.querySelector('main h1')?.textContent;
        document.title = `${h ? h + ' · ' : ''}${settings.site_name} Admin`;
    }, [url, settings.site_name]);

    const path = url.split('?')[0];
    const isActive = (item: NavItem) => {
        const target = item.match ?? new URL(route(item.route), window.location.origin).pathname;
        return target === '/admin' ? path === '/admin' : path === target || path.startsWith(target + '/') || path.startsWith(target + '-');
    };

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
                <LogoMark className="size-8" tone="light" />
                <div className="leading-none">
                    <div className="font-display text-[15px] font-semibold tracking-[0.14em] text-white">{settings.site_name?.toUpperCase()}</div>
                    <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-violet-300">Admin</div>
                </div>
            </div>
            <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6 pt-2 scrollbar-none">
                {groups.map((g) => (
                    <div key={g.label}>
                        {g.label && <div className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/30">{g.label}</div>}
                        <ul className="space-y-0.5">
                            {g.items.map((item) => {
                                const active = isActive(item);
                                const count = item.counter ? counters?.[item.counter] : 0;
                                return (
                                    <li key={item.route}>
                                        <Link
                                            href={route(item.route)}
                                            className={cn(
                                                'group flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition',
                                                active ? 'bg-white/10 text-white' : 'text-white/55 hover:bg-white/5 hover:text-white',
                                            )}
                                        >
                                            <item.icon className={cn('size-[18px]', active ? 'text-violet-300' : 'text-white/40 group-hover:text-white/70')} strokeWidth={1.75} />
                                            <span className="flex-1">{item.label}</span>
                                            {!!count && (
                                                <span className={cn('tabular rounded-full px-1.5 py-px text-[10.5px] font-bold', item.counter === 'low_stock' ? 'bg-amber-400/15 text-amber-300' : 'bg-violet-500 text-white')}>
                                                    {count}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
            <div className="border-t border-white/10 p-3">
                <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/55 transition hover:bg-white/5 hover:text-white">
                    <ExternalLink className="size-4" /> View website
                </a>
                <button onClick={() => router.post(route('admin.logout'))} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] text-white/55 transition hover:bg-white/5 hover:text-white">
                    <LogOut className="size-4" /> Sign out
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F6F6F8]">
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] bg-onyx lg:block">{sidebar}</aside>
            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-onyx/50" onClick={() => setOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-[260px] bg-onyx">{sidebar}</aside>
                    <button onClick={() => setOpen(false)} className="absolute left-[272px] top-4 rounded-full bg-white p-2" aria-label="Close menu">
                        <X className="size-5" />
                    </button>
                </div>
            )}
            <div className="lg:pl-[248px]">
                <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-mist bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
                    <button onClick={() => setOpen(true)} className="-ml-1 rounded-lg p-2 lg:hidden" aria-label="Open menu">
                        <Menu className="size-5" />
                    </button>
                    <div className="flex-1" />
                    <Link href={route('admin.account')} className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition hover:bg-porcelain">
                        <span className="flex size-8 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">{admin?.name?.[0] ?? 'A'}</span>
                        <span className="hidden text-sm font-medium sm:block">{admin?.name}</span>
                        <ChevronDown className="size-4 text-slate" />
                    </Link>
                </header>
                <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
            </div>
            <Toaster />
        </div>
    );
}

export function PageHeader({ title, description, actions, back }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
    return (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
                {back && (
                    <Link href={back.href} className="mb-2 inline-flex items-center gap-1 text-[13px] font-medium text-slate hover:text-onyx">
                        ← {back.label}
                    </Link>
                )}
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description && <p className="mt-1 max-w-3xl text-sm text-slate">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
    );
}

export { Boxes };
