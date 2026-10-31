<?php

namespace App\Services;

use App\Models\Order;
use Stripe\StripeClient;

class StripeService
{
    public static function enabled(): bool
    {
        return (bool) config('services.stripe.secret');
    }

    /** Demo mode lets you test the full flow without Stripe keys. Never enable it on a live store. */
    public static function demoMode(): bool
    {
        return ! static::enabled() && (bool) config('services.stripe.demo_mode');
    }

    protected function client(): StripeClient
    {
        return new StripeClient(config('services.stripe.secret'));
    }

    public function checkoutUrl(Order $order): string
    {
        $amount = (int) round((float) $order->grand_total * (float) $order->exchange_rate * 100);
        $session = $this->client()->checkout->sessions->create([
            'mode' => 'payment',
            'customer_email' => $order->email,
            'client_reference_id' => (string) $order->id,
            'metadata' => ['order_id' => $order->id, 'order_number' => $order->number],
            'payment_intent_data' => ['metadata' => ['order_id' => $order->id, 'order_number' => $order->number]],
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => strtolower($order->currency),
                    'unit_amount' => $amount,
                    'product_data' => [
                        'name' => setting('site_name').' order '.$order->number,
                        'description' => $order->items()->count().' item(s) incl. delivery and VAT',
                    ],
                ],
            ]],
            'success_url' => route('checkout.success', $order->number).'?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url' => route('checkout.cancelled', $order->number),
        ]);
        $order->update(['stripe_session_id' => $session->id]);

        return $session->url;
    }

    /** Returns the payment intent id if the session is paid. */
    public function paidIntent(string $sessionId): ?string
    {
        $session = $this->client()->checkout->sessions->retrieve($sessionId);

        return $session->payment_status === 'paid' ? (string) $session->payment_intent : null;
    }

    public function refund(Order $order, float $amount): string
    {
        $refund = $this->client()->refunds->create([
            'payment_intent' => $order->stripe_payment_intent,
            'amount' => (int) round($amount * (float) $order->exchange_rate * 100),
        ]);

        return $refund->id;
    }
}
