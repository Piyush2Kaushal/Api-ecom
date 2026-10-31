<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CustomerVerified
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user('web');
        if (! $user) {
            return redirect()->guest(route('login'));
        }
        if (($user->is_active ?? true) === false) {
            auth('web')->logout();

            return redirect()->route('login')->with('error', 'Your account has been disabled. Please contact us.');
        }
        if (! $user->email_verified_at) {
            return redirect()->route('verify.show');
        }

        return $next($request);
    }
}
