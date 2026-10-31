import { Link, useForm } from '@inertiajs/react';
import { AuthShell } from '@/components/store/AuthShell';
import { Button, Checkbox, Input } from '@/components/ui';
import { route } from '@/lib/utils';

export default function Login() {
    const form = useForm({ email: '', password: '', remember: true });
    return (
        <AuthShell title="Welcome back" subtitle={<>New to Avesta? <Link href={route('register')} className="font-semibold text-violet-700">Create an account</Link></>}>
            <form onSubmit={(e) => { e.preventDefault(); form.post(route('login.store')); }} className="space-y-4">
                <Input label="Email" type="email" autoComplete="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                <Input label="Password" type="password" autoComplete="current-password" required value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} error={form.errors.password} />
                <div className="flex items-center justify-between">
                    <Checkbox checked={form.data.remember} onChange={(v) => form.setData('remember', v)} label="Keep me signed in" />
                    <Link href={route('password.request')} className="text-sm font-medium text-violet-700">Forgot password?</Link>
                </div>
                <Button size="lg" block loading={form.processing}>Sign in</Button>
            </form>
            <div className="mt-8 rounded-2xl bg-porcelain p-4 text-sm text-slate">
                Installer or reseller? <Link href={route('register', { type: 'trader' })} className="font-semibold text-onyx">Apply for a trade account →</Link>
            </div>
        </AuthShell>
    );
}
