<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CartService
{
    public const SESSION_KEY = 'cart_token';

    public function current(bool $create = false): ?Cart
    {
        $user = Auth::guard('web')->user();
        if ($user) {
            $cart = Cart::where('user_id', $user->id)->whereNull('converted_at')->latest('id')->first();
            if (! $cart && $create) {
                $cart = Cart::create(['user_id' => $user->id, 'email' => $user->email]);
            }

            return $cart;
        }

        $token = session(self::SESSION_KEY);
        $cart = $token ? Cart::where('token', $token)->whereNull('user_id')->whereNull('converted_at')->first() : null;
        if (! $cart && $create) {
            $token = Str::random(40);
            session([self::SESSION_KEY => $token]);
            $cart = Cart::create(['token' => $token]);
        }

        return $cart;
    }

    /** Move a guest cart into the user's cart after login / registration. */
    public function mergeGuestCart(User $user, ?string $token): void
    {
        if (! $token) {
            return;
        }
        $guest = Cart::where('token', $token)->whereNull('user_id')->whereNull('converted_at')->with('items')->first();
        if (! $guest || $guest->items->isEmpty()) {
            return;
        }
        $cart = Cart::firstOrCreate(['user_id' => $user->id, 'converted_at' => null], ['email' => $user->email]);
        foreach ($guest->items as $item) {
            $existing = $cart->items()->where('product_id', $item->product_id)
                ->where('product_variant_id', $item->product_variant_id)->where('saved_for_later', $item->saved_for_later)->first();
            $existing ? $existing->increment('quantity', $item->quantity) : $item->update(['cart_id' => $cart->id]);
        }
        if (! $cart->coupon_code && $guest->coupon_code) {
            $cart->update(['coupon_code' => $guest->coupon_code]);
        }
        $guest->delete();
    }

    public function add(Product $product, ?int $variantId, int $qty): CartItem
    {
        $cart = $this->current(true);
        $item = $cart->items()->where('product_id', $product->id)->where('product_variant_id', $variantId)->where('saved_for_later', false)->first();
        if ($item) {
            $item->increment('quantity', $qty);
        } else {
            $item = $cart->items()->create(['product_id' => $product->id, 'product_variant_id' => $variantId, 'quantity' => $qty]);
        }
        $cart->touch();

        return $item;
    }

    public function itemCount(?Cart $cart = null): int
    {
        $cart ??= $this->current();

        return $cart ? (int) $cart->items()->where('saved_for_later', false)->sum('quantity') : 0;
    }

    /**
     * Full price breakdown for a cart.
     *
     * @param  array{country?:string, postcode?:string, shipping_method_id?:int|null, email?:string|null}  $ctx
     */
    public function summary(?Cart $cart, ?User $user, array $ctx = []): array
    {
        $tier = Pricing::tierFor($user);
        $cart?->load(['items.product.images', 'items.product.brand', 'items.variant', 'items.product.categories:id']);
        $items = $cart ? $cart->items : collect();

        $lines = [];
        $saved = [];
        $weight = 0.0;
        foreach ($items as $item) {
            $p = $item->product;
            if (! $p || ! $p->is_active) {
                continue;
            }
            $variant = $item->variant;
            $price = Pricing::price($p, $tier, $variant);
            $row = [
                'id' => $item->id,
                'product_id' => $p->id,
                'variant_id' => $variant?->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'sku' => $variant?->sku ?: $p->sku,
                'brand' => $p->brand?->name,
                'variant_label' => $variant ? ($p->option_name ?: 'Option').': '.$variant->value : null,
                'image' => media_url($variant?->image) ?? $p->images->first()?->url,
                'quantity' => (int) $item->quantity,
                'unit_original' => $price['original'],
                'unit_price' => $price['price'],
                'percent_off' => $price['percent_off'],
                'vat_mode' => $p->resolvedVatMode(),
                'in_stock' => $p->inStock($variant),
                'available' => $p->availableQty($variant),
                'category_ids' => array_merge([$p->category_id], $p->categories->pluck('id')->all()),
                'brand_id' => $p->brand_id,
            ];
            if ($item->saved_for_later) {
                $saved[] = $row;

                continue;
            }
            $row['line_original'] = round($row['unit_original'] * $row['quantity'], 2);
            $row['line_amount'] = round($row['unit_price'] * $row['quantity'], 2);
            $row['coupon_discount'] = 0.0;
            $row['issue'] = null;
            if (! $row['in_stock']) {
                $row['issue'] = 'Out of stock';
            } elseif ($row['available'] !== null && $row['quantity'] > $row['available']) {
                $row['issue'] = 'Only '.$row['available'].' available';
            }
            $weight += (float) $p->weight * $row['quantity'];
            $lines[] = $row;
        }

        $itemsSubtotal = round(array_sum(array_column($lines, 'line_amount')), 2);
        $savings = round(array_sum(array_column($lines, 'line_original')) - $itemsSubtotal, 2);

        // Coupon
        $coupon = null;
        $couponError = null;
        $freeShippingCoupon = false;
        $couponDiscount = 0.0;
        if ($cart?->coupon_code) {
            $result = $this->applyCoupon($cart->coupon_code, $lines, $tier, $user, $ctx['email'] ?? $cart->email);
            if (isset($result['error'])) {
                $couponError = $result['error'];
            } else {
                $lines = $result['lines'];
                $couponDiscount = $result['discount'];
                $freeShippingCoupon = $result['free_shipping'];
                $coupon = ['code' => $result['coupon']->code, 'description' => $result['coupon']->description, 'type' => $result['coupon']->type, 'discount' => $couponDiscount];
            }
        }

        // VAT per line on the discounted amount
        $net = 0.0;
        $vat = 0.0;
        $gross = 0.0;
        $includedVat = 0.0;
        foreach ($lines as &$line) {
            $taxable = round($line['line_amount'] - $line['coupon_discount'], 2);
            $v = Pricing::vat($taxable, $line['vat_mode']);
            $line['net'] = $v['net'];
            $line['vat'] = $v['vat'];
            $line['gross'] = $v['gross'];
            $line['vat_rate'] = $v['rate'];
            $net += $v['net'];
            $vat += $v['vat'];
            $gross += $v['gross'];
            if ($line['vat_mode'] === 'included') {
                $includedVat += $v['vat'];
            }
            unset($line['category_ids'], $line['brand_id']);
        }
        unset($line);

        // Shipping
        $afterCoupon = round($itemsSubtotal - $couponDiscount, 2);
        $country = $ctx['country'] ?? 'GB';
        $methods = $lines ? ShippingService::methodsFor($country, $ctx['postcode'] ?? null, $afterCoupon, $weight) : [];
        if ($freeShippingCoupon) {
            $methods = array_map(fn ($m) => array_merge($m, ['cost' => 0.0, 'is_free' => true]), $methods);
        }
        $selected = collect($methods)->firstWhere('id', (int) ($ctx['shipping_method_id'] ?? 0)) ?? ($methods[0] ?? null);
        $shippingCost = $selected ? (float) $selected['cost'] : 0.0;
        $shipVat = ['net' => $shippingCost, 'vat' => 0.0, 'gross' => $shippingCost];
        if (setting('vat_on_shipping') && $shippingCost > 0) {
            $shipVat = Pricing::vat($shippingCost, setting('default_vat_mode') === 'excluded' ? 'excluded' : 'included');
        }

        $threshold = ShippingService::freeShippingThreshold();

        return [
            'tier' => $tier,
            'lines' => array_values($lines),
            'saved' => $saved,
            'coupon' => $coupon,
            'coupon_error' => $couponError,
            'shipping_methods' => $methods,
            'shipping_method' => $selected,
            'has_issues' => collect($lines)->contains(fn ($l) => $l['issue'] !== null),
            'free_shipping' => $threshold ? [
                'threshold' => $threshold,
                'remaining' => max(0, round($threshold - $afterCoupon, 2)),
                'qualified' => $afterCoupon >= $threshold,
            ] : null,
            'totals' => [
                'item_count' => array_sum(array_column($lines, 'quantity')),
                'items_subtotal' => $itemsSubtotal,
                'savings' => $savings,
                'coupon_discount' => $couponDiscount,
                'shipping' => round($shipVat['gross'], 2),
                'shipping_vat' => round($shipVat['vat'], 2),
                'net_total' => round($net + $shipVat['net'], 2),
                'vat_total' => round($vat + $shipVat['vat'], 2),
                'included_vat' => round($includedVat, 2),
                'grand_total' => round($gross + $shipVat['gross'], 2),
                'vat_rate' => Pricing::vatRate(),
                'weight' => round($weight, 3),
            ],
        ];
    }

    /**
     * Validate a coupon against the cart lines and spread the discount across eligible lines.
     */
    public function applyCoupon(string $code, array $lines, string $tier, ?User $user, ?string $email): array
    {
        $coupon = Coupon::where('code', strtoupper(trim($code)))->first();
        if (! $coupon || ! $coupon->is_active) {
            return ['error' => 'This coupon code is not valid.'];
        }
        if ($coupon->starts_at && $coupon->starts_at->isFuture()) {
            return ['error' => 'This coupon is not active yet.'];
        }
        if ($coupon->ends_at && $coupon->ends_at->isPast()) {
            return ['error' => 'This coupon has expired.'];
        }
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return ['error' => 'This coupon has reached its usage limit.'];
        }
        if (! empty($coupon->allowed_tiers) && ! in_array($tier, $coupon->allowed_tiers, true)) {
            return ['error' => 'This coupon is not available for your account type.'];
        }
        if ($coupon->usage_per_customer && ($user || $email)) {
            $used = CouponUsage::where('coupon_id', $coupon->id)
                ->where(fn ($q) => $user ? $q->where('user_id', $user->id)->orWhere('email', $user->email) : $q->where('email', $email))->count();
            if ($used >= $coupon->usage_per_customer) {
                return ['error' => 'You have already used this coupon.'];
            }
        }

        $ids = collect($coupon->applies_ids ?? [])->map(fn ($i) => (int) $i)->all();
        if ($coupon->applies_to === 'categories') {
            $ids = collect($ids)->flatMap(fn ($id) => Category::descendantIds($id))->unique()->all();
        }
        $eligible = [];
        foreach ($lines as $i => $line) {
            $ok = match ($coupon->applies_to) {
                'products' => in_array($line['product_id'], $ids, true),
                'categories' => (bool) array_intersect($line['category_ids'], $ids),
                'brands' => in_array($line['brand_id'], $ids, true),
                default => true,
            };
            if ($ok) {
                $eligible[] = $i;
            }
        }
        if (! $eligible) {
            return ['error' => 'This coupon does not apply to the items in your basket.'];
        }
        $eligibleSum = round(array_sum(array_map(fn ($i) => $lines[$i]['line_amount'], $eligible)), 2);
        if ($coupon->min_subtotal && $eligibleSum < (float) $coupon->min_subtotal) {
            return ['error' => 'Spend '.money($coupon->min_subtotal).' or more to use this coupon.'];
        }

        $discount = match ($coupon->type) {
            'percent' => round($eligibleSum * min((float) $coupon->value, 100) / 100, 2),
            'fixed' => min((float) $coupon->value, $eligibleSum),
            default => 0.0,
        };
        if ($coupon->max_discount && $discount > (float) $coupon->max_discount) {
            $discount = (float) $coupon->max_discount;
        }

        // Spread proportionally; the last eligible line absorbs rounding.
        $remaining = $discount;
        foreach ($eligible as $n => $i) {
            $share = $n === array_key_last($eligible) ? $remaining : round($discount * $lines[$i]['line_amount'] / max($eligibleSum, 0.01), 2);
            $share = min($share, $lines[$i]['line_amount']);
            $lines[$i]['coupon_discount'] = $share;
            $remaining = round($remaining - $share, 2);
        }

        return ['coupon' => $coupon, 'lines' => $lines, 'discount' => round($discount, 2), 'free_shipping' => $coupon->type === 'free_shipping'];
    }
}
