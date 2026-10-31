<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/** Demo catalogue so the store looks complete on first install. Safe to delete from the admin. */
class CatalogSeeder extends Seeder
{
    protected array $cats = [];

    public function run(): void
    {
        if (Product::exists()) {
            return;
        }

        $brands = [];
        foreach ([
            ['Tenvo', 'Security for a smarter tomorrow', true, 'Professional CCTV without the premium price tag. Tenvo brings pro-grade cameras and recorders designed for installers, traders and resellers — reliable, simple to install and competitively priced.'],
            ['Hikvision', 'World-leading video security', false, 'AcuSense, ColorVu and DarkFighter technologies from the world\'s largest video security manufacturer.'],
            ['HiLook', 'Smart value by Hikvision', false, 'Dependable, easy-to-install CCTV built on Hikvision technology.'],
            ['Hizone Pro', 'Pro performance, every install', false, 'Feature-packed cameras and recorders for professional installers.'],
            ['Ajax', 'Wireless security, reinvented', false, 'Award-winning wireless intruder alarm systems with Jeweller radio technology.'],
        ] as $i => [$name, $tagline, $exclusive, $desc]) {
            $brands[$name] = Brand::create([
                'name' => $name, 'slug' => Str::slug($name), 'tagline' => $tagline, 'description' => $desc,
                'is_exclusive' => $exclusive, 'is_featured' => true, 'sort_order' => $i,
                'banner' => $exclusive ? 'images/demo/hero-tenvo.svg' : null,
            ]);
        }

        // Category tree — demonstrates all five levels (CCTV › CCTV Kits › IP Kits › 4 Camera Kits › 5MP Kits).
        $tree = [
            'CCTV' => ['_img' => 'images/demo/turret-white.svg', 'IP Cameras' => ['Dome Cameras' => [], 'Bullet Cameras' => [], 'Turret Cameras' => [], 'PTZ Cameras' => []],
                'Turbo HD Cameras' => ['Analogue Turrets' => [], 'Analogue Bullets' => []],
                'CCTV Kits' => ['IP Kits' => ['4 Camera Kits' => ['5MP Kits' => [], '8MP 4K Kits' => []], '8 Camera Kits' => []], 'Analogue Kits' => []],
                'Recorders' => ['NVRs' => [], 'DVRs' => []]],
            'Intruder Alarm' => ['_img' => 'images/demo/alarm-hub.svg', 'AX Pro by Hikvision' => ['AX Pro Hubs' => [], 'AX Pro Detectors' => []], 'Ajax' => ['Ajax Hubs' => [], 'Ajax Detectors' => [], 'Ajax Keypads' => []]],
            'Access Control' => ['_img' => 'images/demo/keypad.svg', 'Keypads & Readers' => [], 'Video Intercom' => []],
            'Fire Alarm' => ['_img' => 'images/demo/smoke-detector.svg', 'Smoke Detectors' => [], 'Fire Panels' => []],
            'Networking' => ['_img' => 'images/demo/poe-switch.svg', 'PoE Switches' => [], 'Cables & Connectors' => []],
            'Accessories' => ['_img' => 'images/demo/hard-drive.svg', 'Hard Drives' => [], 'Junction Boxes & Brackets' => []],
        ];
        $this->buildTree($tree, null, 1);
        Category::whereIn('slug', ['cctv', 'intruder-alarm', 'access-control', 'fire-alarm', 'networking', 'accessories', 'cctv-kits', 'recorders'])->update(['show_on_home' => true]);
        Category::where('slug', 'recorders')->update(['image' => 'images/demo/nvr-black.svg']);
        Category::where('slug', 'cctv-kits')->update(['image' => 'images/demo/dome-white.svg']);

        $p = fn (...$a) => $this->product(...$a);
        $dome = ['Resolution' => '5MP', 'Form Factor' => 'Dome', 'Lens' => '2.8mm', 'Technology' => 'ColorVu', 'IR Range' => '30m', 'Protection' => 'IP67 / IK10', 'Power' => 'PoE (802.3af)'];

        // Tenvo — the exclusive brand
        $p($brands['Tenvo'], 'Dome Cameras', 'Tenvo 5MP ColorVu IP Dome Camera, 2.8mm', 'TV-IPD5-28', 79.99, 54.99, 49.99, ['percent', 10], ['images/demo/dome-white.svg', 'images/demo/dome-black.svg'],
            $dome, ['5MP ultra-clear imaging', '24/7 full-colour night vision', 'Built-in microphone', 'Human & vehicle detection', 'IP67 weatherproof, IK10 vandal-proof'], 48, true, true);
        $p($brands['Tenvo'], 'Turret Cameras', 'Tenvo 3K Smart Hybrid Light Turret Camera, 2.8mm', 'TV-IPT3K-28', 69.99, 47.50, 43.00, ['percent', 12], ['images/demo/turret-white.svg', 'images/demo/turret-black.svg'],
            ['Resolution' => '3K / 5MP', 'Form Factor' => 'Turret', 'Lens' => '2.8mm', 'Technology' => 'Smart Hybrid Light', 'IR Range' => '30m', 'Audio' => 'Built-in mic'],
            ['Smart Hybrid Light — IR or white light on demand', '3K resolution', 'AI motion detection', 'Two-way audio ready'], 60, true, true);
        $p($brands['Tenvo'], 'Bullet Cameras', 'Tenvo 8MP 4K AcuSense Bullet Camera, 4mm', 'TV-IPB8-4', 109.99, 76.00, 69.00, ['fixed', 10], ['images/demo/bullet-white.svg', 'images/demo/bullet-black.svg'],
            ['Resolution' => '8MP 4K', 'Form Factor' => 'Bullet', 'Lens' => '4mm', 'Technology' => 'AcuSense', 'IR Range' => '40m'], ['True 4K detail', 'AcuSense false-alarm reduction', 'Strobe light & audio deterrent'], 22, true, false);
        $p($brands['Tenvo'], 'NVRs', 'Tenvo 8 Channel 4K PoE NVR with AcuSense', 'TV-NVR8P', 189.99, 132.00, 119.00, ['percent', 8], ['images/demo/nvr-8.svg'],
            ['Channels' => '8', 'Resolution' => 'Up to 8MP', 'PoE' => '8 ports', 'Storage' => '1 × SATA up to 10TB', 'Form Factor' => 'Recorder'], ['8 PoE ports — one cable per camera', 'H.265+ compression', 'Free mobile app'], 18, true, true);
        $p($brands['Tenvo'], '5MP Kits', 'Tenvo 4 Camera 5MP ColorVu IP Kit with 2TB NVR', 'TV-KIT4-5MP', 449.99, 319.00, 289.00, ['percent', 15], ['images/demo/dome-white.svg', 'images/demo/nvr-8.svg'],
            ['Channels' => '4', 'Resolution' => '5MP', 'Technology' => 'ColorVu', 'Storage' => '2TB included', 'Form Factor' => 'Kit'], ['Complete plug-and-play kit', '4 × 5MP ColorVu cameras', '2TB surveillance HDD pre-installed'], 12, true, true);
        $p($brands['Tenvo'], '8MP 4K Kits', 'Tenvo 4 Camera 4K AcuSense Turret Kit', 'TV-KIT4-4K', 599.99, 429.00, 395.00, ['none', 0], ['images/demo/turret-white.svg', 'images/demo/nvr-black.svg'],
            ['Channels' => '4', 'Resolution' => '8MP 4K', 'Technology' => 'AcuSense', 'Storage' => '2TB included', 'Form Factor' => 'Kit'], ['4K clarity on every camera', 'Smart human/vehicle alerts'], 6, false, true);
        $p($brands['Tenvo'], 'PTZ Cameras', 'Tenvo 4MP 25× Optical Zoom PTZ Camera', 'TV-PTZ4-25X', 649.99, 469.00, 439.00, ['percent', 5], ['images/demo/ptz.svg'],
            ['Resolution' => '4MP', 'Form Factor' => 'PTZ', 'Lens' => '25× optical', 'Technology' => 'DarkFighter', 'IR Range' => '150m'], ['25× optical zoom', 'Auto-tracking', '150m IR'], 4, false, false);

        // Hikvision
        $p($brands['Hikvision'], 'Turret Cameras', 'Hikvision Turbo HD 3K ColorVu Dual-Lens Turret Camera, 2.8mm', 'DS-2CE70KF0T-MFS', 62.50, 44.00, 40.00, ['percent', 8], ['images/demo/turret-white.svg'],
            ['Resolution' => '3K', 'Form Factor' => 'Turret', 'Lens' => '2.8mm', 'Technology' => 'ColorVu', 'Channels' => '1'], ['3K high resolution', 'ColorVu technology', 'Dual-lens design', 'Turbo HD over coax'], 35, false, false, 'Analogue Turrets');
        $p($brands['Hikvision'], 'PTZ Cameras', 'Hikvision 2MP 15× DarkFighter AcuSense IR Network PTZ Camera', 'DS-2DE4215IW-DE', 261.96, 199.00, 185.00, ['percent', 8], ['images/demo/ptz.svg'],
            ['Resolution' => '2MP', 'Form Factor' => 'PTZ', 'Lens' => '15× optical', 'Technology' => 'DarkFighter', 'IR Range' => '100m'], ['15× optical zoom', 'AcuSense human/vehicle classification', 'DarkFighter ultra-low-light'], 9, true, false);
        $p($brands['Hikvision'], 'Dome Cameras', 'Hikvision 6MP AcuSense ColorVu Dome Camera, 2.8mm', 'DS-2CD2167G2-SU', 159.99, 112.00, 104.00, ['none', 0], ['images/demo/dome-black.svg'],
            ['Resolution' => '6MP', 'Form Factor' => 'Dome', 'Lens' => '2.8mm', 'Technology' => 'ColorVu', 'Audio' => 'Built-in mic'], ['ColorVu 2.0', 'AcuSense 2.0', 'Built-in mic'], 14, false, false);
        $p($brands['Hikvision'], 'NVRs', 'Hikvision 16 Channel 4K AcuSense PoE NVR', 'DS-7616NXI-K2/16P', 489.99, 362.00, 339.00, ['percent', 6], ['images/demo/nvr-black.svg'],
            ['Channels' => '16', 'Resolution' => 'Up to 12MP', 'PoE' => '16 ports', 'Storage' => '2 × SATA', 'Form Factor' => 'Recorder'], ['16 PoE ports', 'AcuSense smart search', '2 HDD bays'], 7, false, false);
        $p($brands['Hikvision'], 'DVRs', 'Hikvision 4 Channel 3K/5MP AcuSense Turbo HD DVR', 'IDS-7204HUHI-M1/S', 98.99, 69.00, 64.47, ['percent', 10], ['images/demo/dvr-white.svg'],
            ['Channels' => '4', 'Resolution' => 'Up to 5MP', 'Storage' => '1 × SATA', 'Form Factor' => 'Recorder'], ['5-in-1 hybrid recorder', 'AcuSense on all channels'], 25, false, false);
        $p($brands['Hikvision'], 'AX Pro Hubs', 'Hikvision AX Pro Wireless Alarm Hub', 'DS-PWA96-M-WE', 179.99, 128.00, 118.00, ['percent', 5], ['images/demo/alarm-hub.svg'],
            ['Technology' => 'Tri-X wireless', 'Connectivity' => 'Wi-Fi / LAN / 4G', 'Zones' => '96'], ['96 wireless zones', 'Video verification', 'Hik-Connect app'], 15, false, false);
        $p($brands['Hikvision'], 'AX Pro Detectors', 'Hikvision AX Pro Wireless PIR Detector', 'DS-PDP15P-EG2-WE', 39.99, 27.50, 25.00, ['none', 0], ['images/demo/smoke-detector.svg'],
            ['Technology' => 'Tri-X wireless', 'Range' => '15m', 'Pet immune' => 'Up to 30kg'], ['Pet immune', '5-year battery'], 80, false, false);
        $p($brands['Hikvision'], 'Video Intercom', 'Hikvision 2-Wire IP Video Intercom Kit', 'DS-KIS703-P', 299.99, 218.00, 205.00, ['percent', 10], ['images/demo/keypad.svg'],
            ['Technology' => '2-wire', 'Screen' => '7" touch', 'Form Factor' => 'Kit'], ['Use existing 2-wire cabling', '7-inch indoor station', 'App call forwarding'], 8, false, false);

        // HiLook
        $p($brands['HiLook'], 'DVRs', 'HiLook 4CH 1080P Lite DVR', 'DVR-204G-K1', 37.35, 26.00, 24.00, ['percent', 10], ['images/demo/dvr-white.svg'],
            ['Channels' => '4', 'Resolution' => '1080P', 'Storage' => '1 × SATA', 'Form Factor' => 'Recorder'], ['H.265 Pro+', 'Compact design'], 40, false, false);
        $p($brands['HiLook'], 'DVRs', 'HiLook 8CH 5MP Hybrid Smart Motion DVR', 'DVR-208U-M1', 94.54, 66.00, 61.00, ['none', 0], ['images/demo/nvr-8.svg'],
            ['Channels' => '8', 'Resolution' => '5MP', 'Storage' => '1 × SATA', 'Form Factor' => 'Recorder'], ['Smart motion detection', '5-in-1 hybrid'], 21, false, false);
        $p($brands['HiLook'], 'Bullet Cameras', 'HiLook 4MP IP Bullet Camera, 2.8mm', 'IPC-B140H', 39.99, 27.00, 24.50, ['percent', 5], ['images/demo/bullet-white.svg'],
            ['Resolution' => '4MP', 'Form Factor' => 'Bullet', 'Lens' => '2.8mm', 'IR Range' => '30m'], ['4MP clarity', 'PoE powered'], 55, false, true);
        $p($brands['HiLook'], 'Analogue Kits', 'HiLook 4 Camera 1080P Turbo HD Kit', 'HL-KIT4-1080', 199.99, 139.00, 129.00, ['percent', 12], ['images/demo/turret-white.svg', 'images/demo/dvr-white.svg'],
            ['Channels' => '4', 'Resolution' => '1080P', 'Form Factor' => 'Kit'], ['Everything included', 'Great value starter kit'], 16, false, false);

        // Hizone Pro
        $p($brands['Hizone Pro'], 'Turret Cameras', 'Hizone Pro 5MP Smart Hybrid Light Turret Camera, Black', 'HZP-T5-SHL-BK', 49.99, 34.00, 31.00, ['percent', 10], ['images/demo/turret-black.svg'],
            ['Resolution' => '5MP', 'Form Factor' => 'Turret', 'Lens' => '2.8mm', 'Technology' => 'Smart Hybrid Light'], ['Smart hybrid light', 'Built-in mic', 'Black housing'], 33, false, true);
        $p($brands['Hizone Pro'], 'Dome Cameras', 'Hizone Pro 3K ColorVu Dome Camera, 2.8mm', 'HZP-D3K-CV', 54.99, 38.00, 35.00, ['none', 0], ['images/demo/dome-white.svg'],
            ['Resolution' => '3K', 'Form Factor' => 'Dome', 'Lens' => '2.8mm', 'Technology' => 'ColorVu'], ['Full-colour 24/7', 'Vandal resistant'], 28, false, false);
        $p($brands['Hizone Pro'], 'DVRs', 'Hizone Pro 8CH AcuSense 2-Way Talk Facial Recognition DVR', 'HZP-DVR8-FR', 154.30, 109.00, 99.00, ['percent', 10], ['images/demo/nvr-8.svg'],
            ['Channels' => '8', 'Resolution' => '5MP', 'Storage' => '1 × SATA', 'Form Factor' => 'Recorder'], ['Facial recognition', 'Two-way audio'], 10, false, false);
        $p($brands['Hizone Pro'], '8 Camera Kits', 'Hizone Pro 8 Camera 5MP IP Kit with 4TB NVR', 'HZP-KIT8-5MP', 849.99, 615.00, 579.00, ['percent', 10], ['images/demo/turret-black.svg', 'images/demo/nvr-black.svg'],
            ['Channels' => '8', 'Resolution' => '5MP', 'Storage' => '4TB included', 'Form Factor' => 'Kit'], ['8 cameras + NVR', '4TB pre-installed'], 3, true, false);

        // Ajax
        $p($brands['Ajax'], 'Ajax Hubs', 'Ajax Hub 2 Plus Wireless Alarm Control Panel, White', 'AJ-HUB2PLUS-W', 289.99, 209.00, 195.00, ['none', 0], ['images/demo/alarm-hub.svg'],
            ['Technology' => 'Jeweller wireless', 'Connectivity' => 'Wi-Fi / LAN / 2× SIM', 'Zones' => '200'], ['Photo verification', '4 communication channels', 'Grade 2 certified'], 11, true, false);
        $p($brands['Ajax'], 'Ajax Detectors', 'Ajax MotionProtect Wireless PIR Detector', 'AJ-MP-W', 54.99, 39.00, 36.00, ['percent', 5], ['images/demo/smoke-detector.svg'],
            ['Technology' => 'Jeweller wireless', 'Range' => '12m', 'Pet immune' => 'Up to 20kg'], ['Pet immune', '7-year battery life'], 64, false, false);
        $p($brands['Ajax'], 'Ajax Keypads', 'Ajax KeyPad Plus Wireless Touch Keypad', 'AJ-KPP-B', 99.99, 72.00, 67.00, ['none', 0], ['images/demo/keypad.svg'],
            ['Technology' => 'Jeweller wireless', 'Access' => 'Code / card / fob'], ['Contactless cards & fobs', 'Touch keypad'], 0, false, false);

        // Networking, fire & accessories
        $p($brands['Tenvo'], 'PoE Switches', 'Tenvo 8-Port Gigabit PoE+ Switch, 120W', 'TV-SW8P-120', 89.99, 62.00, 57.00, ['none', 0], ['images/demo/poe-switch.svg'],
            ['PoE' => '8 ports', 'Budget' => '120W', 'Uplink' => '2 × Gigabit', 'Form Factor' => 'Switch'], ['Extended 250m mode', 'Unmanaged plug-and-play'], 30, false, false);
        $p($brands['Hikvision'], 'Smoke Detectors', 'Hikvision Wireless Optical Smoke Detector', 'DS-PDSMK-S-WE', 44.99, 31.00, 28.50, ['percent', 10], ['images/demo/smoke-detector.svg'],
            ['Technology' => 'Optical', 'Battery' => '5 years'], ['85dB siren', 'Wireless'], 37, false, false);
        $p(null, 'Hard Drives', '4TB Surveillance Hard Drive, 24/7 Rated', 'HDD-4TB-SURV', 99.99, 74.00, 69.00, ['none', 0], ['images/demo/hard-drive.svg'],
            ['Capacity' => '4TB', 'Workload' => '24/7', 'Interface' => 'SATA III'], ['Designed for 24/7 recording', 'Supports up to 64 cameras'], 45, false, false);
        $p(null, 'Junction Boxes & Brackets', 'Universal Junction Box for Dome & Turret Cameras, White', 'JB-UNI-W', 14.99, 9.50, 8.50, ['none', 0], ['images/demo/junction-box.svg'],
            ['Colour' => 'White', 'Material' => 'Aluminium alloy'], ['Hides cable joints', 'Weatherproof'], 150, false, false, null, true);

        // Coupons
        Coupon::create(['code' => 'WELCOME10', 'description' => '10% off first order', 'type' => 'percent', 'value' => 10, 'usage_per_customer' => 1, 'allowed_tiers' => ['retailer']]);
        Coupon::create(['code' => 'FREESHIP', 'description' => 'Free delivery', 'type' => 'free_shipping', 'value' => 0, 'min_subtotal' => 50]);
        Coupon::create(['code' => 'TENVO15', 'description' => '15% off Tenvo', 'type' => 'percent', 'value' => 15, 'applies_to' => 'brands', 'applies_ids' => [$brands['Tenvo']->id], 'is_active' => false]);
    }

