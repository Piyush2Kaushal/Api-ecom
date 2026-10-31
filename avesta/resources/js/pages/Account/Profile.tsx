import { useForm } from '@inertiajs/react';
import { Button, Card, Input, Switch } from '@/components/ui';
import { route } from '@/lib/utils';

export default function Profile({ profile }: any) {
    const form = useForm({ first_name: profile.first_name, last_name: profile.last_name ?? '', phone: profile.phone ?? '', company_name: profile.company_name ?? '', vat_number: profile.vat_number ?? '', company_number: profile.company_number ?? '', marketing_opt_in: profile.marketing_opt_in });
    const pw = useForm({ current_password: '', password: '', password_confirmation: '' });
    return (
        <div className="space-y-5">
            <Card title="Personal & company details">
                <form onSubmit={(e) => { e.preventDefault(); form.put(route('account.profile.update'), { preserveScroll: true }); }} className="grid gap-4 sm:grid-cols-2">
                    <Input label="First name" required value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} error={form.errors.first_name} />
                    <Input label="Last name" required value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} error={form.errors.last_name} />
                    <Input label="Email" value={profile.email} disabled help="Contact us to change your login email." />
                    <Input label="Phone" required value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} error={form.errors.phone} />
                    <Input label="Company name" value={form.data.company_name} onChange={(e) => form.setData('company_name', e.target.value)} />
                    <Input label="VAT number" value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} help="Printed on your invoices." />
                    <Input label="Company registration no." value={form.data.company_number} onChange={(e) => form.setData('company_number', e.target.value)} />
                    <div className="sm:col-span-2"><Switch checked={form.data.marketing_opt_in} onChange={(v) => form.setData('marketing_opt_in', v)} label="Marketing emails" description="New products, trade offers and training dates." /></div>
                    <div className="sm:col-span-2"><Button loading={form.processing}>Save changes</Button></div>
                </form>
            </Card>
            <Card title="Change password">
                <form onSubmit={(e) => { e.preventDefault(); pw.put(route('account.password.update'), { preserveScroll: true, onSuccess: () => pw.reset() }); }} className="grid gap-4 sm:grid-cols-3">
                    <Input label="Current password" type="password" required value={pw.data.current_password} onChange={(e) => pw.setData('current_password', e.target.value)} error={pw.errors.current_password} />
                    <Input label="New password" type="password" required value={pw.data.password} onChange={(e) => pw.setData('password', e.target.value)} error={pw.errors.password} />
                    <Input label="Confirm new password" type="password" required value={pw.data.password_confirmation} onChange={(e) => pw.setData('password_confirmation', e.target.value)} />
                    <div className="sm:col-span-3"><Button variant="dark" loading={pw.processing}>Update password</Button></div>
                </form>
            </Card>
        </div>
    );
}
