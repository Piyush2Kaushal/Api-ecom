<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\Page;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PageResource extends ResourceController
{
    protected string $model = Page::class;

    protected string $title = 'Pages';

    protected string $singular = 'Page';

    protected ?string $description = 'Policies, About Us, Delivery, Warranty and any other content page. Pages open at yoursite.co.uk/slug.';

    protected array $searchable = ['title', 'slug'];

    protected string $defaultSort = 'title';

    protected string $defaultDirection = 'asc';

    public static function slug(): string
    {
        return 'pages';
    }

    protected function fields(): array
    {
        return [
            ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => true, 'col' => 6],
            ['name' => 'slug', 'label' => 'URL slug', 'type' => 'text', 'col' => 6, 'help' => 'e.g. delivery → /delivery'],
            ['name' => 'content', 'label' => 'Content', 'type' => 'richtext'],
            ['name' => 'is_active', 'label' => 'Published', 'type' => 'toggle', 'default' => true],
            ['name' => 'seo', 'label' => 'SEO', 'type' => 'section'],
            ['name' => 'meta_title', 'label' => 'Meta title', 'type' => 'text'],
            ['name' => 'meta_description', 'label' => 'Meta description', 'type' => 'textarea', 'max' => 500],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'title', 'label' => 'Page', 'type' => 'title', 'sub' => 'path'],
            ['key' => 'updated_at', 'label' => 'Updated', 'type' => 'date'],
            ['key' => 'is_active', 'label' => 'Published', 'type' => 'toggle'],
        ];
    }

    protected function transform(Model $p): array
    {
        return array_merge($p->toArray(), ['path' => '/'.$p->slug, 'view_url' => url($p->slug)]);
    }

    protected function prepare(array $data, ?Model $item): array
    {
        $slug = Str::slug(($data['slug'] ?? '') ?: $data['title']);
        $reserved = ['admin', 'account', 'cart', 'checkout', 'shop', 'search', 'product', 'category', 'brand', 'brands', 'login', 'register', 'training', 'contact', 'track', 'trade-accounts-apply'];
        if (in_array($slug, $reserved, true) || Page::where('slug', $slug)->where('id', '!=', $item?->id ?? 0)->exists()) {
            $slug .= '-page';
        }
        $data['slug'] = $slug;

        return $data;
    }
}
