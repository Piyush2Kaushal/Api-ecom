import { Link } from '@inertiajs/react';
import { AnimatePresence, motion } from 'motion/react';
import { forwardRef, useEffect, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Loader2, Minus, Plus, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ Button */

type Variant = 'primary' | 'dark' | 'outline' | 'ghost' | 'light' | 'gold' | 'danger' | 'soft';
type Size = 'xs' | 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
    primary: 'bg-violet-600 text-white shadow-[0_8px_24px_-10px_rgb(91_43_217/0.7)] hover:bg-violet-700 active:bg-violet-800',
    dark: 'bg-onyx text-white hover:bg-graphite active:bg-carbon',
    outline: 'border border-fog bg-white text-onyx hover:border-onyx',
    ghost: 'text-onyx hover:bg-porcelain',
    light: 'bg-white text-onyx hover:bg-violet-50',
    gold: 'bg-gold text-onyx hover:brightness-105',
    danger: 'bg-danger text-white hover:brightness-95',
    soft: 'bg-violet-50 text-violet-700 hover:bg-violet-100',
};
const sizes: Record<Size, string> = {
    xs: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
    sm: 'h-9 px-3.5 text-[13px] gap-2 rounded-xl',
    md: 'h-11 px-5 text-sm gap-2 rounded-xl',
    lg: 'h-13 px-7 text-[15px] gap-2.5 rounded-2xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    href?: string;
    external?: boolean;
    block?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant = 'primary', size = 'md', loading, href, external, block, className, children, disabled, ...rest },
    ref,
) {
    const classes = cn(
        'inline-flex select-none items-center justify-center font-semibold tracking-[-0.01em] transition-all duration-200 ease-[var(--ease-premium)] disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
    );
    if (href) {
        return external ? (
            <a href={href} className={classes} target="_blank" rel="noreferrer">
                {children}
            </a>
        ) : (
            <Link href={href} className={classes}>
                {children}
            </Link>
        );
    }
    return (
        <button ref={ref} className={classes} disabled={disabled || loading} {...rest}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            {children}
        </button>
    );
});

/* ------------------------------------------------------------------ Form fields */

export function Label({ children, htmlFor, required, className }: { children: ReactNode; htmlFor?: string; required?: boolean; className?: string }) {
    return (
        <label htmlFor={htmlFor} className={cn('mb-1.5 block text-[13px] font-medium text-carbon', className)}>
            {children}
            {required && <span className="ml-0.5 text-violet-600">*</span>}
        </label>
    );
}

export function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="mt-1.5 text-xs font-medium text-danger">{message}</p>;
}

export function Help({ children }: { children?: ReactNode }) {
    if (!children) return null;
    return <p className="mt-1.5 text-xs leading-relaxed text-slate">{children}</p>;
}

const inputBase =
    'block w-full rounded-xl border border-mist bg-white px-3.5 text-[15px] text-onyx placeholder:text-ash transition focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 disabled:bg-porcelain disabled:text-slate sm:text-sm';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: ReactNode;
    error?: string;
    help?: ReactNode;
    prefix?: ReactNode;
    suffix?: ReactNode;
    wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, error, help, prefix, suffix, className, wrapperClassName, id, required, ...rest },
    ref,
) {
    const auto = useId();
    const fieldId = id ?? auto;
    return (
        <div className={wrapperClassName}>
            {label && (
                <Label htmlFor={fieldId} required={required}>
                    {label}
                </Label>
            )}
            <div className="relative">
                {prefix && <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate">{prefix}</span>}
                <input
                    ref={ref}
                    id={fieldId}
                    required={required}
                    className={cn(inputBase, 'h-11', prefix && 'pl-8', suffix && 'pr-10', error && 'border-danger focus:border-danger focus:ring-danger/10', className)}
                    aria-invalid={!!error}
                    {...rest}
                />
                {suffix && <span className="absolute inset-y-0 right-3 flex items-center text-sm text-slate">{suffix}</span>}
            </div>
            <FieldError message={error} />
            <Help>{help}</Help>
        </div>
    );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: ReactNode;
    error?: string;
    help?: ReactNode;
    wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, error, help, className, wrapperClassName, id, required, ...rest }, ref) {
    const auto = useId();
    const fieldId = id ?? auto;
    return (
        <div className={wrapperClassName}>
            {label && (
                <Label htmlFor={fieldId} required={required}>
                    {label}
                </Label>
            )}
            <textarea ref={ref} id={fieldId} required={required} rows={4} className={cn(inputBase, 'py-3 leading-relaxed', error && 'border-danger', className)} {...rest} />
            <FieldError message={error} />
            <Help>{help}</Help>
        </div>
    );
});

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: ReactNode;
    error?: string;
    help?: ReactNode;
    options: { value: string | number; label: string }[];
    placeholder?: string;
    wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    { label, error, help, options, placeholder, className, wrapperClassName, id, required, ...rest },
    ref,
) {
    const auto = useId();
    const fieldId = id ?? auto;
    return (
        <div className={wrapperClassName}>
            {label && (
                <Label htmlFor={fieldId} required={required}>
                    {label}
                </Label>
            )}
            <div className="relative">
                <select ref={ref} id={fieldId} required={required} className={cn(inputBase, 'h-11 appearance-none pr-10', error && 'border-danger', className)} {...rest}>
                    {placeholder !== undefined && <option value="">{placeholder}</option>}
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate" />
            </div>
            <FieldError message={error} />
            <Help>{help}</Help>
        </div>
    );
});

