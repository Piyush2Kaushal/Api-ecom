<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\CartService;
use App\Services\InvoiceService;
use App\Services\ProductPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function __construct(protected CartService $cart) {}

    public function index()
    {
        $summary = $this->cart->summary($this->cart->current(), auth('web')->user());
        $ids = collect($summary['lines'])->pluck('product_id');
        $suggested = $ids->isNotEmpty()
            ? ProductPresenter::cardQuery()->whereNotIn('products.id', $ids)
                ->whereIn('category_id', Product::whereIn('id', $ids)->select('category_id'))->orderByDesc('sales_count')->limit(4)->get()
            : ProductPresenter::cardQuery()->where('is_featured', true)->limit(4)->get();

        return Inertia::render('Store/Cart', [
            'summary' => $summary,
            'suggested' => ProductPresenter::cards($suggested, $this->tier()),
            'meta' => $this->meta('Your basket'),
        ]);
    }

    public function summary()
    {
        return response()->json($this->cart->summary($this->cart->current(), auth('web')->user()));
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'variant_id' => 'nullable|integer|exists:product_variants,id',
            'quantity' => 'nullable|integer|min:1|max:9999',
        ]);
        $product = Product::where('is_active', true)->findOrFail($data['product_id']);
        $variant = null;
        if ($product->variants()->where('is_active', true)->exists()) {
            $variant = ProductVariant::where('product_id', $product->id)->where('is_active', true)->find($data['variant_id'] ?? 0);
            if (! $variant) {
                return $this->respond($request, false, 'Please choose a '.strtolower($product->option_name ?: 'option').' first.');
            }
        }
        $qty = (int) ($data['quantity'] ?? 1);
        if (! $product->inStock($variant)) {
            return $this->respond($request, false, 'Sorry, this item is out of stock.');
        }
        $available = $product->availableQty($variant);
        $inCart = (int) optional($this->cart->current())->items()?->where('product_id', $product->id)->where('product_variant_id', $variant?->id)->sum('quantity');
        if ($available !== null && $qty + $inCart > $available) {
            return $this->respond($request, false, 'Only '.$available.' available.');
        }
        $this->cart->add($product, $variant?->id, $qty);

        return $this->respond($request, true, $product->name.' added to your basket.');
    }

    protected function respond(Request $request, bool $ok, string $message)
    {
        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['ok' => $ok, 'message' => $message, 'count' => $this->cart->itemCount()], $ok ? 200 : 422);
        }

        return back()->with($ok ? 'success' : 'error', $message);
    }

    protected function ownItem(int $id): CartItem
    {
        $cart = $this->cart->current();
        abort_unless($cart, 404);

        return $cart->items()->findOrFail($id);
    }

    public function update(Request $request, int $item)
    {
        $qty = (int) $request->validate(['quantity' => 'required|integer|min:0|max:9999'])['quantity'];
        $row = $this->ownItem($item);
        $qty === 0 ? $row->delete() : $row->update(['quantity' => $qty]);

        return $request->wantsJson() && ! $request->header('X-Inertia') ? $this->summary() : back();
    }

    public function remove(Request $request, int $item)
    {
        $this->ownItem($item)->delete();

        return $request->wantsJson() && ! $request->header('X-Inertia') ? $this->summary() : back();
    }

    public function toggleSaved(int $item)
    {
        $row = $this->ownItem($item);
        $row->update(['saved_for_later' => ! $row->saved_for_later]);

        return back()->with('success', $row->saved_for_later ? 'Saved for later.' : 'Moved to your basket.');
    }

    public function applyCoupon(Request $request)
    {
        $code = strtoupper(trim($request->validate(['code' => 'required|string|max:50'])['code']));
        $cart = $this->cart->current(true);
        $summary = $this->cart->summary(tap($cart)->update(['coupon_code' => $code]), auth('web')->user());
        if ($summary['coupon_error']) {
            $cart->update(['coupon_code' => null]);

            return back()->withErrors(['code' => $summary['coupon_error']]);
        }

        return back()->with('success', 'Coupon '.$code.' applied.');
    }

    public function removeCoupon()
    {
        $this->cart->current()?->update(['coupon_code' => null]);

        return back();
    }

    /** Trade "quick order": paste SKUs and quantities. */
    public function quickOrder(Request $request)
    {
        $data = $request->validate(['rows' => 'required|array|max:100', 'rows.*.sku' => 'nullable|string|max:100', 'rows.*.quantity' => 'nullable|integer|min:1|max:9999']);
        $added = 0;
        $missing = [];
        foreach ($data['rows'] as $row) {
            $sku = trim((string) ($row['sku'] ?? ''));
            if ($sku === '') {
                continue;
            }
            $variant = ProductVariant::where('sku', $sku)->where('is_active', true)->first();
            $product = $variant ? $variant->product : Product::where('sku', $sku)->first();
            if (! $product || ! $product->is_active || (! $variant && $product->variants()->where('is_active', true)->exists()) || ! $product->inStock($variant)) {
                $missing[] = $sku;

                continue;
            }
            $this->cart->add($product, $variant?->id, (int) ($row['quantity'] ?? 1));
            $added++;
        }
        $msg = $added.' item(s) added to your basket.'.($missing ? ' Not found or unavailable: '.implode(', ', $missing) : '');

        return redirect()->route('cart')->with($added ? 'success' : 'error', $msg);
    }

    public function quote(Request $request)
    {
        $user = $request->user('web');
        $summary = $this->cart->summary($this->cart->current(), $user);
        abort_if(empty($summary['lines']), 404);

        return InvoiceService::quote($summary, $user)->download('avesta-quote-'.now()->format('Ymd').'.pdf');
    }
}
