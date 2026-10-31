import { Card, EmptyState, StatusBadge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

export default function Enquiries({ training, contact }: any) {
    if (!training.length && !contact.length) return <EmptyState icon={<MessageSquare className="size-6" />} title="No enquiries yet" text="Training registrations and messages you send us will appear here." />;
    return (
        <div className="space-y-5">
            {training.length > 0 && (
                <Card title="Training registrations" padded={false}>
                    <ul className="divide-y divide-mist">{training.map((t: any) => (
                        <li key={t.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm"><div><div className="font-semibold">{t.course_title}</div><div className="text-xs text-slate">{formatDate(t.created_at)}</div></div><StatusBadge status={t.status} /></li>
                    ))}</ul>
                </Card>
            )}
            {contact.length > 0 && (
                <Card title="Messages" padded={false}>
                    <ul className="divide-y divide-mist">{contact.map((c: any) => (
                        <li key={c.id} className="px-5 py-4 text-sm"><div className="flex items-center justify-between gap-4"><div className="font-semibold">{c.subject || 'Enquiry'}</div><StatusBadge status={c.status} /></div><p className="mt-1 line-clamp-2 text-slate">{c.message}</p><div className="mt-1 text-xs text-ash">{formatDate(c.created_at)}</div></li>
                    ))}</ul>
                </Card>
            )}
        </div>
    );
}
