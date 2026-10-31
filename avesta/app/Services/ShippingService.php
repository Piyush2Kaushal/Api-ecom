<?php

namespace App\Services;

use App\Models\ShippingMethod;
use App\Models\ShippingZone;

class ShippingService
{
    public static function freeShippingThreshold(): ?float
    {
        $t = (float) setting('free_shipping_threshold', 0);

        return setting('free_shipping_enabled') && $t > 0 ? $t : null;
    }

    public static function zoneFor(string $country, ?string $postcode): ?ShippingZone
    {
        $postcode = strtoupper(str_replace(' ', '', (string) $postcode));
        $zones = ShippingZone::where('is_active', true)->orderBy('sort_order')->with(['methods' => fn ($q) => $q->where('is_active', true)])->get()
            ->filter(fn ($z) => in_array($country, $z->countries ?? [], true));

        // Zones restricted to postcode prefixes (e.g. Highlands "IV", "HS") win over the general country zone.
        $specific = $zones->first(function ($z) use ($postcode) {
            foreach ($z->postcode_prefixes ?? [] as $prefix) {
                $prefix = strtoupper(str_replace(' ', '', $prefix));
                if ($prefix !== '' && $postcode !== '' && preg_match('/^'.preg_quote($prefix, '/').'(\d|$)/', $postcode)) {
                    return true;
                }
            }

            return false;
        });

        return $specific ?? $zones->first(fn ($z) => empty($z->postcode_prefixes));
    }

    /**
     * @return array<int, array{id:int,name:string,description:?string,estimate:?string,cost:float,is_free:bool}>
     */
    public static function methodsFor(string $country, ?string $postcode, float $orderValue, float $weight): array
    {
        $zone = static::zoneFor($country ?: 'GB', $postcode);
        if (! $zone) {
            return [];
        }
        $threshold = static::freeShippingThreshold();

        return $zone->methods->map(function (ShippingMethod $m) use ($orderValue, $weight, $threshold) {
            $cost = static::cost($m, $orderValue, $weight);
            if ($cost === null) {
                return null;
            }
            $free = $m->free_shipping_eligible && $threshold !== null && $orderValue >= $threshold;

            return [
                'id' => $m->id,
                'name' => $m->name,
                'description' => $m->description,
                'estimate' => $m->delivery_estimate,
                'cost' => $free ? 0.0 : $cost,
                'is_free' => $free || $cost == 0,
            ];
        })->filter()->values()->all();
    }

    /** Null means "not available for this cart" (outside all weight/value bands). */
    public static function cost(ShippingMethod $m, float $orderValue, float $weight): ?float
    {
        if ($m->type === 'flat') {
            return (float) $m->cost;
        }
        $measure = $m->type === 'weight' ? $weight : $orderValue;
        foreach ($m->rates ?? [] as $band) {
            $min = (float) ($band['min'] ?? 0);
            $max = ($band['max'] ?? '') === '' || $band['max'] === null ? INF : (float) $band['max'];
            if ($measure >= $min && $measure <= $max) {
                return (float) ($band['cost'] ?? 0);
            }
        }

        return null;
    }
}
