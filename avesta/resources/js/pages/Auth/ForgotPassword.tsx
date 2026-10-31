import { Link, useForm } from '@inertiajs/react';
import { AuthShell } from '@/components/store/AuthShell';
import { Button, Input } from '@/components/ui';
import { route } from '@/lib/utils';

export default function ForgotPassword() {
    const form = useForm({ email: '' });
    return (
        <AuthShell title="Reset your password" subtitle="Enter your email and we'll send you a 6-digit reset code.">
            <form onSubmit={(e) => { e.preventDefault(); form.post(route('password.email')); }} className="space-y-4">
                <Input label="Email" type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                <Button size="lg" block loading={form.processing}>Send reset code</Button>
            </form>
            <Link href={route('login')} className="mt-6 inline-block text-sm font-medium text-violet-700">← Back to sign in</Link>
        </AuthShell>
    );
}
