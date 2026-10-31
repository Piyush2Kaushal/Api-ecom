import { Link, useForm } from '@inertiajs/react';
import { AlertCircle, Check, CreditCard, Lock, ShieldCheck, Truck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Totals } from '@/components/store/Totals';
import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui';
import { useMoney } from '@/hooks/useMoney';
import { useShared } from '@/hooks/useShared';
import { api, cn, route } from '@/lib/utils';
import type { CartSummary } from '@/types';

interface Address { id: number; label: string | null; first_name: string; last_name: string | null; company: string | null; line1: string; line2: string | null; city: string; county: string | null; postcode: string; country: string; phone: string | null }

const emptyAddress = { first_name: '', last_name: '', company: '', line1: '', line2: '', city: '', county: '', postcode: '', country: 'GB', phone: '' };

function Step({ n, title, children, aside }: { n: number; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
    return (
        <section className="rounded-3xl border border-mist bg-white p-5 md:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-3 text-lg font-semibold">
                    <span className="flex size-7 items-center justify-center rounded-full bg-onyx text-xs font-bold text-white">{n}</span>
                    {title}
                </h2>
                {aside}
            </div>
            {children}
        </section>
    );
}

function AddressFields({ prefix, value, onChange, errors, countries }: { prefix: string; value: typeof emptyAddress; onChange: (k: string, v: string) => void; errors: Record<string, string>; countries: Record<string, string> }) {
    const e = (k: string) => errors[`${prefix}.${k}`];
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" required autoComplete="given-name" value={value.first_name} onChange={(ev) => onChange('first_name', ev.target.value)} error={e('first_name')} />
            <Input label="Last name" required autoComplete="family-name" value={value.last_name} onChange={(ev) => onChange('last_name', ev.target.value)} error={e('last_name')} />
            <Input label="Company (optional)" autoComplete="organization" value={value.company} onChange={(ev) => onChange('company', ev.target.value)} wrapperClassName="sm:col-span-2" />
            <Input label="Address line 1" required autoComplete="address-line1" value={value.line1} onChange={(ev) => onChange('line1', ev.target.value)} error={e('line1')} wrapperClassName="sm:col-span-2" />
            <Input label="Address line 2 (optional)" autoComplete="address-line2" value={value.line2} onChange={(ev) => onChange('line2', ev.target.value)} wrapperClassName="sm:col-span-2" />
            <Input label="Town / City" required autoComplete="address-level2" value={value.city} onChange={(ev) => onChange('city', ev.target.value)} error={e('city')} />
            <Input label="County (optional)" autoComplete="address-level1" value={value.county} onChange={(ev) => onChange('county', ev.target.value)} />
            <Input label="Postcode" required autoComplete="postal-code" value={value.postcode} onChange={(ev) => onChange('postcode', ev.target.value.toUpperCase())} error={e('postcode')} />
            <Select label="Country" required value={value.country} onChange={(ev) => onChange('country', ev.target.value)} options={Object.entries(countries).map(([v, l]) => ({ value: v, label: l }))} error={e('country')} />
        </div>
    );
}

