<?php

namespace App\Support;

use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;

/**
 * Key/value website settings, editable from Admin → Settings.
 * Values are JSON-encoded so arrays and booleans round-trip cleanly.
 */
class Settings
{
    protected static ?array $loaded = null;

    public static function defaults(): array
    {
        return [
            // General
            'site_name' => 'Avesta',
            'site_tagline' => 'Securing Your World',
            'logo' => null,
            'logo_light' => null,
            'favicon' => null,
            'company_name' => 'Avesta Manchester Ltd',
            'company_address' => '64 Waterloo Road, Manchester M8 8GJ, United Kingdom',
            'company_email' => 'sales@avestatek.co.uk',
            'company_phone' => '03333 440 789',
            'company_mobile' => '+44 7785 941526',
            'company_number' => '',
            'company_vat_number' => '',
            'opening_hours' => 'Mon – Fri, 9:00 – 17:30',
            'admin_notification_email' => 'info@hizonepro.co.uk',

            // Tax
            'vat_rate' => 20,
            'default_vat_mode' => 'included',
            'vat_on_shipping' => false,

            // Currency
            'base_currency' => 'GBP',
            'currencies' => [
                ['code' => 'EUR', 'symbol' => '€', 'rate' => 1.17, 'enabled' => false],
                ['code' => 'USD', 'symbol' => '$', 'rate' => 1.27, 'enabled' => false],
            ],

            // Shipping
            'free_shipping_enabled' => true,
            'free_shipping_threshold' => 99,
            'ship_to_countries' => ['GB'],

            // Checkout & orders
            'guest_checkout' => true,
            'po_reference_enabled' => true,
            'order_prefix' => 'AVS-',
            'invoice_prefix' => 'AVS-INV-',
            'credit_note_prefix' => 'AVS-CN-',
            'min_order_value' => 0,
            'checkout_terms_text' => 'I agree to the Terms of Service and Refund Policy.',

            // Catalogue
            'products_per_page' => 24,
            'low_stock_threshold' => 5,
            'show_stock_qty' => true,
            'filterable_specs' => ['Resolution', 'Channels', 'Technology', 'Lens', 'Form Factor'],
            'reviews_enabled' => true,
            'reviews_auto_approve' => false,

            // Announcement & cookies
            'announcement_enabled' => true,
            'announcement_text' => 'Free UK delivery on orders over £99 · Trade pricing available for installers',
            'announcement_link' => '/trade-accounts',
            'cookie_banner_enabled' => true,
            'cookie_banner_text' => 'We use essential cookies to run this store and optional cookies to improve your experience.',

            // Training
            'training_intro' => 'Hands-on CCTV & security installer training with industry experts. Choose a course and we will contact you to confirm your place.',
            'training_terms_text' => 'I agree to the terms & conditions and understand that the £50 deposit is non-refundable if I fail to comply.',

            // Trade
            'trade_cta_title' => 'Are you a CCTV installer or reseller?',
            'trade_cta_text' => 'Open a trade account for exclusive trade pricing, priority support and fast dispatch across the UK.',

            // Social
            'social_facebook' => 'https://facebook.com',
            'social_instagram' => 'https://instagram.com',
            'social_linkedin' => '',
            'social_youtube' => '',
            'social_tiktok' => '',
            'whatsapp_number' => '',

            // SEO
            'seo_title' => 'Avesta — Professional CCTV & Security Systems UK',
            'seo_description' => 'Premium CCTV cameras, NVRs, intruder alarms, access control and networking from Tenvo, Hikvision, HiLook, Hizone Pro and Ajax. Trade pricing for installers.',
            'seo_og_image' => null,
            'google_analytics_id' => '',

            // Security
            'admin_email_2fa' => false,

            // Footer
            'footer_about' => 'Avesta supplies professional CCTV, intruder alarm, access control and networking equipment to homeowners, installers and resellers across the UK.',
            'newsletter_enabled' => true,
        ];
    }

    protected static function load(): array
    {
        if (static::$loaded !== null) {
            return static::$loaded;
        }

        $stored = Cache::rememberForever('settings', function () {
            try {
                if (! Schema::hasTable('settings')) {
                    return [];
                }

                return Setting::query()->pluck('value', 'key')->map(fn ($v) => json_decode($v, true))->all();
            } catch (\Throwable) {
                return [];
            }
        });

        return static::$loaded = array_merge(static::defaults(), $stored);
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        $all = static::load();

        return array_key_exists($key, $all) ? $all[$key] : $default;
    }

    public static function all(): array
    {
        return static::load();
    }

    public static function set(array $values): void
    {
        foreach ($values as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => json_encode($value)]);
        }
        static::flush();
    }

    public static function flush(): void
    {
        Cache::forget('settings');
        static::$loaded = null;
    }

    /** Settings that are safe to expose to the storefront. */
    public static function public(): array
    {
        $s = static::load();
        $keys = ['site_name', 'site_tagline', 'company_name', 'company_address', 'company_email', 'company_phone', 'company_mobile',
            'opening_hours', 'vat_rate', 'free_shipping_enabled', 'free_shipping_threshold', 'guest_checkout', 'po_reference_enabled',
            'announcement_enabled', 'announcement_text', 'announcement_link', 'cookie_banner_enabled', 'cookie_banner_text',
            'social_facebook', 'social_instagram', 'social_linkedin', 'social_youtube', 'social_tiktok', 'whatsapp_number',
            'footer_about', 'newsletter_enabled', 'show_stock_qty', 'reviews_enabled', 'checkout_terms_text', 'trade_cta_title', 'trade_cta_text'];
        $out = array_intersect_key($s, array_flip($keys));
        $out['logo_url'] = media_url($s['logo']);
        $out['logo_light_url'] = media_url($s['logo_light']);
        $out['free_shipping_active'] = (bool) $s['free_shipping_enabled'] && (float) $s['free_shipping_threshold'] > 0;
        $out['currencies'] = array_values(array_merge(
            [['code' => 'GBP', 'symbol' => '£', 'rate' => 1, 'enabled' => true]],
            array_values(array_filter($s['currencies'] ?? [], fn ($c) => ! empty($c['enabled'])))
        ));

        return $out;
    }
}
