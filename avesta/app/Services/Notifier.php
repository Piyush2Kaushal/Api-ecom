<?php

namespace App\Services;

use App\Mail\BrandedMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/** Sends mail without ever breaking the customer's request if SMTP is misconfigured. */
class Notifier
{
    public static function send(?string $to, BrandedMail $mail): bool
    {
        if (! $to) {
            return false;
        }
        try {
            Mail::to($to)->send($mail);

            return true;
        } catch (\Throwable $e) {
            Log::error('Mail failed: '.$e->getMessage(), ['to' => $to, 'subject' => $mail->subjectLine]);

            return false;
        }
    }

    public static function admin(BrandedMail $mail): bool
    {
        return static::send(setting('admin_notification_email') ?: config('mail.from.address'), $mail);
    }
}
