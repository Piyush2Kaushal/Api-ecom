export type Tier = 'retailer' | 'trader' | 'wholesaler';

export interface PriceInfo {
    original: number;
    price: number;
    percent_off: number;
    has_discount: boolean;
}

export interface ProductCard {
    id: number;
    name: string;
    slug: string;
    sku: string;
    brand: { name: string; slug: string; is_exclusive: boolean } | null;
    image: string | null;
    image_alt: string | null;
    price: PriceInfo;
    vat_mode: 'included' | 'excluded' | 'none';
    in_stock: boolean;
    has_variants: boolean;
    is_new: boolean;
    is_featured: boolean;
    rating: number | null;
    short_description?: string | null;
}

export interface CategoryNode {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    depth: number;
    image_url: string | null;
    children: CategoryNode[];
}

export interface LinkItem {
    label: string;
    url: string;
    new_tab?: boolean;
}

export interface Currency {
    code: string;
    symbol: string;
    rate: number;
    enabled: boolean;
}

export interface PublicSettings {
    site_name: string;
    site_tagline: string;
    logo_url: string | null;
    logo_light_url: string | null;
    company_name: string;
    company_address: string;
    company_email: string;
    company_phone: string;
    company_mobile: string;
    opening_hours: string;
    vat_rate: number;
    free_shipping_active: boolean;
    free_shipping_threshold: number;
    guest_checkout: boolean;
    po_reference_enabled: boolean;
    announcement_enabled: boolean;
    announcement_text: string;
    announcement_link: string;
    cookie_banner_enabled: boolean;
    cookie_banner_text: string;
    social_facebook: string;
    social_instagram: string;
    social_linkedin: string;
    social_youtube: string;
    social_tiktok: string;
    whatsapp_number: string;
    footer_about: string;
    newsletter_enabled: boolean;
    show_stock_qty: boolean;
    reviews_enabled: boolean;
    checkout_terms_text: string;
    trade_cta_title: string;
    trade_cta_text: string;
    currencies: Currency[];
}

export interface AuthUser {
    id: number;
    name: string;
    first_name: string;
    email: string;
    tier: Tier;
    pending_tier: Tier | null;
}

export interface SharedProps {
    [key: string]: any;
    flash: { success?: string | null; error?: string | null };
    settings: PublicSettings;
    auth?: { user: AuthUser | null };
    cartCount?: number;
    wishlistIds?: number[];
    currency?: string;
    nav?: {
        categories: CategoryNode[];
        brands: { id: number; name: string; slug: string; logo_url: string | null; is_exclusive: boolean; tagline: string | null }[];
        header_links: LinkItem[];
        footer: { quick: LinkItem[]; products: LinkItem[]; help: LinkItem[] };
    };
    popup?: any;
    admin?: { id: number; name: string; email: string } | null;
    counters?: Record<string, number> | null;
    errors: Record<string, string>;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface CartLine {
    id: number;
    product_id: number;
    variant_id: number | null;
    name: string;
    slug: string;
    sku: string;
    brand: string | null;
    variant_label: string | null;
    image: string | null;
    quantity: number;
    unit_original: number;
    unit_price: number;
    percent_off: number;
    vat_mode: 'included' | 'excluded' | 'none';
    in_stock: boolean;
    available: number | null;
    line_original: number;
    line_amount: number;
    coupon_discount: number;
    net: number;
    vat: number;
    gross: number;
    vat_rate: number;
    issue: string | null;
}

export interface ShippingOption {
    id: number;
    name: string;
    description: string | null;
    estimate: string | null;
    cost: number;
    is_free: boolean;
}

export interface CartSummary {
    tier: Tier;
    lines: CartLine[];
    saved: Partial<CartLine>[];
    coupon: { code: string; description: string | null; type: string; discount: number } | null;
    coupon_error: string | null;
    shipping_methods: ShippingOption[];
    shipping_method: ShippingOption | null;
    has_issues: boolean;
    free_shipping: { threshold: number; remaining: number; qualified: boolean } | null;
    totals: {
        item_count: number;
        items_subtotal: number;
        savings: number;
        coupon_discount: number;
        shipping: number;
        shipping_vat: number;
        net_total: number;
        vat_total: number;
        included_vat: number;
        grand_total: number;
        vat_rate: number;
        weight: number;
    };
}
