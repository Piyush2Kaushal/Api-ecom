import { Heart } from 'lucide-react';
import { ProductCard } from '@/components/store/ProductCard';
import { Button, EmptyState } from '@/components/ui';
import { route } from '@/lib/utils';

export default function Wishlist({ products }: any) {
    return products.length === 0 ? (
        <EmptyState icon={<Heart className="size-6" />} title="Your wishlist is empty" text="Tap the heart on any product to save it here." action={<Button href={route('shop')}>Browse products</Button>} />
    ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-6 xl:grid-cols-3">{products.map((p: any) => <ProductCard key={p.id} product={p} />)}</div>
    );
}