export default function Checkout({ summary: initial, addresses, countries, paymentMode }: { summary: CartSummary; addresses: Address[]; countries: Record<string, string>; paymentMode: 'stripe' | 'demo' | 'disabled' }) {
    const { auth, settings } = useShared();
    const money = useMoney();
    const [summary, setSummary] = useState(initial);
    const [quoting, setQuoting] = useState(false);
    const def = addresses[0];
    const [selectedAddress, setSelectedAddress] = useState<number | 'new'>(def ? def.id : 'new');
    const toForm = (a?: Address) => (a ? { first_name: a.first_name, last_name: a.last_name ?? '', company: a.company ?? '', line1: a.line1, line2: a.line2 ?? '', city: a.city, county: a.county ?? '', postcode: a.postcode, country: a.country, phone: a.phone ?? '' } : { ...emptyAddress });

    const form = useForm({
        email: auth?.user?.email ?? '',
        phone: def?.phone ?? '',
        shipping: toForm(def),
        billing_same: true,
        billing: { ...emptyAddress },
        shipping_method_id: initial.shipping_method?.id ?? null,
        po_reference: '',
        notes: '',
        save_address: !def,
        accept_terms: false,
    });

    const quoteTimer = useRef<number>(undefined);
    useEffect(() => {
        window.clearTimeout(quoteTimer.current);
        quoteTimer.current = window.setTimeout(() => {
            setQuoting(true);
            api<CartSummary>(route('checkout.quote'), {
                method: 'POST',
                body: { country: form.data.shipping.country, postcode: form.data.shipping.postcode, shipping_method_id: form.data.shipping_method_id, email: form.data.email || null },
            })
                .then((s) => {
                    setSummary(s);
                    if (s.shipping_method && s.shipping_method.id !== form.data.shipping_method_id) form.setData('shipping_method_id', s.shipping_method.id);
                    if (!s.shipping_method) form.setData('shipping_method_id', null);
                })
                .finally(() => setQuoting(false));
        }, 350);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.data.shipping.country, form.data.shipping.postcode, form.data.shipping_method_id]);

    const setShip = (k: string, v: string) => form.setData('shipping', { ...form.data.shipping, [k]: v });
    const setBill = (k: string, v: string) => form.setData('billing', { ...form.data.billing, [k]: v });
    const chooseAddress = (id: number | 'new') => {
        setSelectedAddress(id);
        const a = addresses.find((x) => x.id === id);
        form.setData((d) => ({ ...d, shipping: toForm(a), phone: a?.phone || d.phone, save_address: id === 'new' }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('checkout.store'), { preserveScroll: true });
    };

    const errorCount = Object.keys(form.errors).length;

    return (
        <div className="bg-porcelain/70">
            <div className="container-x py-8 md:py-12">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="eyebrow">Secure checkout</div>
                        <h1 className="mt-2 font-display text-[32px] font-semibold tracking-tight md:text-[40px]">Checkout</h1>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate">
                        <Lock className="size-4 text-success" /> 256-bit encrypted · Payments by Stripe
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_420px]">
                    <div className="space-y-5">
                        {errorCount > 0 && (
                            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-800 ring-1 ring-red-100">
                                <AlertCircle className="mt-0.5 size-4 shrink-0" /> Please check the highlighted fields below.
                            </div>
                        )}

                        <Step
                            n={1}
                            title="Contact"
                            aside={!auth?.user && <Link href={route('login')} className="text-sm font-semibold text-violet-700">Sign in for faster checkout</Link>}
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input label="Email" type="email" required autoComplete="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} disabled={!!auth?.user} help={!auth?.user ? 'Your order confirmation and invoice will be sent here.' : undefined} />
                                <Input label="Phone" type="tel" required autoComplete="tel" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} error={form.errors.phone} help="For delivery updates only." />
                            </div>
                        </Step>

                        <Step n={2} title="Delivery address">
                            {addresses.length > 0 && (
                                <div className="mb-5 grid gap-2.5 sm:grid-cols-2">
                                    {addresses.map((a) => (
                                        <button type="button" key={a.id} onClick={() => chooseAddress(a.id)} className={cn('rounded-2xl border p-4 text-left text-sm transition', selectedAddress === a.id ? 'border-violet-600 bg-violet-50/50 ring-1 ring-violet-600' : 'border-mist hover:border-fog')}>
                                            <div className="font-semibold">{a.label || `${a.first_name} ${a.last_name ?? ''}`}</div>
                                            <div className="mt-1 text-slate">{a.line1}, {a.city} {a.postcode}</div>
                                        </button>
                                    ))}
                                    <button type="button" onClick={() => chooseAddress('new')} className={cn('rounded-2xl border border-dashed p-4 text-left text-sm font-medium transition', selectedAddress === 'new' ? 'border-violet-600 text-violet-700' : 'border-fog text-slate hover:border-slate')}>
                                        + New address
                                    </button>
                                </div>
                            )}
                            {(selectedAddress === 'new' || addresses.length === 0) && <AddressFields prefix="shipping" value={form.data.shipping} onChange={setShip} errors={form.errors} countries={countries} />}
                            {selectedAddress !== 'new' && addresses.length > 0 && <AddressFields prefix="shipping" value={form.data.shipping} onChange={setShip} errors={form.errors} countries={countries} />}
                            <div className="mt-5 space-y-3">
                                <Checkbox checked={form.data.billing_same} onChange={(v) => form.setData('billing_same', v)} label="Billing address is the same as delivery" />
                                {auth?.user && selectedAddress === 'new' && <Checkbox checked={form.data.save_address} onChange={(v) => form.setData('save_address', v)} label="Save this address to my account" />}
                            </div>
                            {!form.data.billing_same && (
                                <div className="mt-6 border-t border-mist pt-6">
                                    <h3 className="mb-4 font-semibold">Billing address</h3>
                                    <AddressFields prefix="billing" value={form.data.billing} onChange={setBill} errors={form.errors} countries={countries} />
                                </div>
                            )}
                        </Step>

                        <Step n={3} title="Delivery method" aside={quoting && <span className="text-xs text-slate">Updating…</span>}>
                            {summary.shipping_methods.length === 0 ? (
                                <div className="rounded-2xl bg-porcelain p-4 text-sm text-slate">
                                    {form.data.shipping.postcode ? 'Sorry — we do not currently deliver to this address. Please contact us for a quote.' : 'Enter your postcode to see delivery options.'}
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {summary.shipping_methods.map((m) => (
                                        <label key={m.id} className={cn('flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition', form.data.shipping_method_id === m.id ? 'border-violet-600 bg-violet-50/40 ring-1 ring-violet-600' : 'border-mist hover:border-fog')}>
                                            <input type="radio" name="ship" className="sr-only" checked={form.data.shipping_method_id === m.id} onChange={() => form.setData('shipping_method_id', m.id)} />
                                            <span className={cn('flex size-5 items-center justify-center rounded-full border-2', form.data.shipping_method_id === m.id ? 'border-violet-600' : 'border-fog')}>
                                                {form.data.shipping_method_id === m.id && <span className="size-2.5 rounded-full bg-violet-600" />}
                                            </span>
                                            <Truck className="size-5 text-slate" />
                                            <span className="flex-1">
                                                <span className="block text-sm font-semibold">{m.name}</span>
                                                <span className="block text-xs text-slate">{[m.estimate, m.description].filter(Boolean).join(' · ')}</span>
                                            </span>
                                            <span className={cn('tabular text-sm font-semibold', m.is_free && 'text-success')}>{m.is_free ? 'Free' : money(m.cost)}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {form.errors.shipping_method_id && <p className="mt-2 text-xs font-medium text-danger">{form.errors.shipping_method_id}</p>}
                        </Step>

                        <Step n={4} title="Order details">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {settings.po_reference_enabled && (
                                    <Input label="Purchase order reference (optional)" placeholder="e.g. PO-10452" value={form.data.po_reference} onChange={(e) => form.setData('po_reference', e.target.value)} help="Shown on your invoice." />
                                )}
                                <Textarea label="Order notes (optional)" rows={3} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} placeholder="Delivery instructions, site details…" wrapperClassName={settings.po_reference_enabled ? '' : 'sm:col-span-2'} />
                            </div>
                        </Step>
                    </div>

                    <aside>
                        <div className="sticky top-28 space-y-4">
                            <div className="rounded-3xl border border-mist bg-white p-6">
                                <h2 className="mb-5 text-lg font-semibold">Your order</h2>
                                <ul className="mb-5 max-h-72 space-y-3.5 overflow-y-auto pr-1 scrollbar-thin">
                                    {summary.lines.map((l) => (
                                        <li key={l.id} className="flex gap-3">
                                            <div className="relative size-14 shrink-0 rounded-xl bg-porcelain p-1.5">
                                                {l.image && <img src={l.image} alt="" className="size-full object-contain" />}
                                                <span className="tabular absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-onyx text-[10px] font-bold text-white">{l.quantity}</span>
                                            </div>
                                            <div className="min-w-0 flex-1 text-sm">
                                                <div className="line-clamp-2 leading-snug">{l.name}</div>
                                                {l.variant_label && <div className="text-xs text-slate">{l.variant_label}</div>}
                                            </div>
                                            <div className="tabular text-sm font-medium">{money(l.line_amount)}</div>
                                        </li>
                                    ))}
                                </ul>
                                <div className={cn('transition-opacity', quoting && 'opacity-50')}>
                                    <Totals summary={summary} />
                                </div>
                                <div className="mt-6 border-t border-mist pt-5">
                                    <Checkbox
                                        checked={form.data.accept_terms}
                                        onChange={(v) => form.setData('accept_terms', v)}
                                        error={form.errors.accept_terms}
                                        label={
                                            <>
                                                {settings.checkout_terms_text} <Link href="/terms-of-service" className="text-violet-700 underline">Read terms</Link>
                                            </>
                                        }
                                    />
                                </div>
                                <Button size="lg" block className="mt-5" loading={form.processing} disabled={!summary.shipping_method || paymentMode === 'disabled' || summary.has_issues}>
                                    <CreditCard className="size-4" /> Pay {money(summary.totals.grand_total)}
                                </Button>
                                {paymentMode === 'demo' && <p className="mt-2.5 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">Demo mode — no real payment will be taken.</p>}
                                {paymentMode === 'disabled' && <p className="mt-2.5 text-center text-xs text-danger">Online payments are not configured yet.</p>}
                                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate">
                                    <span className="flex items-center gap-1"><ShieldCheck className="size-3.5" /> Secure</span>
                                    <span className="flex items-center gap-1"><Check className="size-3.5" /> Visa · Mastercard · Amex · Apple Pay</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </form>
            </div>
        </div>
    );
}
