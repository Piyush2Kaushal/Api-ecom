<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;

/** Turns products into the arrays the storefront renders, with tier-correct prices. */
class ProductPresenter
{
    public static function cardQuery(): Builder
    {
        return Product::query()->active()
            ->with(['brand:id,name,slug,is_exclusive', 'images' => fn ($q) => $q->orderBy('sort_order')])
            ->withAvg(['reviews as rating' => fn ($q) => $q->where('is_approved', true)], 'rating')
            ->withCount(['variants as variants_count' => fn ($q) => $q->where('is_active', true)]);
    }

    public static function card(Product $p, string $tier): array
    {
        $price = Pricing::price($p, $tier);
        $images = $p->images;

        return [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'sku' => $p->sku,
            'brand' => $p->brand ? ['name' => $p->brand->name, 'slug' => $p->brand->slug, 'is_exclusive' => $p->brand->is_exclusive] : null,
            'image' => $images->first()?->url,
            'image_alt' => $images->get(1)?->url,
            'price' => $price,
            'vat_mode' => $p->resolvedVatMode(),
            'in_stock' => $p->inStock(),
            'has_variants' => ($p->variants_count ?? 0) > 0,
            'is_new' => $p->is_new,
            'is_featured' => $p->is_featured,
            'rating' => $p->rating ? round((float) $p->rating, 1) : null,
            'short_description' => $p->short_description,
        ];
    }

    public static function cards($products, string $tier): array
    {
        return collect($products)->map(fn ($p) => static::card($p, $tier))->values()->all();
    }

    public static function detail(Product $p, string $tier): array
    {
        $p->loadMissing(['brand', 'images', 'specs', 'files', 'variants' => fn ($q) => $q->where('is_active', true)]);
        $card = static::card($p, $tier);

        return array_merge($card, [
            'description' => $p->description,
            'key_features' => $p->key_features ?? [],
            'specs' => $p->specs->map->only(['label', 'value'])->values(),
            'files' => $p->files->map->only(['title', 'url'])->values(),
            'images' => $p->images->map(fn ($i) => ['url' => $i->url, 'alt' => $i->alt ?: $p->name])->values(),
            'option_name' => $p->option_name ?: 'Option',
            'variants' => $p->variants->map(fn ($v) => [
                'id' => $v->id,
                'value' => $v->value,
                'sku' => $v->sku,
                'image' => media_url($v->image),
                'price' => Pricing::price($p, $tier, $v),
                'in_stock' => $p->inStock($v),
                'available' => $p->availableQty($v),
            ])->values(),
            'available' => $p->availableQty(),
            'low_stock' => $p->track_stock && $p->stock_qty > 0 && $p->isLowStock(),
            'track_stock' => $p->track_stock,
            'allow_backorder' => $p->allow_backorder,
            'breadcrumbs' => Category::trail($p->category_id),
            'category_id' => $p->category_id,
            'meta_title' => $p->meta_title,
            'meta_description' => $p->meta_description,
        ]);
    }
}
