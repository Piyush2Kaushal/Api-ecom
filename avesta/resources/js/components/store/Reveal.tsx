import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Subtle fade-up when an element scrolls into view (IntersectionObserver — no layout thrash). */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: { children: ReactNode; className?: string; delay?: number; as?: any }) {
    const ref = useRef<HTMLElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            el.style.opacity = '1';
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.animate(
                        [
                            { opacity: 0, transform: 'translateY(18px)' },
                            { opacity: 1, transform: 'none' },
                        ],
                        { duration: 750, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' },
                    );
                    io.disconnect();
                }
            },
            { rootMargin: '0px 0px -8% 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, [delay]);
    return (
        <Tag ref={ref} className={cn('opacity-0', className)}>
            {children}
        </Tag>
    );
}
