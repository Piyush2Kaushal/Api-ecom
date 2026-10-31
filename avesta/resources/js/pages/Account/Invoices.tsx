import { FileDown, FileText } from 'lucide-react';
import { Badge, EmptyState, Pagination } from '@/components/ui';
import { gbp } from '@/hooks/useMoney';
import { formatDate, route } from '@/lib/utils';

export default function Invoices({ invoices }: any) {
    return (
        <div className="rounded-3xl border border-mist bg-white">
            <div className="border-b border-mist p-5"><h2 className="text-lg font-semibold">Invoices & credit notes</h2></div>
            {invoices.data.length === 0 ? (
                <div className="p-6"><EmptyState icon={<FileText className="size-6" />} title="No invoices yet" text="Invoices appear here as soon as an order is paid." /></div>
            ) : (
                <ul className="divide-y divide-mist">
                    {invoices.data.map((i: any) => (
                        <li key={i.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                            <FileText className="size-5 text-violet-600" />
                            <div className="flex-1">
                                <div className="font-semibold">{i.number} {i.type === 'credit_note' && <Badge tone="warning">Credit note</Badge>}</div>
                                <div className="text-xs text-slate">Order {i.order?.number} · {formatDate(i.issued_at)}{i.order?.po_reference && ` · PO ${i.order.po_reference}`}</div>
                            </div>
                            <div className="tabular font-semibold">{gbp(i.amount, i.order?.currency, Number(i.order?.exchange_rate ?? 1))}</div>
                            <a href={route('account.invoices.download', i.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-mist px-3 py-2 text-sm font-semibold hover:border-onyx"><FileDown className="size-4" /> PDF</a>
                        </li>
                    ))}
                </ul>
            )}
            <Pagination links={invoices.links} className="p-5" />
        </div>
    );
}
