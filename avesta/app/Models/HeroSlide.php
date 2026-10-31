<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['image_url', 'mobile_image_url'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function getImageUrlAttribute(): ?string
    {
        return media_url($this->image);
    }

    public function getMobileImageUrlAttribute(): ?string
    {
        return media_url($this->mobile_image);
    }
}
