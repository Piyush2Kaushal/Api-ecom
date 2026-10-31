import { useForm } from '@inertiajs/react';
import { AuthShell } from '@/components/store/AuthShell';
import { Button, FieldError, Input, Label } from '@/components/ui';
import { route } from '@/lib/utils';
import { OtpInput } from './VerifyOtp';

export default function ResetPassword({ email }: { email: string }) {
    const form = useForm({ email, code: '', password: '', password_confirmation: '' });
    return (
        <AuthShell title="Choose a new password" subtitle="Enter the code from your email and a new password.">
            <form onSubmit={(e) => { e.preventDefault(); form.post(route('password.update')); }} className="space-y-5">
                <Input label="Email" type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                <div>
                    <Label>Reset code</Label>
                    <OtpInput value={form.data.code} onChange={(v) => form.setData('code', v)} autoFocus={false} />
                    <FieldError message={form.errors.code} />
                </div>
                <Input label="New password" type="password" required value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} error={form.errors.password} />
                <Input label="Confirm new password" type="password" required value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />
                <Button size="lg" block loading={form.processing}>Update password</Button>
            </form>
        </AuthShell>
    );
}
