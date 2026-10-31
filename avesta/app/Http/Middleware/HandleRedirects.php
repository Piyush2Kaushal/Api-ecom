<?php

namespace App\Http\Middleware;

use App\Models\Redirect;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/** 301 redirects managed from Admin → SEO → Redirects (e.g. old Zoho URLs). */
class HandleRedirects
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->isMethod('GET') && ! $request->is('admin*', 'build/*', 'uploads/*')) {
            $map = Cache::rememberForever('redirects_map', function () {
                try {
                    return Redirect::pluck('to_path', 'from_path')->all();
                } catch (\Throwable) {
                    return [];
                }
            });
            $path = '/'.ltrim($request->path(), '/');
            if (isset($map[$path])) {
                Redirect::where('from_path', $path)->increment('hits');

                return redirect($map[$path], 301);
            }
        }

        return $next($request);
    }
}
