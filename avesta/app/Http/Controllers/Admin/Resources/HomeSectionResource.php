<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Http\Controllers\Admin\ProductController;
use App\Models\Brand;
use App\Models\HomeSection;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;

class HomeSectionResource extends ResourceController
{
    protected string $model = HomeSection::class;

    protected string $title = 'Homepage sections';

    protected string $singular = 'Section';

    protected ?string $description = 'Build the homepage from blocks. Drag to reorder, switch any block on or off. Hero slides are managed under Hero slides.';

    protected bool $sortable = true;

    protected array $searchable = ['title'];

    public const TYPES = [
        'hero' => 'Hero slider',
        'usp' => 'Benefits strip (icons)',
        'categories' => 'Shop by category',
        'products' => 'Product carousel',
        'brand_spotlight' => 'Brand spotlight (e.g. Tenvo)',
        'banner' => 'Full-width banner',
        'split' => 'Image + text block',
        'trade_cta' => 'Trade account call-to-action',
        'training_cta' => 'Training call-to-action',
        'support_cta' => 'Technical support block',
        'features' => 'Why buy from us (feature cards)',
        'brands' => 'Brand logos strip',
        'newsletter' => 'Newsletter sign-up',
        'text' => 'Free text',
    ];

    public static function slug(): string
    {
        return 'home-sections';
    }

