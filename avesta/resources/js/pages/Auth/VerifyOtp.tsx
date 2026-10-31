import { router, useForm } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import { useRef } from 'react';
import { AuthShell } from '@/components/store/AuthShell';
import { Button, FieldError } from '@/components/ui';
import { route } from '@/lib/utils';

export function OtpInput({ value, onChange, autoFocus = true }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const digits = value.padEnd(6, ' ').split('').slice(0, 6);
    const set = (i: number, d: string) => {
        const arr = value.padEnd(6, ' ').split('');
        arr[i] = d || ' ';
        onChange(arr.join('').replace(/\s+$/, ''));
    };
    return (
        <div className="flex justify-between gap-2" onPaste={(e) => {
            const t = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
            if (t) { e.preventDefault(); onChange(t); refs.current[Math.min(5, t.length)]?.focus(); }
        }}>
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    autoFocus={autoFocus && i === 0}
                    maxLength={1}
                    value={d.trim()}
                    onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(-1);
                        set(i, v);
                        if (v && i < 5) refs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => { if (e.key === 'Backspace' && !d.trim() && i > 0) refs.current[i - 1]?.focus(); }}
                    className="tabular h-14 w-full rounded-2xl border border-mist text-center font-display text-2xl font-semibold focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 sm:h-16"
                    aria-label={`Digit ${i + 1}`}
                />
            ))}
        </div>
    );
}

export default function VerifyOtp({ email }: { email: string }) {
    const form = useForm({ code: '' });
    return (
        <AuthShell title="Check your inbox" subtitle={<>We sent a 6-digit code to <strong className="text-onyx">{email}</strong>. It expires in 10 minutes.</>}>
            <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><MailCheck className="size-6" /></div>
            <form onSubmit={(e) => { e.preventDefault(); form.post(route('verify.store')); }}>
                <OtpInput value={form.data.code} onChange={(v) => form.setData('code', v)} />
                <FieldError message={form.errors.code} />
                <Button size="lg" block className="mt-6" loading={form.processing} disabled={form.data.code.length !== 6}>Verify email</Button>
            </form>
            <p className="mt-6 text-sm text-slate">
                Didn't get it? Check spam, or{' '}
                <button onClick={() => router.post(route('verify.resend'), {}, { preserveScroll: true })} className="font-semibold text-violet-700">send a new code</button>.
            </p>
            <button onClick={() => router.post(route('logout'))} className="mt-2 text-sm text-slate underline">Use a different email</button>
        </AuthShell>
    );
}
