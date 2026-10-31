import { Banner, BrandSpotlight, BrandsStrip, CategoryTiles, FeatureGrid, Hero, NewsletterBlock, ProductRail, Split, SupportCta, TextBlock, TradeCta, TrainingCta, UspStrip, type HomeSection } from '@/components/store/HomeBlocks';

export default function Home({ sections }: { sections: HomeSection[] }) {
    return (
        <>
            {sections.map((s) => {
                switch (s.type) {
                    case 'hero':
                        return <Hero key={s.id} slides={s.slides ?? []} />;
                    case 'usp':
                        return <UspStrip key={s.id} section={s} />;
                    case 'categories':
                        return <CategoryTiles key={s.id} section={s} />;
                    case 'products':
                        return <ProductRail key={s.id} section={s} />;
                    case 'brand_spotlight':
                        return <BrandSpotlight key={s.id} section={s} />;
                    case 'banner':
                        return <Banner key={s.id} section={s} />;
                    case 'split':
                        return <Split key={s.id} section={s} />;
                    case 'trade_cta':
                        return <TradeCta key={s.id} section={s} />;
                    case 'training_cta':
                        return <TrainingCta key={s.id} section={s} />;
                    case 'brands':
                        return <BrandsStrip key={s.id} section={s} />;
                    case 'newsletter':
                        return <NewsletterBlock key={s.id} section={s} />;
                    case 'support_cta':
                        return <SupportCta key={s.id} section={s} />;
                    case 'features':
                        return <FeatureGrid key={s.id} section={s} />;
                    case 'text':
                        return <TextBlock key={s.id} section={s} />;
                    default:
                        return null;
                }
            })}
        </>
    );
}
