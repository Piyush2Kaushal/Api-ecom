<?php

namespace App\Services;

use App\Mail\BrandedMail;
use App\Models\Product;
use App\Models\StockNotification;

class StockAlertService
{
    public static function notifyIfBackInStock(Product $product): void
    {
        if (! $product->is_active || ! $product->inStock()) {
            return;
        }
        StockNotification::where('product_id', $product->id)->whereNull('notified_at')->limit(200)->get()
            ->each(function ($n) use ($product) {
                Notifier::send($n->email, new BrandedMail(
                    subjectLine: $product->name.' is back in stock',
                    heading: 'Back in stock',
                    lines: ['Good news — '.$product->name.' is available again. Stock is limited, so order soon.'],
                    button: ['text' => 'View product', 'url' => route('product.show', $product->slug)],
                ));
                $n->update(['notified_at' => now()]);
            });
    }
}
