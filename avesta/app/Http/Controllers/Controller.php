<?php

namespace App\Http\Controllers;

use App\Services\Pricing;

abstract class Controller
{
    protected function tier(): string
    {
        return Pricing::tierFor(auth('web')->user());
    }

    protected function meta(?string $title = null, ?string $description = null, ?string $image = null, array $extra = []): array
    {
        return array_filter(array_merge(['title' => $title, 'description' => $description, 'image' => $image], $extra), fn ($v) => $v !== null);
    }
}
