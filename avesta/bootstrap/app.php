<?php

use App\Http\Middleware\AdminAuthenticate;
use App\Http\Middleware\CustomerVerified;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\HandleRedirects;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Inertia\Inertia;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(prepend: [HandleRedirects::class], append: [HandleInertiaRequests::class]);
        $middleware->validateCsrfTokens(except: ['stripe/webhook']);
        $middleware->alias([
            'admin' => AdminAuthenticate::class,
            'customer' => CustomerVerified::class,
        ]);
        $middleware->redirectGuestsTo(fn (Request $r) => $r->is('admin*') ? route('admin.login') : route('login'));
        $middleware->redirectUsersTo(fn (Request $r) => $r->is('admin*') ? route('admin.dashboard') : route('account.dashboard'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function ($response, $e, Request $request) {
            $status = $response->getStatusCode();
            if (! app()->hasDebugModeEnabled() && ! $request->expectsJson()) {
                // Server errors use a plain page that needs no database (works even if MySQL is down).
                if ($status >= 500) {
                    return response()->view('errors.500', ['code' => $status], $status);
                }
                if (in_array($status, [403, 404], true)) {
                    try {
                        return Inertia::render('Store/Error', ['status' => $status])->toResponse($request)->setStatusCode($status);
                    } catch (\Throwable) {
                        return response()->view('errors.500', ['code' => $status], $status);
                    }
                }
            }
            if ($status === 419) {
                return back()->with('error', 'Your session expired. Please try again.');
            }

            return $response;
        });
    })->create();
