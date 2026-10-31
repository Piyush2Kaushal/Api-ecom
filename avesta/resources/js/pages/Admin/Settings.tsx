import { router } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Globe, GraduationCap, Lock, Megaphone, Package, Percent, Store, Truck } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { SchemaField, setPath, type FieldDef } from '@/components/admin/Fields';
import { Button } from '@/components/ui';
import { cn, route } from '@/lib/utils';

const icons: Record<string, any> = { store: Store, percent: Percent, truck: Truck, package: Package, megaphone: Megaphone, graduation: GraduationCap, globe: Globe, lock: Lock };

export default function Settings({ groups, values, active, env }: { groups: Record<string, { label: string; icon: string; fields: FieldDef[] }>; values: Record<string, any>; active: string; env: any }) {
    const [tab, setTab] = useState(groups[active] ? active : 'general');
    const [data, setData] = useState<any>(() => ({ ...values, apply_vat_all: '' }));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const group = groups[tab];

    const save = () => {
        setSaving(true);
        const payload: any = { group: tab };
        group.fields.forEach((f) => f.type !== 'section' && (payload[f.name] = data[f.name]));
        router.post(route('admin.settings.update'), payload, {
            preserveScroll: true,
            onError: setErrors,
            onSuccess: () => { setErrors({}); setData((d: any) => ({ ...d, apply_vat_all: '' })); },
            onFinish: () => setSaving(false),
        });
    };

    const Status = ({ ok, label, text }: { ok: boolean; label: string; text: string }) => (
        <div className="flex items-start gap-3 rounded-xl border border-mist bg-white p-4 text-sm">
            {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <AlertCircle className="mt-0.5 size-4 shrink-0 text-warning" />}
            <div><div className="font-semibold">{label}</div><div className="text-slate">{text}</div></div>
        </div>
    );

    return (
        <>
            <PageHeader title="Settings" description="Everything about how your store works. Changes apply instantly." />
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <nav className="flex gap-1 overflow-x-auto lg:flex-col">
                    {Object.entries(groups).map(([key, g]) => {
                        const Icon = icons[g.icon] ?? Store;
                        return (
                            <button key={key} onClick={() => setTab(key)} className={cn('flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition', tab === key ? 'bg-white text-onyx shadow-soft ring-1 ring-mist' : 'text-slate hover:bg-white hover:text-onyx')}>
                                <Icon className={cn('size-4', tab === key && 'text-violet-600')} /> {g.label}
                            </button>
                        );
                    })}
                </nav>
                <div className="space-y-4">
                    {tab === 'general' && (
                        <div className="grid gap-3 md:grid-cols-3">
                            <Status ok={env.stripe} label="Stripe payments" text={env.stripe ? (env.stripe_webhook ? 'Connected with webhook.' : 'Connected — add STRIPE_WEBHOOK_SECRET.') : env.demo_payments ? 'Demo mode (no real payments).' : 'Add STRIPE_KEY / STRIPE_SECRET in .env.'} />
                            <Status ok={env.mail !== 'log'} label="Email sending" text={env.mail === 'log' ? 'Emails are only logged — set MAIL_* in .env.' : `Sending from ${env.mail_from}`} />
                            <Status ok={!env.debug} label="Live mode" text={env.debug ? 'APP_DEBUG is on — turn off on the live site.' : 'Debug mode is off.'} />
                        </div>
                    )}
                    <div className="rounded-2xl border border-mist bg-white">
                        <div className="border-b border-mist px-6 py-4"><h2 className="font-semibold">{group.label}</h2></div>
                        <div className="grid grid-cols-12 gap-4 p-6">
                            {group.fields.map((f, i) => <SchemaField key={f.name + i} field={f} data={data} setData={(p, v) => setData((d: any) => setPath(d, p, v))} errors={errors} />)}
                        </div>
                        <div className="flex justify-end border-t border-mist bg-porcelain/50 px-6 py-4">
                            <Button onClick={save} loading={saving}>Save {group.label.toLowerCase()}</Button>
                        </div>
                    </div>
                    {tab === 'tax' && (
                        <div className="rounded-2xl bg-violet-50 p-5 text-sm leading-relaxed text-violet-950">
                            <div className="mb-2 font-semibold">How VAT is calculated</div>
                            <ul className="list-disc space-y-1 pl-5">
                                <li><strong>VAT included</strong> — a £20 product costs £20; the invoice shows £16.67 + £3.33 VAT.</li>
                                <li><strong>VAT excluded</strong> — a £20 product costs £24 at checkout (£20 + £4 VAT).</li>
                                <li><strong>No VAT</strong> — a £20 product costs £20 with no VAT line.</li>
                                <li>Order: tier price → product discount → coupon → VAT on the discounted amount → delivery.</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
