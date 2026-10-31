<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\MenuItem;
use App\Models\Page;
use App\Models\ShippingMethod;
use App\Models\ShippingZone;
use App\Models\TrainingCourse;
use Illuminate\Database\Seeder;

class StoreSeeder extends Seeder
{
    public function run(): void
    {
        Admin::firstOrCreate(['email' => strtolower(env('ADMIN_EMAIL', 'admin@avesta.test'))], [
            'name' => 'Avesta Admin',
            'password' => env('ADMIN_PASSWORD', 'ChangeMe123!'),
        ]);

        // Shipping — UK only to start; edit everything in Admin → Shipping.
        if (! ShippingZone::exists()) {
            $mainland = ShippingZone::create(['name' => 'UK Mainland', 'countries' => ['GB'], 'postcode_prefixes' => [], 'sort_order' => 3]);
            ShippingMethod::create(['shipping_zone_id' => $mainland->id, 'name' => 'Standard delivery', 'delivery_estimate' => '2–3 working days', 'type' => 'flat', 'cost' => 6.95, 'sort_order' => 0]);
            ShippingMethod::create(['shipping_zone_id' => $mainland->id, 'name' => 'Next working day', 'description' => 'Order before 2pm', 'delivery_estimate' => 'Next working day', 'type' => 'flat', 'cost' => 12.95, 'free_shipping_eligible' => false, 'sort_order' => 1]);

            $highlands = ShippingZone::create(['name' => 'Highlands & Islands', 'countries' => ['GB'], 'postcode_prefixes' => ['HS', 'IV', 'KW', 'ZE', 'PA20', 'PA41', 'PA42', 'PH17', 'PH41', 'KA27', 'KA28', 'IM', 'GY', 'JE', 'TR21'], 'sort_order' => 1]);
            ShippingMethod::create(['shipping_zone_id' => $highlands->id, 'name' => 'Highlands & Islands delivery', 'delivery_estimate' => '3–5 working days', 'type' => 'weight', 'cost' => 0,
                'rates' => [['min' => 0, 'max' => 5, 'cost' => 14.95], ['min' => 5, 'max' => 20, 'cost' => 24.95], ['min' => 20, 'max' => null, 'cost' => 39.95]], 'free_shipping_eligible' => false]);

            $ni = ShippingZone::create(['name' => 'Northern Ireland', 'countries' => ['GB'], 'postcode_prefixes' => ['BT'], 'sort_order' => 2]);
            ShippingMethod::create(['shipping_zone_id' => $ni->id, 'name' => 'Northern Ireland delivery', 'delivery_estimate' => '3–4 working days', 'type' => 'flat', 'cost' => 11.95, 'free_shipping_eligible' => true]);
        }

        if (! TrainingCourse::exists()) {
            foreach ([
                ['CCTV Installer Foundation', 'Hands-on introduction to analogue and IP CCTV: cabling, camera positioning, NVR/DVR setup and remote viewing.', '2 days', '£50 deposit'],
                ['Advanced IP & Network Video', 'PoE budgeting, VLANs, port forwarding alternatives, AcuSense/ColorVu tuning and multi-site management.', '1 day', '£50 deposit'],
                ['Intruder Alarm Systems (AX Pro & Ajax)', 'Wireless alarm design, detector placement, app setup, ARC connectivity and customer handover.', '1 day', '£50 deposit'],
                ['Access Control & Video Intercom', 'Door entry, maglocks, readers, PSU sizing and intercom commissioning.', '1 day', '£50 deposit'],
            ] as $i => [$title, $desc, $dur, $price]) {
                TrainingCourse::create(['title' => $title, 'description' => $desc, 'duration' => $dur, 'price_label' => $price, 'sort_order' => $i]);
            }
        }

        $pages = [
            'about-us' => ['About Us', '<h2>Securing your world since day one</h2><p>Avesta is a UK supplier of professional CCTV, intruder alarm, access control, fire and networking equipment, based in Manchester. We work with homeowners, businesses and — above all — the installers and resellers who keep the UK secure.</p><h3>What makes us different</h3><ul><li><strong>Curated brands</strong> — Tenvo, Hikvision, HiLook, Hizone Pro and Ajax.</li><li><strong>Trade pricing</strong> for approved installers and wholesalers.</li><li><strong>Installer training</strong> delivered by working engineers.</li><li><strong>Real support</strong> from people who install the products we sell.</li></ul>'],
            'delivery' => ['Delivery Information', '<h2>Delivery</h2><p>We deliver across the UK. Orders placed before 2pm on a working day are normally dispatched the same day.</p><ul><li>Standard delivery: 2–3 working days</li><li>Next working day: order before 2pm</li><li>Highlands, Islands and Northern Ireland: 3–5 working days</li></ul><p>Delivery prices are shown at checkout. Free delivery applies to qualifying orders over the threshold shown on our website.</p>'],
            'return-policy' => ['Return Policy', '<h2>Returns</h2><p>You can return unused items in their original packaging within 30 days of delivery. Please contact us first with your order number so we can issue a returns reference.</p><p>Items must be returned in resaleable condition. We recommend a tracked service for returns.</p>'],
            'refund-policy' => ['Refund Policy', '<h2>Refunds</h2><p>Once your return has been received and inspected we will refund your original payment method within 5 working days. You will receive a credit note by email.</p>'],
            'warranty' => ['Warranty', '<h2>Warranty</h2><p>All products carry the manufacturer\'s warranty — typically 2 to 3 years. Faulty items should be reported to our support team with your order number and a short description of the fault.</p>'],
            'privacy-policy' => ['Privacy Policy', '<h2>Your privacy</h2><p>We only collect the information we need to process your orders, manage your account and — if you opt in — send you offers. We never sell your data. Payments are processed securely by Stripe; we never see or store your card details.</p><p>You can ask us to export or delete your data at any time by contacting us.</p>'],
            'terms-of-service' => ['Terms of Service', '<h2>Terms of Service</h2><p>By placing an order you agree to these terms. Prices are shown in GBP. Trade prices are available only to approved trade accounts. We reserve the right to cancel orders affected by pricing errors and will refund any payment in full.</p>'],
            'trade-accounts' => ['Trade Accounts', '<h3>Who can apply?</h3><p>CCTV and security installers, electricians, integrators, resellers and wholesalers with a registered UK business.</p><h3>What you get</h3><ul><li>Trade or wholesale pricing on the full range</li><li>Download pro-forma quotes and add your PO references</li><li>Quick re-order and order by SKU</li><li>Priority technical support and training</li></ul><h3>How it works</h3><p>Create an account and choose <strong>Trader</strong> or <strong>Wholesaler</strong>. Your account works straight away at retail prices while we review your application — usually within one working day. As soon as you are approved your trade prices appear automatically.</p>'],
        ];
        foreach ($pages as $slug => [$title, $content]) {
            Page::firstOrCreate(['slug' => $slug], ['title' => $title, 'content' => $content]);
        }

        if (! MenuItem::exists()) {
            $menus = [
                'header' => [['Training', '/training'], ['Trade', '/trade-accounts']],
                'footer_quick' => [['About Us', '/about-us'], ['Contact Us', '/contact'], ['Trade Accounts', '/trade-accounts'], ['Our Trainings', '/training'], ['Track an Order', '/track']],
                'footer_products' => [['All Products', '/shop'], ['Brands', '/brands'], ['Tenvo', '/brand/tenvo'], ['CCTV', '/category/cctv'], ['Accessories', '/category/accessories']],
                'footer_help' => [['Delivery', '/delivery'], ['Return Policy', '/return-policy'], ['Refund Policy', '/refund-policy'], ['Warranty', '/warranty'], ['Privacy Policy', '/privacy-policy'], ['Terms of Service', '/terms-of-service']],
            ];
            foreach ($menus as $loc => $links) {
                foreach ($links as $i => [$label, $url]) {
                    MenuItem::create(['location' => $loc, 'label' => $label, 'url' => $url, 'sort_order' => $i]);
                }
            }
        }
    }
}