export function Checkbox({
    checked,
    onChange,
    label,
    description,
    className,
    error,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: ReactNode;
    description?: ReactNode;
    className?: string;
    error?: string;
}) {
    return (
        <div className={className}>
            <label className="group flex cursor-pointer items-start gap-3">
                <span
                    className={cn(
                        'mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition',
                        checked ? 'border-violet-600 bg-violet-600 text-white' : 'border-fog bg-white group-hover:border-slate',
                    )}
                >
                    {checked && <Check className="size-3" strokeWidth={3} />}
                </span>
                <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
                <span className="text-sm leading-snug text-carbon">
                    {label}
                    {description && <span className="mt-0.5 block text-xs text-slate">{description}</span>}
                </span>
            </label>
            <FieldError message={error} />
        </div>
    );
}

export function Switch({ checked, onChange, label, description, size = 'md' }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; description?: ReactNode; size?: 'sm' | 'md' }) {
    const btn = (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-300',
                size === 'sm' ? 'h-5 w-9' : 'h-6 w-11',
                checked ? 'bg-violet-600' : 'bg-fog',
            )}
        >
            <span
                className={cn(
                    'inline-block rounded-full bg-white shadow-sm transition-transform duration-300 ease-[var(--ease-premium)]',
                    size === 'sm' ? 'size-4' : 'size-5',
                    checked ? (size === 'sm' ? 'translate-x-[18px]' : 'translate-x-[22px]') : 'translate-x-0.5',
                )}
            />
        </button>
    );
    if (!label) return btn;
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <div className="text-sm font-medium text-onyx">{label}</div>
                {description && <div className="mt-0.5 text-xs leading-relaxed text-slate">{description}</div>}
            </div>
            {btn}
        </div>
    );
}

/* ------------------------------------------------------------------ Display */

const badgeTones = {
    neutral: 'bg-porcelain text-carbon ring-mist',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    gold: 'bg-gold-soft text-[#8a6a22] ring-[#eadcb8]',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    danger: 'bg-red-50 text-red-700 ring-red-100',
    warning: 'bg-amber-50 text-amber-800 ring-amber-100',
    dark: 'bg-onyx text-white ring-onyx',
    info: 'bg-sky-50 text-sky-700 ring-sky-100',
};
export type Tone = keyof typeof badgeTones;

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
    return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset', badgeTones[tone], className)}>{children}</span>;
}

export const statusTone: Record<string, Tone> = {
    pending_payment: 'neutral',
    paid: 'violet',
    processing: 'info',
    dispatched: 'warning',
    delivered: 'success',
    cancelled: 'danger',
    refunded: 'danger',
    partially_refunded: 'warning',
    failed: 'danger',
    pending: 'warning',
    unverified: 'neutral',
    approved: 'success',
    rejected: 'danger',
    new: 'violet',
    contacted: 'info',
    confirmed: 'success',
    completed: 'success',
    replied: 'success',
    closed: 'neutral',
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
    return <Badge tone={statusTone[status] ?? 'neutral'}>{label ?? status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}</Badge>;
}

