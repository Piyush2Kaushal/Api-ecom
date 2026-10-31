<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BrandResource extends ResourceController
{
    protected string $model = Brand::class;

    protected string $title = 'Brands';

    protected string $singular = 'Brand';

    protected ?string $description = 'Mark your own brand as “Exclusive” to give it premium highlights across the store.';

    protected bool $sortable = true;

    public static function slug(): string
    {
        return 'brands';
    }

    protected function query(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        return Brand::withCount('products');
    }

    protected function fields(): array
    {
        return [
            ['name' => 'name', 'label' => 'Brand name', 'type' => 'text', 'required' => true, 'col' => 6],
            ['name' => 'slug', 'label' => 'URL slug', 'type' => 'text', 'col' => 6, 'help' => 'Leave empty to generate automatically.'],
            ['name' => 'tagline', 'label' => 'Tagline', 'type' => 'text'],
            ['name' => 'description', 'label' => 'Description', 'type' => 'textarea'],
            ['name' => 'logo', 'label' => 'Logo', 'type' => 'image', 'col' => 6],
            ['name' => 'banner', 'label' => 'Brand page banner', 'type' => 'image', 'col' => 6],
            ['name' => 'is_exclusive', 'label' => 'Exclusive brand', 'type' => 'toggle', 'help' => 'Shows a gold “Exclusive” badge on its products.'],
            ['name' => 'is_featured', 'label' => 'Show in brand strip', 'type' => 'toggle'],
            ['name' => 'is_active', 'label' => 'Visible on website', 'type' => 'toggle', 'default' => true],
            ['name' => 'seo', 'label' => 'SEO', 'type' => 'section'],
            ['name' => 'meta_title', 'label' => 'Meta title', 'type' => 'text'],
            ['name' => 'meta_description', 'label' => 'Meta description', 'type' => 'textarea', 'max' => 500],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'logo_url', 'label' => '', 'type' => 'image'],
            ['key' => 'name', 'label' => 'Brand', 'type' => 'title', 'sub' => 'tagline'],
            ['key' => 'products_count', 'label' => 'Products', 'type' => 'number'],
            ['key' => 'is_exclusive', 'label' => 'Exclusive', 'type' => 'badge'],
            ['key' => 'is_active', 'label' => 'Visible', 'type' => 'toggle'],
        ];
    }

    protected function prepare(array $data, ?Model $item): array
    {
        $slug = Str::slug(($data['slug'] ?? '') ?: $data['name']);
        if (Brand::where('slug', $slug)->where('id', '!=', $item?->id ?? 0)->exists()) {
            $slug .= '-'.Str::lower(Str::random(4));
        }
        $data['slug'] = $slug;

        return $data;
    }
}
