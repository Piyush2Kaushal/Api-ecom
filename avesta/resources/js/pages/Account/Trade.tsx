import { useForm } from '@inertiajs/react';
import { BadgeCheck, Clock, XCircle } from 'lucide-react';
import { Button, Card, Input, Select, StatusBadge, Textarea } from '@/components/ui';
import { formatDate, route, tierLabel } from '@/lib/utils';

export default function Trade({ applications, profile }: any) {
    const pending = applications.find((a: any) => a.status === 'pending');
    const form = useForm({ requested_tier: profile.tier === 'trader' ? 'wholesaler' : 'trader', company_name: profile.company_name ?? '', vat_number: profile.vat_number ?? '', company_number: profile.company_number ?? '', business_type: '', website: '', business_address: '', monthly_spend: '', message: '', document: null as File | null });
    const canApply = !pending && profile.tier !== 'wholesaler';
    return (
        <div className="space-y-5">
            <div className="rounded-3xl bg-onyx p-6 text-white">
                <div className="flex items-center gap-3">
                    {profile.tier === 'retailer' ? <Clock className="size-6 text-violet-300" /> : <BadgeCheck className="size-6 text-gold" />}
                    <div>
                        <div className="text-sm text-white/60">Current account type</div>
                        <div className="text-xl font-semibold">{tierLabel[profile.tier]}</div>
                    </div>
                </div>
                {pending && <p className="mt-4 text-sm text-white/70">Your {tierLabel[pending.requested_tier]} application (submitted {formatDate(pending.created_at)}) is being reviewed. We'll email you when it's done.</p>}
            </div>
            {applications.length > 0 && (
                <Card title="Applications" padded={false}>
                    <ul className="divide-y divide-mist">
                        {applications.map((a: any) => (
                            <li key={a.id} className="flex flex-wrap items-center gap-4 px-5 py-4 text-sm">
                                <div className="flex-1">
                                    <div className="font-semibold">{tierLabel[a.requested_tier]} — {a.company_name}</div>
                                    <div className="text-xs text-slate">Submitted {formatDate(a.created_at)}{a.reviewed_at && ` · Reviewed ${formatDate(a.reviewed_at)}`}</div>
                                    {a.status === 'rejected' && a.rejection_reason && <div className="mt-1 flex items-center gap-1.5 text-xs text-danger"><XCircle className="size-3.5" /> {a.rejection_reason}</div>}
                                </div>
                                <StatusBadge status={a.status} />
                            </li>
                        ))}
                    </ul>
                </Card>
            )}
            {canApply && (
                <Card title={profile.tier === 'retailer' ? 'Apply for a trade account' : 'Upgrade to wholesaler'}>
                    <form onSubmit={(e) => { e.preventDefault(); form.post(route('account.trade.apply'), { forceFormData: true, preserveScroll: true }); }} className="grid gap-4 sm:grid-cols-2">
                        <Select label="Account type" required value={form.data.requested_tier} onChange={(e) => form.setData('requested_tier', e.target.value)} options={[...(profile.tier === 'retailer' ? [{ value: 'trader', label: 'Trader (installers)' }] : []), { value: 'wholesaler', label: 'Wholesaler (resellers)' }]} />
                        <Input label="Company name" required value={form.data.company_name} onChange={(e) => form.setData('company_name', e.target.value)} error={form.errors.company_name} />
                        <Input label="Company registration no." required value={form.data.company_number} onChange={(e) => form.setData('company_number', e.target.value)} error={form.errors.company_number} />
                        <Input label="VAT number" value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} />
                        <Select label="Business type" required placeholder="Select…" value={form.data.business_type} onChange={(e) => form.setData('business_type', e.target.value)} error={form.errors.business_type} options={['Security installer', 'Electrician', 'Systems integrator', 'IT / network contractor', 'Reseller / retailer', 'Distributor / wholesaler', 'Other'].map((v) => ({ value: v, label: v }))} />
                        <Select label="Estimated monthly spend" placeholder="Select…" value={form.data.monthly_spend} onChange={(e) => form.setData('monthly_spend', e.target.value)} options={['Under £500', '£500 – £2,000', '£2,000 – £10,000', 'Over £10,000'].map((v) => ({ value: v, label: v }))} />
                        <Input label="Website" value={form.data.website} onChange={(e) => form.setData('website', e.target.value)} wrapperClassName="sm:col-span-2" />
                        <Textarea label="Business address" required rows={2} value={form.data.business_address} onChange={(e) => form.setData('business_address', e.target.value)} error={form.errors.business_address} wrapperClassName="sm:col-span-2" />
                        <Textarea label="Message (optional)" rows={2} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} wrapperClassName="sm:col-span-2" />
                        <div className="sm:col-span-2">
                            <label className="mb-1.5 block text-[13px] font-medium">Supporting document (optional)</label>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => form.setData('document', e.target.files?.[0] ?? null)} className="block w-full text-sm text-slate file:mr-4 file:rounded-xl file:border-0 file:bg-violet-50 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-violet-700" />
                        </div>
                        <div className="sm:col-span-2"><Button loading={form.processing}>Submit application</Button></div>
                    </form>
                </Card>
            )}
        </div>
    );
}
