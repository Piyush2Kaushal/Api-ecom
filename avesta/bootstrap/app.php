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
            if (! app()->hasDebugModeEnabled() && in_array($status, [403, 404, 500, 503], true) && ! $request->expectsJson()) {
                return Inertia::render('Store/Error', ['status' => $status])->toResponse($request)->setStatusCode($status);
            }
            if ($status === 419) {
                return back()->with('error', 'Your session expired. Please try again.');
            }

            return $response;
        });
    })->create();
