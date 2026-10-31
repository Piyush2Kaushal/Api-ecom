import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SectionHeading({ eyebrow, title, subtitle, link, linkLabel = 'View all', tone = 'light', className }: {
    eyebrow?: ReactNode; title: ReactNode; subtitle?: ReactNode; link?: string | null; linkLabel?: string; tone?: 'light' | 'dark'; className?: string;
}) {
    return (
        <div className={cn('mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10', className)}>
            <div className="max-w-2xl">
                {eyebrow && <div className={cn('eyebrow mb-3', tone === 'dark' && 'text-violet-300')}>{eyebrow}</div>}
                <h2 className={cn('text-[28px] font-semibold leading-[1.1] md:text-[38px]', tone === 'dark' ? 'text-white' : 'text-onyx')}>{title}</h2>
                {subtitle && <p className={cn('mt-3 text-[15px] leading-relaxed md:text-base', tone === 'dark' ? 'text-white/60' : 'text-slate')}>{subtitle}</p>}
            </div>
            {link && (
                <Link href={link} className={cn('group inline-flex items-center gap-1.5 text-sm font-semibold', tone === 'dark' ? 'text-white' : 'text-onyx')}>
                    {linkLabel}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
            )}
        </div>
    );
}
