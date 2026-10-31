import { useForm } from '@inertiajs/react';
import { motion } from 'motion/react';
import { Check, FileDown, PackageSearch } from 'lucide-react';
import { AddressBlock, OrderItems, OrderTotals } from '@/components/store/OrderView';
import { Button } from '@/components/ui';
import { route } from '@/lib/utils';

export default function OrderSuccess({ order, invoiceUrl, trackUrl, canCreateAccount }: { order: any; invoiceUrl: string | null; trackUrl: string; canCreateAccount: boolean }) {
    const paid = !!order.paid_at;
    return (
        <div className="bg-porcelain/60">
            <div className="container-x max-w-4xl py-12 md:py-20">
                <div className="text-center">
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }} className="mx-auto flex size-20 items-center justify-center rounded-full bg-violet-600 text-white shadow-glow">
                        <Check className="size-9" strokeWidth={2.5} />
                    </motion.div>
                    <h1 className="mt-6 font-display text-[34px] font-semibold tracking-tight md:text-[44px]">{paid ? 'Thank you — order confirmed' : 'Order received'}</h1>
                    <p className="mt-3 text-slate">
                        {paid ? <>Order <strong className="text-onyx">{order.number}</strong> is confirmed. A confirmation and VAT invoice have been sent to <strong className="text-onyx">{order.email}</strong>.</> : <>We are confirming your payment for order <strong>{order.number}</strong>. This page will update shortly.</>}
                    </p>
                    <div className="mt-7 flex flex-wrap justify-center gap-3">
                        {invoiceUrl && <Button variant="dark" href={invoiceUrl} external><FileDown className="size-4" /> Download invoice</Button>}
                        <Button variant="outline" href={trackUrl}><PackageSearch className="size-4" /> Track order</Button>
                        <Button variant="ghost" href={route('shop')}>Continue shopping</Button>
                    </div>
                </div>
                <div className="mt-12 grid gap-6 md:grid-cols-[1fr_300px]">
                    <div className="rounded-3xl border border-mist bg-white p-6">
                        <OrderItems order={order} />
                        <div className="mt-4 border-t border-mist pt-4"><OrderTotals order={order} /></div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-5 rounded-3xl border border-mist bg-white p-6">
                            <AddressBlock title="Delivering to" a={order.shipping_address} />
                            {order.po_reference && <div className="text-sm"><div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">PO reference</div>{order.po_reference}</div>}
                        </div>
                        {canCreateAccount && <CreateAccount email={order.email} first={order.shipping_address?.first_name} last={order.shipping_address?.last_name} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreateAccount({ email, first, last }: { email: string; first?: string; last?: string }) {
    return (
        <div className="rounded-3xl bg-onyx p-6 text-white">
            <div className="text-lg font-semibold">Save time next order</div>
            <p className="mt-1.5 text-sm text-white/60">Create an account with {email} — this order will be added to it automatically.</p>
            <Button variant="light" size="sm" className="mt-4" href={route('register') + `?email=${encodeURIComponent(email)}&first_name=${encodeURIComponent(first ?? '')}&last_name=${encodeURIComponent(last ?? '')}`}>Create account</Button>
        </div>
    );
}
