import { useForm } from '@inertiajs/react';
import { LogoMark } from '@/components/store/Logo';
import { Toaster } from '@/components/store/Toaster';
import { OtpInput } from '@/pages/Auth/VerifyOtp';
import { Button, Checkbox, FieldError, Input } from '@/components/ui';
import { route } from '@/lib/utils';

export default function Login({ step }: { step: 'password' | 'code' }) {
    const form = useForm({ email: '', password: '', remember: true });
    const code = useForm({ code: '' });
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-noir px-4">
            <div className="bg-grid absolute inset-0 opacity-50" />
            <div className="relative w-full max-w-sm">
                <div className="mb-8 flex flex-col items-center text-white">
                    <LogoMark className="size-12" tone="light" />
                    <div className="mt-4 font-display text-xl font-semibold tracking-[0.18em]">AVESTA</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-300">Admin panel</div>
                </div>
                <div className="rounded-3xl bg-white p-7 shadow-2xl">
                    {step === 'password' ? (
                        <form onSubmit={(e) => { e.preventDefault(); form.post(route('admin.login.store')); }} className="space-y-4">
                            <Input label="Email" type="email" autoComplete="username" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} error={form.errors.email} />
                            <Input label="Password" type="password" autoComplete="current-password" required value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} />
                            <Checkbox checked={form.data.remember} onChange={(v) => form.setData('remember', v)} label="Remember this device" />
                            <Button block size="lg" loading={form.processing}>Sign in</Button>
                        </form>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); code.post(route('admin.login.verify')); }} className="space-y-5">
                            <p className="text-sm text-slate">Enter the 6-digit code we emailed you.</p>
                            <OtpInput value={code.data.code} onChange={(v) => code.setData('code', v)} />
                            <FieldError message={code.errors.code} />
                            <Button block size="lg" loading={code.processing}>Verify & sign in</Button>
                        </form>
                    )}
                </div>
            </div>
            <Toaster />
        </div>
    );
}
