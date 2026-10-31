import { useForm } from '@inertiajs/react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { useShared } from '@/hooks/useShared';
import { route } from '@/lib/utils';

export default function Contact() {
    const { settings, auth } = useShared();
    const form = useForm({ name: auth?.user?.name ?? '', email: auth?.user?.email ?? '', phone: '', company: '', subject: '', message: '' });
    const cards = [
        { icon: Phone, label: 'Call us', value: settings.company_phone, href: `tel:${settings.company_phone?.replace(/\s/g, '')}` },
        { icon: Mail, label: 'Email', value: settings.company_email, href: `mailto:${settings.company_email}` },
        { icon: MapPin, label: 'Visit', value: settings.company_address },
        { icon: Clock, label: 'Opening hours', value: settings.opening_hours },
    ];
    return (
        <>
            <section className="relative overflow-hidden bg-noir text-white">
                <div className="bg-grid absolute inset-0 opacity-50" />
                <div className="container-x relative py-16 md:py-24">
                    <div className="eyebrow text-violet-300">Contact</div>
                    <h1 className="mt-3 max-w-2xl font-display text-[40px] font-semibold leading-[1.05] tracking-tight md:text-[60px]">Talk to people who install security.</h1>
                    <p className="mt-4 max-w-xl text-white/60">Product advice, trade accounts, quotes for larger projects or help with an order — we usually reply within one working day.</p>
                </div>
            </section>
            <div className="container-x grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_1.3fr]">
                <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {cards.map(({ icon: Icon, label, value, href }) => (
                        <div key={label} className="flex gap-4 rounded-3xl border border-mist p-5">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Icon className="size-5" /></span>
                            <span>
                                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate">{label}</span>
                                {href ? <a href={href} className="mt-1 block font-medium hover:text-violet-700">{value}</a> : <span className="mt-1 block font-medium">{value}</span>}
                            </span>
                        </div>
                    ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); form.post(route('contact.store'), { preserveScroll: true, onSuccess: () => form.reset('message', 'subject') }); }} className="rounded-3xl border border-mist p-6 md:p-8">
                    <h2 className="text-xl font-semibold">Send us a message</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <Input label="Name" required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} />
                        <Input label="Email" type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                        <Input label="Phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                        <Input label="Company" value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} />
                        <Input label="Subject" value={form.data.subject} onChange={(e) => form.setData('subject', e.target.value)} wrapperClassName="sm:col-span-2" />
                        <Textarea label="Message" required rows={6} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} error={form.errors.message} wrapperClassName="sm:col-span-2" />
                    </div>
                    <Button className="mt-6" size="lg" loading={form.processing}>Send message</Button>
                </form>
            </div>
        </>
    );
}
