# Avesta — CCTV & Security E-commerce

A complete store for **Avesta Manchester Ltd**: retail, trade and wholesale pricing, trade approvals, Stripe payments, VAT invoices, installer training, and a full admin panel.

**Built with:** Laravel 13 (PHP 8.3+) · React 19 + TypeScript · Inertia.js · Tailwind CSS 4 · MySQL · Stripe · GSAP / Motion

---

## 1. What's included

### Storefront
- Homepage built from blocks you control in the admin panel:
  - Hero slider
  - Tenvo spotlight
  - Product carousels
  - Category tiles
  - Banners
  - Trade and training calls-to-action
  - Brand strip
- Mega menu that shows all 5 category levels. On mobile it becomes a drill-down menu.
- Live search with suggestions.
- Category, brand and search pages with filters:
  - Brand
  - Price
  - In stock
  - On sale
  - Specifications such as Resolution, Channels and Lens
- Sorting and pagination on every listing page.
- Product pages:
  - Image gallery with zoom
  - Your price shown next to the crossed-out original price
  - Options (e.g. colour)
  - Specifications and datasheet downloads
  - Reviews (verified buyers only)
  - "Ask a question" form
  - "Email me when back in stock" form
  - Related products and "Frequently bought together"
- Slide-out mini basket, plus a full basket page with:
  - Coupons
  - Save for later
  - Free-delivery progress bar
  - Pro-forma quote PDF
- One-page checkout:
  - Guest or signed-in checkout
  - Saved addresses
  - Live delivery prices worked out from the postcode
  - PO reference and order notes
  - Stripe payment
- Order confirmation, order tracking (order number + email) and invoice download.
- Pages for Training registration, Contact, Trade Accounts, Brands, and all policies (editable).
- Cookie banner, promotional popup, WhatsApp button and newsletter sign-up.
- SEO: page titles and descriptions, Google product data, `sitemap.xml`, `robots.txt`, and redirects for old URLs.

### Customer accounts (Retailer / Trader / Wholesaler)
- **Registration with an emailed 6-digit code.**
  - Trader and Wholesaler applicants also enter their company details and can upload a document.
  - Their account works immediately at **retail** prices.
  - Their application appears under **Admin → Trade approvals**.
  - Once approved, trade or wholesale prices switch on automatically and the customer gets an email.
- **Customer dashboard:**
  - Overview
  - Orders (with tracking and "Buy again")
  - Invoices (PDF)
  - Purchase orders
  - Quick order by SKU
  - Wishlist
  - Addresses
  - Trade application
  - Enquiries
  - Profile and password
- **Guest orders are linked automatically** when that email address later registers.

### Admin panel (`/admin`)
- **Dashboard:**
  - Revenue (today, this week, this month)
  - Sales chart split by customer type
  - Orders waiting to be sent, pending approvals and enquiries
  - Top products and low-stock alerts
- **Products:**
  - Three price levels, each with its own discount
  - Live "customer sees" preview, including VAT
  - Gallery, specifications, options, downloads, SEO
  - Bulk edit and bulk delete
  - Duplicate a product
  - **Excel/CSV import and export**
- **Categories:** drag-and-drop tree, up to 5 levels deep.
- **Orders:**
  - Status updates with courier and tracking number (the customer is emailed)
  - Refunds (through Stripe, with automatic credit notes)
  - Mark as paid
  - Resend confirmation
  - Internal notes
  - Export
- **Invoices and credit notes.**
- **Customers:**
  - Registered customers and guests (shown as "Guest 1", "Guest 2"…)
  - Each profile shows full order and invoice history
  - Change a customer's account type
  - Export
- **Trade approvals:** approve or reject (with a reason). The customer is emailed either way.
- **Coupons:** percentage, fixed amount or free delivery. Limits by customer type, product, category or brand. Usage limits, start/end dates, and an on/off switch.
- **Shipping zones and delivery methods:** flat price, price by weight or price by order value, plus a free-delivery threshold.
- **Website content:** homepage blocks, hero slides, pages, menus, popups, redirects.
- **Training:** courses and registrations. **Enquiries**, **Reviews**, **Newsletter** (with export).
- **Reports:** by date range, customer type, brand, product and coupon.
- **Abandoned baskets.**
- **Settings** for nearly everything:
  - Company details and logo
  - VAT and currencies
  - Delivery and checkout
  - Stock
  - Banners
  - SEO and social links
  - Optional emailed sign-in code for the admin

---

## 2. How prices and VAT work

The calculation always follows this order:

**price level → product discount → coupon → VAT on the discounted amount → delivery**

| Product VAT type | £20 product | Checkout shows |
|---|---|---|
| VAT **included** | customer pays **£20** | £16.67 + £3.33 VAT |
| VAT **excluded** | customer pays **£24** | £20 + £4 VAT |
| **No VAT** | customer pays **£20** | no VAT line |

- **VAT rate:** 20% by default. Change it in **Settings → VAT & currency**.
- **Default VAT type:** set once in **Settings**. You can apply it to every product in one click, or change selected products with bulk edit.
- **VAT on delivery:** off by default. There is a switch to turn it on.
- **Empty Trader or Wholesaler price:** that customer type falls back to the Retailer price.

