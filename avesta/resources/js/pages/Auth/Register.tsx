import { Link, useForm } from '@inertiajs/react';
import { Building2, Check, Store, Warehouse } from 'lucide-react';
import { Button, Checkbox, Input, Select, Textarea } from '@/components/ui';
import { AuthShell } from '@/components/store/AuthShell';
import { cn, route } from '@/lib/utils';

const types = [
    { value: 'retailer', title: 'Retailer', text: 'Personal or small business buyer', icon: Store, note: 'Instant access' },
    { value: 'trader', title: 'Trader', text: 'Installers & electricians', icon: Building2, note: 'Approval required' },
    { value: 'wholesaler', title: 'Wholesaler', text: 'Resellers & distributors', icon: Warehouse, note: 'Approval required' },
] as const;

export default function Register({ initialType }: { initialType: string }) {
    const qs = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const form = useForm({
        account_type: initialType,
        first_name: qs.get('first_name') ?? '',
        last_name: qs.get('last_name') ?? '',
        email: qs.get('email') ?? '',
        phone: '',
        password: '',
        password_confirmation: '',
        company_name: '',
        vat_number: '',
        company_number: '',
        business_type: '',
        website: '',
        business_address: '',
        monthly_spend: '',
        message: '',
        document: null as File | null,
        marketing_opt_in: false,
        accept_terms: false,
    });
    const trade = form.data.account_type !== 'retailer';
    const e = form.errors as Record<string, string>;

    return (
        <AuthShell wide title="Create your account" subtitle={<>Already registered? <Link href={route('login')} className="font-semibold text-violet-700">Sign in</Link></>}>
            <form onSubmit={(ev) => { ev.preventDefault(); form.post(route('register.store'), { forceFormData: true }); }} className="space-y-8">
                <div>
                    <div className="mb-3 text-[13px] font-medium text-carbon">Account type</div>
                    <div className="grid gap-3 sm:grid-cols-3">
                        {types.map((t) => (
                            <button type="button" key={t.value} onClick={() => form.setData('account_type', t.value)} className={cn('relative rounded-2xl border p-4 text-left transition', form.data.account_type === t.value ? 'border-violet-600 bg-violet-50/50 ring-1 ring-violet-600' : 'border-mist hover:border-fog')}>
                                {form.data.account_type === t.value && <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-violet-600 text-white"><Check className="size-3" strokeWidth={3} /></span>}
                                <t.icon className="size-5 text-violet-600" />
                                <div className="mt-3 font-semibold">{t.title}</div>
                                <div className="text-xs text-slate">{t.text}</div>
                                <div className={cn('mt-2 text-[11px] font-semibold', t.value === 'retailer' ? 'text-success' : 'text-[#8a6a22]')}>{t.note}</div>
                            </button>
                        ))}
                    </div>
                    {trade && (
                        <p className="mt-3 rounded-xl bg-gold-soft px-4 py-3 text-[13px] leading-relaxed text-carbon">
                            Your account works straight away with retail prices. Once our team approves your {form.data.account_type} application, your {form.data.account_type === 'trader' ? 'trade' : 'wholesale'} prices switch on automatically.
                        </p>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="First name" required value={form.data.first_name} onChange={(ev) => form.setData('first_name', ev.target.value)} error={e.first_name} />
                    <Input label="Last name" required value={form.data.last_name} onChange={(ev) => form.setData('last_name', ev.target.value)} error={e.last_name} />
                    <Input label="Email" type="email" required autoComplete="email" value={form.data.email} onChange={(ev) => form.setData('email', ev.target.value)} error={e.email} />
                    <Input label="Phone" type="tel" required value={form.data.phone} onChange={(ev) => form.setData('phone', ev.target.value)} error={e.phone} />
                    <Input label="Password" type="password" required autoComplete="new-password" value={form.data.password} onChange={(ev) => form.setData('password', ev.target.value)} error={e.password} help="At least 8 characters with letters and numbers." />
                    <Input label="Confirm password" type="password" required autoComplete="new-password" value={form.data.password_confirmation} onChange={(ev) => form.setData('password_confirmation', ev.target.value)} />
                </div>

                {trade && (
                    <div className="rounded-3xl border border-mist p-5 md:p-6">
                        <h3 className="font-semibold">Business details</h3>
                        <p className="mt-1 text-sm text-slate">Used to verify your trade application.</p>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <Input label="Company name" required value={form.data.company_name} onChange={(ev) => form.setData('company_name', ev.target.value)} error={e.company_name} wrapperClassName="sm:col-span-2" />
                            <Input label="Company registration no." required value={form.data.company_number} onChange={(ev) => form.setData('company_number', ev.target.value)} error={e.company_number} />
                            <Input label="VAT number" value={form.data.vat_number} onChange={(ev) => form.setData('vat_number', ev.target.value)} error={e.vat_number} />
                            <Select label="Business type" required placeholder="Select…" value={form.data.business_type} onChange={(ev) => form.setData('business_type', ev.target.value)} error={e.business_type}
                                options={['Security installer', 'Electrician', 'Systems integrator', 'IT / network contractor', 'Reseller / retailer', 'Distributor / wholesaler', 'Other'].map((v) => ({ value: v, label: v }))} />
                            <Select label="Estimated monthly spend" placeholder="Select…" value={form.data.monthly_spend} onChange={(ev) => form.setData('monthly_spend', ev.target.value)}
                                options={['Under £500', '£500 – £2,000', '£2,000 – £10,000', 'Over £10,000'].map((v) => ({ value: v, label: v }))} />
                            <Input label="Website" value={form.data.website} onChange={(ev) => form.setData('website', ev.target.value)} wrapperClassName="sm:col-span-2" />
                            <Textarea label="Business address" required rows={2} value={form.data.business_address} onChange={(ev) => form.setData('business_address', ev.target.value)} error={e.business_address} wrapperClassName="sm:col-span-2" />
                            <Textarea label="Anything else? (optional)" rows={2} value={form.data.message} onChange={(ev) => form.setData('message', ev.target.value)} wrapperClassName="sm:col-span-2" />
                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-[13px] font-medium text-carbon">Supporting document (optional)</label>
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(ev) => form.setData('document', ev.target.files?.[0] ?? null)} className="block w-full text-sm text-slate file:mr-4 file:rounded-xl file:border-0 file:bg-violet-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100" />
                                <p className="mt-1.5 text-xs text-slate">e.g. trade certificate or company letterhead — PDF/JPG/PNG up to 5MB.</p>
                                {e.document && <p className="mt-1 text-xs text-danger">{e.document}</p>}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <Checkbox checked={form.data.marketing_opt_in} onChange={(v) => form.setData('marketing_opt_in', v)} label="Email me trade offers and new products" />
                    <Checkbox checked={form.data.accept_terms} onChange={(v) => form.setData('accept_terms', v)} error={e.accept_terms} label={<>I agree to the <Link href="/terms-of-service" className="text-violet-700 underline">Terms</Link> and <Link href="/privacy-policy" className="text-violet-700 underline">Privacy Policy</Link></>} />
                </div>
                <Button size="lg" block loading={form.processing}>Create account & verify email</Button>
            </form>
        </AuthShell>
    );
}
