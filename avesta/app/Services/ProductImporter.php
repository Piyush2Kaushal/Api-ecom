<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use OpenSpout\Reader\CSV\Reader as CsvReader;
use OpenSpout\Reader\XLSX\Reader as XlsxReader;

/**
 * CSV / Excel import & export for products.
 * Rows are matched by SKU. Categories are given as paths ("CCTV > IP Cameras > Dome") and created if missing.
 */
class ProductImporter
{
    public const COLUMNS = [
        'sku', 'name', 'slug', 'brand', 'category', 'extra_categories',
        'retail_price', 'retail_discount_type', 'retail_discount_value',
        'trade_price', 'trade_discount_type', 'trade_discount_value',
        'wholesale_price', 'wholesale_discount_type', 'wholesale_discount_value',
        'vat_mode', 'track_stock', 'stock_qty', 'allow_backorder', 'weight',
        'is_active', 'is_featured', 'short_description', 'description', 'key_features', 'specs', 'images',
        'meta_title', 'meta_description',
    ];

    public const HELP = [
        'sku' => 'Required. Unique product code — used to match existing products.',
        'name' => 'Required for new products.',
        'category' => 'Path using ">" e.g. CCTV > IP Cameras > Dome. Missing categories are created (max 5 levels).',
        'extra_categories' => 'Optional extra category paths separated by ";".',
        'brand' => 'Brand name. Created if it does not exist.',
        '*_discount_type' => 'none, percent or fixed.',
        'vat_mode' => 'default, included, excluded or none.',
        'track_stock / allow_backorder / is_active / is_featured' => 'yes or no.',
        'key_features' => 'Separate features with "|".',
        'specs' => 'Label: Value pairs separated by "|" e.g. Resolution: 5MP | Lens: 2.8mm',
        'images' => 'Image URLs or uploads/... paths separated by "|". URLs are downloaded if you tick "download images".',
    ];

    public static function exampleRow(): array
    {
        return ['TV-5MP-DOME-28', 'Tenvo 5MP ColorVu Dome Camera 2.8mm', '', 'Tenvo', 'CCTV > IP Cameras > Dome Cameras', 'Tenvo Exclusives',
            '89.99', 'percent', '10', '64.99', 'percent', '5', '58.00', 'none', '0',
            'default', 'yes', '40', 'no', '0.45', 'yes', 'yes',
            '5MP full-colour dome camera with built-in mic.', '<p>Full product description…</p>',
            '5MP resolution | 24/7 colour | Built-in mic', 'Resolution: 5MP | Lens: 2.8mm | Technology: ColorVu',
            'https://example.com/image1.jpg', '', ''];
    }

    public static function toRow(Product $p): array
    {
        $path = fn ($id) => implode(' > ', array_column(Category::trail($id), 'name'));

        return [
            $p->sku, $p->name, $p->slug, $p->brand?->name, $p->category_id ? $path($p->category_id) : '',
            $p->categories->map(fn ($c) => $path($c->id))->implode('; '),
            $p->retail_price, $p->retail_discount_type, $p->retail_discount_value,
            $p->trade_price, $p->trade_discount_type, $p->trade_discount_value,
            $p->wholesale_price, $p->wholesale_discount_type, $p->wholesale_discount_value,
            $p->vat_mode, $p->track_stock, $p->stock_qty, $p->allow_backorder, $p->weight,
            $p->is_active, $p->is_featured, $p->short_description, $p->description,
            implode(' | ', $p->key_features ?? []),
            $p->specs->map(fn ($s) => $s->label.': '.$s->value)->implode(' | '),
            $p->images->pluck('path')->implode(' | '),
            $p->meta_title, $p->meta_description,
        ];
    }

