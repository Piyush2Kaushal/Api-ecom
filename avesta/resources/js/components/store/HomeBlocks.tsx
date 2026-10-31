import { Link, useForm } from '@inertiajs/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowLeft, ArrowRight, Award, BadgeCheck, GraduationCap, Headset, Lock, ShieldCheck, Truck, Zap } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn, route } from '@/lib/utils';
import type { ProductCard as Card } from '@/types';
import { ProductCard } from './ProductCard';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';

gsap.registerPlugin(ScrollTrigger);

export interface HomeSection {
    id: number;
    type: string;
    title: string | null;
    subtitle: string | null;
    settings: Record<string, any>;
    slides?: any[];
    categories?: { name: string; slug: string; image_url: string | null }[];
    products?: Card[];
    link?: string | null;
    brand?: { name: string; slug: string; logo_url: string | null; tagline: string | null } | null;
    brands?: { name: string; slug: string; logo_url: string | null; is_exclusive: boolean }[];
    courses?: { title: string; duration: string | null; price_label: string | null }[];
}

const themeBg: Record<string, string> = {
    light: 'bg-white',
    muted: 'bg-porcelain',
    dark: 'bg-onyx text-white',
    violet: 'bg-violet-950 text-white',
};

/* ------------------------------------------------------------------ Hero */

