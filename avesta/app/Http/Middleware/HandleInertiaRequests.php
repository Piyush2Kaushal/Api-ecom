<?php

namespace App\Http\Middleware;

use App\Models\Brand;
use App\Models\Category;
use App\Models\ContactEnquiry;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Popup;
use App\Models\Product;
use App\Models\TradeApplication;
use App\Models\TrainingEnquiry;
use App\Services\CartService;
use App\Support\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        $isAdmin = $request->is('admin', 'admin/*');
        $base = [
            ...parent::share($request),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'importErrors' => fn () => $request->session()->get('importErrors'),
            ],
            'settings' => fn () => Settings::public(),
            'csrf' => fn () => csrf_token(),
        ];

        if ($isAdmin) {
            $admin = auth('admin')->user();

            return array_merge($base, [
                'admin' => $admin ? $admin->only(['id', 'name', 'email']) : null,
                'counters' => fn () => $admin ? [
                    'approvals' => TradeApplication::where('status', 'pending')->count(),
                    'orders' => Order::where('status', 'paid')->count(),
                    'enquiries' => ContactEnquiry::where('status', 'new')->count(),
                    'training' => TrainingEnquiry::where('status', 'new')->count(),
                    'low_stock' => Product::where('track_stock', true)->where('is_active', true)
                        ->whereRaw('stock_qty <= COALESCE(low_stock_threshold, ?)', [(int) setting('low_stock_threshold', 5)])->count(),
                ] : null,
            ]);
        }

        $user = auth('web')->user();

        return array_merge($base, [
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'first_name' => $user->first_name,
                    'email' => $user->email,
                    'tier' => $user->tier,
                    'pending_tier' => $user->pendingApplication?->requested_tier,
                ] : null,
            ],
            'cartCount' => fn () => app(CartService::class)->itemCount(),
            'wishlistIds' => fn () => $user ? $user->wishlist()->pluck('product_id') : [],
            'currency' => fn () => $request->session()->get('currency', 'GBP'),
            'nav' => fn () => Cache::rememberForever('nav_menu', fn () => [
                'categories' => Category::nested(true, true),
                'brands' => Brand::activeList(),
                'header_links' => MenuItem::where('location', 'header')->orderBy('sort_order')->get(['label', 'url', 'new_tab'])->toArray(),
                'footer' => [
                    'quick' => MenuItem::where('location', 'footer_quick')->orderBy('sort_order')->get(['label', 'url', 'new_tab'])->toArray(),
                    'products' => MenuItem::where('location', 'footer_products')->orderBy('sort_order')->get(['label', 'url', 'new_tab'])->toArray(),
                    'help' => MenuItem::where('location', 'footer_help')->orderBy('sort_order')->get(['label', 'url', 'new_tab'])->toArray(),
                ],
            ]),
            'popup' => fn () => Cache::rememberForever('active_popup', fn () => Popup::where('is_active', true)->latest()->first()?->toArray()),
        ]);
    }
}
