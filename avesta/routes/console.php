<?php

use App\Models\Cart;
use App\Models\EmailOtp;
use App\Models\Order;
use Illuminate\Support\Facades\Schedule;

// Runs via the cPanel cron job: * * * * * php /path/to/avesta/artisan schedule:run
Schedule::call(function () {
    EmailOtp::where('expires_at', '<', now()->subDay())->delete();
    // Empty guest baskets older than 60 days
    Cart::whereNull('user_id')->where('updated_at', '<', now()->subDays(60))->delete();
    // Unpaid checkouts older than 7 days are marked as failed
    Order::where('status', 'pending_payment')->where('created_at', '<', now()->subDays(7))->update(['status' => 'failed', 'payment_status' => 'abandoned']);
})->daily()->name('store-cleanup')->withoutOverlapping();
