import { BadgeCheck, Building2, Clock, FileText, Percent, Zap } from 'lucide-react';
import { Button } from '@/components/ui';
import { useShared } from '@/hooks/useShared';
import { route } from '@/lib/utils';

export default function Trade({ content }: { content: string | null }) {
    const { auth, settings } = useShared();
    const steps = [
        { n: '01', title: 'Register', text: 'Create your account and choose Trader or Wholesaler. Add your company details.' },
        { n: '02', title: 'Verify your email', text: 'Enter the 6-digit code we email you. Your account works immediately at retail prices.' },
        { n: '03', title: 'We review', text: 'Our team checks your business details — usually within one working day.' },
        { n: '04', title: 'Trade prices unlocked', text: 'Once approved, your trade prices appear automatically across the store.' },
    ];
    const perks = [
        { icon: Percent, title: 'Trade & wholesale pricing', text: 'Dedicated price levels on every product.' },
        { icon: FileText, title: 'Quotes & PO numbers', text: 'Pro-forma PDFs and PO references on invoices.' },
        { icon: Zap, title: 'Quick order by SKU', text: 'Paste SKUs and quantities, re-order in one click.' },
        { icon: Clock, title: 'Priority support', text: 'Direct access to our technical team.' },
    ];
    const cta = auth?.user ? route('account.trade') : route('register', { type: 'trader' });
    return (
        <>
            <section className="relative overflow-hidden bg-violet-950 text-white">
                <img src="/images/demo/hero-trade.svg" alt="" className="absolute inset-0 size-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-950 via-violet-950/80 to-transparent" />
                <div className="container-x relative py-20 md:py-28">
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold"><span className="h-px w-6 bg-gold" /> Avesta Trade</div>
                    <h1 className="mt-4 max-w-2xl font-display text-[42px] font-semibold leading-[1.04] tracking-tight md:text-[64px]">{settings.trade_cta_title}</h1>
                    <p className="mt-5 max-w-lg text-[17px] text-white/65">{settings.trade_cta_text}</p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button variant="gold" size="lg" href={cta}>Apply as a Trader</Button>
                        <Button variant="outline" size="lg" className="!border-white/30 !bg-white/5 !text-white backdrop-blur hover:!border-white hover:!bg-white/15" href={auth?.user ? route('account.trade') : route('register', { type: 'wholesaler' })}>Apply as a Wholesaler</Button>
                    </div>
                </div>
            </section>
            <section className="container-x py-14 md:py-20">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {perks.map(({ icon: Icon, title, text }) => (
                        <div key={title} className="rounded-3xl bg-porcelain p-6">
                            <Icon className="size-6 text-violet-600" strokeWidth={1.75} />
                            <div className="mt-4 font-semibold">{title}</div>
                            <div className="mt-1 text-sm text-slate">{text}</div>
                        </div>
                    ))}
                </div>
                <h2 className="mt-20 font-display text-3xl font-semibold md:text-4xl">How it works</h2>
                <div className="mt-8 grid gap-6 md:grid-cols-4">
                    {steps.map((s) => (
                        <div key={s.n} className="border-t-2 border-onyx pt-5">
                            <div className="tabular font-display text-sm font-semibold text-violet-600">{s.n}</div>
                            <div className="mt-2 text-lg font-semibold">{s.title}</div>
                            <div className="mt-1.5 text-sm leading-relaxed text-slate">{s.text}</div>
                        </div>
                    ))}
                </div>
                {content && <div className="prose-avesta mt-16 max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />}
                <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-3xl bg-onyx p-8 text-white md:flex-row md:items-center md:p-10">
                    <div className="flex items-center gap-4">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold"><Building2 className="size-6" /></span>
                        <div>
                            <div className="text-xl font-semibold">Ready to unlock trade prices?</div>
                            <div className="text-sm text-white/60">It takes about two minutes.</div>
                        </div>
                    </div>
                    <Button variant="gold" size="lg" href={cta}><BadgeCheck className="size-5" /> Apply now</Button>
                </div>
            </section>
        </>
    );
}
