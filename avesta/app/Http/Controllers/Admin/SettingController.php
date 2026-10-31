<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Support\Settings;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public static function groups(): array
    {
        $opt = fn (array $m) => collect($m)->map(fn ($l, $v) => ['value' => (string) $v, 'label' => $l])->values()->all();

        return [
            'general' => ['label' => 'Store & company', 'icon' => 'store', 'fields' => [
                ['name' => 'site_name', 'label' => 'Store name', 'type' => 'text', 'col' => 6],
                ['name' => 'site_tagline', 'label' => 'Tagline', 'type' => 'text', 'col' => 6],
                ['name' => 'logo', 'label' => 'Logo (for light backgrounds)', 'type' => 'image', 'col' => 4],
                ['name' => 'logo_light', 'label' => 'Logo (for dark backgrounds)', 'type' => 'image', 'col' => 4],
                ['name' => 'favicon', 'label' => 'Browser icon', 'type' => 'image', 'col' => 4],
                ['name' => 'company', 'label' => 'Company details (shown in footer, emails & invoices)', 'type' => 'section'],
                ['name' => 'company_name', 'label' => 'Legal company name', 'type' => 'text', 'col' => 6],
                ['name' => 'company_email', 'label' => 'Customer email', 'type' => 'email', 'col' => 6],
                ['name' => 'company_phone', 'label' => 'Phone', 'type' => 'text', 'col' => 6],
                ['name' => 'company_mobile', 'label' => 'Mobile / WhatsApp', 'type' => 'text', 'col' => 6],
                ['name' => 'company_address', 'label' => 'Address', 'type' => 'textarea', 'max' => 500],
                ['name' => 'company_number', 'label' => 'Company registration no.', 'type' => 'text', 'col' => 6],
                ['name' => 'company_vat_number', 'label' => 'VAT registration no.', 'type' => 'text', 'col' => 6],
                ['name' => 'opening_hours', 'label' => 'Opening hours', 'type' => 'text', 'col' => 6],
                ['name' => 'admin_notification_email', 'label' => 'Send admin notifications to', 'type' => 'email', 'col' => 6, 'help' => 'New orders, trade applications, enquiries and training registrations.'],
                ['name' => 'footer_about', 'label' => 'Footer “about” text', 'type' => 'textarea'],
            ]],
            'tax' => ['label' => 'VAT & currency', 'icon' => 'percent', 'fields' => [
                ['name' => 'vat_rate', 'label' => 'VAT rate (%)', 'type' => 'percent', 'col' => 6, 'min' => 0],
                ['name' => 'default_vat_mode', 'label' => 'Default VAT for products', 'type' => 'select', 'col' => 6,
                    'options' => $opt(['included' => 'Prices INCLUDE VAT', 'excluded' => 'VAT is ADDED at checkout', 'none' => 'No VAT (0%)']),
                    'help' => 'Products set to “Use store default” follow this. You can override per product or in bulk.'],
                ['name' => 'vat_on_shipping', 'label' => 'Charge VAT on delivery', 'type' => 'toggle'],
                ['name' => 'apply_vat_all', 'label' => 'Apply to all products now', 'type' => 'select', 'virtual' => true,
                    'options' => $opt(['' => '— leave products as they are —', 'default' => 'Reset every product to the store default', 'included' => 'Set every product to VAT included', 'excluded' => 'Set every product to VAT excluded', 'none' => 'Set every product to No VAT']),
                    'help' => 'One-off action. To change only some products, use bulk edit on the Products page.'],
                ['name' => 'currency_section', 'label' => 'Extra currencies (prices are always set in GBP)', 'type' => 'section'],
                ['name' => 'currencies', 'label' => 'Currencies', 'type' => 'repeater', 'fixed' => true, 'fields' => [
                    ['name' => 'code', 'label' => 'Code', 'type' => 'text', 'readonly' => true],
                    ['name' => 'symbol', 'label' => 'Symbol', 'type' => 'text', 'readonly' => true],
                    ['name' => 'rate', 'label' => 'Rate (1 GBP =)', 'type' => 'number'],
                    ['name' => 'enabled', 'label' => 'Enabled', 'type' => 'toggle'],
                ]],
            ]],
            'shipping' => ['label' => 'Delivery & checkout', 'icon' => 'truck', 'fields' => [
                ['name' => 'free_shipping_enabled', 'label' => 'Offer free delivery over a threshold', 'type' => 'toggle', 'help' => 'When off (or the amount is empty), all free-delivery banners and progress bars disappear automatically.'],
                ['name' => 'free_shipping_threshold', 'label' => 'Free delivery threshold (£)', 'type' => 'money', 'col' => 6, 'min' => 0],
                ['name' => 'min_order_value', 'label' => 'Minimum order value (£)', 'type' => 'money', 'col' => 6, 'min' => 0],
                ['name' => 'ship_to_countries', 'label' => 'Countries you deliver to', 'type' => 'multiselect', 'options' => $opt([
                    'GB' => 'United Kingdom', 'IE' => 'Ireland', 'FR' => 'France', 'DE' => 'Germany', 'NL' => 'Netherlands', 'BE' => 'Belgium',
                    'ES' => 'Spain', 'IT' => 'Italy', 'PT' => 'Portugal', 'US' => 'United States', 'AE' => 'United Arab Emirates'])],
                ['name' => 'guest_checkout', 'label' => 'Allow guest checkout', 'type' => 'toggle'],
                ['name' => 'po_reference_enabled', 'label' => 'Ask for a PO reference at checkout', 'type' => 'toggle'],
                ['name' => 'checkout_terms_text', 'label' => 'Checkout terms checkbox text', 'type' => 'text'],
                ['name' => 'numbers', 'label' => 'Numbering', 'type' => 'section'],
                ['name' => 'order_prefix', 'label' => 'Order number prefix', 'type' => 'text', 'col' => 4],
                ['name' => 'invoice_prefix', 'label' => 'Invoice prefix', 'type' => 'text', 'col' => 4],
                ['name' => 'credit_note_prefix', 'label' => 'Credit note prefix', 'type' => 'text', 'col' => 4],
            ]],
            'catalog' => ['label' => 'Catalogue & stock', 'icon' => 'package', 'fields' => [
                ['name' => 'products_per_page', 'label' => 'Products per page', 'type' => 'number', 'col' => 6, 'min' => 12],
                ['name' => 'low_stock_threshold', 'label' => 'Low-stock warning at', 'type' => 'number', 'col' => 6, 'min' => 0],
                ['name' => 'show_stock_qty', 'label' => 'Show “Only X left” to customers', 'type' => 'toggle'],
                ['name' => 'filterable_specs', 'label' => 'Specification filters on category pages', 'type' => 'tags',
                    'help' => 'Spec labels customers can filter by, e.g. Resolution, Channels, Lens.',
                    'suggestions' => \App\Models\ProductSpec::select('label')->distinct()->orderBy('label')->limit(100)->pluck('label')],
                ['name' => 'reviews_enabled', 'label' => 'Product reviews', 'type' => 'toggle'],
                ['name' => 'reviews_auto_approve', 'label' => 'Publish reviews without approval', 'type' => 'toggle'],
            ]],
            'marketing' => ['label' => 'Banners & marketing', 'icon' => 'megaphone', 'fields' => [
                ['name' => 'announcement_enabled', 'label' => 'Show announcement bar', 'type' => 'toggle'],
                ['name' => 'announcement_text', 'label' => 'Announcement text', 'type' => 'text', 'col' => 8],
                ['name' => 'announcement_link', 'label' => 'Announcement link', 'type' => 'text', 'col' => 4],
                ['name' => 'trade_cta_title', 'label' => 'Trade call-to-action title', 'type' => 'text'],
                ['name' => 'trade_cta_text', 'label' => 'Trade call-to-action text', 'type' => 'textarea'],
                ['name' => 'newsletter_enabled', 'label' => 'Newsletter sign-up in footer', 'type' => 'toggle'],
                ['name' => 'cookie_banner_enabled', 'label' => 'Cookie consent banner', 'type' => 'toggle'],
                ['name' => 'cookie_banner_text', 'label' => 'Cookie banner text', 'type' => 'textarea'],
            ]],
            'training' => ['label' => 'Training', 'icon' => 'graduation', 'fields' => [
                ['name' => 'training_intro', 'label' => 'Training page introduction', 'type' => 'textarea'],
                ['name' => 'training_terms_text', 'label' => 'Agreement checkbox text', 'type' => 'textarea', 'help' => 'e.g. the £50 deposit line.'],
            ]],
            'social' => ['label' => 'Social & SEO', 'icon' => 'globe', 'fields' => [
                ['name' => 'social_facebook', 'label' => 'Facebook URL', 'type' => 'text', 'col' => 6],
                ['name' => 'social_instagram', 'label' => 'Instagram URL', 'type' => 'text', 'col' => 6],
                ['name' => 'social_linkedin', 'label' => 'LinkedIn URL', 'type' => 'text', 'col' => 6],
                ['name' => 'social_youtube', 'label' => 'YouTube URL', 'type' => 'text', 'col' => 6],
                ['name' => 'social_tiktok', 'label' => 'TikTok URL', 'type' => 'text', 'col' => 6],
                ['name' => 'whatsapp_number', 'label' => 'WhatsApp number (shows chat button)', 'type' => 'text', 'col' => 6, 'placeholder' => '447785941526'],
                ['name' => 'seo', 'label' => 'Search engines', 'type' => 'section'],
                ['name' => 'seo_title', 'label' => 'Homepage title', 'type' => 'text'],
                ['name' => 'seo_description', 'label' => 'Homepage description', 'type' => 'textarea', 'max' => 500],
                ['name' => 'seo_og_image', 'label' => 'Social sharing image', 'type' => 'image'],
                ['name' => 'google_analytics_id', 'label' => 'Google Analytics ID', 'type' => 'text', 'placeholder' => 'G-XXXXXXX'],
            ]],
            'security' => ['label' => 'Admin security', 'icon' => 'lock', 'fields' => [
                ['name' => 'admin_email_2fa', 'label' => 'Require an emailed code when signing in to admin', 'type' => 'toggle',
                    'help' => 'Make sure email sending works before enabling this.'],
            ]],
        ];
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/Settings', [
            'groups' => static::groups(),
            'values' => Settings::all(),
            'active' => $request->query('tab', 'general'),
            'env' => [
                'stripe' => (bool) config('services.stripe.secret'),
                'stripe_webhook' => (bool) config('services.stripe.webhook_secret'),
                'demo_payments' => (bool) config('services.stripe.demo_mode'),
                'mail' => config('mail.default'),
                'mail_from' => config('mail.from.address'),
                'app_url' => config('app.url'),
                'debug' => (bool) config('app.debug'),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $group = $request->validate(['group' => 'required|string'])['group'];
        $fields = collect(static::groups()[$group]['fields'] ?? [])->reject(fn ($f) => $f['type'] === 'section');
        abort_if($fields->isEmpty(), 404);

        $values = [];
        foreach ($fields as $f) {
            if (! empty($f['virtual'])) {
                continue;
            }
            $raw = $request->input($f['name']);
            $values[$f['name']] = match ($f['type']) {
                'toggle' => (bool) $raw,
                'number', 'money', 'percent' => $raw === null || $raw === '' ? 0 : (float) $raw,
                'multiselect', 'tags' => array_values(array_filter((array) $raw, fn ($v) => $v !== null && $v !== '')),
                'repeater' => array_values(array_map(fn ($r) => array_merge($r, ['rate' => (float) ($r['rate'] ?? 1), 'enabled' => (bool) ($r['enabled'] ?? false)]), (array) $raw)),
                default => $raw === null ? '' : (string) $raw,
            };
        }
        if (isset($values['vat_rate']) && ($values['vat_rate'] < 0 || $values['vat_rate'] > 100)) {
            return back()->withErrors(['vat_rate' => 'VAT rate must be between 0 and 100.']);
        }
        Settings::set($values);

        if ($group === 'tax' && in_array($request->input('apply_vat_all'), Product::VAT_MODES, true)) {
            Product::query()->update(['vat_mode' => $request->input('apply_vat_all')]);
        }

        return back()->with('success', 'Settings saved.');
    }
}
