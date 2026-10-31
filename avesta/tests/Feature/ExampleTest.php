<?php

namespace Tests\Feature;

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_storefront_pages_load(): void
    {
        foreach (['/', '/shop', '/category/cctv', '/brand/tenvo', '/brands', '/product/tenvo-5mp-colorvu-ip-dome-camera-28mm',
            '/cart', '/training', '/contact', '/trade-accounts', '/delivery', '/track', '/login', '/register', '/sitemap.xml'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_admin_pages_load(): void
    {
        $this->actingAs(Admin::first(), 'admin');
        foreach (['/admin', '/admin/products', '/admin/products/1/edit', '/admin/categories', '/admin/orders', '/admin/customers',
            '/admin/approvals', '/admin/coupons', '/admin/home-sections', '/admin/settings', '/admin/reports'] as $url) {
            $this->get($url)->assertOk();
        }
    }
}
