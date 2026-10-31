<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Mail\BrandedMail;
use App\Models\Address;
use App\Models\ContactEnquiry;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Product;
use App\Models\TradeApplication;
use App\Models\TrainingEnquiry;
use App\Services\CartService;
use App\Services\InvoiceService;
use App\Services\MediaService;
use App\Services\Notifier;
use App\Services\ProductPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AccountController extends Controller
{
    protected function user()
    {
        return auth('web')->user();
    }

    public function dashboard()
    {
        $user = $this->user();
        $paid = $user->orders()->whereNotNull('paid_at');

        return Inertia::render('Account/Dashboard', [
            'stats' => [
                'orders' => (clone $paid)->count(),
                'spent' => (float) (clone $paid)->sum('grand_total'),
                'saved' => (float) (clone $paid)->sum('savings_total') + (float) (clone $paid)->sum('coupon_discount'),
                'open' => $user->orders()->whereIn('status', ['paid', 'processing', 'dispatched'])->count(),
            ],
            'recentOrders' => $user->orders()->whereNotNull('paid_at')->latest()->limit(5)->withCount('items')->get(),
            'application' => $user->tradeApplications()->first(),
            'profile' => $user->only(['first_name', 'last_name', 'email', 'phone', 'tier', 'company_name', 'created_at']),
            'meta' => $this->meta('My account'),
        ]);
    }

    public function orders(Request $request)
    {
        $orders = $this->user()->orders()->whereNot('status', 'pending_payment')->withCount('items')
            ->when($request->query('q'), fn ($q, $term) => $q->where(fn ($w) => $w->where('number', 'like', "%{$term}%")->orWhere('po_reference', 'like', "%{$term}%")))
            ->latest()->paginate(15)->withQueryString();

        return Inertia::render('Account/Orders', ['orders' => $orders, 'filters' => $request->only('q'), 'meta' => $this->meta('My orders')]);
    }

    public function order(string $number)
    {
        $order = $this->user()->orders()->where('number', $number)->with(['items', 'history', 'invoices', 'refunds'])->firstOrFail();

        return Inertia::render('Account/OrderShow', ['order' => $order, 'meta' => $this->meta('Order '.$order->number)]);
    }

    public function reorder(string $number, CartService $cart)
    {
        $order = $this->user()->orders()->where('number', $number)->with('items')->firstOrFail();
        $added = 0;
        foreach ($order->items as $item) {
            $product = Product::where('is_active', true)->find($item->product_id);
            if ($product && $product->inStock()) {
                $cart->add($product, $item->product_variant_id, $item->quantity);
                $added++;
            }
        }

        return redirect()->route('cart')->with($added ? 'success' : 'error', $added ? 'Items from '.$order->number.' added to your basket at today\'s prices.' : 'Those items are no longer available.');
    }

    public function invoices()
    {
        $invoices = Invoice::whereIn('order_id', $this->user()->orders()->select('id'))->with('order:id,number,po_reference,currency,exchange_rate')->latest('issued_at')->paginate(20);

        return Inertia::render('Account/Invoices', ['invoices' => $invoices, 'meta' => $this->meta('Invoices')]);
    }

    public function downloadInvoice(Invoice $invoice)
    {
        abort_unless($invoice->order->user_id === $this->user()->id, 403);

        return InvoiceService::pdf($invoice)->download($invoice->number.'.pdf');
    }

    public function purchaseOrders(Request $request)
    {
        $orders = $this->user()->orders()->whereNotNull('po_reference')->whereNotNull('paid_at')
            ->when($request->query('q'), fn ($q, $t) => $q->where('po_reference', 'like', "%{$t}%"))
            ->with('invoices:id,order_id,number,type')->latest()->paginate(20)->withQueryString();

        return Inertia::render('Account/PurchaseOrders', ['orders' => $orders, 'filters' => $request->only('q'), 'meta' => $this->meta('Purchase orders')]);
    }

    public function addresses()
    {
        return Inertia::render('Account/Addresses', [
            'addresses' => $this->user()->addresses()->orderByDesc('is_default_shipping')->latest()->get(),
            'meta' => $this->meta('Addresses'),
        ]);
    }

    protected function addressRules(): array
    {
        return [
            'label' => 'nullable|string|max:60', 'first_name' => 'required|string|max:80', 'last_name' => 'required|string|max:80',
            'company' => 'nullable|string|max:120', 'line1' => 'required|string|max:190', 'line2' => 'nullable|string|max:190',
            'city' => 'required|string|max:100', 'county' => 'nullable|string|max:100', 'postcode' => 'required|string|max:20',
            'country' => 'required|string|size:2', 'phone' => 'nullable|string|max:40',
            'is_default_shipping' => 'boolean', 'is_default_billing' => 'boolean',
        ];
    }

    public function saveAddress(Request $request, ?Address $address = null)
    {
        $user = $this->user();
        if ($address) {
            abort_unless($address->user_id === $user->id, 403);
        }
        $data = $request->validate($this->addressRules());
        $data['postcode'] = strtoupper($data['postcode']);
        if (! empty($data['is_default_shipping'])) {
            $user->addresses()->update(['is_default_shipping' => false]);
        }
        if (! empty($data['is_default_billing'])) {
            $user->addresses()->update(['is_default_billing' => false]);
        }
        $address ? $address->update($data) : $user->addresses()->create($data);

        return back()->with('success', 'Address saved.');
    }

    public function deleteAddress(Address $address)
    {
        abort_unless($address->user_id === $this->user()->id, 403);
        $address->delete();

        return back()->with('success', 'Address removed.');
    }

    public function profile()
    {
        return Inertia::render('Account/Profile', [
            'profile' => $this->user()->only(['first_name', 'last_name', 'email', 'phone', 'company_name', 'vat_number', 'company_number', 'marketing_opt_in', 'tier']),
            'meta' => $this->meta('Profile & settings'),
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $this->user();
        $data = $request->validate([
            'first_name' => 'required|string|max:80', 'last_name' => 'required|string|max:80', 'phone' => 'required|string|max:40',
            'company_name' => 'nullable|string|max:150', 'vat_number' => 'nullable|string|max:50', 'company_number' => 'nullable|string|max:50',
            'marketing_opt_in' => 'boolean',
        ]);
        $user->update($data);

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(Request $request)
    {
        $user = $this->user();
        $data = $request->validate(['current_password' => 'required', 'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()]]);
        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages(['current_password' => 'Your current password is incorrect.']);
        }
        $user->update(['password' => $data['password']]);

        return back()->with('success', 'Password changed.');
    }

    public function wishlist()
    {
        $ids = $this->user()->wishlist()->latest()->pluck('product_id');
        $products = ProductPresenter::cardQuery()->whereIn('products.id', $ids)->get();

        return Inertia::render('Account/Wishlist', ['products' => ProductPresenter::cards($products, $this->tier()), 'meta' => $this->meta('Wishlist')]);
    }

    public function trade()
    {
        return Inertia::render('Account/Trade', [
            'applications' => $this->user()->tradeApplications()->get(),
            'profile' => $this->user()->only(['company_name', 'vat_number', 'company_number', 'tier']),
            'meta' => $this->meta('Trade account'),
        ]);
    }

    public function applyTrade(Request $request)
    {
        $user = $this->user();
        if ($user->tradeApplications()->where('status', 'pending')->exists()) {
            return back()->with('error', 'You already have an application under review.');
        }
        $data = $request->validate([
            'requested_tier' => ['required', Rule::in(['trader', 'wholesaler'])],
            'company_name' => 'required|string|max:150', 'vat_number' => 'nullable|string|max:50', 'company_number' => 'required|string|max:50',
            'business_type' => 'required|string|max:80', 'website' => 'nullable|string|max:190', 'business_address' => 'required|string|max:500',
            'monthly_spend' => 'nullable|string|max:50', 'message' => 'nullable|string|max:2000',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);
        if ($data['requested_tier'] === $user->tier) {
            return back()->with('error', 'You already have this account type.');
        }
        unset($data['document']);
        $app = TradeApplication::create($data + [
            'user_id' => $user->id,
            'status' => 'pending',
            'document_path' => $request->hasFile('document') ? MediaService::store($request->file('document'), 'trade-documents') : null,
        ]);
        $user->update(['company_name' => $data['company_name'], 'vat_number' => $data['vat_number'] ?? $user->vat_number, 'company_number' => $data['company_number']]);
        Notifier::admin(new BrandedMail(
            subjectLine: 'New '.$app->requested_tier.' application — '.$app->company_name,
            heading: 'New trade account application',
            lines: [$user->name.' ('.$user->email.') has applied for a '.$app->requested_tier.' account.'],
            button: ['text' => 'Review application', 'url' => route('admin.approvals.index')],
        ));

        return back()->with('success', 'Application submitted — we will email you once it has been reviewed.');
    }

    public function quickOrder()
    {
        return Inertia::render('Account/QuickOrder', ['meta' => $this->meta('Quick order')]);
    }

    public function enquiries()
    {
        $user = $this->user();

        return Inertia::render('Account/Enquiries', [
            'training' => TrainingEnquiry::where('user_id', $user->id)->orWhere('email', $user->email)->latest()->get(),
            'contact' => ContactEnquiry::where('user_id', $user->id)->orWhere('email', $user->email)->latest()->get(),
            'meta' => $this->meta('My enquiries'),
        ]);
    }
}
