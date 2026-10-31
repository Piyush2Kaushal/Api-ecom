import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, FileUp, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Plus, Quote, Redo, Trash2, Undo, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FieldError, Help, Input, Label, Select, Switch, Textarea } from '@/components/ui';
import { csrf, cn, route } from '@/lib/utils';

/* ------------------------------------------------------------------ Upload helper */

export async function uploadFile(file: File, folder = 'media'): Promise<{ path: string; url: string; name: string }> {
    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);
    const xsrf = decodeURIComponent(document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1] ?? '');
    const res = await fetch(route('admin.upload'), { method: 'POST', body, credentials: 'same-origin', headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrf, 'X-CSRF-TOKEN': csrf() } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message ?? 'Upload failed');
    return data;
}

const toUrl = (path?: string | null) => (!path ? null : /^(https?:)?\/\//.test(path) ? path : '/' + path.replace(/^\//, ''));

/* ------------------------------------------------------------------ Image upload */

export function ImageField({ label, value, onChange, folder = 'media', help, error, aspect = 'aspect-[4/3]' }: { label?: string; value: string | null; onChange: (v: string | null) => void; folder?: string; help?: string; error?: string; aspect?: string }) {
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const pick = async (file?: File) => {
        if (!file) return;
        setBusy(true);
        setErr(null);
        try {
            onChange((await uploadFile(file, folder)).path);
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setBusy(false);
        }
    };
    const url = toUrl(value);
    return (
        <div>
            {label && <Label>{label}</Label>}
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    pick(e.dataTransfer.files?.[0]);
                }}
                className={cn('group relative flex items-center justify-center overflow-hidden rounded-2xl border border-dashed border-fog bg-porcelain/60 transition hover:border-violet-400', aspect)}
            >
                {url ? (
                    <>
                        <img src={url} alt="" className="size-full object-contain p-3" />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-onyx/50 opacity-0 transition group-hover:opacity-100">
                            <button type="button" onClick={() => input.current?.click()} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold">Replace</button>
                            <button type="button" onClick={() => onChange(null)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-danger">Remove</button>
                        </div>
                    </>
                ) : (
                    <button type="button" onClick={() => input.current?.click()} className="flex size-full flex-col items-center justify-center gap-2 p-4 text-center text-xs text-slate">
                        {busy ? <Loader2 className="size-6 animate-spin text-violet-600" /> : <UploadCloud className="size-6 text-violet-500" />}
                        <span><strong className="text-onyx">Click to upload</strong> or drag & drop</span>
                    </button>
                )}
                {busy && url && <div className="absolute inset-0 flex items-center justify-center bg-white/70"><Loader2 className="size-6 animate-spin text-violet-600" /></div>}
            </div>
            <input ref={input} type="file" accept="image/*,.svg" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
            <FieldError message={err ?? error} />
            <Help>{help}</Help>
        </div>
    );
}

/* ------------------------------------------------------------------ Multi image gallery (products) */

