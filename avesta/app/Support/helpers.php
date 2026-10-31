<?php

use App\Support\Settings;

if (! function_exists('setting')) {
    function setting(string $key, mixed $default = null): mixed
    {
        return Settings::get($key, $default);
    }
}

if (! function_exists('media_url')) {
    function media_url(?string $path): ?string
    {
        if (! $path) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '//')) {
            return $path;
        }

        return asset(ltrim($path, '/'));
    }
}

if (! function_exists('money')) {
    function money(float|int|string|null $amount, string $currency = 'GBP', float $rate = 1): string
    {
        $symbols = ['GBP' => '£', 'EUR' => '€', 'USD' => '$'];
        $value = round((float) $amount * $rate, 2);

        return ($value < 0 ? '-' : '').($symbols[$currency] ?? $currency.' ').number_format(abs($value), 2);
    }
}
