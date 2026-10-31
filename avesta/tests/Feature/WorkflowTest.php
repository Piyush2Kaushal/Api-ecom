<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Cart;
use App\Models\Category;
use App\Models\ContactEnquiry;
use App\Models\Coupon;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Product;
use App\Models\TradeApplication;
use App\Models\TrainingCourse;
use App\Models\TrainingEnquiry;
use App\Models\User;
use App\Services\CartService;
use App\Services\OrderService;
use App\Support\Settings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/** End-to-end business workflows: checkout, orders, invoices, admin tools, forms. */
class WorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    protected function admin(): static
    {
        return $this->actingAs(Admin::first(), 'admin');
    }

    protected function customer(string $tier = 'retailer'): User
    {
        return User::create(['first_name' => 'Jo', 'last_name' => 'Bloggs', 'email' => uniqid().'@x.test', 'phone' => '0700', 'password' => 'secret123',
            'tier' => $tier, 'email_verified_at' => now()]);
    }

    protected function checkout(?User $user = null): Order
    {
        config(['services.stripe.demo_mode' => true, 'services.stripe.secret' => null]);
        $product = Product::where('sku', 'TV-IPD5-28')->first();
        $user ? $this->actingAs($user, 'web') : null;
        $this->post('/cart', ['product_id' => $product->id, 'quantity' => 2])->assertRedirect();
        $address = ['first_name' => 'Jo', 'last_name' => 'Bloggs', 'line1' => '1 High St', 'city' => 'Leeds', 'postcode' => 'LS1 1AA', 'country' => 'GB'];
        $method = \App\Models\ShippingMethod::where('name', 'Standard delivery')->first();
        $this->post('/checkout', [
            'email' => $user?->email ?? 'guest@x.test', 'phone' => '0700', 'shipping' => $address, 'billing_same' => true,
            'shipping_method_id' => $method->id, 'po_reference' => 'PO-77', 'accept_terms' => true,
        ])->assertRedirect();

        return Order::latest('id')->first();
    }

    public function test_guest_checkout_creates_paid_order_invoice_and_reduces_stock(): void
    {
        $before = Product::where('sku', 'TV-IPD5-28')->value('stock_qty');
        $order = $this->checkout();
        $this->assertNotNull($order->paid_at);
        $this->assertSame('paid', $order->status);
        $this->assertSame('PO-77', $order->po_reference);
        $this->assertNotNull($order->guest_customer_id);
        // 2 × £71.99 = £143.98 (≥ £99 so standard delivery is free)
        $this->assertSame('143.98', $order->grand_total);
        $this->assertSame('0.00', $order->shipping_total);
        $this->assertSame($before - 2, Product::where('sku', 'TV-IPD5-28')->value('stock_qty'));
        $this->assertSame(1, $order->invoices()->count());
        $this->assertNotNull(Cart::find($order->cart_id)->converted_at);
    }

    public function test_guest_orders_link_to_account_after_registration(): void
    {
        $order = $this->checkout();
        auth('web')->logout();
        $this->post('/register', ['account_type' => 'retailer', 'first_name' => 'G', 'last_name' => 'U', 'email' => 'guest@x.test', 'phone' => '0700',
            'password' => 'Secret123', 'password_confirmation' => 'Secret123', 'accept_terms' => true])->assertRedirect('/verify');
        $user = User::where('email', 'guest@x.test')->first();
        \App\Models\EmailOtp::where('email', $user->email)->update(['code_hash' => bcrypt('123456')]);
        $this->post('/verify', ['code' => '123456'])->assertRedirect('/account');
        $this->assertSame($user->id, $order->fresh()->user_id);
    }

    public function test_trade_registration_waits_for_approval_then_upgrades(): void
    {
        $this->post('/register', ['account_type' => 'trader', 'first_name' => 'T', 'last_name' => 'R', 'email' => 'trade@x.test', 'phone' => '0700',
            'password' => 'Secret123', 'password_confirmation' => 'Secret123', 'accept_terms' => true, 'company_name' => 'Acme Ltd',
            'company_number' => '123', 'business_type' => 'Security installer', 'business_address' => 'Leeds'])->assertRedirect('/verify');
        $user = User::where('email', 'trade@x.test')->first();
        $this->assertSame('retailer', $user->tier);
        \App\Models\EmailOtp::where('email', $user->email)->update(['code_hash' => bcrypt('654321')]);
        $this->post('/verify', ['code' => '654321']);
        $app = TradeApplication::first();
        $this->assertSame('pending', $app->status);

        auth('web')->logout();
        $this->admin()->post("/admin/approvals/{$app->id}/approve")->assertRedirect();
        $this->assertSame('trader', $user->fresh()->tier);
    }

    public function test_wrong_otp_is_rejected(): void
    {
        $this->post('/register', ['account_type' => 'retailer', 'first_name' => 'A', 'last_name' => 'B', 'email' => 'otp@x.test', 'phone' => '0700',
            'password' => 'Secret123', 'password_confirmation' => 'Secret123', 'accept_terms' => true]);
        $this->post('/verify', ['code' => '000000'])->assertSessionHasErrors('code');
        $this->assertNull(User::where('email', 'otp@x.test')->value('email_verified_at'));
    }

    public function test_admin_dispatch_refund_and_invoice_pdfs(): void
    {
        $order = $this->checkout();
        $this->admin()->post("/admin/orders/{$order->id}/status", ['status' => 'dispatched', 'carrier' => 'DPD', 'tracking_number' => 'DPD123', 'notify' => true])->assertRedirect();
        $this->assertSame('dispatched', $order->fresh()->status);
        $this->assertNotNull($order->fresh()->shipped_at);

        $this->post("/admin/orders/{$order->id}/refund", ['amount' => 50, 'reason' => 'Damaged', 'restock' => false])->assertRedirect();
        $order->refresh();
        $this->assertSame('partially_refunded', $order->status);
        $this->assertSame('50.00', $order->refunded_total);
        $this->assertSame(1, $order->invoices()->where('type', 'credit_note')->count());

        $invoice = $order->invoices()->where('type', 'invoice')->first();
        $res = $this->get("/admin/invoices/{$invoice->id}/download");
        $res->assertOk();
        $this->assertStringStartsWith('%PDF', $res->getContent());
        $this->get("/admin/orders/{$order->id}")->assertOk();
    }

    public function test_customer_account_pages_invoice_and_reorder(): void
    {
        $user = $this->customer();
        $order = $this->checkout($user);
        foreach (['/account', '/account/orders', "/account/orders/{$order->number}", '/account/invoices', '/account/purchase-orders',
            '/account/addresses', '/account/profile', '/account/wishlist', '/account/trade', '/account/quick-order', '/account/enquiries'] as $url) {
            $this->get($url)->assertOk();
        }
        $invoice = $order->invoices()->first();
        $this->get("/account/invoices/{$invoice->id}/download")->assertOk();
        $this->post("/account/orders/{$order->number}/reorder")->assertRedirect('/cart');
        $this->assertSame(2, app(CartService::class)->itemCount());
        $this->get('/cart/quote')->assertOk();

        // Another customer cannot download this invoice
        $this->actingAs($this->customer(), 'web')->get("/account/invoices/{$invoice->id}/download")->assertForbidden();
    }

    public function test_quick_order_by_sku(): void
    {
        $this->actingAs($this->customer('trader'), 'web')
            ->post('/cart/quick-order', ['rows' => [['sku' => 'TV-IPT3K-28', 'quantity' => 3], ['sku' => 'NOPE', 'quantity' => 1]]])
            ->assertRedirect('/cart');
        $this->assertSame(3, app(CartService::class)->itemCount());
    }

    public function test_coupon_rules(): void
    {
        $product = Product::where('sku', 'TV-IPD5-28')->first();
        $this->post('/cart', ['product_id' => $product->id]);
        $this->post('/cart-coupon', ['code' => 'NOPE'])->assertSessionHasErrors('code');
        $this->post('/cart-coupon', ['code' => 'welcome10'])->assertSessionHasNoErrors();
        Coupon::where('code', 'TENVO15')->update(['is_active' => false]);
        $this->post('/cart-coupon', ['code' => 'TENVO15'])->assertSessionHasErrors('code');
    }

    public function test_out_of_stock_cannot_be_added(): void
    {
        $p = Product::where('sku', 'AJ-KPP-B')->first();
        $this->assertSame(0, $p->stock_qty);
        $this->post('/cart', ['product_id' => $p->id])->assertSessionHas('error');
        $this->post("/product/{$p->id}/notify", ['email' => 'me@x.test'])->assertSessionHas('success');
    }

    public function test_training_and_contact_forms(): void
    {
        $course = TrainingCourse::first();
        $this->post('/training', ['training_course_id' => $course->id, 'full_name' => 'Sam', 'phone' => '0700', 'email' => 's@x.test', 'agree' => true])->assertSessionHas('success');
        $this->post('/training', ['training_course_id' => $course->id, 'full_name' => 'Sam', 'phone' => '0700', 'email' => 's@x.test'])->assertSessionHasErrors('agree');
        $this->assertSame(1, TrainingEnquiry::count());
        $this->post('/contact', ['name' => 'Sam', 'email' => 's@x.test', 'message' => 'Hello'])->assertSessionHas('success');
        $this->assertSame(1, ContactEnquiry::count());
    }

    public function test_admin_product_crud_bulk_and_duplicate(): void
    {
        $this->admin()->post('/admin/products', [
            'name' => 'Test Cam', 'sku' => 'TEST-1', 'vat_mode' => 'excluded',
            'retail_price' => 100, 'retail_discount_type' => 'percent', 'retail_discount_value' => 10,
            'trade_price' => 80, 'trade_discount_type' => 'none', 'wholesale_discount_type' => 'none',
            'category_id' => Category::where('slug', '5mp-kits')->value('id'),
            'specs' => [['label' => 'Resolution', 'value' => '5MP']], 'key_features' => ['Great'], 'images' => [['path' => 'images/demo/ptz.svg']],
        ])->assertRedirect();
        $p = Product::where('sku', 'TEST-1')->first();
        $this->assertSame(5, Category::find($p->category_id)->depth);
        $this->assertSame(1, $p->specs()->count());

        $this->post('/admin/products/bulk', ['action' => 'discount', 'ids' => [$p->id], 'tier' => 'trade', 'discount_type' => 'percent', 'value' => 25])->assertRedirect();
        $this->assertSame(60.0, \App\Services\Pricing::price($p->fresh(), 'trader')['price']);
        $this->post('/admin/products/bulk', ['action' => 'vat', 'ids' => [$p->id], 'value' => 'none']);
        $this->assertSame('none', $p->fresh()->vat_mode);

        $this->post("/admin/products/{$p->id}/duplicate")->assertRedirect();
        $this->assertSame(2, Product::where('name', 'like', 'Test Cam%')->count());
        $this->delete("/admin/products/{$p->id}")->assertRedirect();
    }

    public function test_product_export_and_import_round_trip(): void
    {
        $this->admin();
        $export = $this->get('/admin/products/export?format=csv');
        $export->assertOk();
        $csv = $export->streamedContent();
        $this->assertStringContainsString('TV-IPD5-28', $csv);

        $file = UploadedFile::fake()->createWithContent('import.csv', implode("\n", [
            'sku,name,brand,category,retail_price,trade_price,stock_qty,specs',
            'NEW-1,Imported Camera,Newbrand,CCTV > Imported > Deep > Deeper > Deepest,49.99,35,10,Resolution: 4MP | Lens: 4mm',
            'TV-IPD5-28,,,,75.00,,,',
            ',No SKU,,,10,,,',
        ]));
        $this->post('/admin/products/import', ['file' => $file, 'mode' => 'upsert'])->assertSessionHas('success');
        $new = Product::where('sku', 'NEW-1')->first();
        $this->assertNotNull($new);
        $this->assertSame(5, Category::find($new->category_id)->depth);
        $this->assertSame('75.00', Product::where('sku', 'TV-IPD5-28')->value('retail_price'));
        $this->get('/admin/products/template?format=xlsx')->assertOk();
        $this->get('/admin/orders/export?format=xlsx')->assertOk();
        $this->get('/admin/customers/export?format=csv')->assertOk();
    }

    public function test_category_depth_limit(): void
    {
        $deepest = Category::where('slug', '5mp-kits')->first();
        $this->admin()->post('/admin/categories', ['name' => 'Too deep', 'parent_id' => $deepest->id])->assertSessionHasErrors('parent_id');
        $this->post('/admin/categories', ['name' => 'Fine', 'parent_id' => Category::where('slug', 'cctv')->value('id')])->assertRedirect()->assertSessionHasNoErrors();
        $fine = Category::where('name', 'Fine')->first();
        $this->assertSame(2, $fine->depth);
        $this->put("/admin/categories/{$fine->id}", ['name' => 'Fine 2'])->assertRedirect();
        $this->assertSame(1, $fine->fresh()->depth);
    }

    public function test_admin_resources_and_settings(): void
    {
        $this->admin()->post('/admin/coupons', ['code' => 'summer 5', 'type' => 'fixed', 'value' => 5, 'is_active' => true, 'applies_to' => 'all'])->assertSessionHasNoErrors();
        $this->assertTrue(Coupon::where('code', 'SUMMER5')->exists());
        $c = Coupon::where('code', 'SUMMER5')->first();
        $this->patch("/admin/coupons/{$c->id}/toggle", ['field' => 'is_active']);
        $this->assertFalse($c->fresh()->is_active);

        $this->post('/admin/settings', ['group' => 'shipping', 'free_shipping_enabled' => false, 'free_shipping_threshold' => 0, 'min_order_value' => 0,
            'ship_to_countries' => ['GB'], 'guest_checkout' => true, 'po_reference_enabled' => true, 'checkout_terms_text' => 'Agree',
            'order_prefix' => 'AV-', 'invoice_prefix' => 'INV-', 'credit_note_prefix' => 'CN-'])->assertSessionHasNoErrors();
        Settings::flush();
        $this->assertFalse(Settings::public()['free_shipping_active']);
        $this->assertSame('AV-', setting('order_prefix'));

        $this->post('/admin/settings', ['group' => 'tax', 'vat_rate' => 20, 'default_vat_mode' => 'excluded', 'vat_on_shipping' => false, 'currencies' => [], 'apply_vat_all' => 'default']);
        $this->assertSame(0, Product::where('vat_mode', '!=', 'default')->count());

        foreach (['brands', 'shipping-zones', 'shipping-methods', 'hero-slides', 'home-sections', 'pages', 'menu-items', 'popups', 'redirects',
            'training-courses', 'training', 'enquiries', 'reviews', 'newsletter'] as $slug) {
            $this->get("/admin/{$slug}")->assertOk();
        }
        $this->post('/admin/redirects', ['from_path' => '/old-zoho-page', 'to_path' => '/shop', 'status_code' => '301'])->assertSessionHasNoErrors();
        auth('admin')->logout();
        $this->get('/old-zoho-page')->assertRedirect('/shop');
    }

    public function test_admin_requires_login_and_customers_cannot_access_admin(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->actingAs($this->customer(), 'web')->get('/admin/products')->assertRedirect('/admin/login');
        $this->post('/admin/login', ['email' => 'admin@avesta.test', 'password' => 'wrong'])->assertSessionHasErrors('email');
    }
}
