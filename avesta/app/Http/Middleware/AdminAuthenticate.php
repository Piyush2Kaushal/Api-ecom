<?php

namespace App\Http\Middleware;

use App\Support\Settings;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AdminAuthenticate
{
    public function handle(Request $request, Closure $next)
    {
        if (! auth('admin')->check()) {
            return redirect()->guest(route('admin.login'));
        }

        $response = $next($request);

        // Any admin change refreshes storefront caches so edits appear instantly.
        if (! $request->isMethod('GET')) {
            foreach (['nav_menu', 'category_tree', 'brands_active', 'active_popup', 'redirects_map'] as $key) {
                Cache::forget($key);
            }
            Settings::flush();
        }

        return $response;
    }
}
