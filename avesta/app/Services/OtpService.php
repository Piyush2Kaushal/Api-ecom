<?php

namespace App\Services;

use App\Mail\BrandedMail;
use App\Models\EmailOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class OtpService
{
    public const TTL_MINUTES = 10;

    public const MAX_ATTEMPTS = 5;

    /** Returns null on success or an error message (e.g. when rate limited). */
    public static function send(string $email, string $purpose): ?string
    {
        $key = 'otp:'.$purpose.':'.strtolower($email);
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return 'Too many codes requested. Please try again in '.ceil(RateLimiter::availableIn($key) / 60).' minutes.';
        }
        RateLimiter::hit($key, 900);

        $code = (string) random_int(100000, 999999);
        EmailOtp::where('email', $email)->where('purpose', $purpose)->delete();
        EmailOtp::create([
            'email' => $email,
            'purpose' => $purpose,
            'code_hash' => Hash::make($code),
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);

        $titles = [
            'register' => 'Verify your email address',
            'reset' => 'Reset your password',
            'admin' => 'Your admin sign-in code',
        ];
        Notifier::send($email, new BrandedMail(
            subjectLine: ($titles[$purpose] ?? 'Your verification code').' — '.setting('site_name'),
            heading: $titles[$purpose] ?? 'Your verification code',
            lines: ['Use the code below to continue. It expires in '.self::TTL_MINUTES.' minutes.'],
            code: $code,
            outro: ['If you did not request this, you can safely ignore this email.'],
        ));

        if (app()->environment('local')) {
            logger()->info("OTP for {$email} ({$purpose}): {$code}");
        }

        return null;
    }

    public static function verify(string $email, string $purpose, string $code): bool
    {
        $otp = EmailOtp::where('email', $email)->where('purpose', $purpose)->latest('id')->first();
        if (! $otp || $otp->expires_at->isPast() || $otp->attempts >= self::MAX_ATTEMPTS) {
            return false;
        }
        if (! Hash::check(trim($code), $otp->code_hash)) {
            $otp->increment('attempts');

            return false;
        }
        $otp->delete();

        return true;
    }
}
