<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Category extends Model
{
    public const MAX_DEPTH = 5;

    protected $guarded = ['id'];

    protected $appends = ['image_url', 'banner_url'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'show_in_menu' => 'boolean', 'show_on_home' => 'boolean'];
    }

    protected static function booted(): void
    {
        $flush = fn () => Cache::forget('category_tree');
        static::saved($flush);
        static::deleted($flush);
    }

    public function getImageUrlAttribute(): ?string
    {
        return media_url($this->image);
    }

    public function getBannerUrlAttribute(): ?string
    {
        return media_url($this->banner);
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order')->orderBy('name');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /** Full cached tree of all categories as flat arrays keyed by id. */
    public static function flatTree(): array
    {
        return Cache::rememberForever('category_tree', function () {
            return static::query()->orderBy('sort_order')->orderBy('name')
                ->get(['id', 'parent_id', 'name', 'slug', 'depth', 'image', 'is_active', 'show_in_menu', 'show_on_home', 'sort_order'])
                ->keyBy('id')->map(fn ($c) => $c->only(['id', 'parent_id', 'name', 'slug', 'depth', 'image_url', 'is_active', 'show_in_menu', 'show_on_home', 'sort_order']))
                ->all();
        });
    }

    /** Nested tree (optionally only active). */
    public static function nested(bool $activeOnly = true, bool $menuOnly = false): array
    {
        $flat = collect(static::flatTree())
            ->when($activeOnly, fn ($c) => $c->where('is_active', true))
            ->when($menuOnly, fn ($c) => $c->where('show_in_menu', true));
        $byParent = $flat->groupBy(fn ($c) => $c['parent_id'] ?? 0);
        $build = function ($parentId) use (&$build, $byParent) {
            return ($byParent[$parentId] ?? collect())->values()->map(function ($c) use ($build) {
                $c['children'] = $build($c['id']);

                return $c;
            })->all();
        };

        return $build(0);
    }

    /** IDs of this category and every descendant. */
    public static function descendantIds(int $id): array
    {
        $flat = collect(static::flatTree());
        $ids = [$id];
        $frontier = [$id];
        while ($frontier) {
            $frontier = $flat->whereIn('parent_id', $frontier)->pluck('id')->all();
            $ids = array_merge($ids, $frontier);
        }

        return $ids;
    }

    /** Breadcrumb trail from root to the given category. */
    public static function trail(?int $id): array
    {
        $flat = static::flatTree();
        $trail = [];
        while ($id && isset($flat[$id])) {
            array_unshift($trail, ['name' => $flat[$id]['name'], 'slug' => $flat[$id]['slug'], 'id' => $id]);
            $id = $flat[$id]['parent_id'];
        }

        return $trail;
    }

    /** Depth of the deepest descendant below this category (0 if none). */
    public function subtreeHeight(): int
    {
        $flat = collect(static::flatTree());
        $height = 0;
        $frontier = [$this->id];
        while (true) {
            $frontier = $flat->whereIn('parent_id', $frontier)->pluck('id')->all();
            if (! $frontier) {
                return $height;
            }
            $height++;
        }
    }
}
