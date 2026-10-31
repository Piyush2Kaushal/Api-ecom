<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\HeroSlide;

class HeroSlideResource extends ResourceController
{
    protected string $model = HeroSlide::class;

    protected string $title = 'Hero slides';

    protected string $singular = 'Slide';

    protected ?string $description = 'The large banner carousel at the top of the homepage. Drag to reorder. Recommended image: 2400 × 1200px (mobile: 1080 × 1350px).';

    protected bool $sortable = true;

    protected array $searchable = ['title'];

    public static function slug(): string
    {
        return 'hero-slides';
    }

    protected function fields(): array
    {
        return [
            ['name' => 'eyebrow', 'label' => 'Small label above title', 'type' => 'text', 'placeholder' => 'Introducing Tenvo'],
            ['name' => 'title', 'label' => 'Headline', 'type' => 'text', 'required' => true],
            ['name' => 'subtitle', 'label' => 'Supporting text', 'type' => 'textarea', 'max' => 500],
            ['name' => 'image', 'label' => 'Desktop image', 'type' => 'image', 'col' => 6],
            ['name' => 'mobile_image', 'label' => 'Mobile image (optional)', 'type' => 'image', 'col' => 6],
            ['name' => 'button_text', 'label' => 'Main button text', 'type' => 'text', 'col' => 6],
            ['name' => 'button_link', 'label' => 'Main button link', 'type' => 'text', 'col' => 6, 'placeholder' => '/brand/tenvo'],
            ['name' => 'button2_text', 'label' => 'Second button text', 'type' => 'text', 'col' => 6],
            ['name' => 'button2_link', 'label' => 'Second button link', 'type' => 'text', 'col' => 6],
            ['name' => 'theme', 'label' => 'Text colour', 'type' => 'select', 'default' => 'dark', 'options' => static::options(['dark' => 'Light text on dark image', 'light' => 'Dark text on light image'])],
            ['name' => 'is_active', 'label' => 'Visible', 'type' => 'toggle', 'default' => true],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'image_url', 'label' => '', 'type' => 'image', 'wide' => true],
            ['key' => 'title', 'label' => 'Headline', 'type' => 'title', 'sub' => 'eyebrow'],
            ['key' => 'button_text', 'label' => 'Button', 'type' => 'text'],
            ['key' => 'is_active', 'label' => 'Visible', 'type' => 'toggle'],
        ];
    }
}
