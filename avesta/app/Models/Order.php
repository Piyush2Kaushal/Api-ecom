<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    public const STATUSES = [
        'pending_payment' => 'Pending payment',
        'paid' => 'Paid',
        'processing' => 'Processing',
        'dispatched' => 'Dispatched',
        'delivered' => 'Delivered',
        'cancelled' => 'Cancelled',
        'refunded' => 'Refunded',
        'partially_refunded' => 'Partially refunded',
        'failed' => 'Payment failed',
    ];

    protected $guarded = ['id'];

    protected $appends = ['status_label', 'customer_label'];

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array', 'billing_address' => 'array',
            'paid_at' => 'datetime', 'shipped_at' => 'datetime', 'delivered_at' => 'datetime', 'cancelled_at' => 'datetime',
            'stock_deducted' => 'boolean',
            'items_subtotal' => 'decimal:2', 'savings_total' => 'decimal:2', 'coupon_discount' => 'decimal:2',
            'shipping_total' => 'decimal:2', 'net_total' => 'decimal:2', 'vat_total' => 'decimal:2',
            'grand_total' => 'decimal:2', 'refunded_total' => 'decimal:2', 'exchange_rate' => 'decimal:6',
        ];
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? ucfirst($this->status);
    }

    public function getCustomerLabelAttribute(): string
    {
        if ($this->user_id) {
            return $this->relationLoaded('user') && $this->user ? $this->user->name : trim(($this->billing_address['first_name'] ?? '').' '.($this->billing_address['last_name'] ?? ''));
        }

        return $this->guest_customer_id ? 'Guest '.$this->guest_customer_id : 'Guest';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function guest()
    {
        return $this->belongsTo(GuestCustomer::class, 'guest_customer_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function history()
    {
        return $this->hasMany(OrderStatusHistory::class)->latest('id');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function refunds()
    {
        return $this->hasMany(Refund::class);
    }

    public function isPaid(): bool
    {
        return $this->paid_at !== null;
    }

    public function scopePaid($q)
    {
        return $q->whereNotNull('paid_at')->whereNotIn('status', ['cancelled', 'refunded']);
    }
}
