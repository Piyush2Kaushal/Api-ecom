<?php

namespace App\Http\Controllers\Store;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request, OrderService $orders)
    {
        try {
            $event = Webhook::constructEvent($request->getContent(), (string) $request->header('Stripe-Signature'), (string) config('services.stripe.webhook_secret'));
        } catch (\Throwable $e) {
            return response('Invalid signature', 400);
        }

        $object = $event->data->object;
        if (in_array($event->type, ['checkout.session.completed', 'checkout.session.async_payment_succeeded'], true) && $object->payment_status === 'paid') {
            $order = Order::find($object->metadata->order_id ?? 0) ?? Order::where('stripe_session_id', $object->id)->first();
            if ($order) {
                $orders->markPaid($order, (string) $object->payment_intent);
            }
        }
        if ($event->type === 'checkout.session.async_payment_failed') {
            Order::where('stripe_session_id', $object->id)->whereNull('paid_at')->update(['status' => 'failed', 'payment_status' => 'failed']);
        }

        return response('ok');
    }
}
