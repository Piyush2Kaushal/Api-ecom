<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\BrandedMail;
use App\Models\GuestCustomer;
use App\Models\Order;
use App\Models\TradeApplication;
use App\Models\User;
use App\Services\CartService;
use App\Services\MediaService;
use App\Services\Notifier;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function __construct(protected CartService $cart) {}

    public function showLogin()
    {
        return Inertia::render('Auth/Login', ['meta' => $this->meta('Sign in')]);
    }

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required|string', 'remember' => 'boolean']);
        $key = 'login:'.strtolower($data['email']).'|'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 6)) {
            throw ValidationException::withMessages(['email' => 'Too many attempts. Try again in '.RateLimiter::availableIn($key).' seconds.']);
        }
        $token = session(CartService::SESSION_KEY);
        if (! Auth::guard('web')->attempt(['email' => strtolower($data['email']), 'password' => $data['password']], $data['remember'] ?? false)) {
            RateLimiter::hit($key, 300);
            throw ValidationException::withMessages(['email' => 'These details do not match our records.']);
        }
        RateLimiter::clear($key);
        $user = Auth::guard('web')->user();
        if (! $user->is_active) {
            Auth::guard('web')->logout();
            throw ValidationException::withMessages(['email' => 'This account has been disabled. Please contact us.']);
        }
        $request->session()->regenerate();
        $user->update(['last_login_at' => now()]);
        $this->cart->mergeGuestCart($user, $token);

        if (! $user->email_verified_at) {
            OtpService::send($user->email, 'register');

            return redirect()->route('verify.show');
        }

        return redirect()->intended(route('account.dashboard'));
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->forget(CartService::SESSION_KEY);
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    public function showRegister(Request $request)
    {
        return Inertia::render('Auth/Register', [
            'initialType' => in_array($request->query('type'), User::TIERS, true) ? $request->query('type') : 'retailer',
            'meta' => $this->meta('Create an account'),
        ]);
    }

    public function register(Request $request)
    {
        $isTrade = in_array($request->input('account_type'), ['trader', 'wholesaler'], true);
        $data = $request->validate(array_merge([
            'account_type' => ['required', Rule::in(User::TIERS)],
            'first_name' => 'required|string|max:80',
            'last_name' => 'required|string|max:80',
            'email' => 'required|email|max:190|unique:users,email',
            'phone' => 'required|string|max:40',
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
            'marketing_opt_in' => 'boolean',
            'accept_terms' => 'accepted',
        ], $isTrade ? [
            'company_name' => 'required|string|max:150',
            'vat_number' => 'nullable|string|max:50',
            'company_number' => 'required|string|max:50',
            'business_type' => 'required|string|max:80',
            'website' => 'nullable|string|max:190',
            'business_address' => 'required|string|max:500',
            'monthly_spend' => 'nullable|string|max:50',
            'message' => 'nullable|string|max:2000',
            'document' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ] : []), ['email.unique' => 'An account with this email already exists. Try signing in.', 'accept_terms.accepted' => 'Please accept the terms to continue.']);

        $token = session(CartService::SESSION_KEY);
        $user = User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'email' => strtolower($data['email']),
            'phone' => $data['phone'],
            'password' => $data['password'],
            'tier' => 'retailer',
            'company_name' => $data['company_name'] ?? null,
            'vat_number' => $data['vat_number'] ?? null,
            'company_number' => $data['company_number'] ?? null,
            'marketing_opt_in' => $data['marketing_opt_in'] ?? false,
        ]);

        if ($isTrade) {
            TradeApplication::create([
                'user_id' => $user->id,
                'requested_tier' => $data['account_type'],
                'status' => 'unverified',
                'company_name' => $data['company_name'],
                'vat_number' => $data['vat_number'] ?? null,
                'company_number' => $data['company_number'],
                'business_type' => $data['business_type'],
                'website' => $data['website'] ?? null,
                'business_address' => $data['business_address'],
                'monthly_spend' => $data['monthly_spend'] ?? null,
                'message' => $data['message'] ?? null,
                'document_path' => $request->hasFile('document') ? MediaService::store($request->file('document'), 'trade-documents') : null,
            ]);
        }

        Auth::guard('web')->login($user);
        $request->session()->regenerate();
        $this->cart->mergeGuestCart($user, $token);
        OtpService::send($user->email, 'register');

        return redirect()->route('verify.show');
    }

    public function showVerify(Request $request)
    {
        $user = $request->user('web');
        if (! $user) {
            return redirect()->route('login');
        }
        if ($user->email_verified_at) {
            return redirect()->route('account.dashboard');
        }

        return Inertia::render('Auth/VerifyOtp', ['email' => $user->email, 'meta' => $this->meta('Verify your email')]);
    }

    public function verify(Request $request)
    {
        $user = $request->user('web');
        $code = $request->validate(['code' => 'required|digits:6'])['code'];
        if (! OtpService::verify($user->email, 'register', $code)) {
            throw ValidationException::withMessages(['code' => 'That code is incorrect or has expired.']);
        }
        $user->update(['email_verified_at' => now()]);

        // Link any previous guest orders placed with this email.
        if ($guest = GuestCustomer::where('email', $user->email)->first()) {
            Order::where('guest_customer_id', $guest->id)->whereNull('user_id')->update(['user_id' => $user->id]);
            $guest->update(['user_id' => $user->id]);
        }

        $application = TradeApplication::where('user_id', $user->id)->where('status', 'unverified')->latest()->first();
        if ($application) {
            $application->update(['status' => 'pending']);
            Notifier::admin(new BrandedMail(
                subjectLine: 'New '.$application->requested_tier.' application — '.$application->company_name,
                heading: 'New trade account application',
                lines: [$user->name.' has applied for a '.$application->requested_tier.' account.'],
                rows: [['Company', $application->company_name], ['Company no.', (string) $application->company_number], ['VAT no.', $application->vat_number ?: '—'],
                    ['Business type', (string) $application->business_type], ['Email', $user->email], ['Phone', (string) $user->phone]],
                button: ['text' => 'Review application', 'url' => route('admin.approvals.index')],
            ));
        }

        Notifier::send($user->email, new BrandedMail(
            subjectLine: 'Welcome to '.setting('site_name'),
            heading: 'Welcome, '.$user->first_name,
            lines: array_filter([
                'Your account is ready. You can now track orders, download invoices and check out faster.',
                $application ? 'Your '.$application->requested_tier.' application is under review. Until it is approved you will see retail prices — we will email you as soon as it is approved.' : null,
            ]),
            button: ['text' => 'Go to my account', 'url' => route('account.dashboard')],
        ));

        return redirect()->route('account.dashboard')->with('success', $application
            ? 'Email verified. Your '.$application->requested_tier.' application is now under review.'
            : 'Email verified — welcome to '.setting('site_name').'!');
    }

    public function resend(Request $request)
    {
        $error = OtpService::send($request->user('web')->email, 'register');

        return back()->with($error ? 'error' : 'success', $error ?? 'A new code is on its way.');
    }

    public function showForgot()
    {
        return Inertia::render('Auth/ForgotPassword', ['meta' => $this->meta('Reset password')]);
    }

    public function sendReset(Request $request)
    {
        $email = strtolower($request->validate(['email' => 'required|email'])['email']);
        if (User::where('email', $email)->exists()) {
            if ($error = OtpService::send($email, 'reset')) {
                return back()->with('error', $error);
            }
        }
        $request->session()->put('reset_email', $email);

        return redirect()->route('password.reset')->with('success', 'If an account exists for '.$email.', a reset code has been sent.');
    }

    public function showReset(Request $request)
    {
        return Inertia::render('Auth/ResetPassword', ['email' => $request->session()->get('reset_email', ''), 'meta' => $this->meta('Choose a new password')]);
    }

    public function reset(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email', 'code' => 'required|digits:6',
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()],
        ]);
        $email = strtolower($data['email']);
        $user = User::where('email', $email)->first();
        if (! $user || ! OtpService::verify($email, 'reset', $data['code'])) {
            throw ValidationException::withMessages(['code' => 'That code is incorrect or has expired.']);
        }
        $user->update(['password' => $data['password'], 'email_verified_at' => $user->email_verified_at ?? now()]);
        $request->session()->forget('reset_email');

        return redirect()->route('login')->with('success', 'Password updated — please sign in.');
    }
}