export function Spinner({ className }: { className?: string }) {
    return <Loader2 className={cn('size-5 animate-spin text-violet-600', className)} />;
}

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} out of 5`}>
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? 'fill-gold text-gold' : 'fill-mist text-mist'} />
            ))}
        </span>
    );
}

export function EmptyState({ icon, title, text, action }: { icon?: ReactNode; title: string; text?: ReactNode; action?: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-fog bg-porcelain/50 px-6 py-16 text-center">
            {icon && <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-soft">{icon}</div>}
            <h3 className="text-lg font-semibold">{title}</h3>
            {text && <p className="mt-1.5 max-w-sm text-sm text-slate">{text}</p>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}

export function QuantityStepper({ value, onChange, min = 1, max, size = 'md' }: { value: number; onChange: (v: number) => void; min?: number; max?: number | null; size?: 'sm' | 'md' }) {
    const clamp = (v: number) => Math.max(min, max ? Math.min(max, v) : v);
    return (
        <div className={cn('inline-flex items-center rounded-xl border border-mist bg-white', size === 'sm' ? 'h-9' : 'h-11')}>
            <button type="button" aria-label="Decrease" className="flex h-full w-9 items-center justify-center text-slate transition hover:text-onyx disabled:opacity-30" disabled={value <= min} onClick={() => onChange(clamp(value - 1))}>
                <Minus className="size-3.5" />
            </button>
            <input
                type="number"
                inputMode="numeric"
                value={value}
                onChange={(e) => onChange(clamp(parseInt(e.target.value || String(min), 10)))}
                className="tabular h-full w-10 border-0 bg-transparent p-0 text-center text-sm font-semibold focus:outline-none"
                aria-label="Quantity"
            />
            <button type="button" aria-label="Increase" className="flex h-full w-9 items-center justify-center text-slate transition hover:text-onyx disabled:opacity-30" disabled={!!max && value >= max} onClick={() => onChange(clamp(value + 1))}>
                <Plus className="size-3.5" />
            </button>
        </div>
    );
}

/* ------------------------------------------------------------------ Overlays */

function useLockBody(open: boolean) {
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && document.dispatchEvent(new CustomEvent('avesta:escape'));
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open]);
}

function useEscape(open: boolean, onClose: () => void) {
    useEffect(() => {
        if (!open) return;
        const h = () => onClose();
        document.addEventListener('avesta:escape', h);
        return () => document.removeEventListener('avesta:escape', h);
    }, [open, onClose]);
}

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
}: {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
    useLockBody(open);
    useEscape(open, onClose);
    const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
    if (typeof document === 'undefined') return null;
    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
                    <motion.div className="absolute inset-0 bg-onyx/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        className={cn('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl', widths[size])}
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.98 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {(title || description) && (
                            <div className="flex items-start justify-between gap-4 border-b border-mist px-6 py-5">
                                <div>
                                    {title && <h2 className="text-lg font-semibold">{title}</h2>}
                                    {description && <p className="mt-1 text-sm text-slate">{description}</p>}
                                </div>
                                <button onClick={onClose} className="-mr-2 rounded-full p-2 text-slate transition hover:bg-porcelain hover:text-onyx" aria-label="Close">
                                    <X className="size-5" />
                                </button>
                            </div>
                        )}
                        <div className="overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
                        {footer && <div className="flex items-center justify-end gap-3 border-t border-mist bg-porcelain/60 px-6 py-4">{footer}</div>}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

export function Drawer({
    open,
    onClose,
    title,
    children,
    footer,
    side = 'right',
    width = 'max-w-md',
}: {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    side?: 'right' | 'left';
    width?: string;
}) {
    useLockBody(open);
    useEscape(open, onClose);
    if (typeof document === 'undefined') return null;
    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[90]">
                    <motion.div className="absolute inset-0 bg-onyx/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
                    <motion.aside
                        className={cn('absolute inset-y-0 flex w-full flex-col bg-white shadow-2xl', width, side === 'right' ? 'right-0' : 'left-0')}
                        initial={{ x: side === 'right' ? '100%' : '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: side === 'right' ? '100%' : '-100%' }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {title !== undefined && (
                            <div className="flex h-16 shrink-0 items-center justify-between border-b border-mist px-5">
                                <div className="text-base font-semibold">{title}</div>
                                <button onClick={onClose} className="-mr-2 rounded-full p-2 text-slate transition hover:bg-porcelain hover:text-onyx" aria-label="Close">
                                    <X className="size-5" />
                                </button>
                            </div>
                        )}
                        <div className="flex-1 overflow-y-auto scrollbar-thin">{children}</div>
                        {footer && <div className="shrink-0 border-t border-mist bg-white p-5">{footer}</div>}
                    </motion.aside>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}

/* ------------------------------------------------------------------ Pagination */

export function Pagination({ links, className, preserveScroll }: { links: { url: string | null; label: string; active: boolean }[]; className?: string; preserveScroll?: boolean }) {
    if (!links || links.length <= 3) return null;
    return (
        <nav className={cn('flex flex-wrap items-center justify-center gap-1.5', className)} aria-label="Pagination">
            {links.map((l, i) => {
                const label = l.label.replace('&laquo;', '‹').replace('&raquo;', '›').replace('Previous', '').replace('Next', '').trim() || (i === 0 ? '‹' : '›');
                const cls = cn(
                    'tabular inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition',
                    l.active ? 'bg-onyx text-white' : 'text-carbon hover:bg-porcelain',
                    !l.url && 'pointer-events-none opacity-30',
                );
                return l.url ? (
                    <Link key={i} href={l.url} className={cls} preserveScroll={preserveScroll} preserveState>
                        {label}
                    </Link>
                ) : (
                    <span key={i} className={cls}>
                        {label}
                    </span>
                );
            })}
        </nav>
    );
}

/* ------------------------------------------------------------------ Card */

export function Card({ children, className, title, action, padded = true }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode; padded?: boolean }) {
    return (
        <section className={cn('rounded-2xl border border-mist bg-white', className)}>
            {(title || action) && (
                <header className="flex items-center justify-between gap-3 border-b border-mist px-5 py-4">
                    <h3 className="text-[15px] font-semibold">{title}</h3>
                    {action}
                </header>
            )}
            <div className={cn(padded && 'p-5')}>{children}</div>
        </section>
    );
}
