<?php

namespace App\Http\Controllers\Admin\Resources;

use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ShippingZoneResource extends ResourceController
{
    protected string $model = ShippingZone::class;

    protected string $title = 'Shipping zones';

    protected string $singular = 'Zone';

    protected ?string $description = 'Zones group delivery areas. A zone with postcode prefixes (e.g. Highlands: IV, HS, KW, ZE) takes priority over the general country zone.';

    protected bool $sortable = true;

    public static function slug(): string
    {
        return 'shipping-zones';
    }

    protected function query(Request $request): \Illuminate\Database\Eloquent\Builder
    {
        return ShippingZone::withCount('methods');
    }

    protected function fields(): array
    {
        return [
            ['name' => 'name', 'label' => 'Zone name', 'type' => 'text', 'required' => true],
            ['name' => 'countries', 'label' => 'Countries', 'type' => 'multiselect', 'required' => true, 'options' => static::options([
                'GB' => 'United Kingdom', 'IE' => 'Ireland', 'FR' => 'France', 'DE' => 'Germany', 'NL' => 'Netherlands', 'BE' => 'Belgium',
                'ES' => 'Spain', 'IT' => 'Italy', 'PT' => 'Portugal', 'US' => 'United States', 'AE' => 'United Arab Emirates',
            ])],
            ['name' => 'postcode_prefixes', 'label' => 'Only these postcode areas (optional)', 'type' => 'tags', 'help' => 'Type a prefix and press Enter, e.g. BT for Northern Ireland.'],
            ['name' => 'is_active', 'label' => 'Active', 'type' => 'toggle', 'default' => true],
        ];
    }

    protected function columns(): array
    {
        return [
            ['key' => 'name', 'label' => 'Zone', 'type' => 'title'],
            ['key' => 'countries', 'label' => 'Countries', 'type' => 'list'],
            ['key' => 'postcode_prefixes', 'label' => 'Postcodes', 'type' => 'list'],
            ['key' => 'methods_count', 'label' => 'Methods', 'type' => 'number'],
            ['key' => 'is_active', 'label' => 'Active', 'type' => 'toggle'],
        ];
    }

    protected function extra(Request $request): array
    {
        return ['links' => [['label' => 'Delivery methods & rates →', 'route' => 'admin.shipping_methods.index']]];
    }

    protected function prepare(array $data, ?Model $item): array
    {
        $data['postcode_prefixes'] = array_values(array_filter(array_map(fn ($p) => strtoupper(trim($p)), $data['postcode_prefixes'] ?? [])));

        return $data;
    }
}
