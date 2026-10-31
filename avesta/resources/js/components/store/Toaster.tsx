import { router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Toast = { id: number; type: 'success' | 'error'; message: string };
let counter = 0;

export function toast(message: string, type: Toast['type'] = 'success') {
    window.dispatchEvent(new CustomEvent('avesta:toast', { detail: { message, type } }));
}

export function Toaster() {
    const page = usePage<any>();
    const [toasts, setToasts] = useState<Toast[]>([]);

    const push = (message?: string | null, type: Toast['type'] = 'success') => {
        if (!message) return;
        const id = ++counter;
        setToasts((t) => [...t.slice(-2), { id, type, message }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'error' ? 6500 : 4200);
    };

    useEffect(() => {
        push(page.props.flash?.success, 'success');
        push(page.props.flash?.error, 'error');
        const off = router.on('success', (e: any) => {
            const f = e.detail.page.props.flash;
            push(f?.success, 'success');
            push(f?.error, 'error');
        });
        const offErr = router.on('error', (e: any) => {
            const errs = e.detail.errors ?? {};
            const keys = Object.keys(errs);
            if (keys.length > 2) push('Please check the highlighted fields.', 'error');
        });
        const custom = (e: Event) => push((e as CustomEvent).detail.message, (e as CustomEvent).detail.type);
        window.addEventListener('avesta:toast', custom);
        return () => {
            off();
            offErr();
            window.removeEventListener('avesta:toast', custom);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end">
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-onyx px-4 py-3.5 text-sm text-white shadow-2xl ring-1 ring-white/10"
                        role="status"
                    >
                        {t.type === 'success' ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-violet-300" /> : <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-400" />}
                        <span className="flex-1 leading-snug">{t.message}</span>
                        <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="text-white/50 hover:text-white" aria-label="Dismiss">
                            <X className="size-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
