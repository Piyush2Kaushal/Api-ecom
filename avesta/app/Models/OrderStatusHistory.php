<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['customer_notified' => 'boolean'];
    }
}
