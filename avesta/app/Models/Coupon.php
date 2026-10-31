<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2', 'min_subtotal' => 'decimal:2', 'max_discount' => 'decimal:2',
            'starts_at' => 'datetime', 'ends_at' => 'datetime', 'allowed_tiers' => 'array',
            'applies_ids' => 'array', 'is_active' => 'boolean',
        ];
    }

    public function usages()
    {
        return $this->hasMany(CouponUsage::class);
    }
}
