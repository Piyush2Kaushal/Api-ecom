<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * php artisan migrate --seed
     *  - StoreSeeder:   admin login, pages, menus, shipping, homepage, training courses (needed for a working store)
     *  - CatalogSeeder: demo brands, categories, products and coupons (delete or replace with your own)
     */
    public function run(): void
    {
        $this->call([StoreSeeder::class, CatalogSeeder::class, HomepageSeeder::class]);
    }
}