    /** @return array{created:int, updated:int, skipped:int, errors:array<int,string>} */
    public function import(string $path, string $type, string $mode, bool $downloadImages): array
    {
        $reader = $type === 'xlsx' ? new XlsxReader : new CsvReader;
        $reader->open($path);
        $result = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => []];
        $headers = null;
        $line = 0;

        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $line++;
                $values = array_map(fn ($v) => is_string($v) ? trim($v) : ($v instanceof \DateTimeInterface ? $v->format('Y-m-d') : $v), $row->toArray());
                if ($headers === null) {
                    $headers = array_map(fn ($h) => Str::snake(strtolower(trim((string) $h))), $values);

                    continue;
                }
                if (! array_filter($values, fn ($v) => $v !== '' && $v !== null)) {
                    continue;
                }
                $data = array_combine($headers, array_pad(array_slice($values, 0, count($headers)), count($headers), null));
                try {
                    $status = $this->importRow($data, $mode, $downloadImages);
                    $result[$status]++;
                } catch (\Throwable $e) {
                    $result['skipped']++;
                    if (count($result['errors']) < 50) {
                        $result['errors'][] = "Row {$line}: ".$e->getMessage();
                    }
                }
            }
            break; // first sheet only
        }
        $reader->close();

        return $result;
    }

    protected function importRow(array $d, string $mode, bool $downloadImages): string
    {
        $sku = trim((string) ($d['sku'] ?? ''));
        if ($sku === '') {
            throw new \RuntimeException('SKU is missing.');
        }
        $product = Product::where('sku', $sku)->first();
        if ($product && $mode === 'create_only') {
            return 'skipped';
        }
        if (! $product && $mode === 'update_only') {
            return 'skipped';
        }
        if (! $product && empty($d['name'])) {
            throw new \RuntimeException("Name is required for new product {$sku}.");
        }
        if (! $product && ($d['retail_price'] ?? '') === '') {
            throw new \RuntimeException("Retail price is required for new product {$sku}.");
        }

        return DB::transaction(function () use ($d, $product, $sku, $downloadImages) {
            $isNew = ! $product;
            $product ??= new Product(['sku' => $sku]);
            $has = fn ($k) => array_key_exists($k, $d) && $d[$k] !== null && $d[$k] !== '';
            $bool = fn ($v) => in_array(strtolower((string) $v), ['1', 'yes', 'y', 'true', 'on'], true);

            foreach (['name', 'short_description', 'description', 'meta_title', 'meta_description'] as $f) {
                if ($has($f)) {
                    $product->$f = $d[$f];
                }
            }
            if ($has('slug') || $isNew) {
                $slug = Str::slug($has('slug') ? $d['slug'] : $d['name']);
                $product->slug = Product::where('slug', $slug)->where('id', '!=', $product->id ?? 0)->exists() ? $slug.'-'.Str::lower(Str::random(4)) : $slug;
            }
            foreach (['retail', 'trade', 'wholesale'] as $t) {
                if ($has($t.'_price')) {
                    $product->{$t.'_price'} = (float) str_replace([',', '£'], '', (string) $d[$t.'_price']);
                }
                if ($has($t.'_discount_type') && in_array($d[$t.'_discount_type'], Product::DISCOUNT_TYPES, true)) {
                    $product->{$t.'_discount_type'} = $d[$t.'_discount_type'];
                }
                if ($has($t.'_discount_value')) {
                    $product->{$t.'_discount_value'} = (float) $d[$t.'_discount_value'];
                }
            }
            if ($has('vat_mode') && in_array($d['vat_mode'], Product::VAT_MODES, true)) {
                $product->vat_mode = $d['vat_mode'];
            }
            foreach (['track_stock', 'allow_backorder', 'is_active', 'is_featured'] as $f) {
                if ($has($f)) {
                    $product->$f = $bool($d[$f]);
                }
            }
            if ($has('stock_qty')) {
                $product->stock_qty = (int) $d['stock_qty'];
            }
            if ($has('weight')) {
                $product->weight = (float) $d['weight'];
            }
            if ($has('key_features')) {
                $product->key_features = array_values(array_filter(array_map('trim', explode('|', (string) $d['key_features']))));
            }
            if ($has('brand')) {
                $product->brand_id = Brand::firstOrCreate(['slug' => Str::slug($d['brand'])], ['name' => $d['brand']])->id;
            }
            if ($has('category')) {
                $product->category_id = $this->categoryFromPath((string) $d['category']);
            }
            $product->save();

            if ($has('extra_categories')) {
                $ids = collect(explode(';', (string) $d['extra_categories']))->map(fn ($p) => trim($p))->filter()
                    ->map(fn ($p) => $this->categoryFromPath($p))->filter()->reject(fn ($id) => $id === $product->category_id)->values()->all();
                $product->categories()->sync($ids);
            }
            if ($has('specs')) {
                $product->specs()->delete();
                foreach (array_values(array_filter(array_map('trim', explode('|', (string) $d['specs'])))) as $i => $pair) {
                    [$label, $value] = array_pad(array_map('trim', explode(':', $pair, 2)), 2, '');
                    if ($label !== '' && $value !== '') {
                        $product->specs()->create(['label' => $label, 'value' => $value, 'sort_order' => $i]);
                    }
                }
            }
            if ($has('images')) {
                $paths = [];
                foreach (array_filter(array_map('trim', explode('|', (string) $d['images']))) as $src) {
                    if ($downloadImages && preg_match('#^https?://#', $src)) {
                        $paths[] = MediaService::storeFromUrl($src, 'products') ?? $src;
                    } else {
                        $paths[] = $src;
                    }
                }
                $product->images()->delete();
                foreach ($paths as $i => $p) {
                    $product->images()->create(['path' => $p, 'sort_order' => $i, 'alt' => $product->name]);
                }
            }

            return $isNew ? 'created' : 'updated';
        });
    }

    protected function categoryFromPath(string $path): ?int
    {
        $parts = array_values(array_filter(array_map('trim', explode('>', $path))));
        $parentId = null;
        foreach (array_slice($parts, 0, Category::MAX_DEPTH) as $depth => $name) {
            $cat = Category::where('parent_id', $parentId)->where('name', $name)->first();
            if (! $cat) {
                $slug = Str::slug($name);
                if (Category::where('slug', $slug)->exists()) {
                    $slug .= '-'.Str::lower(Str::random(4));
                }
                $cat = Category::create(['parent_id' => $parentId, 'name' => $name, 'slug' => $slug, 'depth' => $depth + 1]);
            }
            $parentId = $cat->id;
        }

        return $parentId;
    }
}
