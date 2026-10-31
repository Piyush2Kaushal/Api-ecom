<?php

namespace App\Services;

use App\Mail\BrandedMail;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\GuestCustomer;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Refund;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Create a pending order from a cart summary (already validated by the controller).
     */
    public function create(Cart $cart, array $summary, array $data, ?User $user): Order
    {
        return DB::transaction(function () use ($cart, $summary, $data, $user) {
            $guestId = null;
            if (! $user) {
                $guest = GuestCustomer::firstOrNew(['email' => strtolower($data['email'])]);
                $guest->fill([
                    'first_name' => $data['shipping']['first_name'],
                    'last_name' => $data['shipping']['last_name'] ?? null,
                    'phone' => $data['phone'] ?? $guest->phone,
                ])->save();
                $guestId = $guest->id;
            }

            $currency = $data['currency'] ?? 'GBP';
            $rate = 1.0;
            if ($currency !== 'GBP') {
                $c = collect(setting('currencies', []))->firstWhere('code', $currency);
                $rate = $c && ! empty($c['enabled']) ? (float) $c['rate'] : 1.0;
                $currency = $c && ! empty($c['enabled']) ? $currency : 'GBP';
            }

            $t = $summary['totals'];
            $order = Order::create([
                'number' => 'TMP-'.uniqid(),
                'user_id' => $user?->id,
                'guest_customer_id' => $guestId,
                'cart_id' => $cart->id,
                'customer_tier' => $summary['tier'],
                'email' => strtolower($data['email']),
                'phone' => $data['phone'] ?? null,
                'shipping_address' => $data['shipping'],
                'billing_address' => $data['billing'],
                'po_reference' => $data['po_reference'] ?? null,
                'customer_notes' => $data['notes'] ?? null,
                'currency' => $currency,
                'exchange_rate' => $rate,
                'items_subtotal' => $t['items_subtotal'],
                'savings_total' => $t['savings'],
                'coupon_code' => $summary['coupon']['code'] ?? null,
                'coupon_discount' => $t['coupon_discount'],
                'shipping_method_id' => $summary['shipping_method']['id'] ?? null,
                'shipping_method_name' => $summary['shipping_method']['name'] ?? null,
                'shipping_total' => $t['shipping'],
                'net_total' => $t['net_total'],
                'vat_total' => $t['vat_total'],
                'grand_total' => $t['grand_total'],
                'status' => 'pending_payment',
                'payment_status' => 'unpaid',
                'ip_address' => request()->ip(),
            ]);
            $order->update(['number' => setting('order_prefix', 'AVS-').(100000 + $order->id)]);

            foreach ($summary['lines'] as $line) {
                $order->items()->create([
                    'product_id' => $line['product_id'],
                    'product_variant_id' => $line['variant_id'],
                    'name' => $line['name'],
                    'sku' => $line['sku'],
                    'variant_label' => $line['variant_label'],
                    'image' => $this->relativeImage($line['image']),
                    'quantity' => $line['quantity'],
                    'unit_original_price' => $line['unit_original'],
                    'unit_price' => $line['unit_price'],
                    'coupon_discount' => $line['coupon_discount'],
                    'vat_mode' => $line['vat_mode'],
                    'vat_rate' => $line['vat_rate'],
                    'line_net' => $line['net'],
                    'line_vat' => $line['vat'],
                    'line_total' => $line['gross'],
                ]);
            }
            $order->history()->create(['status' => 'pending_payment', 'note' => 'Order placed, awaiting payment.']);
            $cart->update(['email' => $order->email]);

            return $order;
        });
    }

    protected function relativeImage(?string $url): ?string
    {
        if (! $url) {
            return null;
        }
        $base = rtrim(asset(''), '/').'/';

        return str_starts_with($url, $base) ? substr($url, strlen($base)) : $url;
    }

    /** Idempotently mark an order as paid: stock, coupon, invoice, emails. */
    public function markPaid(Order $order, ?string $paymentIntent = null, string $method = 'card'): Order
    {
        $justPaid = DB::transaction(function () use ($order, $paymentIntent, $method) {
            $order = Order::whereKey($order->id)->lockForUpdate()->first();
            if ($order->paid_at) {
                return false;
            }
            $order->update([
                'paid_at' => now(),
                'status' => 'paid',
                'payment_status' => 'paid',
                'payment_method' => $method,
                'stripe_payment_intent' => $paymentIntent ?? $order->stripe_payment_intent,
            ]);
            $this->deductStock($order);

            if ($order->coupon_code && ($coupon = Coupon::where('code', $order->coupon_code)->first())) {
                $coupon->increment('used_count');
                CouponUsage::create(['coupon_id' => $coupon->id, 'order_id' => $order->id, 'user_id' => $order->user_id, 'email' => $order->email]);
            }

            $invoice = Invoice::create(['order_id' => $order->id, 'number' => 'TMP-'.uniqid(), 'type' => 'invoice', 'amount' => $order->grand_total, 'issued_at' => now()]);
            $invoice->update(['number' => setting('invoice_prefix', 'AVS-INV-').now()->format('Y').'-'.str_pad((string) $invoice->id, 5, '0', STR_PAD_LEFT)]);

            $order->history()->create(['status' => 'paid', 'note' => 'Payment received.', 'customer_notified' => true]);
            if ($order->cart_id) {
                Cart::whereKey($order->cart_id)->update(['converted_at' => now()]);
            }

            return true;
        });

        $order->refresh();
        if ($justPaid) {
            $this->sendConfirmation($order);
        }

        return $order;
    }

    protected function deductStock(Order $order): void
    {
        if ($order->stock_deducted) {
            return;
        }
        foreach ($order->items as $item) {
            $product = Product::whereKey($item->product_id)->lockForUpdate()->first();
            if (! $product) {
                continue;
            }
            $product->increment('sales_count', $item->quantity);
            if ($product->track_stock) {
                $item->product_variant_id
                    ? ProductVariant::whereKey($item->product_variant_id)->decrement('stock_qty', $item->quantity)
                    : $product->decrement('stock_qty', $item->quantity);
            }
        }
        $order->update(['stock_deducted' => true]);
    }

    public function restock(Order $order, ?array $quantities = null): void
    {
        foreach ($order->items as $item) {
            $qty = $quantities[$item->id] ?? $item->quantity;
            $product = Product::find($item->product_id);
            if (! $product || ! $product->track_stock || $qty <= 0) {
                continue;
            }
            $item->product_variant_id
                ? ProductVariant::whereKey($item->product_variant_id)->increment('stock_qty', $qty)
                : $product->increment('stock_qty', $qty);
            StockAlertService::notifyIfBackInStock($product->fresh());
        }
    }

    public function updateStatus(Order $order, string $status, ?string $note = null, bool $notify = true, array $tracking = []): void
    {
        $changes = ['status' => $status];
        if ($tracking) {
            $changes = array_merge($changes, array_intersect_key($tracking, array_flip(['carrier', 'tracking_number', 'tracking_url'])));
        }
        if ($status === 'dispatched' && ! $order->shipped_at) {
            $changes['shipped_at'] = now();
        }
        if ($status === 'delivered' && ! $order->delivered_at) {
            $changes['delivered_at'] = now();
        }
        if ($status === 'cancelled' && ! $order->cancelled_at) {
            $changes['cancelled_at'] = now();
            if ($order->stock_deducted) {
                $this->restock($order);
                $changes['stock_deducted'] = false;
            }
        }
        $order->update($changes);
        $order->history()->create(['status' => $status, 'note' => $note, 'customer_notified' => $notify]);

        if ($notify) {
            $messages = [
                'processing' => 'Good news — we are preparing your order.',
                'dispatched' => 'Your order is on its way.',
                'delivered' => 'Your order has been delivered. We hope you enjoy your new equipment.',
                'cancelled' => 'Your order has been cancelled. If you were charged, a refund will follow.',
            ];
            $rows = [['Order', $order->number], ['Status', Order::STATUSES[$status] ?? $status]];
            if ($order->tracking_number) {
                $rows[] = ['Courier', (string) $order->carrier];
                $rows[] = ['Tracking number', $order->tracking_number];
            }
            Notifier::send($order->email, new BrandedMail(
                subjectLine: 'Order '.$order->number.' — '.(Order::STATUSES[$status] ?? $status),
                heading: 'Order update',
                lines: array_filter([$messages[$status] ?? 'Your order status has been updated.', $note]),
                rows: $rows,
                button: $order->tracking_url ? ['text' => 'Track parcel', 'url' => $order->tracking_url] : ['text' => 'View order', 'url' => route('track', ['number' => $order->number, 'email' => $order->email])],
            ));
        }
    }

    public function refund(Order $order, float $amount, ?string $reason, bool $restock): Refund
    {
        $amount = round(min($amount, (float) $order->grand_total - (float) $order->refunded_total), 2);
        if ($amount <= 0) {
            throw new \RuntimeException('Nothing left to refund on this order.');
        }
        $stripeId = null;
        if ($order->stripe_payment_intent && StripeService::enabled()) {
            $stripeId = app(StripeService::class)->refund($order, $amount);
        }

        return DB::transaction(function () use ($order, $amount, $reason, $restock, $stripeId) {
            $refund = $order->refunds()->create(['amount' => $amount, 'reason' => $reason, 'stripe_refund_id' => $stripeId, 'restocked' => $restock]);
            $total = round((float) $order->refunded_total + $amount, 2);
            $full = $total >= (float) $order->grand_total;
            $order->update(['refunded_total' => $total, 'status' => $full ? 'refunded' : 'partially_refunded', 'payment_status' => $full ? 'refunded' : 'partially_refunded']);
            if ($restock && $order->stock_deducted) {
                $this->restock($order);
                $order->update(['stock_deducted' => false]);
            }
            $cn = Invoice::create(['order_id' => $order->id, 'number' => 'TMP-'.uniqid(), 'type' => 'credit_note', 'amount' => $amount, 'note' => $reason, 'issued_at' => now()]);
            $cn->update(['number' => setting('credit_note_prefix', 'AVS-CN-').now()->format('Y').'-'.str_pad((string) $cn->id, 5, '0', STR_PAD_LEFT)]);
            $order->history()->create(['status' => $order->status, 'note' => 'Refunded '.money($amount).($reason ? ' — '.$reason : ''), 'customer_notified' => true]);
            Notifier::send($order->email, new BrandedMail(
                subjectLine: 'Refund issued for order '.$order->number,
                heading: 'Refund issued',
                lines: ['We have issued a refund of '.money($amount).' to your original payment method. It can take 5–10 working days to appear.'],
                rows: [['Order', $order->number], ['Refund', money($amount)], ['Credit note', $cn->number]],
            ));

            return $refund;
        });
    }

    public function sendConfirmation(Order $order): void
    {
        $order->loadMissing(['items', 'invoices']);
        $invoice = $order->invoices->firstWhere('type', 'invoice');
        $rows = $order->items->map(fn ($i) => [$i->quantity.' × '.$i->name.($i->variant_label ? ' ('.$i->variant_label.')' : ''), money($i->line_total, $order->currency, (float) $order->exchange_rate)])->all();
        if ((float) $order->coupon_discount > 0) {
            $rows[] = ['Coupon '.$order->coupon_code, '−'.money($order->coupon_discount, $order->currency, (float) $order->exchange_rate)];
        }
        $rows[] = ['Delivery ('.$order->shipping_method_name.')', (float) $order->shipping_total > 0 ? money($order->shipping_total, $order->currency, (float) $order->exchange_rate) : 'Free'];
        $rows[] = ['VAT', money($order->vat_total, $order->currency, (float) $order->exchange_rate)];
        $rows[] = ['Total paid', money($order->grand_total, $order->currency, (float) $order->exchange_rate)];

        $files = [];
        if ($invoice) {
            try {
                $files[] = ['data' => InvoiceService::pdf($invoice)->output(), 'name' => $invoice->number.'.pdf'];
            } catch (\Throwable $e) {
                logger()->error('Invoice PDF failed: '.$e->getMessage());
            }
        }

        Notifier::send($order->email, new BrandedMail(
            subjectLine: 'Order confirmed — '.$order->number,
            heading: 'Thank you for your order',
            lines: ['Hi '.($order->shipping_address['first_name'] ?? 'there').', we have received your payment and your order is confirmed. Your invoice is attached.'],
            rows: $rows,
            button: ['text' => 'Track your order', 'url' => route('track', ['number' => $order->number, 'email' => $order->email])],
            files: $files,
        ));

        Notifier::admin(new BrandedMail(
            subjectLine: 'New order '.$order->number.' — '.money($order->grand_total),
            heading: 'New paid order',
            lines: [$order->customer_label.' ('.$order->email.') placed an order as a '.$order->customer_tier.'.'],
            rows: $rows,
            button: ['text' => 'Open in admin', 'url' => route('admin.orders.show', $order)],
        ));
    }
}
