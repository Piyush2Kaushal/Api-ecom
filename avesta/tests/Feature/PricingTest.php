<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use App\Models\User;
use App\Services\CartService;
use App\Services\Pricing;
use App\Support\Settings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** Locks in the VAT / discount rules agreed with the client. */
class PricingTest extends TestCase
{
    use RefreshDatabase;

    protected function product(array $attrs = []): Product
    {
        static $n = 0;
        $n++;

        return Product::create(array_merge([
            'name' => 'Camera '.$n, 'slug' => 'camera-'.$n, 'sku' => 'SKU-'.$n,
            'retail_price' => 20, 'vat_mode' => 'included', 'track_stock' => false,
        ], $attrs));
    }

    protected function summary(array $lines, ?User $user = null, ?string $coupon = null, float $shipping = 0): array
    {
        $zone = ShippingZone::create(['name' => 'UK', 'countries' => ['GB']]);
        ShippingMethod::create(['shipping_zone_id' => $zone->id, 'name' => 'Std', 'type' => 'flat', 'cost' => $shipping, 'free_shipping_eligible' => false]);
        $cart = Cart::create(['token' => 't'.uniqid(), 'coupon_code' => $coupon]);
        foreach ($lines as [$product, $qty]) {
            $cart->items()->create(['product_id' => $product->id, 'quantity' => $qty]);
        }

        return app(CartService::class)->summary($cart, $user, ['country' => 'GB']);
    }

    public function test_example_a_vat_included_keeps_total_and_extracts_vat(): void
    {
        $t = $this->summary([[$this->product(['vat_mode' => 'included']), 1]])['totals'];
        $this->assertSame(20.0, $t['grand_total']);
        $this->assertSame(16.67, $t['net_total']);
        $this->assertSame(3.33, $t['vat_total']);
    }

    public function test_example_b_vat_excluded_adds_vat_on_top(): void
    {
        $t = $this->summary([[$this->product(['vat_mode' => 'excluded']), 1]])['totals'];
        $this->assertSame(24.0, $t['grand_total']);
        $this->assertSame(4.0, $t['vat_total']);
    }

    public function test_example_c_no_vat(): void
    {
        $t = $this->summary([[$this->product(['vat_mode' => 'none']), 1]])['totals'];
        $this->assertSame(20.0, $t['grand_total']);
        $this->assertSame(0.0, $t['vat_total']);
    }

    public function test_example_d_discount_then_coupon_then_vat_then_shipping(): void
    {
        Coupon::create(['code' => 'TEN', 'type' => 'percent', 'value' => 10]);
        $p = $this->product(['vat_mode' => 'excluded', 'retail_discount_type' => 'percent', 'retail_discount_value' => 10]);
        $t = $this->summary([[$p, 1]], null, 'TEN', 5)['totals'];
        $this->assertSame(18.0, $t['items_subtotal']);
        $this->assertSame(1.8, $t['coupon_discount']);
        $this->assertSame(3.24, $t['vat_total']);
        $this->assertSame(5.0, $t['shipping']);
        $this->assertSame(24.44, $t['grand_total']);
    }

    public function test_default_vat_mode_and_rate_come_from_settings(): void
    {
        Settings::set(['default_vat_mode' => 'excluded', 'vat_rate' => 5]);
        $t = $this->summary([[$this->product(['vat_mode' => 'default']), 1]])['totals'];
        $this->assertSame(21.0, $t['grand_total']);
    }

    public function test_each_tier_has_its_own_price_and_discount(): void
    {
        $p = $this->product([
            'retail_price' => 20, 'retail_discount_type' => 'percent', 'retail_discount_value' => 10,
            'trade_price' => 10, 'trade_discount_type' => 'percent', 'trade_discount_value' => 20,
            'wholesale_price' => null,
        ]);
        $this->assertSame(18.0, Pricing::price($p, 'retailer')['price']);
        $this->assertSame(8.0, Pricing::price($p, 'trader')['price']);
        $this->assertSame(10.0, Pricing::price($p, 'trader')['original']);
        // Empty wholesale price falls back to the retailer price
        $this->assertSame(18.0, Pricing::price($p, 'wholesaler')['price']);
    }

    public function test_unapproved_trade_applicant_sees_retail_prices(): void
    {
        $user = User::create(['first_name' => 'T', 'email' => 't@x.test', 'password' => 'secret123', 'tier' => 'retailer']);
        $p = $this->product(['trade_price' => 10]);
        $this->assertSame(20.0, $this->summary([[$p, 1]], $user)['totals']['grand_total']);
        $user->update(['tier' => 'trader']);
        $this->assertSame(10.0, $this->summary([[$p, 1]], $user->fresh())['totals']['grand_total']);
    }
}
