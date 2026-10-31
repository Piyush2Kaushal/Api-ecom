<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CartService;
use App\Services\OrderService;
use App\Services\StripeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function __construct(protected CartService $cart, protected OrderService $orders) {}

    public function show(Request $request)
    {
        $user = $request->user('web');
        if (! $user && ! setting('guest_checkout', true)) {
            return redirect()->guest(route('login'))->with('error', 'Please sign in to check out.');
        }
        $cart = $this->cart->current();
        $summary = $this->cart->summary($cart, $user, ['country' => 'GB']);
        if (empty($summary['lines'])) {
            return redirect()->route('cart');
        }

        return Inertia::render('Store/Checkout', [
            'summary' => $summary,
            'addresses' => $user ? $user->addresses()->orderByDesc('is_default_shipping')->get() : [],
            'countries' => $this->countries(),
            'paymentMode' => StripeService::enabled() ? 'stripe' : (StripeService::demoMode() ? 'demo' : 'disabled'),
            'meta' => $this->meta('Checkout'),
        ]);
    }

    /** Live recalculation as the customer changes postcode / delivery method. */
    public function quote(Request $request)
    {
        $ctx = $request->validate([
            'country' => 'nullable|string|size:2', 'postcode' => 'nullable|string|max:20',
            'shipping_method_id' => 'nullable|integer', 'email' => 'nullable|email',
        ]);

        return response()->json($this->cart->summary($this->cart->current(), $request->user('web'), $ctx));
    }

    public function store(Request $request)
    {
        $user = $request->user('web');
        abort_if(! $user && ! setting('guest_checkout', true), 403);
        $countries = array_keys($this->countries());
        $addr = fn (string $p) => [
            "$p.first_name" => 'required|string|max:80', "$p.last_name" => 'required|string|max:80',
            "$p.company" => 'nullable|string|max:120', "$p.line1" => 'required|string|max:190', "$p.line2" => 'nullable|string|max:190',
            "$p.city" => 'required|string|max:100', "$p.county" => 'nullable|string|max:100', "$p.postcode" => 'required|string|max:20',
            "$p.country" => ['required', Rule::in($countries)], "$p.phone" => 'nullable|string|max:40',
        ];
        $data = $request->validate(array_merge([
            'email' => 'required|email|max:190',
            'phone' => 'required|string|max:40',
            'billing_same' => 'boolean',
            'shipping_method_id' => 'required|integer',
            'po_reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
            'save_address' => 'boolean',
            'accept_terms' => 'accepted',
        ], $addr('shipping'), $request->boolean('billing_same') ? [] : $addr('billing')), [
            'accept_terms.accepted' => 'Please accept the terms to continue.',
            'shipping_method_id.required' => 'Please choose a delivery method.',
        ]);
        $data['shipping']['postcode'] = strtoupper(trim($data['shipping']['postcode']));
        $data['billing'] = $request->boolean('billing_same') ? $data['shipping'] : $data['billing'];
        $data['currency'] = $request->session()->get('currency', 'GBP');

        $cart = $this->cart->current();
        $summary = $this->cart->summary($cart, $user, [
            'country' => $data['shipping']['country'], 'postcode' => $data['shipping']['postcode'],
            'shipping_method_id' => $data['shipping_method_id'], 'email' => $data['email'],
        ]);
        if (! $cart || empty($summary['lines'])) {
            return redirect()->route('cart')->with('error', 'Your basket is empty.');
        }
        if ($summary['has_issues']) {
            return redirect()->route('cart')->with('error', 'Some items in your basket need attention before checkout.');
        }
        if (! $summary['shipping_method'] || $summary['shipping_method']['id'] !== (int) $data['shipping_method_id']) {
            return back()->withErrors(['shipping_method_id' => 'Delivery is not available to this address with the selected method.']);
        }
        if ($summary['coupon_error']) {
            $cart->update(['coupon_code' => null]);

            return back()->with('error', $summary['coupon_error']);
        }
        $min = (float) setting('min_order_value', 0);
        if ($min > 0 && $summary['totals']['items_subtotal'] < $min) {
            return back()->with('error', 'The minimum order value is '.money($min).'.');
        }

        if ($user && $request->boolean('save_address') && ! $user->addresses()->where('line1', $data['shipping']['line1'])->where('postcode', $data['shipping']['postcode'])->exists()) {
            $user->addresses()->create($data['shipping'] + ['is_default_shipping' => ! $user->addresses()->exists(), 'is_default_billing' => ! $user->addresses()->exists()]);
        }

        $order = $this->orders->create($cart, $summary, $data, $user);

        if (StripeService::enabled()) {
            try {
                return Inertia::location(app(StripeService::class)->checkoutUrl($order));
            } catch (\Throwable $e) {
                report($e);
                $order->update(['status' => 'failed', 'payment_status' => 'failed']);

                return back()->with('error', 'We could not start the payment. Please try again or contact us.');
            }
        }
        if (StripeService::demoMode()) {
            $this->orders->markPaid($order, null, 'demo');

            return redirect()->to($this->successUrl($order));
        }
        $order->update(['status' => 'failed']);

        return back()->with('error', 'Online payments are not configured yet. Please contact us to complete your order.');
    }

    protected function successUrl(Order $order): string
    {
        return URL::signedRoute('checkout.success', ['number' => $order->number]);
    }

    public function success(Request $request, string $number)
    {
        $order = Order::where('number', $number)->firstOrFail();
        $owner = ($request->user('web') && $request->user('web')->id === $order->user_id) || $request->hasValidSignature()
            || ($request->filled('session_id') && $request->query('session_id') === $order->stripe_session_id);
        abort_unless($owner, 403);

        if (! $order->paid_at && $order->stripe_session_id && StripeService::enabled()) {
            try {
                if ($intent = app(StripeService::class)->paidIntent($order->stripe_session_id)) {
                    $order = $this->orders->markPaid($order, $intent);
                }
            } catch (\Throwable $e) {
                report($e);
            }
        }
        $order->load('items', 'invoices');

        return Inertia::render('Store/OrderSuccess', [
            'order' => $order,
            'invoiceUrl' => ($inv = $order->invoices->firstWhere('type', 'invoice')) ? URL::signedRoute('invoice.public', $inv) : null,
            'trackUrl' => route('track', ['number' => $order->number, 'email' => $order->email]),
            'canCreateAccount' => ! $order->user_id && ! \App\Models\User::where('email', $order->email)->exists(),
            'meta' => $this->meta('Order confirmed'),
        ]);
    }

    public function cancelled(string $number)
    {
        $order = Order::where('number', $number)->whereNull('paid_at')->first();
        $order?->update(['status' => 'failed', 'payment_status' => 'cancelled']);

        return redirect()->route('checkout')->with('error', 'Payment was cancelled — your basket is still saved.');
    }

    public function countries(): array
    {
        $all = [
            'GB' => 'United Kingdom', 'IE' => 'Ireland', 'FR' => 'France', 'DE' => 'Germany', 'NL' => 'Netherlands', 'BE' => 'Belgium',
            'ES' => 'Spain', 'IT' => 'Italy', 'PT' => 'Portugal', 'US' => 'United States', 'AE' => 'United Arab Emirates',
        ];
        $allowed = (array) setting('ship_to_countries', ['GB']);

        return array_intersect_key($all, array_flip($allowed)) ?: ['GB' => 'United Kingdom'];
    }
}
