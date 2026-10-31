<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

/**
 * Single source of truth for tier prices, discounts and VAT.
 *
 * Order of calculation: tier price → product discount → coupon → VAT (on discounted amount) → shipping.
 */
class Pricing
{
    public static function column(?string $tier): string
    {
        return match ($tier) {
            'trader' => 'trade',
            'wholesaler' => 'wholesale',
            default => 'retail',
        };
    }

    public static function tierFor(?User $user): string
    {
        return $user && in_array($user->tier, User::TIERS, true) ? $user->tier : 'retailer';
    }

    public static function discountActive(Product $p): bool
    {
        $now = now();

        return (! $p->discount_starts_at || $p->discount_starts_at->lte($now))
            && (! $p->discount_ends_at || $p->discount_ends_at->gte($now));
    }

    /**
     * @return array{original: float, price: float, percent_off: float, has_discount: bool}
     */
    public static function price(Product $p, string $tier, ?ProductVariant $variant = null): array
    {
        $col = static::column($tier);
        $useOwn = $col !== 'retail' && $p->{$col.'_price'} !== null && (float) $p->{$col.'_price'} > 0;
        $source = $useOwn ? $col : 'retail';

        $base = (float) $p->{$source.'_price'} + ($variant ? (float) $variant->price_adjustment : 0);
        $base = max(0, $base);
        $type = $p->{$source.'_discount_type'};
        $value = (float) $p->{$source.'_discount_value'};

        $price = $base;
        if (static::discountActive($p) && $value > 0) {
            $price = match ($type) {
                'percent' => $base * (1 - min($value, 100) / 100),
                'fixed' => max(0, $base - $value),
                default => $base,
            };
        }
        $price = round($price, 2);
        $hasDiscount = $price < $base;

        return [
            'original' => round($base, 2),
            'price' => $price,
            'percent_off' => $hasDiscount && $base > 0 ? round((1 - $price / $base) * 100, 1) : 0,
            'has_discount' => $hasDiscount,
        ];
    }

    public static function vatRate(): float
    {
        return (float) setting('vat_rate', 20);
    }

    /**
     * Split an amount into net / VAT / gross according to the VAT mode.
     * - included: amount already contains VAT  → gross = amount
     * - excluded: VAT is added on top          → gross = amount + VAT
     * - none:     zero-rated                    → gross = amount
     *
     * @return array{net: float, vat: float, gross: float, rate: float}
     */
    public static function vat(float $amount, string $mode, ?float $rate = null): array
    {
        $rate = $mode === 'none' ? 0.0 : ($rate ?? static::vatRate());
        $r = $rate / 100;

        return match ($mode) {
            'excluded' => ['net' => round($amount, 2), 'vat' => round($amount * $r, 2), 'gross' => round($amount + round($amount * $r, 2), 2), 'rate' => $rate],
            'included' => (function () use ($amount, $r, $rate) {
                $net = round($amount / (1 + $r), 2);

                return ['net' => $net, 'vat' => round($amount - $net, 2), 'gross' => round($amount, 2), 'rate' => $rate];
            })(),
            default => ['net' => round($amount, 2), 'vat' => 0.0, 'gross' => round($amount, 2), 'rate' => 0.0],
        };
    }
}