    protected function buildTree(array $nodes, ?int $parent, int $depth): void
    {
        $i = 0;
        foreach ($nodes as $name => $children) {
            if ($name === '_img') {
                continue;
            }
            $slug = Str::slug($name);
            if (Category::where('slug', $slug)->exists()) {
                $slug .= '-'.$depth;
            }
            $cat = Category::create(['parent_id' => $parent, 'name' => $name, 'slug' => $slug, 'depth' => $depth, 'sort_order' => $i++,
                'image' => $children['_img'] ?? null, 'description' => $depth === 1 ? "Professional {$name} equipment from leading brands." : null]);
            $this->cats[$name] = $cat->id;
            $this->buildTree($children, $cat->id, $depth + 1);
        }
    }

    protected function product(?Brand $brand, string $category, string $name, string $sku, float $retail, ?float $trade, ?float $wholesale, array $discount,
        array $images, array $specs, array $features, int $stock, bool $featured, bool $new, ?string $extraCategory = null, bool $variants = false): void
    {
        [$type, $value] = $discount;
        $product = Product::create([
            'brand_id' => $brand?->id,
            'category_id' => $this->cats[$category] ?? null,
            'name' => $name,
            'slug' => Str::slug($name),
            'sku' => $sku,
            'short_description' => $features[0].'. '.($features[1] ?? '').'.',
            'description' => '<p><strong>'.e($name).'</strong> is built for reliable, professional security installations — for homes, offices, shops and warehouses.</p><p>'.e(implode('. ', $features)).'.</p>',
            'key_features' => $features,
            'retail_price' => $retail, 'retail_discount_type' => $type, 'retail_discount_value' => $value,
            'trade_price' => $trade, 'trade_discount_type' => $type === 'none' ? 'none' : 'percent', 'trade_discount_value' => $type === 'none' ? 0 : 5,
            'wholesale_price' => $wholesale, 'wholesale_discount_type' => 'none', 'wholesale_discount_value' => 0,
            'vat_mode' => 'default',
            'stock_qty' => $stock, 'track_stock' => true, 'low_stock_threshold' => null,
            'weight' => str_contains($sku, 'KIT') ? 6.5 : (str_contains(strtolower($name), 'nvr') || str_contains(strtolower($name), 'dvr') ? 2.2 : 0.6),
            'is_featured' => $featured, 'is_new' => $new,
            'option_name' => $variants ? 'Colour' : null,
        ]);
        foreach ($images as $i => $img) {
            $product->images()->create(['path' => $img, 'alt' => $name, 'sort_order' => $i]);
        }
        $i = 0;
        foreach ($specs as $label => $val) {
            $product->specs()->create(['label' => $label, 'value' => $val, 'sort_order' => $i++]);
        }
        if ($extraCategory && isset($this->cats[$extraCategory])) {
            $product->categories()->attach($this->cats[$extraCategory]);
        }
        if ($variants) {
            $product->variants()->create(['value' => 'White', 'sku' => $sku, 'stock_qty' => 100, 'sort_order' => 0]);
            $product->variants()->create(['value' => 'Black', 'sku' => str_replace('-W', '-B', $sku), 'price_adjustment' => 1.00, 'stock_qty' => 50, 'sort_order' => 1]);
        }
    }
}
