import { useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Download, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { PageHeader } from '@/layouts/AdminLayout';
import { Button, Card, Checkbox, Select } from '@/components/ui';
import { route } from '@/lib/utils';

export default function Import({ columns, help }: { columns: string[]; help: Record<string, string> }) {
    const { props } = usePage<any>();
    const form = useForm({ file: null as File | null, mode: 'upsert', download_images: false });
    const importErrors: string[] = props.flash?.importErrors ?? props.importErrors ?? [];
    return (
        <>
            <PageHeader back={{ href: route('admin.products.index'), label: 'Products' }} title="Import products" description="Add or update hundreds of products at once from Excel or CSV. Products are matched by SKU." />
            <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
                <Card title="Upload file">
                    <form onSubmit={(e) => { e.preventDefault(); form.post(route('admin.products.import.store'), { forceFormData: true, preserveScroll: true }); }} className="space-y-5">
                        <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-fog bg-porcelain/60 px-6 py-12 text-center transition hover:border-violet-400">
                            {form.data.file ? <FileSpreadsheet className="size-8 text-violet-600" /> : <UploadCloud className="size-8 text-violet-500" />}
                            <span className="text-sm"><strong>{form.data.file ? form.data.file.name : 'Choose an .xlsx or .csv file'}</strong></span>
                            <span className="text-xs text-slate">Up to 20MB · first sheet only</span>
                            <input type="file" accept=".xlsx,.csv" className="hidden" onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)} />
                        </label>
                        {form.errors.file && <p className="text-sm text-danger">{form.errors.file}</p>}
                        <Select label="What should happen?" value={form.data.mode} onChange={(e) => form.setData('mode', e.target.value)} options={[{ value: 'upsert', label: 'Create new products and update existing ones (recommended)' }, { value: 'create_only', label: 'Only create new products' }, { value: 'update_only', label: 'Only update existing products' }]} />
                        <Checkbox checked={form.data.download_images} onChange={(v) => form.setData('download_images', v)} label="Download images from URLs into the store" description="Slower, but images keep working if the old site is removed." />
                        <Button size="lg" loading={form.processing} disabled={!form.data.file}>Start import</Button>
                    </form>
                    {importErrors.length > 0 && (
                        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
                            <div className="mb-2 flex items-center gap-2 font-semibold"><AlertTriangle className="size-4" /> Some rows were skipped</div>
                            <ul className="list-disc space-y-1 pl-5">{importErrors.map((er, i) => <li key={i}>{er}</li>)}</ul>
                        </div>
                    )}
                </Card>
                <Card title="1. Download the template">
                    <p className="text-sm text-slate">Start from the template (or export your current products), fill it in, then upload it.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button variant="dark" size="sm" href={route('admin.products.template', { format: 'xlsx' })} external><Download className="size-4" /> Template (Excel)</Button>
                        <Button variant="outline" size="sm" href={route('admin.products.template', { format: 'csv' })} external><Download className="size-4" /> Template (CSV)</Button>
                        <Button variant="outline" size="sm" href={route('admin.products.export', { format: 'xlsx' })} external><Download className="size-4" /> Export all products</Button>
                    </div>
                    <div className="mt-6 space-y-2.5 text-sm">
                        {Object.entries(help).map(([k, v]) => <div key={k}><code className="rounded bg-porcelain px-1.5 py-0.5 text-xs font-semibold">{k}</code> <span className="text-slate">{v}</span></div>)}
                    </div>
                    <div className="mt-6 text-xs text-slate">Columns: {columns.join(', ')}</div>
                </Card>
            </div>
        </>
    );
}