These rules are covered by automated tests (`tests/Feature/PricingTest.php`).

---

## 3. Run it on your computer

Requirements: PHP 8.3+, Composer, Node 20+.

```bash
composer install
npm install
cp .env.example .env              # set DB_CONNECTION=sqlite for a quick local test
php artisan key:generate
php artisan migrate --seed        # creates the admin login + demo catalogue
npm run build                     # or: npm run dev
php artisan serve
```

- Store: http://127.0.0.1:8000
- Admin: http://127.0.0.1:8000/admin (`admin@avesta.test` / `ChangeMe123!`)

**Testing without Stripe keys:** set `PAYMENT_DEMO_MODE=true`. Orders are then marked as paid instantly.

**Testing without real email:** set `MAIL_MAILER=log`. Verification codes are written to `storage/logs/laravel.log`.

**Run the tests:** `php artisan test`

---

## 4. Deploy on cPanel

The built front-end files (`public/build`) are committed to the repository, so **your server does not need Node.js**.

1. **Choose PHP 8.3 or newer.**
   - Go to cPanel → *MultiPHP Manager*.
   - Make sure these extensions are on: `pdo_mysql`, `mbstring`, `gd`, `zip`, `intl`, `fileinfo`, `openssl`.
2. **Create the database.**
   - Go to cPanel → *MySQL Databases*.
   - Create a database and a user, then add the user to the database with **All privileges**.
3. **Upload the code** to a folder *outside* `public_html`, for example `/home/USERNAME/avesta`.
   - Upload the `avesta` folder from this repository.
   - Include `vendor/`: run `composer install --no-dev --optimize-autoloader` on your computer first, or run it in the cPanel Terminal.
4. **Point the domain at the `public` folder.**
   - Go to cPanel → *Domains* → *Manage*, and set the **document root** to `/home/USERNAME/avesta/public`.
   - *If your host doesn't allow changing the document root:*
     1. Copy the contents of `avesta/public` into `public_html`.
     2. In `public_html/index.php`, change both `__DIR__.'/../` paths to `__DIR__.'/../avesta/`.
5. **Create the `.env` file.**
   - Copy `.env.example` to `.env`.
   - Fill in `APP_URL`, the `DB_*` details, the `MAIL_*` details and the `STRIPE_*` keys.
   - Set `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
   - Keep `APP_DEBUG=false` and `PAYMENT_DEMO_MODE=false`.
6. **Run the setup commands** in cPanel → *Terminal*:
   ```bash
   cd ~/avesta
   php artisan key:generate --force
   php artisan migrate --seed --force
   php artisan config:cache && php artisan route:cache && php artisan view:cache
   chmod -R 775 storage bootstrap/cache public/uploads
   ```
7. **Add a cron job** in cPanel → *Cron Jobs*, set to run every minute:
   `* * * * * cd ~/avesta && php artisan schedule:run >> /dev/null 2>&1`
8. **Set up the Stripe webhook.**
   - Go to Stripe → *Developers → Webhooks → Add endpoint*.
   - URL: `https://your-domain/stripe/webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`
   - Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
9. **Turn on SSL** in cPanel → *SSL/TLS Status* → *Run AutoSSL*.
10. **After any change to `.env`,** run `php artisan config:cache` again.

**To update the site later:** upload the changed files, run `php artisan migrate --force`, then run the three cache commands from step 6.

---

## 5. First steps after going live
1. **Change your admin login.** Sign in at `/admin` and go to **Admin account**.
2. **Fill in your details.** Go to **Settings → Store & company** and add your logo, company number and VAT number (both are printed on invoices).
3. **Check delivery.** Review **Shipping** zones and prices, and the free-delivery threshold under **Settings → Delivery & checkout**.
4. **Replace the demo products.**
   - Go to **Products → Export** to see the file format, or download the import template.
   - Prepare your products in Excel and use **Import**.
   - Delete the demo products with bulk delete.
5. **Adjust the homepage** under **Homepage** and **Hero slides**.
6. **Add redirects** for important old Zoho URLs under **Redirects**, so you keep your Google rankings.

---

## 6. Where things are

| Area | Location |
|---|---|
| Pricing, VAT, cart, shipping, orders, Stripe | `app/Services/` |
| Settings and their defaults | `app/Support/Settings.php` |
| Storefront, account and admin controllers | `app/Http/Controllers/{Store,Account,Admin}` |
| Admin pages built from a field list | `app/Http/Controllers/Admin/Resources/` |
| Front-end pages | `resources/js/pages/{Store,Auth,Account,Admin}` |
| Shared components | `resources/js/components/` |
| Design tokens (colours, fonts) | `resources/css/app.css` |
| Email and PDF templates | `resources/views/emails`, `resources/views/pdf` |
| Demo data | `database/seeders/` |
| Demo product artwork (replace with real photos) | `public/images/demo/` |
| Uploaded images | `public/uploads/` (automatically converted to WebP) |
