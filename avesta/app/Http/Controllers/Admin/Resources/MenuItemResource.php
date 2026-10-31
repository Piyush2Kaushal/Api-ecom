<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\MenuItem;

class MenuItemResource extends ResourceController
{
    protected string $model = MenuItem::class;

    protected string $title = 'Menus';

    protected string $singular = 'Menu link';

    protected ?string $description = 'Categories appear in the main menu automatically (tick “Show in menu” on a category). Use these links for extra header links and the footer columns.';

    protected bool $sortable = true;

    protected array $searchable = ['label', 'url'];

    public const LOCATIONS = ['header' => 'Header (after categories)', 'footer_quick' => 'Footer — Quick links', 'footer_products' => 'Footer — Shop', 'footer_help' => 'Footer — Help & policies'];

    public static function slug(): string
    {
        return 'menu-items';
    }

    protected function filters(): array
    {
        return [['key' => 'location', 'label' => 'Menu', 'options' => static::options(self::LOCATIONS)]];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'location', 'label' => 'Menu', 'type' => 'select', 'required' => true, 'options' => static::options(self::LOCATIONS)],
            ['name' => 'label', 'label' => 'Link text', 'type' => 'text', 'required' => true, 'col' => 6],
            ['name' => 'url', 'label' => 'Link', 'type' => 'text', 'required' => true, 'col' => 6, 'placeholder' => '/delivery or https://…'],
            ['name' => 'new_tab', 'label' => 'Open in new tab', 'type' => 'toggle'],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'label', 'label' => 'Link', 'type' => 'title', 'sub' => 'url'],
            ['key' => 'location_label', 'label' => 'Menu', 'type' => 'badge'],
        ];
    }

    protected function transform(\Illuminate\Database\Eloquent\Model $m): array
    {
        return array_merge($m->toArray(), ['location_label' => self::LOCATIONS[$m->location] ?? $m->location]);
    }
}
