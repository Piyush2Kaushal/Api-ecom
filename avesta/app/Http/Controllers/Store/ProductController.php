<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Mail\BrandedMail;
use App\Models\ContactEnquiry;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\StockNotification;
use App\Services\Notifier;
use App\Services\ProductPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function show(string $slug)
    {
        $product = Product::where('slug', $slug)->where('is_active', true)->with('brand')->firstOrFail();
        Product::whereKey($product->id)->increment('views');
        $tier = $this->tier();
        $user = auth('web')->user();
        $detail = ProductPresenter::detail($product, $tier);

        $related = ProductPresenter::cardQuery()->where('products.id', '!=', $product->id)
            ->where(fn ($q) => $q->where('category_id', $product->category_id)->orWhere('brand_id', $product->brand_id))
            ->orderByRaw('CASE WHEN category_id = ? THEN 0 ELSE 1 END', [$product->category_id ?? 0])
            ->orderByDesc('sales_count')->limit(8)->get();

        // "Frequently bought together" from paid orders containing this product.
        $togetherIds = OrderItem::whereIn('order_id', OrderItem::where('product_id', $product->id)->select('order_id'))
            ->where('product_id', '!=', $product->id)->whereNotNull('product_id')
            ->selectRaw('product_id, COUNT(*) as c')->groupBy('product_id')->orderByDesc('c')->limit(4)->pluck('product_id');
        $together = $togetherIds->isNotEmpty() ? ProductPresenter::cardQuery()->whereIn('products.id', $togetherIds)->get() : collect();

        $reviews = $product->reviews()->where('is_approved', true)->with('user:id,first_name,last_name')->latest()->limit(20)->get()
            ->map(fn ($r) => ['id' => $r->id, 'rating' => $r->rating, 'title' => $r->title, 'body' => $r->body,
                'author' => $r->user ? $r->user->first_name.' '.Str::substr((string) $r->user->last_name, 0, 1).'.' : 'Customer',
                'date' => $r->created_at->format('d M Y')]);

        $canReview = $user && ! Review::where('product_id', $product->id)->where('user_id', $user->id)->exists()
            && OrderItem::where('product_id', $product->id)->whereHas('order', fn ($o) => $o->where('user_id', $user->id)->whereNotNull('paid_at'))->exists();

        $price = $detail['price'];

        return Inertia::render('Store/Product', [
            'product' => $detail,
            'related' => ProductPresenter::cards($related, $tier),
            'together' => ProductPresenter::cards($together, $tier),
            'reviews' => $reviews,
            'reviewStats' => ['average' => round((float) $product->reviews()->where('is_approved', true)->avg('rating'), 1), 'count' => $reviews->count()],
            'canReview' => $canReview,
            'meta' => $this->meta(
                $product->meta_title ?: $product->name,
                $product->meta_description ?: ($product->short_description ?: Str::limit(strip_tags((string) $product->description), 160)),
                $detail['image'],
                ['type' => 'product', 'jsonld' => [
                    '@context' => 'https://schema.org/',
                    '@type' => 'Product',
                    'name' => $product->name,
                    'sku' => $product->sku,
                    'image' => array_column($detail['images']->all(), 'url'),
                    'description' => Str::limit(strip_tags((string) ($product->short_description ?: $product->description)), 500),
                    'brand' => $product->brand ? ['@type' => 'Brand', 'name' => $product->brand->name] : null,
                    'offers' => [
                        '@type' => 'Offer',
                        'priceCurrency' => 'GBP',
                        'price' => number_format($price['price'], 2, '.', ''),
                        'availability' => $detail['in_stock'] ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                        'url' => route('product.show', $product->slug),
                    ],
                ]]
            ),
        ]);
    }

    public function review(Request $request, Product $product)
    {
        $user = $request->user('web');
        $data = $request->validate(['rating' => 'required|integer|min:1|max:5', 'title' => 'nullable|string|max:120', 'body' => 'nullable|string|max:2000']);
        $bought = OrderItem::where('product_id', $product->id)->whereHas('order', fn ($o) => $o->where('user_id', $user->id)->whereNotNull('paid_at'))->exists();
        abort_unless($bought, 403, 'Only verified buyers can review this product.');
        Review::updateOrCreate(['product_id' => $product->id, 'user_id' => $user->id], $data + ['is_approved' => (bool) setting('reviews_auto_approve')]);

        return back()->with('success', setting('reviews_auto_approve') ? 'Thank you — your review is live.' : 'Thank you — your review will appear once approved.');
    }

    public function notify(Request $request, Product $product)
    {
        $data = $request->validate(['email' => 'required|email|max:190']);
        StockNotification::updateOrCreate(['product_id' => $product->id, 'email' => strtolower($data['email'])], ['notified_at' => null]);

        return back()->with('success', 'We will email you as soon as it is back in stock.');
    }

    public function question(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120', 'email' => 'required|email|max:190',
            'phone' => 'nullable|string|max:40', 'message' => 'required|string|max:3000',
        ]);
        $enquiry = ContactEnquiry::create($data + ['product_id' => $product->id, 'subject' => 'Product question: '.$product->name, 'user_id' => auth('web')->id()]);
        Notifier::admin(new BrandedMail(
            subjectLine: 'Product question — '.$product->name,
            heading: 'New product question',
            lines: [$data['message']],
            rows: [['Product', $product->name.' ('.$product->sku.')'], ['Name', $data['name']], ['Email', $data['email']], ['Phone', $data['phone'] ?? '—']],
            button: ['text' => 'Open in admin', 'url' => route('admin.enquiries.index')],
            replyToAddress: $data['email'],
        ));

        return back()->with('success', 'Thanks — our team will reply shortly.');
    }
}
