import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Breadcrumbs({ items, className, tone = 'light' }: { items: { label: string; href?: string }[]; className?: string; tone?: 'light' | 'dark' }) {
    return (
        <nav aria-label="Breadcrumb" className={cn('flex flex-wrap items-center gap-1 text-[13px]', tone === 'dark' ? 'text-white/50' : 'text-slate', className)}>
            <Link href="/" className={tone === 'dark' ? 'hover:text-white' : 'hover:text-onyx'}>Home</Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                    <ChevronRight className="size-3.5 opacity-50" />
                    {item.href && i < items.length - 1 ? (
                        <Link href={item.href} className={tone === 'dark' ? 'hover:text-white' : 'hover:text-onyx'}>{item.label}</Link>
                    ) : (
                        <span className={tone === 'dark' ? 'text-white/80' : 'text-onyx'}>{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}
