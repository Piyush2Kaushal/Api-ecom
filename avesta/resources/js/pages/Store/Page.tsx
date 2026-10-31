import { Breadcrumbs } from '@/components/store/Breadcrumbs';
import { formatDate } from '@/lib/utils';

export default function Page({ page }: { page: { title: string; content: string | null; updated_at: string } }) {
    return (
        <>
            <section className="border-b border-mist bg-porcelain/60">
                <div className="container-x max-w-4xl py-12 md:py-16">
                    <Breadcrumbs items={[{ label: page.title }]} />
                    <h1 className="mt-5 font-display text-[36px] font-semibold tracking-tight md:text-[48px]">{page.title}</h1>
                    <p className="mt-2 text-sm text-slate">Last updated {formatDate(page.updated_at)}</p>
                </div>
            </section>
            <article className="container-x max-w-4xl py-12 md:py-16">
                <div className="prose-avesta" dangerouslySetInnerHTML={{ __html: page.content ?? '' }} />
            </article>
        </>
    );
}