    protected function fields(): array
    {
        $brands = Brand::orderBy('name')->get(['id', 'name'])->map(fn ($b) => ['value' => (string) $b->id, 'label' => $b->name])->all();
        $cats = collect(ProductController::categoryOptions())->map(fn ($c) => ['value' => (string) $c['id'], 'label' => $c['label']])->all();
        $show = fn (array $types) => ['field' => 'type', 'in' => $types];
        $icons = static::options(['truck' => 'Delivery', 'shield' => 'Warranty', 'badge' => 'Trade pricing', 'headset' => 'Support', 'award' => 'Quality', 'graduation' => 'Training', 'lock' => 'Secure', 'zap' => 'Fast', 'trade' => 'Trade supplier', 'bulb' => 'Ideas / products', 'settings' => 'Technical', 'cart' => 'Dispatch / cart', 'users' => 'People / training', 'tag' => 'Pricing tag', 'clock' => 'Time']);

        return [
            ['name' => 'type', 'label' => 'Block type', 'type' => 'select', 'required' => true, 'options' => static::options(self::TYPES)],
            ['name' => 'title', 'label' => 'Heading', 'type' => 'text'],
            ['name' => 'subtitle', 'label' => 'Sub-heading', 'type' => 'textarea', 'max' => 500],
            ['name' => 'is_active', 'label' => 'Visible', 'type' => 'toggle', 'default' => true],

            ['name' => 'settings.eyebrow', 'label' => 'Small label', 'type' => 'text', 'showIf' => $show(['brand_spotlight', 'banner', 'split', 'trade_cta', 'training_cta', 'support_cta', 'features'])],

            // Products
            ['name' => 'settings.source', 'label' => 'Which products?', 'type' => 'select', 'showIf' => $show(['products']), 'default' => 'featured',
                'options' => static::options(['featured' => 'Featured products', 'brand' => 'From a brand', 'category' => 'From a category', 'latest' => 'Newest', 'bestsellers' => 'Best sellers', 'sale' => 'On sale', 'manual' => 'Pick products manually'])],
            ['name' => 'settings.brand_id', 'label' => 'Brand', 'type' => 'select', 'options' => $brands, 'showIf' => ['field' => 'settings.source', 'in' => ['brand']]],
            ['name' => 'settings.category_id', 'label' => 'Category', 'type' => 'select', 'options' => $cats, 'showIf' => ['field' => 'settings.source', 'in' => ['category']]],
            ['name' => 'settings.product_ids', 'label' => 'Products', 'type' => 'multiselect', 'showIf' => ['field' => 'settings.source', 'in' => ['manual']],
                'options' => Product::orderBy('name')->limit(5000)->get(['id', 'name', 'sku'])->map(fn ($p) => ['value' => (string) $p->id, 'label' => $p->name.' ('.$p->sku.')'])->all()],
            ['name' => 'settings.limit', 'label' => 'How many', 'type' => 'number', 'showIf' => $show(['products']), 'default' => 8],
            ['name' => 'settings.theme', 'label' => 'Background', 'type' => 'select', 'showIf' => $show(['products', 'banner', 'split', 'usp', 'newsletter', 'features']), 'default' => 'light',
                'options' => static::options(['light' => 'White', 'muted' => 'Soft grey', 'dark' => 'Black (premium)', 'violet' => 'Deep violet'])],

            // Categories
            ['name' => 'settings.category_ids', 'label' => 'Categories to show', 'type' => 'multiselect', 'options' => $cats, 'showIf' => $show(['categories']),
                'help' => 'Leave empty to show categories ticked “Show on homepage” (or all top-level categories).'],

            // Brand spotlight
            ['name' => 'settings.brand_id', 'label' => 'Brand', 'type' => 'select', 'options' => $brands, 'showIf' => $show(['brand_spotlight'])],
            ['name' => 'settings.features', 'label' => 'Highlights', 'type' => 'repeater', 'showIf' => $show(['brand_spotlight']),
                'fields' => [['name' => 'title', 'label' => 'Title', 'type' => 'text'], ['name' => 'text', 'label' => 'Text', 'type' => 'text']]],

            // Shared visual + CTA
            ['name' => 'settings.text', 'label' => 'Body text', 'type' => 'textarea', 'showIf' => $show(['brand_spotlight', 'banner', 'split', 'trade_cta', 'training_cta', 'support_cta', 'newsletter'])],
            ['name' => 'settings.image', 'label' => 'Image', 'type' => 'image', 'col' => 6, 'showIf' => $show(['brand_spotlight', 'banner', 'split', 'trade_cta', 'training_cta', 'support_cta'])],
            ['name' => 'settings.mobile_image', 'label' => 'Mobile image', 'type' => 'image', 'col' => 6, 'showIf' => $show(['banner'])],
            ['name' => 'settings.image_position', 'label' => 'Image side', 'type' => 'select', 'showIf' => $show(['split', 'support_cta']), 'default' => 'right', 'options' => static::options(['left' => 'Left', 'right' => 'Right'])],
            ['name' => 'settings.button_text', 'label' => 'Button text', 'type' => 'text', 'col' => 6, 'showIf' => $show(['brand_spotlight', 'banner', 'split', 'trade_cta', 'training_cta', 'support_cta'])],
            ['name' => 'settings.button_link', 'label' => 'Button link', 'type' => 'text', 'col' => 6, 'showIf' => $show(['brand_spotlight', 'banner', 'split', 'trade_cta', 'training_cta', 'support_cta'])],

            // Technical support extras
            ['name' => 'settings.points', 'label' => 'Tick points', 'type' => 'repeater', 'showIf' => $show(['support_cta']),
                'fields' => [['name' => 'text', 'label' => 'Point', 'type' => 'text']]],
            ['name' => 'settings.badge_title', 'label' => 'Image badge title', 'type' => 'text', 'col' => 6, 'showIf' => $show(['support_cta']), 'help' => 'e.g. Experts online'],
            ['name' => 'settings.badge_text', 'label' => 'Image badge text', 'type' => 'text', 'col' => 6, 'showIf' => $show(['support_cta']), 'help' => 'The phone button uses the number in Settings → Store & company.'],

            // USP strip / feature cards
            ['name' => 'settings.items', 'label' => 'Items', 'type' => 'repeater', 'showIf' => $show(['usp', 'features']),
                'fields' => [['name' => 'icon', 'label' => 'Icon', 'type' => 'select', 'options' => $icons], ['name' => 'title', 'label' => 'Title', 'type' => 'text'], ['name' => 'text', 'label' => 'Text', 'type' => 'text']]],

            // Free text
            ['name' => 'settings.html', 'label' => 'Content', 'type' => 'richtext', 'showIf' => $show(['text'])],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'type_label', 'label' => 'Block', 'type' => 'badge'],
            ['key' => 'title', 'label' => 'Heading', 'type' => 'title', 'sub' => 'subtitle'],
            ['key' => 'is_active', 'label' => 'Visible', 'type' => 'toggle'],
        ];
    }

    protected function transform(Model $s): array
    {
        $settings = $s->settings ?? [];
        foreach (['brand_id', 'category_id'] as $k) {
            if (isset($settings[$k])) {
                $settings[$k] = (string) $settings[$k];
            }
        }
        foreach (['product_ids', 'category_ids'] as $k) {
            if (isset($settings[$k])) {
                $settings[$k] = array_map('strval', (array) $settings[$k]);
            }
        }

        return array_merge($s->toArray(), ['settings' => $settings, 'type_label' => self::TYPES[$s->type] ?? $s->type]);
    }

    protected function prepare(array $data, ?Model $item): array
    {
        $settings = array_merge($item?->settings ?? [], $data['settings'] ?? []);
        foreach (['brand_id', 'category_id', 'limit'] as $k) {
            if (isset($settings[$k]) && $settings[$k] !== '') {
                $settings[$k] = (int) $settings[$k];
            }
        }
        foreach (['product_ids', 'category_ids'] as $k) {
            if (isset($settings[$k])) {
                $settings[$k] = array_map('intval', (array) $settings[$k]);
            }
        }
        $data['settings'] = $settings;

        return $data;
    }
}
