import { Link, router } from '@inertiajs/react';
import { BadgeCheck, Building2, Check, FileText, X } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/layouts/AdminLayout';
import { Button, EmptyState, Modal, Pagination, Select, StatusBadge, Textarea } from '@/components/ui';
import { cn, formatDate, route, tierLabel } from '@/lib/utils';

export default function Approvals({ applications, status, counts }: any) {
    const [rejecting, setRejecting] = useState<any>(null);
    const [reason, setReason] = useState('');
    const [tiers, setTiers] = useState<Record<number, string>>({});
    const tabs = [['pending', 'Waiting'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['unverified', 'Email not verified'], ['all', 'All']];
    return (
        <>
            <PageHeader title="Trade approvals" description="Approve or reject trader and wholesaler applications. Customers keep retail prices until approved, and get an email either way." />
            <div className="mb-4 flex flex-wrap gap-1.5">
                {tabs.map(([k, l]) => (
                    <Link key={k} href={route('admin.approvals.index', { status: k })} className={cn('rounded-full px-4 py-2 text-sm font-medium transition', status === k ? 'bg-onyx text-white' : 'bg-white text-slate ring-1 ring-mist hover:text-onyx')}>
                        {l} {k !== 'all' && counts[k] ? <span className="ml-1 opacity-60">{counts[k]}</span> : null}
                    </Link>
                ))}
            </div>
            {applications.data.length === 0 ? (
                <EmptyState icon={<BadgeCheck className="size-6" />} title="Nothing here" text={status === 'pending' ? 'No applications are waiting for review.' : undefined} />
            ) : (
                <div className="space-y-3">
                    {applications.data.map((a: any) => (
                        <div key={a.id} className="rounded-2xl border border-mist bg-white p-5">
                            <div className="flex flex-wrap items-start gap-5">
                                <span className="flex size-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Building2 className="size-5" /></span>
                                <div className="min-w-[240px] flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-lg font-semibold">{a.company_name}</span>
                                        <StatusBadge status={a.status} />
                                        <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-[11px] font-bold text-[#8a6a22]">Wants: {tierLabel[a.requested_tier]}</span>
                                    </div>
                                    <div className="mt-1 text-sm text-slate">
                                        <Link href={route('admin.customers.show', a.user.id)} className="font-medium text-onyx hover:text-violet-700">{a.user.first_name} {a.user.last_name}</Link> · {a.user.email} · {a.user.phone} · applied {formatDate(a.created_at)}
                                    </div>
                                    <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                                        {[['Company no.', a.company_number], ['VAT no.', a.vat_number], ['Business type', a.business_type], ['Monthly spend', a.monthly_spend], ['Website', a.website], ['Address', a.business_address]].map(([k, v]) => (
                                            <div key={k}><dt className="text-xs text-slate">{k}</dt><dd className="font-medium">{v || '—'}</dd></div>
                                        ))}
                                    </dl>
                                    {a.message && <p className="mt-3 rounded-xl bg-porcelain p-3 text-sm">{a.message}</p>}
                                    {a.document_path && <a href={'/' + a.document_path} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-700"><FileText className="size-4" /> View supporting document</a>}
                                    {a.rejection_reason && <p className="mt-3 text-sm text-danger">Reason: {a.rejection_reason}</p>}
                                </div>
                                {a.status === 'pending' && (
                                    <div className="flex w-full flex-col gap-2 sm:w-52">
                                        <Select value={tiers[a.id] ?? a.requested_tier} onChange={(e) => setTiers({ ...tiers, [a.id]: e.target.value })} options={[{ value: 'trader', label: 'Approve as Trader' }, { value: 'wholesaler', label: 'Approve as Wholesaler' }]} />
                                        <Button onClick={() => router.post(route('admin.approvals.approve', a.id), { tier: tiers[a.id] ?? a.requested_tier }, { preserveScroll: true })}><Check className="size-4" /> Approve</Button>
                                        <Button variant="outline" onClick={() => { setRejecting(a); setReason(''); }}><X className="size-4" /> Reject</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Pagination links={applications.links} className="mt-6" />
            <Modal open={!!rejecting} onClose={() => setRejecting(null)} title="Reject application" description={rejecting?.company_name} footer={<><Button variant="ghost" onClick={() => setRejecting(null)}>Cancel</Button><Button variant="danger" disabled={!reason.trim()} onClick={() => router.post(route('admin.approvals.reject', rejecting.id), { reason }, { preserveScroll: true, onSuccess: () => setRejecting(null) })}>Reject & notify</Button></>}>
                <Textarea label="Reason (sent to the customer)" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. We could not verify the company registration number." />
            </Modal>
        </>
    );
}
