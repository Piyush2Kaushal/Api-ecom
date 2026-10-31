<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Services\MediaService;
use App\Services\Pricing;
use App\Services\ProductImporter;
use App\Services\StockAlertService;
use App\Support\Exporter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $threshold = (int) setting('low_stock_threshold', 5);
        $products = $this->filtered($request)
            ->with(['brand:id,name', 'category:id,name', 'images' => fn ($q) => $q->orderBy('sort_order')])
            ->paginate((int) $request->query('per_page', 25))->withQueryString();

        $products->getCollection()->transform(fn (Product $p) => [
            'id' => $p->id, 'name' => $p->name, 'sku' => $p->sku, 'slug' => $p->slug,
            'image' => $p->images->first()?->url,
            'brand' => $p->brand?->name, 'category' => $p->category?->name,
            'prices' => collect(['retailer', 'trader', 'wholesaler'])->mapWithKeys(fn ($t) => [$t => Pricing::price($p, $t)]),
            'vat_mode' => $p->vat_mode, 'stock_qty' => $p->stock_qty, 'track_stock' => $p->track_stock,
            'low' => $p->track_stock && $p->stock_qty <= ($p->low_stock_threshold ?? $threshold),
            'is_active' => $p->is_active, 'is_featured' => $p->is_featured, 'updated_at' => $p->updated_at,
        ]);

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['q', 'category', 'brand', 'status', 'stock', 'sort']),
            'categories' => $this->categoryOptions(),
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
        ]);
    }

    protected function filtered(Request $request)
    {
        $threshold = (int) setting('low_stock_threshold', 5);

        return Product::query()
            ->when($request->query('q'), fn ($q, $t) => $q->where(fn ($w) => $w->where('name', 'like', "%{$t}%")->orWhere('sku', 'like', "%{$t}%")))
            ->when($request->query('category'), fn ($q, $c) => $q->inCategory((int) $c))
            ->when($request->query('brand'), fn ($q, $b) => $q->where('brand_id', $b))
            ->when($request->query('status') === 'active', fn ($q) => $q->where('is_active', true))
            ->when($request->query('status') === 'hidden', fn ($q) => $q->where('is_active', false))
            ->when($request->query('status') === 'featured', fn ($q) => $q->where('is_featured', true))
            ->when($request->query('stock') === 'out', fn ($q) => $q->where('track_stock', true)->where('stock_qty', '<=', 0))
            ->when($request->query('stock') === 'low', fn ($q) => $q->where('track_stock', true)->whereRaw('stock_qty <= COALESCE(low_stock_threshold, ?)', [$threshold]))
            ->when($request->query('sort', 'latest'), function ($q, $s) {
                match ($s) {
                    'name' => $q->orderBy('name'),
                    'price' => $q->orderBy('retail_price'),
                    'stock' => $q->orderBy('stock_qty'),
                    'sales' => $q->orderByDesc('sales_count'),
                    default => $q->latest('id'),
                };
            });
    }

    public static function categoryOptions(): array
    {
        $out = [];
        $walk = function ($nodes, $prefix = '') use (&$walk, &$out) {
            foreach ($nodes as $n) {
                $out[] = ['id' => $n['id'], 'name' => $n['name'], 'label' => $prefix.$n['name'], 'depth' => $n['depth']];
                $walk($n['children'], $prefix.$n['name'].' › ');
            }
        };
        $walk(Category::nested(false));

        return $out;
    }

    public function create()
    {
        return $this->form(new Product([
            'vat_mode' => 'default', 'track_stock' => true, 'is_active' => true,
            'retail_discount_type' => 'none', 'trade_discount_type' => 'none', 'wholesale_discount_type' => 'none',
        ]));
    }

    public function edit(Product $product)
    {
        return $this->form($product->load(['images', 'specs', 'files', 'variants', 'categories:id']));
    }

    protected function form(Product $product)
    {
        return Inertia::render('Admin/Products/Form', [
            'product' => $product->exists ? array_merge($product->toArray(), [
                'extra_category_ids' => $product->categories->pluck('id'),
                'discount_starts_at' => $product->discount_starts_at?->format('Y-m-d\TH:i'),
                'discount_ends_at' => $product->discount_ends_at?->format('Y-m-d\TH:i'),
            ]) : $product->toArray(),
            'categories' => $this->categoryOptions(),
            'brands' => Brand::orderBy('name')->get(['id', 'name']),
            'vatRate' => Pricing::vatRate(),
            'defaultVatMode' => setting('default_vat_mode'),
            'specLabels' => \App\Models\ProductSpec::select('label')->distinct()->orderBy('label')->limit(200)->pluck('label'),
        ]);
    }

    protected function rules(?Product $product = null): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product?->id)],
            'sku' => ['required', 'string', 'max:100', Rule::unique('products', 'sku')->ignore($product?->id)],
            'brand_id' => 'nullable|exists:brands,id',
            'category_id' => 'nullable|exists:categories,id',
            'extra_category_ids' => 'array', 'extra_category_ids.*' => 'integer|exists:categories,id',
            'short_description' => 'nullable|string|max:1000',
            'description' => 'nullable|string',
            'key_features' => 'array', 'key_features.*' => 'nullable|string|max:300',
            'discount_starts_at' => 'nullable|date', 'discount_ends_at' => 'nullable|date|after_or_equal:discount_starts_at',
            'vat_mode' => ['required', Rule::in(Product::VAT_MODES)],
            'track_stock' => 'boolean', 'stock_qty' => 'nullable|integer|min:-99999|max:9999999', 'allow_backorder' => 'boolean',
            'low_stock_threshold' => 'nullable|integer|min:0', 'weight' => 'nullable|numeric|min:0',
            'option_name' => 'nullable|string|max:60',
            'is_active' => 'boolean', 'is_featured' => 'boolean', 'is_new' => 'boolean', 'sort_order' => 'nullable|integer',
            'meta_title' => 'nullable|string|max:255', 'meta_description' => 'nullable|string|max:500',
            'images' => 'array', 'images.*.path' => 'required|string|max:500', 'images.*.alt' => 'nullable|string|max:255',
            'specs' => 'array', 'specs.*.label' => 'nullable|string|max:120', 'specs.*.value' => 'nullable|string|max:500',
            'files' => 'array', 'files.*.title' => 'required|string|max:190', 'files.*.path' => 'required|string|max:500',
            'variants' => 'array', 'variants.*.id' => 'nullable|integer', 'variants.*.value' => 'required|string|max:120',
            'variants.*.sku' => 'nullable|string|max:100', 'variants.*.price_adjustment' => 'nullable|numeric',
            'variants.*.stock_qty' => 'nullable|integer', 'variants.*.image' => 'nullable|string|max:500', 'variants.*.is_active' => 'boolean',
        ];
        foreach (['retail', 'trade', 'wholesale'] as $t) {
            $rules[$t.'_price'] = ($t === 'retail' ? 'required' : 'nullable').'|numeric|min:0|max:9999999';
            $rules[$t.'_discount_type'] = ['required', Rule::in(Product::DISCOUNT_TYPES)];
            $rules[$t.'_discount_value'] = 'nullable|numeric|min:0|max:9999999';
        }

        return $rules;
    }

    public function store(Request $request)
    {
        $product = $this->save($request, new Product);

        return redirect()->route('admin.products.edit', $product)->with('success', 'Product created.');
    }

    public function update(Request $request, Product $product)
    {
        $wasOut = ! $product->inStock();
        $this->save($request, $product);
        if ($wasOut) {
            StockAlertService::notifyIfBackInStock($product->fresh());
        }

        return back()->with('success', 'Product saved.');
    }

    protected function save(Request $request, Product $product): Product
    {
        $data = $request->validate($this->rules($product->exists ? $product : null));

        return DB::transaction(function () use ($data, $product) {
            $fields = collect($data)->except(['extra_category_ids', 'images', 'specs', 'files', 'variants'])->all();
            $fields['slug'] = Str::slug($fields['slug'] ?: $fields['name']);
            if (Product::where('slug', $fields['slug'])->where('id', '!=', $product->id ?? 0)->exists()) {
                $fields['slug'] .= '-'.Str::lower(Str::random(4));
            }
            $fields['key_features'] = array_values(array_filter($data['key_features'] ?? []));
            foreach (['retail', 'trade', 'wholesale'] as $t) {
                $fields[$t.'_discount_value'] = (float) ($fields[$t.'_discount_value'] ?? 0);
                if ($fields[$t.'_discount_type'] === 'none') {
                    $fields[$t.'_discount_value'] = 0;
                }
            }
            $fields['stock_qty'] = (int) ($fields['stock_qty'] ?? 0);
            $fields['sort_order'] = (int) ($fields['sort_order'] ?? 0);
            $product->fill($fields)->save();

            $product->categories()->sync(array_values(array_diff($data['extra_category_ids'] ?? [], [$product->category_id])));

            $product->images()->delete();
            foreach (array_values($data['images'] ?? []) as $i => $img) {
                $product->images()->create(['path' => $img['path'], 'alt' => $img['alt'] ?? null, 'sort_order' => $i]);
            }
            $product->specs()->delete();
            foreach (array_values(array_filter($data['specs'] ?? [], fn ($s) => trim((string) ($s['label'] ?? '')) !== '' && trim((string) ($s['value'] ?? '')) !== '')) as $i => $spec) {
                $product->specs()->create(['label' => trim($spec['label']), 'value' => trim($spec['value']), 'sort_order' => $i]);
            }
            $product->files()->delete();
            foreach ($data['files'] ?? [] as $file) {
                $product->files()->create($file);
            }

            $keep = [];
            foreach (array_values($data['variants'] ?? []) as $i => $v) {
                $attrs = ['value' => $v['value'], 'sku' => $v['sku'] ?? null, 'price_adjustment' => (float) ($v['price_adjustment'] ?? 0),
                    'stock_qty' => (int) ($v['stock_qty'] ?? 0), 'image' => $v['image'] ?? null, 'is_active' => $v['is_active'] ?? true, 'sort_order' => $i];
                $variant = ! empty($v['id']) ? $product->variants()->find($v['id']) : null;
                $variant ? $variant->update($attrs) : $variant = $product->variants()->create($attrs);
                $keep[] = $variant->id;
            }
            $product->variants()->whereNotIn('id', $keep ?: [0])->delete();
            if ($keep) {
                $product->update(['stock_qty' => (int) $product->variants()->where('is_active', true)->sum('stock_qty')]);
            }

            return $product;
        });
    }

    public function duplicate(Product $product)
    {
        $product->load(['images', 'specs', 'files', 'variants', 'categories']);
        $copy = $product->replicate(['sales_count', 'views']);
        $copy->name = $product->name.' (copy)';
        $copy->sku = $product->sku.'-COPY-'.Str::upper(Str::random(3));
        $copy->slug = Str::slug($copy->name).'-'.Str::lower(Str::random(4));
        $copy->is_active = false;
        $copy->save();
        $copy->categories()->sync($product->categories->pluck('id'));
        foreach (['images', 'specs', 'files', 'variants'] as $rel) {
            foreach ($product->$rel as $row) {
                $copy->$rel()->create(collect($row->getAttributes())->except(['id', 'product_id', 'created_at', 'updated_at'])->all());
            }
        }

        return redirect()->route('admin.products.edit', $copy)->with('success', 'Product duplicated — it is hidden until you publish it.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('admin.products.index')->with('success', 'Product deleted.');
    }

    public function bulk(Request $request)
    {
        $data = $request->validate([
            'ids' => 'required_without:all_matching|array', 'ids.*' => 'integer',
            'all_matching' => 'boolean', 'filters' => 'array',
            'action' => ['required', Rule::in(['delete', 'activate', 'deactivate', 'feature', 'unfeature', 'vat', 'category', 'add_category', 'brand', 'discount', 'price_adjust', 'stock', 'track_stock'])],
            'value' => 'nullable', 'tier' => 'nullable|in:retail,trade,wholesale,all', 'discount_type' => 'nullable|in:none,percent,fixed',
        ]);
        $q = ! empty($data['all_matching']) ? $this->filtered(new Request($data['filters'] ?? [])) : Product::whereIn('id', $data['ids']);
        $ids = (clone $q)->reorder()->pluck('products.id');
        $query = Product::whereIn('id', $ids);
        $v = $data['value'] ?? null;
        $tiers = ($data['tier'] ?? 'all') === 'all' ? ['retail', 'trade', 'wholesale'] : [$data['tier']];

        match ($data['action']) {
            'delete' => $query->delete(),
            'activate' => $query->update(['is_active' => true]),
            'deactivate' => $query->update(['is_active' => false]),
            'feature' => $query->update(['is_featured' => true]),
            'unfeature' => $query->update(['is_featured' => false]),
            'vat' => in_array($v, Product::VAT_MODES, true) ? $query->update(['vat_mode' => $v]) : null,
            'category' => $query->update(['category_id' => $v ?: null]),
            'add_category' => $v ? $ids->each(fn ($id) => Product::find($id)?->categories()->syncWithoutDetaching([(int) $v])) : null,
            'brand' => $query->update(['brand_id' => $v ?: null]),
            'discount' => $query->update(collect($tiers)->flatMap(fn ($t) => [
                $t.'_discount_type' => $data['discount_type'] ?? 'percent',
                $t.'_discount_value' => ($data['discount_type'] ?? 'percent') === 'none' ? 0 : (float) $v,
            ])->all()),
            'price_adjust' => collect($tiers)->each(fn ($t) => Product::whereIn('id', $ids)->whereNotNull($t.'_price')
                ->update([$t.'_price' => DB::raw("ROUND({$t}_price * (1 + ".((float) $v / 100).'), 2)')])),
            'stock' => $query->update(['stock_qty' => (int) $v]),
            'track_stock' => $query->update(['track_stock' => (bool) $v]),
        };

        return back()->with('success', $ids->count().' product(s) updated.');
    }

    public function export(Request $request)
    {
        $headers = ProductImporter::COLUMNS;
        $rows = (function () use ($request) {
            foreach ($this->filtered($request)->with(['brand', 'category', 'categories', 'images', 'specs'])->lazy(200) as $p) {
                yield ProductImporter::toRow($p);
            }
        })();

        return Exporter::download('products', $headers, $rows, $request->query('format', 'xlsx'));
    }

    public function template(Request $request)
    {
        return Exporter::download('product-import-template', ProductImporter::COLUMNS, [ProductImporter::exampleRow()], $request->query('format', 'xlsx'));
    }

    public function importForm()
    {
        return Inertia::render('Admin/Products/Import', ['columns' => ProductImporter::COLUMNS, 'help' => ProductImporter::HELP]);
    }

    public function import(Request $request)
    {
        $data = $request->validate([
            'file' => 'required|file|max:20480|mimes:csv,txt,xlsx',
            'download_images' => 'boolean',
            'mode' => 'required|in:upsert,create_only,update_only',
        ]);
        @set_time_limit(600);
        $file = $data['file'];
        $ext = strtolower($file->getClientOriginalExtension());
        $path = $file->getRealPath();
        if (! in_array($ext, ['csv', 'xlsx', 'txt'], true)) {
            return back()->with('error', 'Please upload a .csv or .xlsx file.');
        }
        $result = (new ProductImporter)->import($path, $ext === 'xlsx' ? 'xlsx' : 'csv', $data['mode'], (bool) ($data['download_images'] ?? false));

        return back()->with('success', "Import finished: {$result['created']} created, {$result['updated']} updated, {$result['skipped']} skipped.")
            ->with('importErrors', $result['errors']);
    }
}
