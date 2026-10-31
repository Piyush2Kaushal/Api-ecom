<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSpec;
use App\Services\ProductPresenter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function shop(Request $request)
    {
        return $this->listing($request, Product::query()->active(), [
            'title' => $request->filled('q') ? 'Search results' : 'All products',
            'subtitle' => $request->filled('q') ? 'Results for “'.$request->string('q').'”' : 'The complete Avesta range',
            'type' => 'shop',
        ]);
    }

    public function category(Request $request, string $slug)
    {
        $category = Category::where('slug', $slug)->where('is_active', true)->firstOrFail();
        $children = Category::where('parent_id', $category->id)->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get();

        return $this->listing($request, Product::query()->active()->inCategory($category->id), [
            'title' => $category->name,
            'subtitle' => $category->description,
            'type' => 'category',
            'banner' => $category->banner_url,
            'breadcrumbs' => Category::trail($category->id),
            'children' => $children->map(fn ($c) => ['name' => $c->name, 'slug' => $c->slug, 'image_url' => $c->image_url])->values(),
            'meta' => $this->meta($category->meta_title ?: $category->name, $category->meta_description ?: $category->description, $category->banner_url ?? $category->image_url),
        ]);
    }

    public function brand(Request $request, string $slug)
    {
        $brand = Brand::where('slug', $slug)->where('is_active', true)->firstOrFail();

        return $this->listing($request, Product::query()->active()->where('brand_id', $brand->id), [
            'title' => $brand->name,
            'subtitle' => $brand->tagline ?: $brand->description,
            'description' => $brand->description,
            'type' => 'brand',
            'banner' => $brand->banner_url,
            'logo' => $brand->logo_url,
            'exclusive' => $brand->is_exclusive,
            'hideBrandFilter' => true,
            'meta' => $this->meta($brand->meta_title ?: $brand->name.' — CCTV & Security', $brand->meta_description ?: $brand->description, $brand->banner_url),
        ]);
    }

    public function brands()
    {
        return Inertia::render('Store/Brands', [
            'brands' => Brand::where('is_active', true)->withCount(['products' => fn ($q) => $q->where('is_active', true)])
                ->orderByDesc('is_exclusive')->orderBy('sort_order')->get(),
            'meta' => $this->meta('Our brands'),
        ]);
    }

    public function suggest(Request $request)
    {
        $q = trim((string) $request->query('q'));
        if (mb_strlen($q) < 2) {
            return response()->json(['products' => [], 'categories' => [], 'brands' => []]);
        }
        $tier = $this->tier();
        $products = ProductPresenter::cardQuery()->search($q)->orderByDesc('sales_count')->limit(6)->get();

        return response()->json([
            'products' => ProductPresenter::cards($products, $tier),
            'categories' => Category::where('is_active', true)->where('name', 'like', "%{$q}%")->limit(4)->get(['name', 'slug']),
            'brands' => Brand::where('is_active', true)->where('name', 'like', "%{$q}%")->limit(3)->get(['name', 'slug']),
        ]);
    }

    protected function listing(Request $request, Builder $base, array $context)
    {
        $tier = $this->tier();
        $base->search($request->query('q'));
        $priceSql = Product::priceSql($tier);

        // Facets are computed on the base set (before the user's own filters) so options never vanish.
        $baseIds = (clone $base)->select('products.id');
        $brandFacets = Brand::whereIn('id', (clone $base)->select('products.brand_id'))->where('is_active', true)
            ->withCount(['products' => fn ($q) => $q->whereIn('products.id', (clone $baseIds))])
            ->orderBy('name')->get(['id', 'name', 'slug']);
        $specLabels = (array) setting('filterable_specs', []);
        $specFacets = $specLabels ? ProductSpec::whereIn('label', $specLabels)->whereIn('product_id', clone $baseIds)
            ->selectRaw('label, value, COUNT(*) as total')->groupBy('label', 'value')->orderBy('value')->get()
            ->groupBy('label')->map(fn ($rows) => $rows->map(fn ($r) => ['value' => $r->value, 'count' => $r->total])->values()) : collect();
        $range = (clone $base)->selectRaw("MIN({$priceSql}) as min_price, MAX({$priceSql}) as max_price")->reorder()->first();

        // Apply filters
        $q = clone $base;
        if ($brands = array_filter((array) $request->query('brand', []))) {
            $q->whereIn('brand_id', Brand::whereIn('slug', $brands)->pluck('id'));
        }
        if ($request->filled('min')) {
            $q->whereRaw("{$priceSql} >= ?", [(float) $request->query('min')]);
        }
        if ($request->filled('max')) {
            $q->whereRaw("{$priceSql} <= ?", [(float) $request->query('max')]);
        }
        if ($request->boolean('in_stock')) {
            $q->where(fn ($w) => $w->where('track_stock', false)->orWhere('allow_backorder', true)->orWhere('stock_qty', '>', 0));
        }
        if ($request->boolean('sale')) {
            $col = \App\Services\Pricing::column($tier);
            $q->where(fn ($w) => $w->where($col.'_discount_type', '!=', 'none')->where($col.'_discount_value', '>', 0));
        }
        foreach ((array) $request->query('spec', []) as $label => $values) {
            $values = array_filter((array) $values);
            if ($values && in_array($label, $specLabels, true)) {
                $q->whereIn('products.id', ProductSpec::where('label', $label)->whereIn('value', $values)->select('product_id'));
            }
        }

        $sort = $request->query('sort', 'featured');
        match ($sort) {
            'newest' => $q->latest('products.id'),
            'price_asc' => $q->orderByRaw("{$priceSql} asc"),
            'price_desc' => $q->orderByRaw("{$priceSql} desc"),
            'name' => $q->orderBy('products.name'),
            'bestselling' => $q->orderByDesc('sales_count'),
            default => $q->orderByDesc('is_featured')->orderBy('products.sort_order')->latest('products.id'),
        };

        $perPage = min(60, max(12, (int) setting('products_per_page', 24)));
        $page = $q->with(['brand:id,name,slug,is_exclusive', 'images'])
            ->withAvg(['reviews as rating' => fn ($r) => $r->where('is_approved', true)], 'rating')
            ->withCount(['variants as variants_count' => fn ($v) => $v->where('is_active', true)])
            ->paginate($perPage)->withQueryString();

        $meta = $context['meta'] ?? $this->meta($context['title']);
        unset($context['meta']);

        return Inertia::render('Store/Listing', [
            'context' => $context,
            'products' => ProductPresenter::cards($page->items(), $tier),
            'pagination' => [
                'current' => $page->currentPage(),
                'last' => $page->lastPage(),
                'total' => $page->total(),
                'from' => $page->firstItem(),
                'to' => $page->lastItem(),
                'links' => $page->linkCollection()->toArray(),
            ],
            'facets' => [
                'brands' => $context['hideBrandFilter'] ?? false ? [] : $brandFacets->map(fn ($b) => ['name' => $b->name, 'slug' => $b->slug, 'count' => $b->products_count])->values(),
                'specs' => $specFacets,
                'price' => ['min' => floor((float) ($range->min_price ?? 0)), 'max' => ceil((float) ($range->max_price ?? 0))],
            ],
            'filters' => [
                'q' => $request->query('q'),
                'brand' => array_values(array_filter((array) $request->query('brand', []))),
                'spec' => (object) $request->query('spec', []),
                'min' => $request->query('min'),
                'max' => $request->query('max'),
                'in_stock' => $request->boolean('in_stock'),
                'sale' => $request->boolean('sale'),
                'sort' => $sort,
            ],
            'meta' => $meta,
        ]);
    }
}
