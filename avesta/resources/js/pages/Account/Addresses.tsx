import { router, useForm } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Checkbox, EmptyState, Input, Modal } from '@/components/ui';
import { route } from '@/lib/utils';

const blank = { label: '', first_name: '', last_name: '', company: '', line1: '', line2: '', city: '', county: '', postcode: '', country: 'GB', phone: '', is_default_shipping: false, is_default_billing: false };

export default function Addresses({ addresses }: any) {
    const [editing, setEditing] = useState<any | null>(null);
    const form = useForm({ ...blank });
    const open = (a?: any) => {
        setEditing(a ?? {});
        form.clearErrors();
        form.setData(a ? Object.fromEntries(Object.keys(blank).map((k) => [k, a[k] ?? (blank as any)[k]])) as any : { ...blank });
    };
    const save = () => {
        const opts = { preserveScroll: true, onSuccess: () => setEditing(null) };
        editing?.id ? form.put(route('account.addresses.update', editing.id), opts) : form.post(route('account.addresses.store'), opts);
    };
    const f = (k: keyof typeof blank, label: string, extra: any = {}) => (
        <Input label={label} value={(form.data as any)[k]} onChange={(e) => form.setData(k as any, k === 'postcode' ? e.target.value.toUpperCase() : e.target.value)} error={(form.errors as any)[k]} {...extra} />
    );
    return (
        <div className="rounded-3xl border border-mist bg-white">
            <div className="flex items-center justify-between border-b border-mist p-5">
                <h2 className="text-lg font-semibold">Saved addresses</h2>
                <Button size="sm" onClick={() => open()}><Plus className="size-4" /> Add address</Button>
            </div>
            <div className="p-5">
                {addresses.length === 0 ? (
                    <EmptyState icon={<MapPin className="size-6" />} title="No saved addresses" text="Save your office, warehouse or site addresses for faster checkout." />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {addresses.map((a: any) => (
                            <div key={a.id} className="rounded-2xl border border-mist p-5 text-sm">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="font-semibold">{a.label || `${a.first_name} ${a.last_name ?? ''}`}</div>
                                    <div className="flex gap-1">
                                        {a.is_default_shipping && <Badge tone="violet">Delivery</Badge>}
                                        {a.is_default_billing && <Badge>Billing</Badge>}
                                    </div>
                                </div>
                                <div className="mt-2 leading-relaxed text-slate">
                                    {a.first_name} {a.last_name}<br />{a.company && <>{a.company}<br /></>}{a.line1}{a.line2 && `, ${a.line2}`}<br />{a.city} {a.postcode}
                                </div>
                                <div className="mt-4 flex gap-4">
                                    <button onClick={() => open(a)} className="flex items-center gap-1.5 font-semibold text-violet-700"><Pencil className="size-3.5" /> Edit</button>
                                    <button onClick={() => confirm('Remove this address?') && router.delete(route('account.addresses.destroy', a.id), { preserveScroll: true })} className="flex items-center gap-1.5 text-slate hover:text-danger"><Trash2 className="size-3.5" /> Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit address' : 'New address'} size="lg" footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save} loading={form.processing}>Save address</Button></>}>
                <div className="grid gap-4 sm:grid-cols-2">
                    {f('label', 'Label (e.g. Office, Site A)', { wrapperClassName: 'sm:col-span-2' })}
                    {f('first_name', 'First name', { required: true })}
                    {f('last_name', 'Last name', { required: true })}
                    {f('company', 'Company', { wrapperClassName: 'sm:col-span-2' })}
                    {f('line1', 'Address line 1', { required: true, wrapperClassName: 'sm:col-span-2' })}
                    {f('line2', 'Address line 2', { wrapperClassName: 'sm:col-span-2' })}
                    {f('city', 'Town / City', { required: true })}
                    {f('county', 'County')}
                    {f('postcode', 'Postcode', { required: true })}
                    {f('phone', 'Phone')}
                    <div className="space-y-2 sm:col-span-2">
                        <Checkbox checked={form.data.is_default_shipping} onChange={(v) => form.setData('is_default_shipping', v)} label="Default delivery address" />
                        <Checkbox checked={form.data.is_default_billing} onChange={(v) => form.setData('is_default_billing', v)} label="Default billing address" />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
