import { Link, useForm } from '@inertiajs/react';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { Facebook, Instagram, Linkedin, Youtube } from './SocialIcons';
import { useShared } from '@/hooks/useShared';
import { route } from '@/lib/utils';
import type { LinkItem } from '@/types';
import { Logo } from './Logo';

function Column({ title, links }: { title: string; links: LinkItem[] }) {
    if (!links?.length) return null;
    return (
        <div>
            <h4 className="mb-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40">{title}</h4>
            <ul className="space-y-2.5">
                {links.map((l) => (
                    <li key={l.url + l.label}>
                        {l.new_tab || l.url.startsWith('http') ? (
                            <a href={l.url} target={l.new_tab ? '_blank' : undefined} rel="noreferrer" className="text-[14px] text-white/70 transition hover:text-white">
                                {l.label}
                            </a>
                        ) : (
                            <Link href={l.url} className="text-[14px] text-white/70 transition hover:text-white">
                                {l.label}
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function Footer() {
    const { settings, nav } = useShared();
    const form = useForm({ email: '' });
    const socials = [
        { url: settings.social_facebook, icon: Facebook, label: 'Facebook' },
        { url: settings.social_instagram, icon: Instagram, label: 'Instagram' },
        { url: settings.social_linkedin, icon: Linkedin, label: 'LinkedIn' },
        { url: settings.social_youtube, icon: Youtube, label: 'YouTube' },
    ].filter((s) => s.url);

    return (
        <footer className="relative overflow-hidden bg-onyx text-white">
            <div className="pointer-events-none absolute -top-40 right-0 size-[520px] rounded-full bg-violet-700/20 blur-[120px]" />
            <div className="container-x relative">
                {settings.newsletter_enabled && (
                    <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-12 md:flex-row md:items-center">
                        <div>
                            <h3 className="font-display text-2xl font-semibold md:text-[28px]">Trade offers & new arrivals, first.</h3>
                            <p className="mt-1.5 text-sm text-white/55">Join installers and security pros who get our updates. No spam, unsubscribe any time.</p>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                form.post(route('newsletter'), { preserveScroll: true, onSuccess: () => form.reset() });
                            }}
                            className="flex w-full max-w-md items-center gap-2 rounded-full bg-white/[0.06] p-1.5 ring-1 ring-white/10 focus-within:ring-violet-400/60"
                        >
                            <input
                                type="email"
                                required
                                value={form.data.email}
                                onChange={(e) => form.setData('email', e.target.value)}
                                placeholder="Your email address"
                                className="min-w-0 flex-1 border-0 bg-transparent px-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-0"
                                aria-label="Email address"
                            />
                            <button disabled={form.processing} className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-5 text-sm font-semibold text-onyx transition hover:bg-violet-100">
                                Subscribe <ArrowRight className="size-4" />
                            </button>
                        </form>
                    </div>
                )}

                <div className="grid gap-10 py-14 md:grid-cols-12">
                    <div className="md:col-span-4">
                        <Logo tone="light" />
                        <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-white/55">{settings.footer_about}</p>
                        <ul className="mt-6 space-y-2.5 text-[14px] text-white/70">
                            <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-violet-300" /><span>{settings.company_name}<br />{settings.company_address}</span></li>
                            <li><a href={`tel:${settings.company_phone?.replace(/\s/g, '')}`} className="flex items-center gap-2.5 hover:text-white"><Phone className="size-4 text-violet-300" />{settings.company_phone}</a></li>
                            <li><a href={`mailto:${settings.company_email}`} className="flex items-center gap-2.5 hover:text-white"><Mail className="size-4 text-violet-300" />{settings.company_email}</a></li>
                        </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8 md:pl-10">
                        <Column title="Shop" links={nav?.footer.products ?? []} />
                        <Column title="Company" links={nav?.footer.quick ?? []} />
                        <Column title="Help" links={nav?.footer.help ?? []} />
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 text-[12.5px] text-white/40 md:flex-row">
                    <div>© {new Date().getFullYear()} {settings.company_name}. All rights reserved.</div>
                    <div className="flex items-center gap-2">
                        {socials.map(({ url, icon: Icon, label }) => (
                            <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label} className="flex size-9 items-center justify-center rounded-full ring-1 ring-white/10 transition hover:bg-white hover:text-onyx">
                                <Icon className="size-4" />
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 text-white/50">
                        <span>Secure payments by</span>
                        <span className="font-semibold tracking-tight text-white/80">stripe</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
