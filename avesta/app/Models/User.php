<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    public const TIERS = ['retailer', 'trader', 'wholesaler'];

    protected $guarded = ['id'];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = ['name'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'marketing_opt_in' => 'boolean',
        ];
    }

    public function getNameAttribute(): string
    {
        return trim($this->first_name.' '.$this->last_name);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    public function tradeApplications()
    {
        return $this->hasMany(TradeApplication::class)->latest();
    }

    public function pendingApplication()
    {
        return $this->hasOne(TradeApplication::class)->where('status', 'pending')->latestOfMany();
    }

    public function wishlist()
    {
        return $this->hasMany(Wishlist::class);
    }

    public function isTrade(): bool
    {
        return in_array($this->tier, ['trader', 'wholesaler'], true);
    }
}