export function Hero({ slides }: { slides: any[] }) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const textRef = useRef<HTMLDivElement>(null);
    const DURATION = 7000;

    useEffect(() => {
        if (paused || slides.length < 2) return;
        const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), DURATION);
        return () => clearTimeout(t);
    }, [index, paused, slides.length]);

    useLayoutEffect(() => {
        if (!textRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('[data-hero-line]', { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.08, delay: 0.1 });
        }, textRef);
        return () => ctx.revert();
    }, [index]);

    const s = slides[index];
    const light = s.theme === 'light';

    // Image-only banners (no headline): show each banner exactly as designed, at its natural shape.
    if (slides.every((sl) => !(sl.title ?? '').trim())) {
        const go = (d: number) => setIndex((index + d + slides.length) % slides.length);
        return (
            <section className="relative isolate overflow-hidden bg-onyx" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel">
                <div className="grid">
                    {slides.map((sl, i) => {
                        const img = (
                            <picture>
                                {sl.mobile_image_url && <source media="(max-width: 767px)" srcSet={sl.mobile_image_url} />}
                                <img src={sl.image_url} alt={sl.eyebrow || sl.button_text || 'Avesta'} className="block h-auto w-full" fetchPriority={i === 0 ? 'high' : 'low'} />
                            </picture>
                        );
                        return (
                            <div key={sl.id} className={cn('transition-opacity duration-[1000ms] ease-[var(--ease-premium)] [grid-area:1/1]', i === index ? 'z-10 opacity-100' : 'pointer-events-none opacity-0')} aria-hidden={i !== index}>
                                {sl.button_link ? <Link href={sl.button_link} aria-label={sl.button_text || sl.eyebrow || 'View'}>{img}</Link> : img}
                            </div>
                        );
                    })}
                </div>
                {slides.length > 1 && (
                    <>
                        <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2 md:bottom-4">
                            {slides.map((sl, i) => (
                                <button key={sl.id} onClick={() => setIndex(i)} className="group relative h-6 w-10 md:w-14" aria-label={`Slide ${i + 1}`}>
                                    <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-onyx/25 ring-1 ring-white/40">
                                        <span className="block h-full rounded-full bg-violet-600" style={{ width: i < index ? '100%' : i === index ? undefined : '0%', animation: i === index && !paused ? `hero-progress ${DURATION}ms linear forwards` : undefined }} />
                                    </span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => go(-1)} className="absolute left-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-onyx shadow-lg backdrop-blur transition hover:bg-white md:flex" aria-label="Previous slide"><ArrowLeft className="size-4" /></button>
                        <button onClick={() => go(1)} className="absolute right-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-onyx shadow-lg backdrop-blur transition hover:bg-white md:flex" aria-label="Next slide"><ArrowRight className="size-4" /></button>
                    </>
                )}
                <style>{`@keyframes hero-progress { from { width: 0% } to { width: 100% } }`}</style>
            </section>
        );
    }

    return (
        <section className={cn('relative isolate overflow-hidden', light ? 'bg-porcelain' : 'bg-onyx')} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} aria-roledescription="carousel">
            {slides.map((sl, i) => (
                <div key={sl.id} className={cn('absolute inset-0 transition-opacity duration-[1200ms] ease-[var(--ease-premium)]', i === index ? 'opacity-100' : 'opacity-0')} aria-hidden={i !== index}>
                    {sl.image_url ? (
                        <picture>
                            {sl.mobile_image_url && <source media="(max-width: 767px)" srcSet={sl.mobile_image_url} />}
                            <img
                                src={sl.image_url}
                                alt=""
                                className={cn('size-full object-cover object-[70%_center] transition-transform duration-[8000ms] ease-out md:object-center', i === index ? 'scale-100' : 'scale-[1.06]')}
                                fetchPriority={i === 0 ? 'high' : 'low'}
                            />
                        </picture>
                    ) : (
                        <div className="size-full bg-noir" />
                    )}
                </div>
            ))}
            <div className={cn('absolute inset-0', light ? 'bg-gradient-to-r from-white/90 via-white/60 to-transparent' : 'bg-gradient-to-r from-onyx/85 via-onyx/45 to-transparent max-md:bg-gradient-to-t max-md:from-onyx max-md:via-onyx/70')} />

            <div className="container-x relative flex min-h-[420px] items-end pb-16 pt-14 md:min-h-[460px] md:items-center md:pb-16 lg:min-h-[min(62vh,540px)]">
                <div ref={textRef} key={index} className="max-w-[640px]">
                    {s.eyebrow && (
                        <div data-hero-line className={cn('mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.2em] ring-1', light ? 'text-violet-700 ring-violet-200' : 'bg-white/5 text-violet-200 ring-white/15 backdrop-blur')}>
                            <span className="size-1.5 rounded-full bg-gold" />
                            {s.eyebrow}
                        </div>
                    )}
                    <h1 data-hero-line className={cn('font-display text-[32px] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[44px] lg:text-[56px]', light ? 'text-onyx' : 'text-white')}>
                        {s.title}
                    </h1>
                    {s.subtitle && (
                        <p data-hero-line className={cn('mt-4 max-w-[500px] text-[14.5px] leading-relaxed md:text-[16px]', light ? 'text-carbon' : 'text-white/70')}>
                            {s.subtitle}
                        </p>
                    )}
                    <div data-hero-line className="mt-7 flex flex-wrap gap-2.5">
                        {s.button_text && s.button_link && (
                            <Link href={s.button_link} className="group inline-flex h-11 items-center gap-2 rounded-full bg-violet-600 px-6 text-[14px] font-semibold text-white shadow-glow transition hover:bg-violet-500">
                                {s.button_text}
                                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                        {s.button2_text && s.button2_link && (
                            <Link href={s.button2_link} className={cn('inline-flex h-11 items-center rounded-full px-6 text-[14px] font-semibold ring-1 transition', light ? 'text-onyx ring-onyx/20 hover:bg-white' : 'text-white ring-white/25 hover:bg-white/10')}>
                                {s.button2_text}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {slides.length > 1 && (
                <div className="container-x absolute inset-x-0 bottom-5 flex items-center justify-between gap-6">
                    <div className="flex flex-1 gap-2.5 md:max-w-md">
                        {slides.map((sl, i) => (
                            <button key={sl.id} onClick={() => setIndex(i)} className="group relative h-8 flex-1" aria-label={`Slide ${i + 1}`}>
                                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/20">
                                    <span
                                        className="block h-full rounded-full bg-white"
                                        style={{
                                            width: i < index ? '100%' : i === index ? undefined : '0%',
                                            animation: i === index && !paused ? `hero-progress ${DURATION}ms linear forwards` : undefined,
                                        }}
                                    />
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="hidden gap-2 md:flex">
                        <button onClick={() => setIndex((index - 1 + slides.length) % slides.length)} className="flex size-10 items-center justify-center rounded-full text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white hover:text-onyx" aria-label="Previous slide">
                            <ArrowLeft className="size-5" />
                        </button>
                        <button onClick={() => setIndex((index + 1) % slides.length)} className="flex size-10 items-center justify-center rounded-full text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white hover:text-onyx" aria-label="Next slide">
                            <ArrowRight className="size-5" />
                        </button>
                    </div>
                </div>
            )}
            <style>{`@keyframes hero-progress { from { width: 0% } to { width: 100% } }`}</style>
        </section>
    );
}

/* ------------------------------------------------------------------ USP */

const icons: Record<string, any> = { truck: Truck, shield: ShieldCheck, badge: BadgeCheck, headset: Headset, award: Award, graduation: GraduationCap, lock: Lock, zap: Zap };

export function UspStrip({ section }: { section: HomeSection }) {
    const items: any[] = section.settings.items ?? [];
    if (!items.length) return null;
    const dark = section.settings.theme === 'dark';
    return (
        <section className={cn('border-b', dark ? 'border-white/10 bg-onyx text-white' : 'border-mist bg-white')}>
            <div className="container-x grid grid-cols-2 lg:grid-cols-4">
                {items.map((it, i) => {
                    const Icon = icons[it.icon] ?? ShieldCheck;
                    return (
                        <div key={i} className={cn('flex items-center gap-3.5 py-6 md:py-7', i % 2 === 1 && 'pl-4 sm:pl-6', i > 0 && 'lg:border-l lg:pl-8', dark ? 'lg:border-white/10' : 'lg:border-mist', i >= 2 && 'max-lg:border-t max-lg:border-mist')}>
                            <span className={cn('flex size-11 shrink-0 items-center justify-center rounded-2xl', dark ? 'bg-white/5 text-violet-300' : 'bg-violet-50 text-violet-600')}>
                                <Icon className="size-5" strokeWidth={1.75} />
                            </span>
                            <span>
                                <span className="block text-[14px] font-semibold leading-tight">{it.title}</span>
                                <span className={cn('mt-0.5 block text-[12.5px]', dark ? 'text-white/50' : 'text-slate')}>{it.text}</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Categories */

export function CategoryTiles({ section }: { section: HomeSection }) {
    const cats = section.categories ?? [];
    if (!cats.length) return null;
    return (
        <section className="py-10 md:py-14">
            <div className="container-x">
                <Reveal>
                    <SectionHeading eyebrow="Categories" title={section.title ?? 'Shop by category'} subtitle={section.subtitle} link={route('shop')} linkLabel="All products" className="mb-6 md:mb-7" />
                </Reveal>
                <div className="-mx-4 flex snap-x scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 lg:grid-cols-8">
                    {cats.slice(0, 8).map((c, i) => (
                        <Reveal key={c.slug} delay={i * 45} className="w-[30%] shrink-0 snap-start sm:w-auto">
                            <Link
                                href={route('category.show', c.slug)}
                                className="group relative flex h-full flex-col items-center rounded-2xl bg-porcelain/80 p-2.5 pb-3.5 ring-1 ring-transparent transition-all duration-500 ease-[var(--ease-premium)] hover:-translate-y-1 hover:bg-white hover:shadow-lift hover:ring-violet-200"
                            >
                                <span className="relative flex aspect-[5/4] w-full items-center justify-center overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_65%,#ffffff_0%,rgba(255,255,255,0)_70%)]">
                                    <span className="absolute inset-x-6 bottom-2 h-3 rounded-full bg-violet-600/0 blur-md transition duration-500 group-hover:bg-violet-600/20" />
                                    {c.image_url ? (
                                        <img src={c.image_url} alt="" loading="lazy" className="relative h-[78%] w-[78%] object-contain transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.08]" />
                                    ) : (
                                        <span className="flex size-12 items-center justify-center rounded-2xl bg-violet-100 font-display text-lg font-semibold text-violet-700">{c.name[0]}</span>
                                    )}
                                </span>
                                <span className="mt-2.5 line-clamp-2 text-center text-[12.5px] font-semibold leading-tight tracking-[-0.01em] sm:line-clamp-1 md:text-[13.5px]">{c.name}</span>
                                <span className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate transition group-hover:text-violet-700">
                                    Shop <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Product carousel */

export function ProductRail({ section }: { section: HomeSection }) {
    const ref = useRef<HTMLDivElement>(null);
    const products = section.products ?? [];
    const theme = section.settings.theme ?? 'light';
    const dark = theme === 'dark' || theme === 'violet';
    const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: 'smooth' });
    return (
        <section className={cn('py-14 md:py-20', themeBg[theme])}>
            <div className="container-x">
                <Reveal className="flex flex-wrap items-end justify-between gap-4">
                    <SectionHeading title={section.title ?? 'Featured'} subtitle={section.subtitle} tone={dark ? 'dark' : 'light'} className="mb-0 md:mb-0" />
                    <div className="flex items-center gap-2">
                        {section.link && (
                            <Link href={section.link} className={cn('mr-2 hidden text-sm font-semibold sm:inline-flex', dark ? 'text-white' : 'text-onyx')}>
                                View all
                            </Link>
                        )}
                        <button onClick={() => scroll(-1)} className={cn('flex size-11 items-center justify-center rounded-full ring-1 transition', dark ? 'text-white ring-white/20 hover:bg-white hover:text-onyx' : 'ring-fog hover:bg-onyx hover:text-white hover:ring-onyx')} aria-label="Scroll left">
                            <ArrowLeft className="size-4" />
                        </button>
                        <button onClick={() => scroll(1)} className={cn('flex size-11 items-center justify-center rounded-full ring-1 transition', dark ? 'text-white ring-white/20 hover:bg-white hover:text-onyx' : 'ring-fog hover:bg-onyx hover:text-white hover:ring-onyx')} aria-label="Scroll right">
                            <ArrowRight className="size-4" />
                        </button>
                    </div>
                </Reveal>
                <div ref={ref} className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 pb-4 pt-2 scrollbar-none sm:gap-4 md:mt-10 lg:-mx-1.5 lg:scroll-px-1.5 lg:gap-5 lg:px-1.5">
                    {products.map((p) => (
                        <div key={p.id} className="w-[47%] shrink-0 snap-start sm:w-[31%] md:w-[calc(25%-12px)] lg:w-[calc(20%-16px)]">
                            <ProductCard product={p} tone={dark ? 'dark' : 'light'} variant="premium" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Brand spotlight */

export function BrandSpotlight({ section }: { section: HomeSection }) {
    const root = useRef<HTMLElement>(null);
    const s = section.settings;
    useLayoutEffect(() => {
        if (!root.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('[data-spot-img]', { yPercent: 8, scale: 0.94 }, { yPercent: -6, scale: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
            gsap.from('[data-spot-feature]', { y: 30, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '[data-spot-features]', start: 'top 85%' } });
        }, root);
        return () => ctx.revert();
    }, []);
    const features: { title: string; text: string }[] = s.features ?? [];

    return (
        <section ref={root} className="relative overflow-hidden bg-noir py-12 text-white md:py-16">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
            <div className="container-x relative grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
                <div className="relative order-2 lg:order-1">
                    <div className="absolute inset-[10%] rounded-full bg-violet-600/30 blur-[90px]" />
                    {s.image_url && <img data-spot-img src={s.image_url} alt={section.brand?.name ?? ''} loading="lazy" className="relative mx-auto aspect-[5/4] w-full max-w-[420px] rounded-[1.75rem] object-cover lg:max-w-[460px]" />}
                </div>
                <div className="order-1 lg:order-2">
                    {s.eyebrow && (
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/10 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.2em] text-gold ring-1 ring-gold/30">
                            <span className="size-1.5 rounded-full bg-gold" /> {s.eyebrow}
                        </div>
                    )}
                    <h2 className="font-display text-[28px] font-semibold leading-[1.06] tracking-[-0.03em] md:text-[40px]">
                        <span className="text-gradient">{section.title}</span>
                    </h2>
                    {section.subtitle && <p className="mt-3 text-[15px] text-white/80 md:text-base">{section.subtitle}</p>}
                    {s.text && <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-white/55">{s.text}</p>}
                    {features.length > 0 && (
                        <div data-spot-features className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 xl:grid-cols-4">
                            {features.map((f, i) => (
                                <div key={i} data-spot-feature className="bg-onyx/60 p-4 backdrop-blur">
                                    <div className="tabular mb-1.5 font-display text-xs font-semibold text-violet-300">0{i + 1}</div>
                                    <div className="text-[13.5px] font-semibold leading-snug">{f.title}</div>
                                    <div className="mt-1 text-[12px] leading-relaxed text-white/50">{f.text}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {s.button_text && s.button_link && (
                        <Link href={s.button_link} className="group mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[14px] font-semibold text-onyx transition hover:bg-violet-100">
                            {s.button_text} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ Banner / split / CTAs */

export function Banner({ section }: { section: HomeSection }) {
    const s = section.settings;
    const dark = (s.theme ?? 'dark') !== 'light';
    return (
        <section className="py-10 md:py-14">
            <div className="container-x">
                <Reveal className={cn('relative isolate overflow-hidden rounded-[2rem] px-7 py-14 md:px-16 md:py-20', dark ? 'bg-noir text-white' : 'bg-violet-50 text-onyx')}>
                    {s.image_url && (
                        <picture>
                            {s.mobile_image_url && <source media="(max-width: 767px)" srcSet={s.mobile_image_url} />}
                            <img src={s.image_url} alt="" loading="lazy" className="absolute inset-0 -z-10 size-full object-cover object-right opacity-90" />
                        </picture>
                    )}
                    {dark && <div className="absolute inset-0 -z-10 bg-gradient-to-r from-onyx/90 via-onyx/50 to-transparent" />}
                    <div className="max-w-lg">
                        {s.eyebrow && <div className={cn('eyebrow mb-4', dark && 'text-violet-300')}>{s.eyebrow}</div>}
                        <h2 className="font-display text-3xl font-semibold leading-tight md:text-[44px]">{section.title}</h2>
                        {section.subtitle && <p className={cn('mt-3 text-lg', dark ? 'text-white/80' : 'text-carbon')}>{section.subtitle}</p>}
                        {s.text && <p className={cn('mt-3 text-[15px] leading-relaxed', dark ? 'text-white/55' : 'text-slate')}>{s.text}</p>}
                        {s.button_text && s.button_link && (
                            <Link href={s.button_link} className={cn('group mt-8 inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold transition', dark ? 'bg-white text-onyx hover:bg-violet-100' : 'bg-onyx text-white hover:bg-graphite')}>
                                {s.button_text} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

export function Split({ section }: { section: HomeSection }) {
    const s = section.settings;
    const theme = s.theme ?? 'light';
    const left = s.image_position === 'left';
    return (
        <section className={cn('py-14 md:py-20', themeBg[theme])}>
            <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                <Reveal className={cn(left ? 'lg:order-1' : 'lg:order-2')}>
                    {s.image_url && <img src={s.image_url} alt="" loading="lazy" className="w-full rounded-[2rem] object-cover" />}
                </Reveal>
                <Reveal className={cn(left ? 'lg:order-2' : 'lg:order-1')} delay={120}>
                    {s.eyebrow && <div className="eyebrow mb-4">{s.eyebrow}</div>}
                    <h2 className="font-display text-3xl font-semibold leading-tight md:text-[44px]">{section.title}</h2>
                    {section.subtitle && <p className="mt-4 text-lg opacity-80">{section.subtitle}</p>}
                    {s.text && <p className="mt-4 text-[15px] leading-relaxed opacity-60">{s.text}</p>}
                    {s.button_text && s.button_link && (
                        <Link href={s.button_link} className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-700">
                            {s.button_text} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </Reveal>
            </div>
        </section>
    );
}

export function TradeCta({ section }: { section: HomeSection }) {
    const s = section.settings;
    const perks = ['Trade & wholesale price levels', 'Pro-forma quotes & PO references', 'Quick re-order by SKU', 'Priority technical support'];
    return (
        <section className="py-10 md:py-14">
            <div className="container-x">
                <Reveal className="relative isolate grid overflow-hidden rounded-[2rem] bg-violet-950 text-white lg:grid-cols-2">
                    <div className="absolute -left-20 -top-20 -z-10 size-96 rounded-full bg-violet-600/40 blur-[100px]" />
                    <div className="p-8 md:p-14 lg:py-16">
                        {s.eyebrow && (
                            <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
                                <span className="h-px w-6 bg-gold" /> {s.eyebrow}
                            </div>
                        )}
                        <h2 className="font-display text-3xl font-semibold leading-[1.08] md:text-[46px]">{section.title}</h2>
                        {section.subtitle && <p className="mt-3 text-[15px] text-white/80 md:text-base">{section.subtitle}</p>}
                        {s.text && <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/55">{s.text}</p>}
                        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                            {perks.map((p) => (
                                <li key={p} className="flex items-center gap-2.5 text-[14px] text-white/85">
                                    <BadgeCheck className="size-[18px] shrink-0 text-gold" /> {p}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-10 flex flex-wrap gap-3">
                            {s.button_text && s.button_link && (
                                <Link href={s.button_link} className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold px-6 text-sm font-semibold text-onyx transition hover:brightness-105">
                                    {s.button_text} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            )}
                            <Link href={route('trade')} className="inline-flex h-12 items-center rounded-full px-6 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10">
                                How it works
                            </Link>
                        </div>
                    </div>
                    {s.image_url && (
                        <div className="relative min-h-[280px]">
                            <img src={s.image_url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-950 via-violet-950/20 to-transparent max-lg:bg-gradient-to-b" />
                        </div>
                    )}
                </Reveal>
            </div>
        </section>
    );
}

export function TrainingCta({ section }: { section: HomeSection }) {
    const s = section.settings;
    return (
        <section className="py-14 md:py-20">
            <div className="container-x grid items-center gap-10 lg:grid-cols-12">
                <Reveal className="lg:col-span-5">
                    {s.eyebrow && <div className="eyebrow mb-4">{s.eyebrow}</div>}
                    <h2 className="font-display text-3xl font-semibold leading-[1.08] md:text-[46px]">{section.title}</h2>
                    {section.subtitle && <p className="mt-4 text-lg text-carbon">{section.subtitle}</p>}
                    {s.text && <p className="mt-3 text-[15px] leading-relaxed text-slate">{s.text}</p>}
                    {!!section.courses?.length && (
                        <ul className="mt-8 divide-y divide-mist border-y border-mist">
                            {section.courses.map((c) => (
                                <li key={c.title} className="flex items-center justify-between gap-4 py-3.5 text-[14px]">
                                    <span className="font-medium">{c.title}</span>
                                    <span className="shrink-0 text-slate">{c.duration}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {s.button_text && s.button_link && (
                        <Link href={s.button_link} className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-onyx px-6 text-sm font-semibold text-white transition hover:bg-violet-700">
                            {s.button_text} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </Reveal>
                <Reveal className="lg:col-span-7" delay={120}>
                    {s.image_url && <img src={s.image_url} alt="" loading="lazy" className="aspect-[16/10] w-full rounded-[2rem] object-cover" />}
                </Reveal>
            </div>
        </section>
    );
}

export function BrandsStrip({ section }: { section: HomeSection }) {
    const brands = section.brands ?? [];
    if (!brands.length) return null;
    const loop = [...brands, ...brands, ...brands];
    return (
        <section className="border-y border-mist py-12">
            <div className="container-x mb-6 text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-slate">{section.title}</div>
            <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
                <div className="flex w-max animate-[marquee_36s_linear_infinite] items-center gap-16 hover:[animation-play-state:paused]">
                    {loop.map((b, i) => (
                        <Link key={i} href={route('brand.show', b.slug)} className="flex h-12 items-center gap-2 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0">
                            {b.logo_url ? <img src={b.logo_url} alt={b.name} className="h-9 w-auto" /> : <span className="font-display text-2xl font-semibold tracking-tight">{b.name}</span>}
                            {b.is_exclusive && <span className="size-1.5 rounded-full bg-gold" />}
                        </Link>
                    ))}
                </div>
            </div>
            <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }`}</style>
        </section>
    );
}

export function NewsletterBlock({ section }: { section: HomeSection }) {
    const form = useForm({ email: '' });
    const dark = (section.settings.theme ?? 'dark') === 'dark';
    return (
        <section className={cn('py-20', dark ? 'bg-noir text-white' : 'bg-violet-50')}>
            <div className="container-x max-w-2xl text-center">
                <h2 className="font-display text-3xl font-semibold md:text-[42px]">{section.title}</h2>
                {section.settings.text && <p className={cn('mt-3 text-[15px]', dark ? 'text-white/60' : 'text-slate')}>{section.settings.text}</p>}
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.post(route('newsletter'), { preserveScroll: true, onSuccess: () => form.reset() });
                    }}
                    className={cn('mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full p-1.5 ring-1', dark ? 'bg-white/5 ring-white/15' : 'bg-white ring-mist')}
                >
                    <input type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="Email address" aria-label="Email address" className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm focus:outline-none focus:ring-0" />
                    <button disabled={form.processing} className="h-11 rounded-full bg-violet-600 px-6 text-sm font-semibold text-white transition hover:bg-violet-500">Subscribe</button>
                </form>
            </div>
        </section>
    );
}

export function TextBlock({ section }: { section: HomeSection }) {
    return (
        <section className="py-16">
            <div className="container-x max-w-3xl">
                {section.title && <h2 className="mb-6 font-display text-3xl font-semibold">{section.title}</h2>}
                <div className="prose-avesta" dangerouslySetInnerHTML={{ __html: section.settings.html ?? '' }} />
            </div>
        </section>
    );
}
