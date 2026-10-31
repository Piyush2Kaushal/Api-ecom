<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Http\Controllers\Admin\ProductController;
use App\Models\Brand;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Database\Eloquent\Model;

class CouponResource extends ResourceController
{
    protected string $model = Coupon::class;

    protected string $title = 'Coupons';

    protected string $singular = 'Coupon';

    protected ?string $description = 'Create discount codes. Switch a coupon off at any time without deleting it.';

    protected array $searchable = ['code', 'description'];

    public static function slug(): string
    {
        return 'coupons';
    }

    protected function filters(): array
    {
        return [['key' => 'is_active', 'label' => 'Status', 'options' => static::options(['1' => 'Enabled', '0' => 'Disabled'])]];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'code', 'label' => 'Coupon code', 'type' => 'text', 'required' => true, 'unique' => true, 'col' => 6, 'uppercase' => true, 'max' => 50],
            ['name' => 'is_active', 'label' => 'Enabled', 'type' => 'toggle', 'default' => true, 'col' => 6],
            ['name' => 'description', 'label' => 'Internal description', 'type' => 'text'],
            ['name' => 'type', 'label' => 'Discount type', 'type' => 'select', 'required' => true, 'col' => 6, 'default' => 'percent',
                'options' => static::options(['percent' => 'Percentage off', 'fixed' => 'Fixed amount off (£)', 'free_shipping' => 'Free delivery'])],
            ['name' => 'value', 'label' => 'Discount value', 'type' => 'number', 'col' => 6, 'min' => 0, 'showIf' => ['field' => 'type', 'in' => ['percent', 'fixed']]],
            ['name' => 'rules', 'label' => 'Rules', 'type' => 'section'],
            ['name' => 'min_subtotal', 'label' => 'Minimum spend (£)', 'type' => 'money', 'col' => 6, 'min' => 0],
            ['name' => 'max_discount', 'label' => 'Maximum discount (£)', 'type' => 'money', 'col' => 6, 'min' => 0],
            ['name' => 'starts_at', 'label' => 'Starts', 'type' => 'datetime', 'col' => 6],
            ['name' => 'ends_at', 'label' => 'Ends', 'type' => 'datetime', 'col' => 6],
            ['name' => 'usage_limit', 'label' => 'Total uses allowed', 'type' => 'number', 'col' => 6, 'min' => 1, 'help' => 'Empty = unlimited'],
            ['name' => 'usage_per_customer', 'label' => 'Uses per customer', 'type' => 'number', 'col' => 6, 'min' => 1, 'help' => 'Empty = unlimited'],
            ['name' => 'allowed_tiers', 'label' => 'Who can use it', 'type' => 'multiselect', 'help' => 'Leave empty for everyone.',
                'options' => static::options(['retailer' => 'Retailers & guests', 'trader' => 'Traders', 'wholesaler' => 'Wholesalers'])],
            ['name' => 'applies_to', 'label' => 'Applies to', 'type' => 'select', 'default' => 'all',
                'options' => static::options(['all' => 'Whole basket', 'products' => 'Specific products', 'categories' => 'Specific categories', 'brands' => 'Specific brands'])],
            ['name' => 'applies_ids', 'label' => 'Choose items', 'type' => 'multiselect', 'optionsBy' => 'applies_to', 'showIf' => ['field' => 'applies_to', 'in' => ['products', 'categories', 'brands']],
                'optionsMap' => [
                    'products' => Product::orderBy('name')->limit(5000)->get(['id', 'name', 'sku'])->map(fn ($p) => ['value' => (string) $p->id, 'label' => $p->name.' ('.$p->sku.')']),
                    'categories' => collect(ProductController::categoryOptions())->map(fn ($c) => ['value' => (string) $c['id'], 'label' => $c['label']]),
                    'brands' => Brand::orderBy('name')->get(['id', 'name'])->map(fn ($b) => ['value' => (string) $b->id, 'label' => $b->name]),
                ]],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'code', 'label' => 'Code', 'type' => 'title', 'sub' => 'description', 'mono' => true],
            ['key' => 'summary', 'label' => 'Discount', 'type' => 'text'],
            ['key' => 'usage', 'label' => 'Used', 'type' => 'text'],
            ['key' => 'window', 'label' => 'Valid', 'type' => 'text'],
            ['key' => 'is_active', 'label' => 'Enabled', 'type' => 'toggle'],
        ];
    }

    protected function transform(Model $c): array
    {
        return array_merge($c->toArray(), [
            'starts_at' => $c->starts_at?->format('Y-m-d\TH:i'),
            'ends_at' => $c->ends_at?->format('Y-m-d\TH:i'),
            'applies_ids' => array_map('strval', $c->applies_ids ?? []),
            'summary' => match ($c->type) {
                'percent' => rtrim(rtrim(number_format((float) $c->value, 2), '0'), '.').'% off',
                'fixed' => money($c->value).' off',
                default => 'Free delivery',
            }.($c->min_subtotal ? ' · min '.money($c->min_subtotal) : ''),
            'usage' => $c->used_count.($c->usage_limit ? ' / '.$c->usage_limit : ''),
            'window' => ($c->starts_at ? $c->starts_at->format('d M') : 'Now').' → '.($c->ends_at ? $c->ends_at->format('d M Y') : 'No end'),
        ]);
    }

    protected function prepare(array $data, ?Model $item): array
    {
        $data['code'] = strtoupper(preg_replace('/\s+/', '', $data['code']));
        $data['value'] = (float) ($data['value'] ?? 0);
        $data['applies_ids'] = array_map('intval', $data['applies_ids'] ?? []);
        $data['allowed_tiers'] = $data['allowed_tiers'] ?? [];

        return $data;
    }
}
