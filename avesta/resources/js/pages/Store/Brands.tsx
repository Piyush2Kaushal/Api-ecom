import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { cn, route } from '@/lib/utils';

export default function Brands({ brands }: { brands: any[] }) {
    return (
        <div className="container-x py-12 md:py-16">
            <div className="eyebrow">Brands</div>
            <h1 className="mt-3 font-display text-[36px] font-semibold tracking-tight md:text-[48px]">The brands installers trust</h1>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {brands.map((b) => (
                    <Link key={b.id} href={route('brand.show', b.slug)} className={cn('group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-3xl p-7 transition', b.is_exclusive ? 'bg-noir text-white sm:col-span-2 lg:col-span-1 lg:row-span-2' : 'bg-porcelain hover:bg-violet-50')}>
                        {b.is_exclusive && b.banner_url && <img src={b.banner_url} alt="" className="absolute inset-0 size-full object-cover opacity-60 transition duration-700 group-hover:scale-105" />}
                        <div className="relative">
                            {b.is_exclusive && <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gold ring-1 ring-gold/30">Exclusive</span>}
                            {b.logo_url ? <img src={b.logo_url} alt={b.name} className="mt-4 h-10" /> : <div className="mt-4 font-display text-3xl font-semibold">{b.name}</div>}
                            {b.tagline && <p className={cn('mt-2 text-sm', b.is_exclusive ? 'text-white/65' : 'text-slate')}>{b.tagline}</p>}
                        </div>
                        <div className="relative mt-6 flex items-center justify-between text-sm font-semibold">
                            <span>{b.products_count} products</span>
                            <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
