import { BadgeCheck, ShieldCheck, Truck } from 'lucide-react';
import type { ReactNode } from 'react';

export function AuthShell({ title, subtitle, children, wide }: { title: string; subtitle?: ReactNode; children: ReactNode; wide?: boolean }) {
    return (
        <div className="grid min-h-[calc(100vh-108px)] lg:grid-cols-[0.9fr_1.1fr]">
            <aside className="relative hidden overflow-hidden bg-noir text-white lg:block">
                <img src="/images/demo/hero-tenvo.svg" alt="" className="absolute inset-0 size-full object-cover object-[75%_center] opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx via-onyx/40 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-12">
                    <h2 className="max-w-md font-display text-4xl font-semibold leading-tight">Professional security. Priced for professionals.</h2>
                    <ul className="mt-8 space-y-3 text-sm text-white/75">
                        <li className="flex items-center gap-3"><BadgeCheck className="size-5 text-gold" /> Trade & wholesale pricing for approved businesses</li>
                        <li className="flex items-center gap-3"><Truck className="size-5 text-violet-300" /> Fast UK delivery & order tracking</li>
                        <li className="flex items-center gap-3"><ShieldCheck className="size-5 text-violet-300" /> Invoices, PO references and quick re-order</li>
                    </ul>
                </div>
            </aside>
            <div className="flex items-start justify-center px-4 py-12 sm:px-8 md:py-16 lg:items-center">
                <div className={wide ? 'w-full max-w-2xl' : 'w-full max-w-md'}>
                    <h1 className="font-display text-[32px] font-semibold tracking-tight md:text-[38px]">{title}</h1>
                    {subtitle && <p className="mt-2 text-[15px] text-slate">{subtitle}</p>}
                    <div className="mt-8">{children}</div>
                </div>
            </div>
        </div>
    );
}
