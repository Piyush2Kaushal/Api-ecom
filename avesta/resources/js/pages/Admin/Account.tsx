import { useForm } from '@inertiajs/react';
import { PageHeader } from '@/layouts/AdminLayout';
import { Button, Card, Input } from '@/components/ui';
import { route } from '@/lib/utils';

export default function Account({ account }: any) {
    const form = useForm({ name: account.name, email: account.email, current_password: '', password: '', password_confirmation: '' });
    return (
        <>
            <PageHeader title="Admin account" description="Change your admin name, login email or password." />
            <Card className="max-w-2xl">
                <form onSubmit={(e) => { e.preventDefault(); form.put(route('admin.account.update'), { preserveScroll: true, onSuccess: () => form.reset('current_password', 'password', 'password_confirmation') }); }} className="grid gap-4 sm:grid-cols-2">
                    <Input label="Name" required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} error={form.errors.name} />
                    <Input label="Login email" type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                    <Input label="New password (optional)" type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} error={form.errors.password} help="At least 10 characters." />
                    <Input label="Confirm new password" type="password" value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                    <Input label="Current password" type="password" required value={form.data.current_password} onChange={(e) => form.setData('current_password', e.target.value)} error={form.errors.current_password} wrapperClassName="sm:col-span-2" help="Required to save any change." />
                    <div className="sm:col-span-2"><Button loading={form.processing}>Save</Button></div>
                </form>
            </Card>
        </>
    );
}
