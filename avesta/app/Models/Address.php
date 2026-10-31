<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_default_shipping' => 'boolean', 'is_default_billing' => 'boolean'];
    }

    public function toSnapshot(): array
    {
        return $this->only(['first_name', 'last_name', 'company', 'line1', 'line2', 'city', 'county', 'postcode', 'country', 'phone']);
    }
}