export function GalleryField({ value, onChange, folder = 'products' }: { value: { path: string; alt?: string | null }[]; onChange: (v: { path: string; alt?: string | null }[]) => void; folder?: string }) {
    const [busy, setBusy] = useState(0);
    const [drag, setDrag] = useState<number | null>(null);
    const input = useRef<HTMLInputElement>(null);
    const add = async (files: FileList | null) => {
        if (!files?.length) return;
        const list = Array.from(files);
        setBusy(list.length);
        const results: { path: string }[] = [];
        for (const f of list) {
            try {
                results.push({ path: (await uploadFile(f, folder)).path });
            } catch {
                /* skip failed */
            }
            setBusy((b) => b - 1);
        }
        onChange([...value, ...results]);
    };
    const move = (from: number, to: number) => {
        const next = [...value];
        const [it] = next.splice(from, 1);
        next.splice(to, 0, it);
        onChange(next);
    };
    return (
        <div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                {value.map((img, i) => (
                    <div
                        key={img.path + i}
                        draggable
                        onDragStart={() => setDrag(i)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => drag !== null && move(drag, i)}
                        className={cn('group relative aspect-square cursor-grab overflow-hidden rounded-2xl border bg-porcelain', i === 0 ? 'border-violet-400 ring-2 ring-violet-100' : 'border-mist')}
                    >
                        <img src={toUrl(img.path)!} alt="" className="size-full object-contain p-2" />
                        {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-md bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">Main</span>}
                        <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute right-1.5 top-1.5 rounded-full bg-white p-1 text-danger opacity-0 shadow transition group-hover:opacity-100" aria-label="Remove image">
                            <X className="size-3.5" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        add(e.dataTransfer.files);
                    }}
                    className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-fog text-xs text-slate transition hover:border-violet-400 hover:text-violet-700"
                >
                    {busy > 0 ? <Loader2 className="size-5 animate-spin text-violet-600" /> : <ImagePlus className="size-5" />}
                    {busy > 0 ? `Uploading ${busy}…` : 'Add images'}
                </button>
            </div>
            <input ref={input} type="file" accept="image/*,.svg" multiple className="hidden" onChange={(e) => add(e.target.files)} />
            <Help>Drag to reorder. The first image is the main image. Images are automatically optimised.</Help>
        </div>
    );
}

/* ------------------------------------------------------------------ File field */

export function FileField({ label, value, onChange, folder = 'files' }: { label?: string; value: string | null; onChange: (path: string | null, name?: string) => void; folder?: string }) {
    const [busy, setBusy] = useState(false);
    const input = useRef<HTMLInputElement>(null);
    return (
        <div>
            {label && <Label>{label}</Label>}
            <div className="flex items-center gap-2">
                <button type="button" onClick={() => input.current?.click()} className="inline-flex h-11 items-center gap-2 rounded-xl border border-mist px-4 text-sm font-medium hover:border-onyx">
                    {busy ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />} {value ? 'Replace file' : 'Upload file'}
                </button>
                {value && <a href={toUrl(value)!} target="_blank" rel="noreferrer" className="truncate text-sm text-violet-700">{value.split('/').pop()}</a>}
            </div>
            <input
                ref={input}
                type="file"
                className="hidden"
                onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setBusy(true);
                    try {
                        const r = await uploadFile(f, folder);
                        onChange(r.path, r.name);
                    } finally {
                        setBusy(false);
                    }
                }}
            />
        </div>
    );
}

/* ------------------------------------------------------------------ Rich text */

export function RichText({ value, onChange, placeholder = 'Write something…' }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
    const editor = useEditor({
        extensions: [StarterKit.configure({ link: false } as any), Link.configure({ openOnClick: false })],
        content: value || '',
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
        editorProps: { attributes: { class: 'prose-avesta tiptap', 'data-placeholder': placeholder } },
        immediatelyRender: false,
    });
    useEffect(() => {
        if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(value || '');
    }, [value, editor]);
    if (!editor) return <div className="h-60 rounded-2xl border border-mist" />;
    const Btn = ({ on, active, children, label }: { on: () => void; active?: boolean; children: React.ReactNode; label: string }) => (
        <button type="button" onClick={on} title={label} aria-label={label} className={cn('rounded-lg p-1.5 transition', active ? 'bg-onyx text-white' : 'text-carbon hover:bg-porcelain')}>
            {children}
        </button>
    );
    const c = editor.chain().focus();
    return (
        <div className="overflow-hidden rounded-2xl border border-mist focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-500/10">
            <div className="flex flex-wrap items-center gap-0.5 border-b border-mist bg-porcelain/60 p-1.5">
                <Btn label="Heading" on={() => c.toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}><Heading2 className="size-4" /></Btn>
                <Btn label="Sub-heading" on={() => c.toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}><Heading3 className="size-4" /></Btn>
                <Btn label="Bold" on={() => c.toggleBold().run()} active={editor.isActive('bold')}><Bold className="size-4" /></Btn>
                <Btn label="Italic" on={() => c.toggleItalic().run()} active={editor.isActive('italic')}><Italic className="size-4" /></Btn>
                <Btn label="Bullet list" on={() => c.toggleBulletList().run()} active={editor.isActive('bulletList')}><List className="size-4" /></Btn>
                <Btn label="Numbered list" on={() => c.toggleOrderedList().run()} active={editor.isActive('orderedList')}><ListOrdered className="size-4" /></Btn>
                <Btn label="Quote" on={() => c.toggleBlockquote().run()} active={editor.isActive('blockquote')}><Quote className="size-4" /></Btn>
                <Btn
                    label="Link"
                    active={editor.isActive('link')}
                    on={() => {
                        const url = window.prompt('Link URL', editor.getAttributes('link').href ?? 'https://');
                        if (url === null) return;
                        url ? c.extendMarkRange('link').setLink({ href: url }).run() : c.unsetLink().run();
                    }}
                >
                    <Link2 className="size-4" />
                </Btn>
                <span className="mx-1 h-5 w-px bg-mist" />
                <Btn label="Undo" on={() => c.undo().run()}><Undo className="size-4" /></Btn>
                <Btn label="Redo" on={() => c.redo().run()}><Redo className="size-4" /></Btn>
            </div>
            <EditorContent editor={editor} className="max-h-[520px] overflow-y-auto bg-white" />
        </div>
    );
}

