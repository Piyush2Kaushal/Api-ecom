<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function show()
    {
        return Inertia::render('Admin/Login', ['step' => session('admin_2fa_id') ? 'code' : 'password']);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required', 'remember' => 'boolean']);
        $key = 'admin-login:'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            throw ValidationException::withMessages(['email' => 'Too many attempts. Try again in '.RateLimiter::availableIn($key).' seconds.']);
        }
        $admin = Admin::where('email', strtolower($data['email']))->first();
        if (! $admin || ! Hash::check($data['password'], $admin->password)) {
            RateLimiter::hit($key, 600);
            throw ValidationException::withMessages(['email' => 'Invalid email or password.']);
        }
        RateLimiter::clear($key);

        if (setting('admin_email_2fa')) {
            OtpService::send($admin->email, 'admin');
            $request->session()->put('admin_2fa_id', $admin->id);
            $request->session()->put('admin_2fa_remember', (bool) ($data['remember'] ?? false));

            return redirect()->route('admin.login')->with('success', 'We emailed a 6-digit code to '.$admin->email);
        }

        return $this->complete($request, $admin, (bool) ($data['remember'] ?? false));
    }

    public function verify(Request $request)
    {
        $code = $request->validate(['code' => 'required|digits:6'])['code'];
        $admin = Admin::find($request->session()->get('admin_2fa_id'));
        if (! $admin || ! OtpService::verify($admin->email, 'admin', $code)) {
            throw ValidationException::withMessages(['code' => 'That code is incorrect or has expired.']);
        }

        return $this->complete($request, $admin, (bool) $request->session()->pull('admin_2fa_remember'));
    }

    protected function complete(Request $request, Admin $admin, bool $remember)
    {
        $request->session()->forget('admin_2fa_id');
        Auth::guard('admin')->login($admin, $remember);
        $request->session()->regenerate();
        $admin->update(['last_login_at' => now()]);

        return redirect()->intended(route('admin.dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::guard('admin')->logout();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }

    public function account()
    {
        return Inertia::render('Admin/Account', ['account' => auth('admin')->user()->only(['name', 'email'])]);
    }

    public function updateAccount(Request $request)
    {
        $admin = auth('admin')->user();
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:190|unique:admins,email,'.$admin->id,
            'current_password' => 'required',
            'password' => ['nullable', 'confirmed', Password::min(10)->letters()->numbers()],
        ]);
        if (! Hash::check($data['current_password'], $admin->password)) {
            throw ValidationException::withMessages(['current_password' => 'Current password is incorrect.']);
        }
        $admin->update(array_filter(['name' => $data['name'], 'email' => strtolower($data['email']), 'password' => $data['password'] ?? null]));

        return back()->with('success', 'Admin account updated.');
    }
}
