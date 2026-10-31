<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\HeroSlide;
use App\Models\HomeSection;
use Illuminate\Database\Seeder;

class HomepageSeeder extends Seeder
{
    public function run(): void
    {
        if (HomeSection::exists()) {
            return;
        }

        HeroSlide::create(['eyebrow' => 'Introducing Tenvo', 'title' => 'Professional CCTV. Installer-friendly pricing.',
            'subtitle' => 'Pro-grade 4K, ColorVu and AcuSense cameras engineered for installers, traders and resellers — without the premium price tag.',
            'image' => 'images/demo/hero-tenvo.svg', 'button_text' => 'Explore Tenvo', 'button_link' => '/brand/tenvo',
            'button2_text' => 'Open a trade account', 'button2_link' => '/trade-accounts', 'theme' => 'dark', 'sort_order' => 0]);
        HeroSlide::create(['eyebrow' => 'Avesta Installer Training', 'title' => 'Learn today. Install tomorrow.',
            'subtitle' => 'Hands-on CCTV & security training from working engineers. Get certified and grow your career.',
            'image' => 'images/demo/hero-training.svg', 'button_text' => 'View courses', 'button_link' => '/training', 'theme' => 'dark', 'sort_order' => 1]);
        HeroSlide::create(['eyebrow' => 'Trade & wholesale', 'title' => 'Your prices. Your PO numbers. Your pace.',
            'subtitle' => 'Approved installers unlock trade pricing, pro-forma quotes, quick re-order and priority support.',
            'image' => 'images/demo/hero-trade.svg', 'button_text' => 'Apply for trade', 'button_link' => '/register?type=trader', 'theme' => 'dark', 'sort_order' => 2]);

        $tenvo = Brand::where('slug', 'tenvo')->first();
        $hik = Brand::where('slug', 'hikvision')->first();
        $hizone = Brand::where('slug', 'hizone-pro')->first();
        $hilook = Brand::where('slug', 'hilook')->first();
        $kits = Category::where('slug', 'cctv-kits')->first();

        $sections = [
            ['hero', null, null, []],
            ['usp', null, null, ['theme' => 'light', 'items' => [
                ['icon' => 'truck', 'title' => 'Fast UK delivery', 'text' => 'Same-day dispatch before 2pm'],
                ['icon' => 'badge', 'title' => 'Trade pricing', 'text' => 'For approved installers'],
                ['icon' => 'shield', 'title' => 'Manufacturer warranty', 'text' => 'Up to 3 years cover'],
                ['icon' => 'headset', 'title' => 'Expert support', 'text' => 'From engineers who install'],
            ]]],
            ['categories', 'Shop by category', 'Everything you need for a complete security installation.', []],
            ['brand_spotlight', 'Tenvo. Security for a smarter tomorrow.', 'Professional CCTV, installer-friendly pricing.', [
                'brand_id' => $tenvo?->id, 'eyebrow' => 'Exclusive to Avesta', 'image' => 'images/demo/spotlight-tenvo.svg',
                'text' => 'Tenvo brings professional-grade CCTV and surveillance solutions designed for security installers, traders and resellers. With reliable technology and competitive trade pricing, Tenvo makes it easier to deliver dependable surveillance to your customers.',
                'features' => [
                    ['title' => '3K / 5MP / 4K cameras', 'text' => 'Sharp, high-resolution video for homes, businesses and sites.'],
                    ['title' => 'Smart Hybrid Light', 'text' => 'Intelligent IR or white-light illumination on demand.'],
                    ['title' => 'ColorVu technology', 'text' => 'Full-colour footage 24/7, even in very low light.'],
                    ['title' => 'AcuSense AI', 'text' => 'Human & vehicle detection that cuts false alarms.'],
                ],
                'button_text' => 'Shop Tenvo', 'button_link' => '/brand/tenvo']],
            ['products', 'Tenvo best sellers', 'Our exclusive range, trusted by installers across the UK.', ['source' => 'brand', 'brand_id' => $tenvo?->id, 'limit' => 8, 'theme' => 'light']],
            ['trade_cta', 'Are you a CCTV installer or reseller?', 'Unlock trade pricing on every product.', [
                'eyebrow' => 'Avesta Trade', 'text' => 'Apply in two minutes. Your account works immediately at retail prices, and trade pricing switches on automatically once approved.',
                'button_text' => 'Apply for a trade account', 'button_link' => '/register?type=trader', 'image' => 'images/demo/hero-trade.svg']],
            ['products', 'Hikvision kits & cameras', null, ['source' => 'brand', 'brand_id' => $hik?->id, 'limit' => 8, 'theme' => 'muted']],
            ['banner', 'Complete CCTV kits, ready to install', 'Cameras, recorder and storage — matched and tested.', [
                'eyebrow' => 'Kits', 'text' => 'From 4-camera home kits to 8-camera 4K business systems.', 'image' => 'images/demo/hero-tenvo.svg',
                'button_text' => 'Shop kits', 'button_link' => $kits ? '/category/'.$kits->slug : '/shop', 'theme' => 'dark']],
            ['products', 'Hizone Pro', 'Pro performance for every install.', ['source' => 'brand', 'brand_id' => $hizone?->id, 'limit' => 8, 'theme' => 'light']],
            ['products', 'HiLook CCTV', null, ['source' => 'brand', 'brand_id' => $hilook?->id, 'limit' => 8, 'theme' => 'light']],
            ['training_cta', 'Learn today. Install tomorrow.', 'Professional installer training with real-world experts.', [
                'eyebrow' => 'Avesta Training', 'text' => 'Expert instructors, practical hands-on sessions, certification and ongoing career support.',
                'button_text' => 'Register for training', 'button_link' => '/training', 'image' => 'images/demo/hero-training.svg']],
            ['brands', 'Brands we trust', null, []],
        ];
        foreach ($sections as $i => [$type, $title, $subtitle, $settings]) {
            HomeSection::create(['type' => $type, 'title' => $title, 'subtitle' => $subtitle, 'settings' => $settings, 'sort_order' => $i]);
        }
    }
}
