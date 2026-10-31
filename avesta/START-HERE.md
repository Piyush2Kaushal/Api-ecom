# Avesta — start here (cPanel upload in 10 steps)

This zip is the **complete website**. The React frontend is already compiled into `public/build`, and the PHP libraries are already in `vendor/`. You do **not** need Node.js or Composer on the server.

| Step | What to do |
|---|---|
| 1 | cPanel → **MultiPHP Manager** → choose **PHP 8.3** (or newer) for your domain. |
| 2 | cPanel → **File Manager** → upload `avesta-backend.zip` to your home folder (e.g. `/home/USERNAME/`), **not** inside `public_html`. Right-click → **Extract**. You now have `/home/USERNAME/avesta`. |
| 3 | cPanel → **Domains** → *Manage* your domain → set **Document Root** to `avesta/public`. *(If your host does not allow this, see "No document root option" below.)* |
| 4 | Create the database and import `database/sql/avesta.sql`. Step-by-step instructions are in `database/sql/README.md` (Option A). |
| 5 | In File Manager, copy `.env.example` → `.env`, then edit `.env`: set `APP_URL`, the `DB_*` details, the `MAIL_*` details (your cPanel email account) and the `STRIPE_*` keys. |
| 6 | cPanel → **Terminal**, then run:<br>`cd ~/avesta`<br>`php artisan key:generate --force`<br>`php artisan optimize`<br>`chmod -R 775 storage bootstrap/cache public/uploads` |
| 7 | cPanel → **Cron Jobs** → add: `* * * * * cd ~/avesta && php artisan schedule:run >> /dev/null 2>&1` |
| 8 | cPanel → **SSL/TLS Status** → **Run AutoSSL** so the site runs on https. |
| 9 | Stripe dashboard → Developers → **Webhooks** → add endpoint `https://YOUR-DOMAIN/stripe/webhook`. Choose events `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `checkout.session.async_payment_failed`. Paste the signing secret into `STRIPE_WEBHOOK_SECRET` in `.env`, then run `php artisan optimize` again. |
| 10 | Open `https://YOUR-DOMAIN/admin`, sign in with **admin@avesta.test / ChangeMe123!** and change the password immediately (Admin → Admin account). |

## After any `.env` change
Run `php artisan optimize` (or `php artisan config:clear`).

## No "document root" option?
1. Move everything **inside** `avesta/public` into `public_html`.
2. Edit `public_html/index.php` and change the two paths:
   - `__DIR__.'/../vendor/autoload.php'` → `__DIR__.'/../avesta/vendor/autoload.php'`
   - `__DIR__.'/../bootstrap/app.php'` → `__DIR__.'/../avesta/bootstrap/app.php'`
3. In `avesta/.env`, add `ASSET_URL=https://YOUR-DOMAIN`.

## Quick checks after upload
- **Home page loads.** If not, check `storage/logs/laravel.log`.
- **Register a test account.** You should receive the 6-digit email code. If not, check the `MAIL_*` settings.
- **Place a test order** with Stripe test keys (card `4242 4242 4242 4242`, any future date, any CVC). You should receive the confirmation email and the invoice PDF.
- **Check Admin → Settings → Store & company.** The three status boxes show whether Stripe, email and live mode are set up correctly.

Full documentation: `README.md`.
