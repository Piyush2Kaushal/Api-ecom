import { Link, usePage } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { useShared } from '@/hooks/useShared';

export function CookieBanner() {
    const { settings } = useShared();
    const [show, setShow] = useState(false);
    useEffect(() => {
        if (settings.cookie_banner_enabled && !localStorage.getItem('cookie_consent')) setTimeout(() => setShow(true), 1200);
    }, [settings.cookie_banner_enabled]);
    const choose = (v: string) => {
        localStorage.setItem('cookie_consent', v);
        setShow(false);
    };
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-x-3 bottom-3 z-[80] mx-auto max-w-xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-mist sm:bottom-5"
                >
                    <p className="text-sm leading-relaxed text-carbon">
                        {settings.cookie_banner_text}{' '}
                        <Link href="/privacy-policy" className="font-medium text-violet-700 underline underline-offset-2">Privacy policy</Link>
                    </p>
                    <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="dark" onClick={() => choose('all')}>Accept all</Button>
                        <Button size="sm" variant="outline" onClick={() => choose('essential')}>Essential only</Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export function PromoPopup() {
    const { popup } = useShared();
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    useEffect(() => {
        if (!popup) return;
        if (popup.pages === 'home' && url !== '/') return;
        const key = 'popup_seen_' + popup.id;
        if (localStorage.getItem(key)) return;
        const t = setTimeout(() => {
            setOpen(true);
            localStorage.setItem(key, '1');
        }, (popup.delay_seconds ?? 5) * 1000);
        return () => clearTimeout(t);
    }, [popup, url]);
    if (!popup) return null;
    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
                    <motion.div className="absolute inset-0 bg-onyx/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="relative grid w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
                        <button onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-onyx shadow" aria-label="Close"><X className="size-4" /></button>
                        {popup.image_url && <div className="bg-noir"><img src={popup.image_url} alt="" className="h-56 w-full object-cover md:h-full" /></div>}
                        <div className="flex flex-col justify-center p-8 md:p-10">
                            <h3 className="font-display text-3xl font-semibold leading-tight">{popup.title}</h3>
                            {popup.content && <p className="mt-3 text-sm leading-relaxed text-slate">{popup.content}</p>}
                            {popup.button_text && popup.button_link && (
                                <Button className="mt-6 self-start" href={popup.button_link} onClick={() => setOpen(false)}>{popup.button_text}</Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export function WhatsAppButton() {
    const { settings } = useShared();
    if (!settings.whatsapp_number) return null;
    return (
        <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Chat on WhatsApp"
            className="fixed bottom-5 left-5 z-[70] flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
        >
            <MessageCircle className="size-6" />
        </a>
    );
}
