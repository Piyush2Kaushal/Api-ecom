import { Button } from '@/components/ui';

export default function Error({ status }: { status: number }) {
    const copy: Record<number, [string, string]> = {
        404: ['Page not found', 'The page you are looking for has moved or no longer exists.'],
        403: ['Access denied', 'You do not have permission to view this page.'],
        500: ['Something went wrong', 'Our team has been notified. Please try again in a moment.'],
        503: ['Back soon', 'We are carrying out scheduled maintenance.'],
    };
    const [title, text] = copy[status] ?? copy[500];
    return (
        <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
            <div className="font-display text-[110px] font-semibold leading-none tracking-tighter text-violet-100 md:text-[160px]">{status}</div>
            <h1 className="-mt-4 font-display text-3xl font-semibold md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-md text-slate">{text}</p>
            <div className="mt-8 flex gap-3">
                <Button href="/">Go home</Button>
                <Button variant="outline" href="/shop">Browse products</Button>
            </div>
        </div>
    );
}
