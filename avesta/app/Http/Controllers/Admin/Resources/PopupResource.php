<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\Popup;

class PopupResource extends ResourceController
{
    protected string $model = Popup::class;

    protected string $title = 'Popups';

    protected string $singular = 'Popup';

    protected ?string $description = 'A gentle promotional popup. Only the newest enabled popup is shown, once per visitor.';

    protected array $searchable = ['title'];

    public static function slug(): string
    {
        return 'popups';
    }

    protected function fields(): array
    {
        return [
            ['name' => 'title', 'label' => 'Title', 'type' => 'text', 'required' => true],
            ['name' => 'content', 'label' => 'Text', 'type' => 'textarea'],
            ['name' => 'image', 'label' => 'Image', 'type' => 'image'],
            ['name' => 'button_text', 'label' => 'Button text', 'type' => 'text', 'col' => 6],
            ['name' => 'button_link', 'label' => 'Button link', 'type' => 'text', 'col' => 6],
            ['name' => 'delay_seconds', 'label' => 'Show after (seconds)', 'type' => 'number', 'col' => 6, 'default' => 5, 'min' => 0],
            ['name' => 'pages', 'label' => 'Show on', 'type' => 'select', 'col' => 6, 'default' => 'home', 'options' => static::options(['home' => 'Homepage only', 'all' => 'All pages'])],
            ['name' => 'is_active', 'label' => 'Enabled', 'type' => 'toggle'],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'image_url', 'label' => '', 'type' => 'image'],
            ['key' => 'title', 'label' => 'Popup', 'type' => 'title'],
            ['key' => 'pages', 'label' => 'Shows on', 'type' => 'text'],
            ['key' => 'is_active', 'label' => 'Enabled', 'type' => 'toggle'],
        ];
    }
}
