<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Brand extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['logo_url', 'banner_url'];

    protected function casts(): array
    {
        return ['is_featured' => 'boolean', 'is_exclusive' => 'boolean', 'is_active' => 'boolean'];
    }

    protected static function booted(): void
    {
        $flush = fn () => Cache::forget('brands_active');
        static::saved($flush);
        static::deleted($flush);
    }

    public function getLogoUrlAttribute(): ?string
    {
        return media_url($this->logo);
    }

    public function getBannerUrlAttribute(): ?string
    {
        return media_url($this->banner);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public static function activeList(): array
    {
        return Cache::rememberForever('brands_active', fn () => static::where('is_active', true)
            ->orderBy('sort_order')->orderBy('name')
            ->get()->map(fn ($b) => $b->only(['id', 'name', 'slug', 'logo_url', 'is_exclusive', 'is_featured', 'tagline']))->all());
    }
}
