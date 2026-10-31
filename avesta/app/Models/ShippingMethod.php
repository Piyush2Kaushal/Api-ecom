<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['cost' => 'decimal:2', 'rates' => 'array', 'free_shipping_eligible' => 'boolean', 'is_active' => 'boolean'];
    }

    public function zone()
    {
        return $this->belongsTo(ShippingZone::class, 'shipping_zone_id');
    }
}
