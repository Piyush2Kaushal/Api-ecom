<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\BrandedMail;
use App\Models\GuestCustomer;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\TradeApplication;
use App\Models\User;
use App\Services\Notifier;
use App\Support\Exporter;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'registered');

        if ($type === 'guests') {
            $customers = GuestCustomer::query()
                ->when($request->query('q'), fn ($q, $t) => $q->where(fn ($w) => $w->where('email', 'like', "%{$t}%")->orWhere('first_name', 'like', "%{$t}%")->orWhere('last_name', 'like', "%{$t}%")))
                ->withCount(['orders as orders_count' => fn ($q) => $q->whereNotNull('paid_at')])
                ->withSum(['orders as spent' => fn ($q) => $q->whereNotNull('paid_at')], 'grand_total')
                ->withMax('orders as last_order_at', 'created_at')
                ->latest()->paginate(25)->withQueryString();
        } else {
            $customers = User::query()
                ->when($request->query('q'), fn ($q, $t) => $q->where(fn ($w) => $w->where('email', 'like', "%{$t}%")->orWhere('first_name', 'like', "%{$t}%")
                    ->orWhere('last_name', 'like', "%{$t}%")->orWhere('company_name', 'like', "%{$t}%")->orWhere('phone', 'like', "%{$t}%")))
                ->when($request->query('tier'), fn ($q, $t) => $q->where('tier', $t))
                ->when($request->query('status') === 'disabled', fn ($q) => $q->where('is_active', false))
                ->when($request->query('status') === 'unverified', fn ($q) => $q->whereNull('email_verified_at'))
                ->withCount(['orders as orders_count' => fn ($q) => $q->whereNotNull('paid_at')])
                ->withSum(['orders as spent' => fn ($q) => $q->whereNotNull('paid_at')], 'grand_total')
                ->with('pendingApplication:id,user_id,requested_tier')
                ->latest()->paginate(25)->withQueryString();
        }

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'type' => $type,
            'filters' => $request->only(['q', 'tier', 'status']),
            'counts' => ['registered' => User::count(), 'guests' => GuestCustomer::whereNull('user_id')->count()],
        ]);
    }

    public function show(User $user)
    {
        $orders = $user->orders()->whereNot('status', 'pending_payment')->withCount('items')->latest()->get();

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $user->load(['addresses', 'tradeApplications']),
            'orders' => $orders,
            'invoices' => Invoice::whereIn('order_id', $orders->pluck('id'))->with('order:id,number')->latest('issued_at')->get(),
            'stats' => [
                'orders' => $orders->whereNotNull('paid_at')->count(),
                'spent' => (float) $orders->whereNotNull('paid_at')->sum('grand_total'),
                'saved' => (float) $orders->whereNotNull('paid_at')->sum('savings_total'),
                'last_order' => $orders->first()?->created_at,
            ],
            'guest' => false,
        ]);
    }

    public function showGuest(GuestCustomer $guest)
    {
        $orders = Order::where('guest_customer_id', $guest->id)->whereNot('status', 'pending_payment')->withCount('items')->latest()->get();

        return Inertia::render('Admin/Customers/Show', [
            'customer' => array_merge($guest->toArray(), ['tier' => 'retailer', 'addresses' => [], 'trade_applications' => []]),
            'orders' => $orders,
            'invoices' => Invoice::whereIn('order_id', $orders->pluck('id'))->with('order:id,number')->latest('issued_at')->get(),
            'stats' => [
                'orders' => $orders->whereNotNull('paid_at')->count(),
                'spent' => (float) $orders->whereNotNull('paid_at')->sum('grand_total'),
                'saved' => (float) $orders->whereNotNull('paid_at')->sum('savings_total'),
                'last_order' => $orders->first()?->created_at,
            ],
            'guest' => true,
            'linkedUser' => $guest->user_id ? User::find($guest->user_id)?->only(['id', 'first_name', 'last_name', 'email']) : null,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:80', 'last_name' => 'nullable|string|max:80',
            'email' => ['required', 'email', 'max:190', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:40', 'tier' => ['required', Rule::in(User::TIERS)],
            'company_name' => 'nullable|string|max:150', 'vat_number' => 'nullable|string|max:50', 'company_number' => 'nullable|string|max:50',
            'is_active' => 'boolean', 'admin_notes' => 'nullable|string|max:5000', 'verified' => 'boolean', 'notify_tier' => 'boolean',
        ]);
        $oldTier = $user->tier;
        $verified = $data['verified'] ?? (bool) $user->email_verified_at;
        $notify = $data['notify_tier'] ?? false;
        unset($data['verified'], $data['notify_tier']);
        $data['email_verified_at'] = $verified ? ($user->email_verified_at ?? now()) : null;
        $user->update($data);

        if ($oldTier !== $user->tier && $notify) {
            Notifier::send($user->email, new BrandedMail(
                subjectLine: 'Your account has been updated',
                heading: 'Account type updated',
                lines: ['Your '.setting('site_name').' account is now a '.ucfirst($user->tier).' account. Sign in to see your prices.'],
                button: ['text' => 'Sign in', 'url' => route('login')],
            ));
        }

        return back()->with('success', 'Customer saved.');
    }

    public function destroy(User $user)
    {
        Order::where('user_id', $user->id)->update(['user_id' => null]);
        $user->delete();

        return redirect()->route('admin.customers.index')->with('success', 'Customer deleted. Their orders are kept.');
    }

    public function export(Request $request)
    {
        $rows = (function () {
            foreach (User::withCount(['orders as paid_orders' => fn ($q) => $q->whereNotNull('paid_at')])
                ->withSum(['orders as spent' => fn ($q) => $q->whereNotNull('paid_at')], 'grand_total')->lazy(200) as $u) {
                yield [$u->id, $u->first_name, $u->last_name, $u->email, $u->phone, $u->tier, $u->company_name, $u->vat_number, $u->company_number,
                    $u->is_active, (bool) $u->email_verified_at, $u->marketing_opt_in, (int) $u->paid_orders, (float) $u->spent, $u->created_at->format('Y-m-d')];
            }
            foreach (GuestCustomer::whereNull('user_id')->withSum(['orders as spent' => fn ($q) => $q->whereNotNull('paid_at')], 'grand_total')
                ->withCount(['orders as paid_orders' => fn ($q) => $q->whereNotNull('paid_at')])->lazy(200) as $g) {
                yield ['G'.$g->id, $g->first_name, $g->last_name, $g->email, $g->phone, 'guest', '', '', '', true, false, false, (int) $g->paid_orders, (float) $g->spent, $g->created_at->format('Y-m-d')];
            }
        })();

        return Exporter::download('customers', ['ID', 'First name', 'Last name', 'Email', 'Phone', 'Type', 'Company', 'VAT no.', 'Company no.',
            'Active', 'Verified', 'Marketing', 'Orders', 'Spent', 'Joined'], $rows, $request->query('format', 'xlsx'));
    }

    /* ---------- Trade approvals ---------- */

    public function approvals(Request $request)
    {
        $status = $request->query('status', 'pending');

        return Inertia::render('Admin/Approvals', [
            'applications' => TradeApplication::with('user:id,first_name,last_name,email,phone,tier,created_at')
                ->when($status !== 'all', fn ($q) => $q->where('status', $status))
                ->latest()->paginate(20)->withQueryString(),
            'status' => $status,
            'counts' => TradeApplication::selectRaw('status, COUNT(*) as c')->groupBy('status')->pluck('c', 'status'),
        ]);
    }

    public function approve(Request $request, TradeApplication $application)
    {
        $tier = $request->validate(['tier' => ['nullable', Rule::in(['trader', 'wholesaler'])]])['tier'] ?? $application->requested_tier;
        $application->update(['status' => 'approved', 'reviewed_at' => now(), 'requested_tier' => $tier]);
        $application->user->update([
            'tier' => $tier,
            'company_name' => $application->company_name,
            'vat_number' => $application->vat_number,
            'company_number' => $application->company_number,
        ]);
        Notifier::send($application->user->email, new BrandedMail(
            subjectLine: 'Your '.ucfirst($tier).' account is approved',
            heading: 'Welcome to '.setting('site_name').' Trade',
            lines: ['Great news, '.$application->user->first_name.' — your '.$tier.' account has been approved.', 'Sign in to see your '.$tier.' prices across the whole store.'],
            button: ['text' => 'Shop with trade prices', 'url' => route('shop')],
        ));

        return back()->with('success', $application->user->name.' is now a '.$tier.'.');
    }

    public function reject(Request $request, TradeApplication $application)
    {
        $reason = $request->validate(['reason' => 'required|string|max:1000'])['reason'];
        $application->update(['status' => 'rejected', 'rejection_reason' => $reason, 'reviewed_at' => now()]);
        Notifier::send($application->user->email, new BrandedMail(
            subjectLine: 'Update on your '.$application->requested_tier.' application',
            heading: 'Application update',
            lines: ['Thank you for applying for a '.$application->requested_tier.' account. Unfortunately we could not approve it at this time.', 'Reason: '.$reason,
                'You can continue shopping with your retail account, and you are welcome to re-apply from your account dashboard.'],
            button: ['text' => 'Go to my account', 'url' => route('account.trade')],
        ));

        return back()->with('success', 'Application rejected and customer notified.');
    }
}
