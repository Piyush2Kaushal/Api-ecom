# Avesta — project notes

Laravel 13 + Inertia (React 19, TypeScript) + Tailwind 4 e-commerce store for a UK CCTV supplier. See README.md.

- Pricing/VAT rules live only in `app/Services/Pricing.php` and `CartService::summary()`; keep `tests/Feature/PricingTest.php` green.
- Customer tiers: retailer / trader / wholesaler (`users.tier`). Trade upgrades go through `trade_applications`.
- Most admin sections are schema-driven (`app/Http/Controllers/Admin/Resources/*` → `resources/js/pages/Admin/Resource.tsx`).
- Settings are key/value (`app/Support/Settings.php`, defaults there).
- Uploads go to `public/uploads` (cPanel friendly). `public/build` is committed so cPanel needs no Node.
- Checks: `php artisan test`, `npx tsc --noEmit`, `npm run build`.
