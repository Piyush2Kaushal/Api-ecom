<?php

namespace App\Models;

use App\Services\Pricing;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public const VAT_MODES = ['default', 'included', 'excluded', 'none'];

    public const DISCOUNT_TYPES = ['none', 'percent', 'fixed'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'key_features' => 'array',
            'retail_price' => 'decimal:2', 'trade_price' => 'decimal:2', 'wholesale_price' => 'decimal:2',
            'retail_discount_value' => 'decimal:2', 'trade_discount_value' => 'decimal:2', 'wholesale_discount_value' => 'decimal:2',
            'discount_starts_at' => 'datetime', 'discount_ends_at' => 'datetime',
            'track_stock' => 'boolean', 'allow_backorder' => 'boolean',
            'is_active' => 'boolean', 'is_featured' => 'boolean', 'is_new' => 'boolean',
            'weight' => 'decimal:3',
        ];
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function specs()
    {
        return $this->hasMany(ProductSpec::class)->orderBy('sort_order');
    }

    public function files()
    {
        return $this->hasMany(ProductFile::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function scopeActive(Builder $q): Builder
    {
        return $q->where('products.is_active', true);
    }

    /** Products in a category or any of its descendants, via primary or extra category. */
    public function scopeInCategory(Builder $q, int $categoryId): Builder
    {
        $ids = Category::descendantIds($categoryId);

        return $q->where(function ($w) use ($ids) {
            $w->whereIn('products.category_id', $ids)
                ->orWhereIn('products.id', fn ($s) => $s->select('product_id')->from('category_product')->whereIn('category_id', $ids));
        });
    }

    public function scopeSearch(Builder $q, ?string $term): Builder
    {
        $term = trim((string) $term);
        if ($term === '') {
            return $q;
        }
        $words = array_slice(preg_split('/\s+/', $term), 0, 6);

        return $q->where(function ($w) use ($words, $term) {
            $w->where('products.sku', 'like', "%{$term}%")->orWhere(function ($all) use ($words) {
                foreach ($words as $word) {
                    $all->where(function ($one) use ($word) {
                        $one->where('products.name', 'like', "%{$word}%")
                            ->orWhereHas('brand', fn ($b) => $b->where('name', 'like', "%{$word}%"));
                    });
                }
            });
        });
    }

    /** SQL expression for the effective (discounted) price for a tier — used for sorting and price filters. */
    public static function priceSql(string $tier): string
    {
        $col = Pricing::column($tier);
        $base = $col === 'retail' ? 'products.retail_price' : "COALESCE(products.{$col}_price, products.retail_price)";
        $type = $col === 'retail' ? 'products.retail_discount_type' : "CASE WHEN products.{$col}_price IS NULL THEN products.retail_discount_type ELSE products.{$col}_discount_type END";
        $value = $col === 'retail' ? 'products.retail_discount_value' : "CASE WHEN products.{$col}_price IS NULL THEN products.retail_discount_value ELSE products.{$col}_discount_value END";
        $now = "'".now()->toDateTimeString()."'";
        $active = "(products.discount_starts_at IS NULL OR products.discount_starts_at <= {$now}) AND (products.discount_ends_at IS NULL OR products.discount_ends_at >= {$now})";

        return "(CASE WHEN {$active} THEN (CASE {$type} WHEN 'percent' THEN {$base} * (1 - {$value} / 100) WHEN 'fixed' THEN {$base} - {$value} ELSE {$base} END) ELSE {$base} END)";
    }

    public function primaryImageUrl(): ?string
    {
        $first = $this->relationLoaded('images') ? $this->images->first() : $this->images()->first();

        return $first?->url;
    }

    public function inStock(?ProductVariant $variant = null): bool
    {
        if (! $this->track_stock || $this->allow_backorder) {
            return true;
        }

        return ($variant ? $variant->stock_qty : $this->stock_qty) > 0;
    }

    public function availableQty(?ProductVariant $variant = null): ?int
    {
        if (! $this->track_stock || $this->allow_backorder) {
            return null;
        }

        return max(0, $variant ? $variant->stock_qty : $this->stock_qty);
    }

    public function isLowStock(): bool
    {
        $threshold = $this->low_stock_threshold ?? (int) setting('low_stock_threshold', 5);

        return $this->track_stock && $this->stock_qty <= $threshold;
    }

    public function resolvedVatMode(): string
    {
        return $this->vat_mode === 'default' ? (string) setting('default_vat_mode', 'included') : $this->vat_mode;
    }
}
