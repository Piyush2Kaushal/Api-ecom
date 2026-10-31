<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductFile extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['url'];

    public function getUrlAttribute(): ?string
    {
        return media_url($this->path);
    }
}
