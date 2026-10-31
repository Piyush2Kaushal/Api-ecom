<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\HeroSlide;
use App\Models\HomeSection;
use App\Models\Product;
use App\Models\TrainingCourse;
use App\Services\ProductPresenter;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        $tier = $this->tier();
        $sections = HomeSection::where('is_active', true)->orderBy('sort_order')->get()
            ->map(fn (HomeSection $s) => $this->resolve($s, $tier))->filter()->values();

        return Inertia::render('Store/Home', [
            'sections' => $sections,
            'meta' => $this->meta(null, null, null, ['jsonld' => [
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => setting('company_name'),
                'url' => url('/'),
                'email' => setting('company_email'),
                'telephone' => setting('company_phone'),
                'address' => setting('company_address'),
            ]]),
        ]);
    }

    protected function resolve(HomeSection $s, string $tier): ?array
    {
        $cfg = $s->settings ?? [];
        $data = ['id' => $s->id, 'type' => $s->type, 'title' => $s->title, 'subtitle' => $s->subtitle, 'settings' => $cfg];

        switch ($s->type) {
            case 'hero':
                $data['slides'] = HeroSlide::where('is_active', true)->orderBy('sort_order')->get();
                if ($data['slides']->isEmpty()) {
                    return null;
                }
                break;
            case 'categories':
                $ids = $cfg['category_ids'] ?? [];
                $q = Category::where('is_active', true);
                $ids ? $q->whereIn('id', $ids) : $q->where(fn ($w) => $w->where('show_on_home', true)->orWhere(fn ($x) => $x->whereNull('parent_id')));
                $list = $q->orderByDesc('show_on_home')->orderBy('depth')->orderBy('sort_order')->limit(12)->get(['id', 'name', 'slug', 'image', 'depth', 'show_on_home']);
                if ($ids) {
                    // Keep the exact order chosen in the admin.
                    $list = $list->sortBy(fn ($c) => array_search($c->id, array_map('intval', $ids)))->values();
                }
                $data['categories'] = $list->map(fn ($c) => ['name' => $c->name, 'slug' => $c->slug, 'image_url' => $c->image_url])->values();
                break;
            case 'products':
                $limit = (int) ($cfg['limit'] ?? 8);
                $q = ProductPresenter::cardQuery();
                match ($cfg['source'] ?? 'featured') {
                    'brand' => $q->where('brand_id', $cfg['brand_id'] ?? 0)->orderByDesc('is_featured')->orderBy('sort_order'),
                    'category' => $q->inCategory((int) ($cfg['category_id'] ?? 0))->orderByDesc('is_featured')->orderBy('sort_order'),
                    'latest' => $q->latest('products.id'),
                    'bestsellers' => $q->orderByDesc('sales_count'),
                    'sale' => $q->where(fn ($w) => $w->where('retail_discount_type', '!=', 'none')->where('retail_discount_value', '>', 0))->orderBy('sort_order'),
                    'manual' => $q->whereIn('products.id', $cfg['product_ids'] ?? [0]),
                    default => $q->where('is_featured', true)->orderBy('sort_order'),
                };
                $products = $q->limit($limit)->get();
                if (($cfg['source'] ?? '') === 'manual') {
                    $order = array_flip($cfg['product_ids'] ?? []);
                    $products = $products->sortBy(fn ($p) => $order[$p->id] ?? 999)->values();
                }
                if ($products->isEmpty()) {
                    return null;
                }
                $data['products'] = ProductPresenter::cards($products, $tier);
                $data['link'] = match ($cfg['source'] ?? '') {
                    'brand' => ($b = Brand::find($cfg['brand_id'] ?? 0)) ? route('brand.show', $b->slug) : null,
                    'category' => ($c = Category::find($cfg['category_id'] ?? 0)) ? route('category.show', $c->slug) : null,
                    default => route('shop'),
                };
                break;
            case 'brand_spotlight':
                $brand = Brand::find($cfg['brand_id'] ?? 0);
                $data['brand'] = $brand?->only(['name', 'slug', 'logo_url', 'tagline']);
                $data['settings']['image_url'] = media_url($cfg['image'] ?? null);
                break;
            case 'banner':
            case 'split':
                $data['settings']['image_url'] = media_url($cfg['image'] ?? null);
                $data['settings']['mobile_image_url'] = media_url($cfg['mobile_image'] ?? null);
                break;
            case 'brands':
                $data['brands'] = Brand::where('is_active', true)->orderBy('sort_order')->get()->map->only(['name', 'slug', 'logo_url', 'is_exclusive']);
                break;
            case 'training_cta':
                $data['courses'] = TrainingCourse::where('is_active', true)->orderBy('sort_order')->limit(4)->get(['title', 'duration', 'price_label']);
                $data['settings']['image_url'] = media_url($cfg['image'] ?? null);
                break;
            case 'trade_cta':
                $data['settings']['image_url'] = media_url($cfg['image'] ?? null);
                break;
        }

        return $data;
    }
}
