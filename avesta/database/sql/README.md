# Database setup (MySQL / MariaDB on cPanel)

`avesta.sql` contains **everything**: all 47 tables plus the starter data:
- the admin login
- the demo catalogue: 5 brands, 39 categories across 5 levels, 30 products
- shipping zones and delivery methods
- coupons
- pages, menus and homepage blocks
- training courses

The admin login inside the file is **admin@avesta.test** / **ChangeMe123!**. Change it after your first sign-in (Admin → Admin account).

---

## Option A — cPanel + phpMyAdmin (no commands needed)

1. **Create the database.** Go to cPanel → **MySQL® Databases** → *Create New Database*, e.g. `avesta`. cPanel names it `cpaneluser_avesta`.
2. **Create a user.** On the same page → *Add New User*, e.g. `avesta`, with a strong password. cPanel names it `cpaneluser_avesta`.
3. **Connect them.** Under *Add User To Database*, pick the user and the database, then tick **ALL PRIVILEGES**.
4. **Import the file.** Go to cPanel → **phpMyAdmin** → click your database on the left → **Import** tab → choose `avesta.sql` → **Import**.
5. **Fill in `.env`:**
   ```
   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=cpaneluser_avesta
   DB_USERNAME=cpaneluser_avesta
   DB_PASSWORD=your-password
   ```

---

## Option B — SQL commands (Terminal / SSH, or any MySQL server)

**1. Create the database and user** (run as the MySQL root/admin user):

```sql
CREATE DATABASE avesta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'avesta'@'localhost' IDENTIFIED BY 'CHANGE_THIS_PASSWORD';
GRANT ALL PRIVILEGES ON avesta.* TO 'avesta'@'localhost';
FLUSH PRIVILEGES;
```

On cPanel, create the database and user in the *MySQL Databases* screen instead. Shared hosting does not give you root access.

**2. Import the tables and data:**

```bash
mysql -u avesta -p avesta < database/sql/avesta.sql
```

**3. Check it worked:**

```sql
USE avesta;
SELECT COUNT(*) AS products FROM products;      -- 30
SELECT COUNT(*) AS categories FROM categories;  -- 39
SELECT email FROM admins;                        -- admin@avesta.test
```

---

## Option C — let Laravel build the database (instead of importing the SQL file)

Use this if you prefer not to import the file, or want an empty database built from the code:

```bash
php artisan migrate --force          # create all tables
php artisan db:seed --force          # add admin + demo data (optional)
```

Set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` before running `db:seed` to choose your own admin login.

---

## Useful SQL afterwards

**Reset the admin password** (if you get locked out):

```bash
php artisan tinker --execute="App\Models\Admin::first()->update(['password' => 'MyNewPassword123'])"
```

**Remove all demo products** once your real catalogue is imported. It is easier to do this in Admin → Products → select all → Delete. In SQL:

```sql
DELETE FROM products;          -- images, specs, options are removed automatically
```

**Back up the database** (cPanel → phpMyAdmin → Export, or):

```bash
mysqldump -u avesta -p avesta > avesta-backup-$(date +%F).sql
```

**Future updates:** whenever new code is uploaded, run `php artisan migrate --force` to add any new tables or columns. Your data is kept.
