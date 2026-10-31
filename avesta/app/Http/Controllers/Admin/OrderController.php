<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\InvoiceService;
use App\Services\OrderService;
use App\Support\Exporter;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function __construct(protected OrderService $orders) {}

    protected function filtered(Request $request)
    {
        return Order::query()
            ->when($request->query('q'), fn ($q, $t) => $q->where(fn ($w) => $w->where('number', 'like', "%{$t}%")->orWhere('email', 'like', "%{$t}%")
                ->orWhere('po_reference', 'like', "%{$t}%")->orWhere('tracking_number', 'like', "%{$t}%")))
            ->when($request->query('status'), fn ($q, $s) => $s === 'open' ? $q->whereIn('status', ['paid', 'processing']) : $q->where('status', $s),
                fn ($q) => $q->where('status', '!=', 'pending_payment'))
            ->when($request->query('tier'), fn ($q, $t) => $q->where('customer_tier', $t))
            ->when($request->query('type') === 'guest', fn ($q) => $q->whereNull('user_id'))
            ->when($request->query('type') === 'registered', fn ($q) => $q->whereNotNull('user_id'))
            ->when($request->query('from'), fn ($q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when($request->query('to'), fn ($q, $d) => $q->whereDate('created_at', '<=', $d))
            ->when($request->query('customer'), fn ($q, $id) => $q->where('user_id', $id))
            ->when($request->query('guest'), fn ($q, $id) => $q->where('guest_customer_id', $id));
    }

    public function index(Request $request)
    {
        return Inertia::render('Admin/Orders/Index', [
            'orders' => $this->filtered($request)->with('user:id,first_name,last_name')->withCount('items')->latest()->paginate(25)->withQueryString(),
            'filters' => $request->only(['q', 'status', 'tier', 'type', 'from', 'to']),
            'statuses' => Order::STATUSES,
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['items.product:id,slug', 'history', 'invoices', 'refunds', 'user', 'guest']);
        $customerStats = $order->user_id
            ? ['orders' => Order::paid()->where('user_id', $order->user_id)->count(), 'spent' => (float) Order::paid()->where('user_id', $order->user_id)->sum('grand_total')]
            : ($order->guest_customer_id ? ['orders' => Order::paid()->where('guest_customer_id', $order->guest_customer_id)->count(), 'spent' => (float) Order::paid()->where('guest_customer_id', $order->guest_customer_id)->sum('grand_total')] : null);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'statuses' => Order::STATUSES,
            'customerStats' => $customerStats,
            'canRefundOnline' => (bool) $order->stripe_payment_intent && \App\Services\StripeService::enabled(),
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(Order::STATUSES))],
            'note' => 'nullable|string|max:1000',
            'notify' => 'boolean',
            'carrier' => 'nullable|string|max:100', 'tracking_number' => 'nullable|string|max:100', 'tracking_url' => 'nullable|url|max:500',
        ]);
        $this->orders->updateStatus($order, $data['status'], $data['note'] ?? null, $data['notify'] ?? true,
            array_filter(['carrier' => $data['carrier'] ?? null, 'tracking_number' => $data['tracking_number'] ?? null, 'tracking_url' => $data['tracking_url'] ?? null]));

        return back()->with('success', 'Order updated.');
    }

    public function markPaid(Order $order)
    {
        abort_if($order->paid_at, 422, 'Order already paid.');
        $this->orders->markPaid($order, null, 'manual');

        return back()->with('success', 'Order marked as paid and invoice generated.');
    }

    public function notes(Request $request, Order $order)
    {
        $order->update($request->validate(['admin_notes' => 'nullable|string|max:5000']));

        return back()->with('success', 'Notes saved.');
    }

    public function refund(Request $request, Order $order)
    {
        $data = $request->validate(['amount' => 'required|numeric|min:0.01', 'reason' => 'nullable|string|max:255', 'restock' => 'boolean']);
        try {
            $this->orders->refund($order, (float) $data['amount'], $data['reason'] ?? null, (bool) ($data['restock'] ?? false));
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Refund failed: '.$e->getMessage());
        }

        return back()->with('success', 'Refund processed.');
    }

    public function resendConfirmation(Order $order)
    {
        abort_unless($order->paid_at, 422);
        $this->orders->sendConfirmation($order);

        return back()->with('success', 'Confirmation email re-sent to '.$order->email.'.');
    }

    public function invoice(Invoice $invoice)
    {
        return InvoiceService::pdf($invoice)->download($invoice->number.'.pdf');
    }

    public function invoicePreview(Invoice $invoice)
    {
        return InvoiceService::pdf($invoice)->stream($invoice->number.'.pdf');
    }

    public function invoices(Request $request)
    {
        return Inertia::render('Admin/Invoices', [
            'invoices' => Invoice::with('order:id,number,email,user_id,guest_customer_id,customer_tier,currency,exchange_rate')
                ->when($request->query('q'), fn ($q, $t) => $q->where('number', 'like', "%{$t}%")->orWhereHas('order', fn ($o) => $o->where('number', 'like', "%{$t}%")->orWhere('email', 'like', "%{$t}%")))
                ->when($request->query('type'), fn ($q, $t) => $q->where('type', $t))
                ->latest('issued_at')->paginate(30)->withQueryString(),
            'filters' => $request->only(['q', 'type']),
        ]);
    }

    public function export(Request $request)
    {
        $rows = (function () use ($request) {
            foreach ($this->filtered($request)->with('user')->latest()->lazy(200) as $o) {
                yield [$o->number, $o->created_at->format('Y-m-d H:i'), $o->paid_at?->format('Y-m-d H:i'), $o->status_label, $o->customer_label, $o->email,
                    $o->customer_tier, $o->po_reference, $o->coupon_code, (float) $o->items_subtotal, (float) $o->coupon_discount, (float) $o->shipping_total,
                    (float) $o->net_total, (float) $o->vat_total, (float) $o->grand_total, (float) $o->refunded_total, $o->currency, $o->tracking_number];
            }
        })();

        return Exporter::download('orders', ['Order', 'Created', 'Paid', 'Status', 'Customer', 'Email', 'Tier', 'PO reference', 'Coupon', 'Items', 'Coupon discount',
            'Shipping', 'Net', 'VAT', 'Total', 'Refunded', 'Currency', 'Tracking'], $rows, $request->query('format', 'xlsx'));
    }

    public function abandoned()
    {
        $carts = \App\Models\Cart::whereNull('converted_at')->where('updated_at', '<', now()->subHour())
            ->whereHas('items', fn ($q) => $q->where('saved_for_later', false))
            ->with(['user:id,first_name,last_name,email,tier', 'items.product:id,name,retail_price'])->latest('updated_at')->paginate(30);

        $carts->getCollection()->transform(fn ($c) => [
            'id' => $c->id,
            'customer' => $c->user ? $c->user->name : ($c->email ? 'Guest' : 'Anonymous visitor'),
            'email' => $c->user?->email ?? $c->email,
            'tier' => $c->user?->tier ?? 'retailer',
            'user_id' => $c->user_id,
            'items' => $c->items->where('saved_for_later', false)->map(fn ($i) => ['name' => $i->product?->name, 'quantity' => $i->quantity])->values(),
            'value' => round($c->items->where('saved_for_later', false)->sum(fn ($i) => (float) ($i->product?->retail_price ?? 0) * $i->quantity), 2),
            'updated_at' => $c->updated_at,
        ]);

        return Inertia::render('Admin/AbandonedCarts', ['carts' => $carts]);
    }
}
