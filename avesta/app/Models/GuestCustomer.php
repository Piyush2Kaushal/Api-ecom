<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GuestCustomer extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['label'];

    public function getLabelAttribute(): string
    {
        return 'Guest '.$this->id;
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
