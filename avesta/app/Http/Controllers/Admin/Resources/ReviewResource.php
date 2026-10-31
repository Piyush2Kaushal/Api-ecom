<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\Review;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ReviewResource extends ResourceController
{
    protected string $model = Review::class;

    protected string $title = 'Reviews';

    protected string $singular = 'Review';

    protected ?string $description = 'Only verified buyers can review. Approve reviews to publish them.';

    protected bool $canCreate = false;

    protected array $searchable = ['title', 'body'];

    public static function slug(): string
    {
        return 'reviews';
    }

    protected function query(Request $request): Builder
    {
        return Review::with(['product:id,name', 'user:id,first_name,last_name']);
    }

    protected function filters(): array
    {
        return [['key' => 'is_approved', 'label' => 'Status', 'options' => static::options(['0' => 'Waiting', '1' => 'Published'])]];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'product_name', 'label' => 'Product', 'type' => 'text', 'readonly' => true],
            ['name' => 'author', 'label' => 'Customer', 'type' => 'text', 'readonly' => true, 'col' => 6],
            ['name' => 'rating', 'label' => 'Rating', 'type' => 'number', 'readonly' => true, 'col' => 6],
            ['name' => 'title', 'label' => 'Title', 'type' => 'text'],
            ['name' => 'body', 'label' => 'Review', 'type' => 'textarea'],
            ['name' => 'is_approved', 'label' => 'Published', 'type' => 'toggle'],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'product_name', 'label' => 'Product', 'type' => 'title', 'sub' => 'author'],
            ['key' => 'stars', 'label' => 'Rating', 'type' => 'text'],
            ['key' => 'title', 'label' => 'Review', 'type' => 'text', 'sub' => 'body'],
            ['key' => 'is_approved', 'label' => 'Published', 'type' => 'toggle'],
        ];
    }

    protected function transform(Model $r): array
    {
        return array_merge($r->toArray(), [
            'product_name' => $r->product?->name,
            'author' => $r->user?->name,
            'stars' => str_repeat('★', $r->rating).str_repeat('☆', 5 - $r->rating),
        ]);
    }
}
