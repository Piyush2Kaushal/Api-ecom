import { Link } from '@inertiajs/react';
import { useShared } from '@/hooks/useShared';
import { cn } from '@/lib/utils';

export function LogoMark({ className, tone = 'dark' }: { className?: string; tone?: 'dark' | 'light' }) {
    const c = tone === 'dark' ? '#0A0A0F' : '#FFFFFF';
    return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
            <circle cx="24" cy="24" r="21" fill="none" stroke={c} strokeWidth="3.2" strokeDasharray="104 8 6 8" strokeLinecap="round" transform="rotate(118 24 24)" />
            <circle cx="24" cy="24" r="14.5" fill="none" stroke={c} strokeWidth="2.6" />
            <path d="M17.6 32 L24 15.5 L30.4 32 M20.2 26.4 H27.8" fill="none" stroke="#5B2BD9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function Logo({ tone = 'dark', className, withTagline = true }: { tone?: 'dark' | 'light'; className?: string; withTagline?: boolean }) {
    const { settings } = useShared();
    const img = tone === 'light' ? settings.logo_light_url ?? settings.logo_url : settings.logo_url;
    return (
        <Link href="/" className={cn('inline-flex items-center gap-2.5', className)} aria-label={settings.site_name}>
            {img ? (
                <img src={img} alt={settings.site_name} className="h-9 w-auto" />
            ) : (
                <>
                    <LogoMark className="size-8 shrink-0 sm:size-9" tone={tone} />
                    <span className="leading-none">
                        <span className={cn('block font-display text-[18px] sm:text-[21px] font-semibold tracking-[0.16em]', tone === 'dark' ? 'text-onyx' : 'text-white')}>
                            {settings.site_name?.toUpperCase()}
                        </span>
                        {withTagline && (
                            <span className={cn('mt-1 hidden text-[8.5px] sm:block font-semibold uppercase tracking-[0.26em]', tone === 'dark' ? 'text-slate' : 'text-violet-300')}>
                                {settings.site_tagline}
                            </span>
                        )}
                    </span>
                </>
            )}
        </Link>
    );
}
