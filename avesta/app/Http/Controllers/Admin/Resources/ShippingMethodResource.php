<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ShippingMethodResource extends ResourceController
{
    protected string $model = ShippingMethod::class;

    protected string $title = 'Delivery methods';

    protected string $singular = 'Delivery method';

    protected ?string $description = 'Set prices per zone: a flat price, or price bands by weight (kg) or by order value (£). The free-delivery threshold is set in Settings → Shipping.';

    protected bool $sortable = true;

    public static function slug(): string
    {
        return 'shipping-methods';
    }

    protected function query(Request $request): Builder
    {
        return ShippingMethod::with('zone:id,name');
    }

    protected function filters(): array
    {
        return [['key' => 'shipping_zone_id', 'label' => 'Zone', 'options' => ShippingZone::orderBy('sort_order')->get()->map(fn ($z) => ['value' => (string) $z->id, 'label' => $z->name])->all()]];
    }

    protected function fields(): array
    {
        return [
            ['name' => 'shipping_zone_id', 'label' => 'Zone', 'type' => 'select', 'required' => true, 'numeric' => true,
                'options' => ShippingZone::orderBy('sort_order')->get()->map(fn ($z) => ['value' => (string) $z->id, 'label' => $z->name])->all()],
            ['name' => 'name', 'label' => 'Name shown at checkout', 'type' => 'text', 'required' => true, 'col' => 6],
            ['name' => 'delivery_estimate', 'label' => 'Delivery estimate', 'type' => 'text', 'col' => 6, 'placeholder' => '2–3 working days'],
            ['name' => 'description', 'label' => 'Short description', 'type' => 'text'],
            ['name' => 'type', 'label' => 'How is it priced?', 'type' => 'select', 'required' => true, 'default' => 'flat',
                'options' => static::options(['flat' => 'Flat price', 'weight' => 'By total weight (kg)', 'order_value' => 'By order value (£)'])],
            ['name' => 'cost', 'label' => 'Price (£)', 'type' => 'money', 'min' => 0, 'showIf' => ['field' => 'type', 'in' => ['flat']]],
            ['name' => 'rates', 'label' => 'Price bands', 'type' => 'repeater', 'showIf' => ['field' => 'type', 'in' => ['weight', 'order_value']],
                'help' => 'Leave “To” empty for “and above”. Carts outside every band will not see this method.',
                'fields' => [
                    ['name' => 'min', 'label' => 'From', 'type' => 'number'],
                    ['name' => 'max', 'label' => 'To', 'type' => 'number'],
                    ['name' => 'cost', 'label' => 'Price (£)', 'type' => 'number'],
                ]],
            ['name' => 'free_shipping_eligible', 'label' => 'Becomes free above the free-delivery threshold', 'type' => 'toggle', 'default' => true],
            ['name' => 'is_active', 'label' => 'Active', 'type' => 'toggle', 'default' => true],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Method', 'type' => 'title', 'sub' => 'delivery_estimate'],
            ['key' => 'zone_name', 'label' => 'Zone', 'type' => 'text'],
            ['key' => 'price_summary', 'label' => 'Price', 'type' => 'text'],
            ['key' => 'free_shipping_eligible', 'label' => 'Free over threshold', 'type' => 'bool'],
            ['key' => 'is_active', 'label' => 'Active', 'type' => 'toggle'],
        ];
    }

    protected function transform(Model $m): array
    {
        return array_merge($m->toArray(), [
            'shipping_zone_id' => (string) $m->shipping_zone_id,
            'zone_name' => $m->zone?->name,
            'price_summary' => $m->type === 'flat' ? ((float) $m->cost > 0 ? money($m->cost) : 'Free') : count($m->rates ?? []).' band(s) by '.($m->type === 'weight' ? 'weight' : 'order value'),
        ]);
    }

    protected function prepare(array $data, ?Model $item): array
    {
        $data['cost'] = (float) ($data['cost'] ?? 0);
        $data['rates'] = array_values(array_map(fn ($r) => [
            'min' => (float) ($r['min'] ?? 0),
            'max' => ($r['max'] ?? '') === '' || ($r['max'] ?? null) === null ? null : (float) $r['max'],
            'cost' => (float) ($r['cost'] ?? 0),
        ], $data['rates'] ?? []));

        return $data;
    }
}