/* ------------------------------------------------------------------ Tags & multiselect */

export function TagsField({ value, onChange, placeholder = 'Type and press Enter', suggestions = [] }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; suggestions?: string[] }) {
    const [text, setText] = useState('');
    const add = (t: string) => {
        const v = t.trim();
        if (v && !value.includes(v)) onChange([...value, v]);
        setText('');
    };
    const left = suggestions.filter((s) => !value.includes(s));
    return (
        <div>
            <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-mist bg-white px-2 py-1.5 focus-within:border-violet-500">
                {value.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">
                        {t}
                        <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X className="size-3" /></button>
                    </span>
                ))}
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            add(text);
                        } else if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
                    }}
                    onBlur={() => text && add(text)}
                    placeholder={value.length ? '' : placeholder}
                    className="min-w-[120px] flex-1 border-0 bg-transparent px-1 text-sm focus:outline-none focus:ring-0"
                />
            </div>
            {left.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {left.slice(0, 20).map((s) => (
                        <button key={s} type="button" onClick={() => add(s)} className="rounded-lg border border-mist px-2 py-0.5 text-xs text-slate hover:border-violet-300 hover:text-violet-700">+ {s}</button>
                    ))}
                </div>
            )}
        </div>
    );
}

export function MultiSelect({ value, onChange, options, placeholder = 'Search…' }: { value: string[]; onChange: (v: string[]) => void; options: { value: string; label: string }[]; placeholder?: string }) {
    const [q, setQ] = useState('');
    const [open, setOpen] = useState(false);
    const selected = options.filter((o) => value.includes(String(o.value)));
    const filtered = options.filter((o) => !value.includes(String(o.value)) && o.label.toLowerCase().includes(q.toLowerCase())).slice(0, 60);
    return (
        <div className="relative" onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}>
            <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-mist bg-white px-2 py-1.5 focus-within:border-violet-500">
                {selected.map((o) => (
                    <span key={o.value} className="inline-flex max-w-full items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-800">
                        <span className="truncate">{o.label}</span>
                        <button type="button" onClick={() => onChange(value.filter((v) => v !== String(o.value)))} aria-label="Remove"><X className="size-3" /></button>
                    </span>
                ))}
                <input value={q} onFocus={() => setOpen(true)} onChange={(e) => { setQ(e.target.value); setOpen(true); }} placeholder={selected.length ? '' : placeholder} className="min-w-[120px] flex-1 border-0 bg-transparent px-1 text-sm focus:outline-none focus:ring-0" />
            </div>
            {open && filtered.length > 0 && (
                <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-mist bg-white p-1 shadow-lift scrollbar-thin">
                    {filtered.map((o) => (
                        <li key={o.value}>
                            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onChange([...value, String(o.value)]); setQ(''); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-porcelain">
                                {o.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ Schema-driven field */

export interface FieldDef {
    name: string;
    label: string;
    type: string;
    required?: boolean;
    help?: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    optionsMap?: Record<string, { value: string; label: string }[]>;
    optionsBy?: string;
    col?: number;
    readonly?: boolean;
    default?: any;
    min?: number;
    uppercase?: boolean;
    fields?: FieldDef[];
    fixed?: boolean;
    suggestions?: string[];
    showIf?: { field: string; in: string[] };
}

export const getPath = (obj: any, path: string) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
export const setPath = (obj: any, path: string, value: any) => {
    const keys = path.split('.');
    const clone = { ...obj };
    let cur = clone;
    keys.slice(0, -1).forEach((k) => {
        cur[k] = { ...(cur[k] ?? {}) };
        cur = cur[k];
    });
    cur[keys[keys.length - 1]] = value;
    return clone;
};

export function isVisible(f: FieldDef, data: any) {
    if (!f.showIf) return true;
    return f.showIf.in.includes(String(getPath(data, f.showIf.field) ?? ''));
}

const colClass: Record<number, string> = { 3: 'sm:col-span-3', 4: 'sm:col-span-4', 6: 'sm:col-span-6', 8: 'sm:col-span-8', 12: 'sm:col-span-12' };

export function SchemaField({ field: f, data, setData, errors }: { field: FieldDef; data: any; setData: (path: string, v: any) => void; errors: Record<string, string> }) {
    const value = getPath(data, f.name);
    const err = errors[f.name];
    const wrap = (node: React.ReactNode) => <div className={cn('col-span-12', colClass[f.col ?? 12])}>{node}</div>;
    if (!isVisible(f, data)) return null;

    if (f.type === 'section') {
        return <div className="col-span-12 mt-3 border-t border-mist pt-5 text-[12px] font-semibold uppercase tracking-[0.12em] text-slate">{f.label}</div>;
    }
    if (f.readonly) {
        return wrap(
            <div>
                <Label>{f.label}</Label>
                <div className="min-h-11 whitespace-pre-wrap rounded-xl bg-porcelain px-3.5 py-2.5 text-sm">{value === null || value === undefined || value === '' ? '—' : f.type === 'email' ? <a href={`mailto:${value}`} className="text-violet-700">{value}</a> : String(value)}</div>
            </div>,
        );
    }
    switch (f.type) {
        case 'textarea':
            return wrap(<Textarea label={f.label} required={f.required} value={value ?? ''} onChange={(e) => setData(f.name, e.target.value)} help={f.help} error={err} placeholder={f.placeholder} rows={3} />);
        case 'richtext':
            return wrap(
                <div>
                    <Label>{f.label}</Label>
                    <RichText value={value ?? ''} onChange={(v) => setData(f.name, v)} />
                    <FieldError message={err} />
                    <Help>{f.help}</Help>
                </div>,
            );
        case 'toggle':
            return wrap(<div className="rounded-xl border border-mist px-4 py-3"><Switch checked={!!value} onChange={(v) => setData(f.name, v)} label={f.label} description={f.help} /></div>);
        case 'select': {
            const opts = f.optionsBy ? f.optionsMap?.[getPath(data, f.optionsBy)] ?? [] : f.options ?? [];
            return wrap(<Select label={f.label} required={f.required} value={value == null ? '' : String(value)} onChange={(e) => setData(f.name, e.target.value)} options={opts} placeholder={f.required ? undefined : '—'} help={f.help} error={err} />);
        }
        case 'multiselect': {
            const opts = f.optionsBy ? f.optionsMap?.[getPath(data, f.optionsBy)] ?? [] : f.options ?? [];
            return wrap(
                <div>
                    <Label required={f.required}>{f.label}</Label>
                    <MultiSelect value={(value ?? []).map(String)} onChange={(v) => setData(f.name, v)} options={opts} />
                    <FieldError message={err} />
                    <Help>{f.help}</Help>
                </div>,
            );
        }
        case 'tags':
            return wrap(
                <div>
                    <Label>{f.label}</Label>
                    <TagsField value={value ?? []} onChange={(v) => setData(f.name, v)} suggestions={f.suggestions} />
                    <FieldError message={err} />
                    <Help>{f.help}</Help>
                </div>,
            );
        case 'image':
            return wrap(<ImageField label={f.label} value={value ?? null} onChange={(v) => setData(f.name, v)} help={f.help} error={err} />);
        case 'file':
            return wrap(<FileField label={f.label} value={value ?? null} onChange={(v) => setData(f.name, v)} />);
        case 'repeater':
            return wrap(<Repeater field={f} value={value ?? []} onChange={(v) => setData(f.name, v)} />);
        case 'number':
        case 'money':
        case 'percent':
            return wrap(
                <Input
                    type="number"
                    step="any"
                    min={f.min}
                    label={f.label}
                    required={f.required}
                    value={value ?? ''}
                    onChange={(e) => setData(f.name, e.target.value)}
                    prefix={f.type === 'money' ? '£' : undefined}
                    suffix={f.type === 'percent' ? '%' : undefined}
                    help={f.help}
                    error={err}
                    placeholder={f.placeholder}
                />,
            );
        case 'date':
        case 'datetime':
            return wrap(<Input type={f.type === 'date' ? 'date' : 'datetime-local'} label={f.label} required={f.required} value={value ?? ''} onChange={(e) => setData(f.name, e.target.value)} help={f.help} error={err} />);
        default:
            return wrap(
                <Input
                    type={f.type === 'email' ? 'email' : 'text'}
                    label={f.label}
                    required={f.required}
                    value={value ?? ''}
                    onChange={(e) => setData(f.name, f.uppercase ? e.target.value.toUpperCase() : e.target.value)}
                    help={f.help}
                    error={err}
                    placeholder={f.placeholder}
                />,
            );
    }
}

function Repeater({ field, value, onChange }: { field: FieldDef; value: any[]; onChange: (v: any[]) => void }) {
    const sub = field.fields ?? [];
    const update = (i: number, k: string, v: any) => onChange(value.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
    return (
        <div>
            <Label>{field.label}</Label>
            <div className="space-y-2">
                {value.map((row, i) => (
                    <div key={i} className="flex items-end gap-2 rounded-xl bg-porcelain/70 p-2.5">
                        <div className="grid flex-1 gap-2" style={{ gridTemplateColumns: `repeat(${sub.length}, minmax(0, 1fr))` }}>
                            {sub.map((s) =>
                                s.readonly ? (
                                    <div key={s.name}>
                                        <div className="mb-1 text-[11px] font-medium text-slate">{s.label}</div>
                                        <div className="flex h-10 items-center text-sm font-semibold">{row[s.name]}</div>
                                    </div>
                                ) : s.type === 'toggle' ? (
                                    <div key={s.name}>
                                        <div className="mb-1 text-[11px] font-medium text-slate">{s.label}</div>
                                        <div className="flex h-10 items-center"><Switch size="sm" checked={!!row[s.name]} onChange={(v) => update(i, s.name, v)} /></div>
                                    </div>
                                ) : s.type === 'select' ? (
                                    <div key={s.name}>
                                        <div className="mb-1 text-[11px] font-medium text-slate">{s.label}</div>
                                        <select value={row[s.name] ?? ''} onChange={(e) => update(i, s.name, e.target.value)} className="h-10 w-full rounded-lg border border-mist bg-white px-2 text-sm">
                                            <option value="">—</option>
                                            {s.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                        </select>
                                    </div>
                                ) : (
                                    <div key={s.name}>
                                        <div className="mb-1 text-[11px] font-medium text-slate">{s.label}</div>
                                        <input type={s.type === 'number' ? 'number' : 'text'} step="any" value={row[s.name] ?? ''} onChange={(e) => update(i, s.name, e.target.value)} className="h-10 w-full rounded-lg border border-mist bg-white px-2.5 text-sm focus:border-violet-500 focus:outline-none" />
                                    </div>
                                ),
                            )}
                        </div>
                        {!field.fixed && (
                            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="mb-2 p-1.5 text-ash hover:text-danger" aria-label="Remove row"><Trash2 className="size-4" /></button>
                        )}
                    </div>
                ))}
            </div>
            {!field.fixed && (
                <button type="button" onClick={() => onChange([...value, {}])} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700">
                    <Plus className="size-4" /> Add row
                </button>
            )}
            <Help>{field.help}</Help>
        </div>
    );
}
