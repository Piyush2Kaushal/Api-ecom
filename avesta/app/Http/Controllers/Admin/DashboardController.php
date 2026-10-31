<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactEnquiry;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\TradeApplication;
use App\Models\TrainingEnquiry;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $paid = fn () => Order::paid();
        $sum = fn ($from, $to = null) => (float) $paid()->where('paid_at', '>=', $from)->when($to, fn ($q) => $q->where('paid_at', '<', $to))->sum('grand_total');
        $count = fn ($from, $to = null) => $paid()->where('paid_at', '>=', $from)->when($to, fn ($q) => $q->where('paid_at', '<', $to))->count();

        $monthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonthNoOverflow()->startOfMonth();
        $monthRevenue = $sum($monthStart);
        $lastMonthRevenue = $sum($lastMonthStart, $monthStart);

        $days = collect(range(29, 0))->map(fn ($i) => now()->subDays($i)->toDateString());
        $daily = $paid()->where('paid_at', '>=', now()->subDays(29)->startOfDay())
            ->selectRaw('DATE(paid_at) as d, customer_tier, SUM(grand_total) as total, COUNT(*) as orders')
            ->groupBy('d', 'customer_tier')->get()->groupBy('d');
        $chart = $days->map(fn ($d) => [
            'date' => $d,
            'label' => \Carbon\Carbon::parse($d)->format('d M'),
            'retailer' => round((float) optional($daily->get($d))->where('customer_tier', 'retailer')->sum('total'), 2),
            'trader' => round((float) optional($daily->get($d))->where('customer_tier', 'trader')->sum('total'), 2),
            'wholesaler' => round((float) optional($daily->get($d))->where('customer_tier', 'wholesaler')->sum('total'), 2),
            'orders' => (int) optional($daily->get($d))->sum('orders'),
        ]);

        $topProducts = OrderItem::whereIn('order_id', Order::paid()->where('paid_at', '>=', now()->subDays(30))->select('id'))
            ->selectRaw('product_id, name, SUM(quantity) as qty, SUM(line_total) as revenue')
            ->groupBy('product_id', 'name')->orderByDesc('revenue')->limit(6)->get();

        $threshold = (int) setting('low_stock_threshold', 5);

        return Inertia::render('Admin/Dashboard', [
            'kpis' => [
                'today' => $sum(now()->startOfDay()),
                'today_orders' => $count(now()->startOfDay()),
                'week' => $sum(now()->startOfWeek()),
                'month' => $monthRevenue,
                'month_orders' => $count($monthStart),
                'month_change' => $lastMonthRevenue > 0 ? round(($monthRevenue - $lastMonthRevenue) / $lastMonthRevenue * 100, 1) : null,
                'aov' => round((float) $paid()->where('paid_at', '>=', now()->subDays(30))->avg('grand_total'), 2),
                'customers' => User::count(),
                'new_customers' => User::where('created_at', '>=', $monthStart)->count(),
                'trade_customers' => User::whereIn('tier', ['trader', 'wholesaler'])->count(),
            ],
            'chart' => $chart,
            'tierSplit' => $paid()->where('paid_at', '>=', $monthStart)->selectRaw('customer_tier, SUM(grand_total) as total, COUNT(*) as orders')->groupBy('customer_tier')->get(),
            'recentOrders' => Order::with('user:id,first_name,last_name')->whereNot('status', 'pending_payment')->latest()->limit(8)->get(),
            'toFulfil' => Order::whereIn('status', ['paid', 'processing'])->count(),
            'pending' => [
                'approvals' => TradeApplication::where('status', 'pending')->count(),
                'enquiries' => ContactEnquiry::where('status', 'new')->count(),
                'training' => TrainingEnquiry::where('status', 'new')->count(),
            ],
            'topProducts' => $topProducts,
            'lowStock' => Product::where('track_stock', true)->where('is_active', true)
                ->whereRaw('stock_qty <= COALESCE(low_stock_threshold, ?)', [$threshold])->orderBy('stock_qty')->limit(8)->get(['id', 'name', 'sku', 'stock_qty']),
        ]);
    }

    public function reports(\Illuminate\Http\Request $request)
    {
        $from = $request->date('from') ?? now()->subDays(29)->startOfDay();
        $to = ($request->date('to') ?? now())->copy()->endOfDay();
        $orders = Order::paid()->whereBetween('paid_at', [$from, $to]);
        $orderIds = (clone $orders)->select('id');

        $data = [
            'summary' => [
                'revenue' => (float) (clone $orders)->sum('grand_total'),
                'net' => (float) (clone $orders)->sum('net_total'),
                'vat' => (float) (clone $orders)->sum('vat_total'),
                'shipping' => (float) (clone $orders)->sum('shipping_total'),
                'discounts' => (float) (clone $orders)->sum('coupon_discount'),
                'refunds' => (float) Order::whereBetween('paid_at', [$from, $to])->sum('refunded_total'),
                'orders' => (clone $orders)->count(),
                'items' => (int) OrderItem::whereIn('order_id', $orderIds)->sum('quantity'),
            ],
            'byDay' => (clone $orders)->selectRaw('DATE(paid_at) as d, SUM(grand_total) as total, COUNT(*) as orders')->groupBy('d')->orderBy('d')->get(),
            'byTier' => (clone $orders)->selectRaw('customer_tier, SUM(grand_total) as total, COUNT(*) as orders')->groupBy('customer_tier')->get(),
            'byProduct' => OrderItem::whereIn('order_id', $orderIds)->selectRaw('name, sku, SUM(quantity) as qty, SUM(line_total) as revenue')
                ->groupBy('name', 'sku')->orderByDesc('revenue')->limit(25)->get(),
            'byBrand' => OrderItem::whereIn('order_items.order_id', $orderIds)->join('products', 'products.id', '=', 'order_items.product_id')
                ->leftJoin('brands', 'brands.id', '=', 'products.brand_id')
                ->selectRaw("COALESCE(brands.name, 'No brand') as brand, SUM(order_items.quantity) as qty, SUM(order_items.line_total) as revenue")
                ->groupBy('brands.name')->orderByDesc('revenue')->get(),
            'byCoupon' => (clone $orders)->whereNotNull('coupon_code')->selectRaw('coupon_code, COUNT(*) as orders, SUM(coupon_discount) as discount, SUM(grand_total) as revenue')
                ->groupBy('coupon_code')->orderByDesc('orders')->get(),
        ];

        if ($request->query('export')) {
            return \App\Support\Exporter::download('sales-report', ['Product', 'SKU', 'Qty', 'Revenue'],
                $data['byProduct']->map(fn ($r) => [$r->name, $r->sku, (int) $r->qty, (float) $r->revenue]), $request->query('export'));
        }

        return Inertia::render('Admin/Reports', $data + ['filters' => ['from' => $from->toDateString(), 'to' => $to->toDateString()]]);
    }
}
