<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['countries' => 'array', 'postcode_prefixes' => 'array', 'is_active' => 'boolean'];
    }

    public function methods()
    {
        return $this->hasMany(ShippingMethod::class)->orderBy('sort_order');
    }
}
