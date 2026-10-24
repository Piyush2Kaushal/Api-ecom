# The Wholesome Pinni – Setup Guide

This guide takes you from a blank Shopify store to a live, working site. Follow the steps in order: some steps depend on earlier ones. For example, collections need products, and menus need collections.

---

## 1. Upload the theme

1. In Shopify admin go to **Online Store › Themes**.
2. Under *Theme library* click **Add theme › Upload zip file**.
3. Choose `the-wholesome-pinni-theme.zip` (it contains `assets/ config/ layout/ locales/ sections/ snippets/ templates/` at the top level).
4. When it appears in the library, click **⋯ › Preview** to check it, then **Publish** when you're ready.

> If you edit files later, re-zip the *contents* of the `theme/` folder, not the folder itself: `cd theme && zip -r ../the-wholesome-pinni-theme.zip .`

---

## 2. Create product metafields (before importing products)

The product page shows **Ingredients**, **Allergen information** and **Storage** from product metafields. Create the definitions first so the CSV import fills them:

1. **Settings › Custom data › Products › Add definition**
2. Create these three, each with type **Multi-line text**:

| Name | Namespace and key |
|---|---|
| Ingredients | `custom.ingredients` |
| Allergens | `custom.allergens` |
| Storage | `custom.storage` |

Turn on **Storefronts access** for each one if Shopify asks.

---

## 3. Import the 7 products

1. **Products › Import › Add file** and choose `products.csv`.
2. Tick **Overwrite products with matching handles** if you're re-importing.
3. Click **Upload and preview**, then **Import products**.

The CSV contains exactly 7 products, each with a 500g and a 1kg variant:

| Product | Handle (URL) |
|---|---|
| Alsi Panjeeri | `/products/alsi-panjeeri` |
| Alsi Pinni (Flaxseed) | `/products/alsi-pinni-flaxseed` |
| Atta Pinni | `/products/atta-pinni` |
| Badam Bites Pinni | `/products/badam-bites-pinni` |
| Besan Pinni | `/products/besan-pinni` |
| Punjabi Pinni | `/products/punjabi-pinni` |
| Sugar-Free Pinni | `/products/sugar-free-pinni` |

**⚠ All products import as *Draft* on purpose.** Before you set them to Active, check the following for each product:

- **Prices and variants.** The reference store couldn't be reached while this was built, so the prices and weights in the CSV are drafts. Change them in the CSV before importing, or in each product afterwards.
- **Ingredients and allergens.** These are typical recipes. **Check every line against your real recipes and pack labels.** UK law requires allergen information to be accurate.
- **Stock.** Every variant starts at 50 units, with "stop selling when out of stock" on. Set your real quantities in **Products › Inventory**.
- **Images.** Upload photos to each product (see `CONTENT-CHECKLIST.md`) and add alt text.
- **Tax.** Variants are marked taxable. Ask your accountant whether your products are zero-rated or standard-rated for VAT, then set this in **Settings › Taxes and duties**.

Then select all 7 products and choose **Set as active**.

### Remove products you don't sell

If any of these exist from an old setup, **archive or delete** them so they never appear on the site: Coconut Paan, Motichoor, Protein Power, Ragi Bites.

---

## 4. Create collections

Go to **Products › Collections › Create collection**. Use exactly these titles so the handles match the theme's links:

| Title | Handle | Type and conditions |
|---|---|---|
| Pinni | `pinni` | Automated: *Product type* is equal to `Pinni` (6 products) |
| Panjeeri | `panjeeri` | Automated: *Product type* is equal to `Panjeeri` (1 product) |
| Best Sellers | `best-sellers` | Manual: add all 7 products, ordered the way you want them on the homepage |

For each collection:
- Add a collection image. It's used on the homepage category tiles and the collection banner.
- Write a short description.
- Under **Search engine listing**, fill in the page title and meta description.

> Shopify creates `/collections/all` automatically. Don't create it yourself.

---

## 5. Create pages

**Online Store › Pages › Add page**

| Title | Template (right-hand panel) | Content |
|---|---|---|
| About Us | `page.about` | Optional extra text. The design comes from the template sections, which you edit in the Theme Editor. |
| Contact | `page.contact` | Optional intro text. The form, email, phone and hours come from the theme. |

Check the handles are `about-us` and `contact` (shown under *Search engine listing*). For each page, fill in the SEO title and meta description.

### Policies
Go to **Settings › Policies**. Fill in, or use Shopify's templates for, the Refund, Privacy, Terms of service, Shipping and Contact information policies. The theme styles them automatically at `/policies/...` and lists them in the footer.

---

## 6. Build the menus

**Online Store › Navigation**

### Main menu (handle `main-menu`)
```
Home            → Home page
Pinni           → Collections › Pinni
   Alsi Pinni         → Products › Alsi Pinni (Flaxseed)
   Sugar-Free Pinni   → Products › Sugar-Free Pinni
   Atta Pinni         → Products › Atta Pinni
   Besan Pinni        → Products › Besan Pinni
Panjeeri        → Collections › Panjeeri
Best Sellers    → Collections › Best Sellers
About Us        → Pages › About Us
Contact Us      → Pages › Contact
```
To nest items under Pinni, drag each one slightly to the right beneath it.

> The theme shows exactly this menu automatically until you build your own, so the header is never empty.

### Footer menu (handle `footer`)
About Us, Contact, plus your policy pages (Refund policy, Shipping policy, Privacy policy, Terms of service). If you leave it empty, the footer shows About Us, Contact and all your policies automatically.

---

## 7. Theme settings

**Online Store › Themes › Customize**, then the ⚙ **Theme settings** icon.

| Setting group | What to do |
|---|---|
| **Logo & favicon** | Upload a **high-resolution logo**. The bundled logo is only 150 px wide, so it looks soft on large and retina screens. Add a 32×32 favicon. |
| **Colours** | Pre-set to match the logo: cream `#FFF8EC`, peach `#F8E6D0`, maroon `#5C1A1B`, saffron gold `#C8902E`, brown `#3B2417` / `#4E3318`. |
| **Typography** | Playfair Display (headings) and Lato (body). You can switch the body font to Poppins here. |
| **Shipping & cart** | **Free shipping threshold = 75.** This one setting drives the announcement bar, the cart progress bar, the product-page note and the "Why choose us" text. Also choose drawer or page cart. |
| **Contact details** | Enter your **real phone number** (or leave it empty to hide it everywhere), email, hours and optional address. No fake numbers are shipped. |
| **Social media** | Paste full profile URLs. Only networks with a URL show an icon, so there are no `#` links. |
| **Search engine** | Upload a social sharing image (1200×628) and check the title suffix and fallback description. |

### Make shipping match the theme
The theme only *displays* the threshold. To actually give free shipping, go to **Settings › Shipping and delivery › UK rates** and add a free rate with the condition *Order price ≥ £75.00*, alongside your paid standard rate below £75.

---

## 8. Homepage content (Theme Editor)

Open **Customize** on the homepage and fill in each section:

1. **Announcement bar.** Three rotating messages. `[threshold]` inserts £75 automatically.
2. **Hero slider.** Upload 3 slide images (2400×1200; a mobile version at 750×1000 is optional). Buttons are already linked.
3. **Our products.** Category tiles linked to Pinni, Panjeeri and Best Sellers. They use the collection images, or you can upload your own.
4. **Best sellers.** Shows the Best Sellers collection (all 7 products).
5. **Image with text (Our story).** Upload a lifestyle image.
6. **Why choose us.** Four features, already written.
7. **Lifestyle banner.** Upload a wide image.
8. **Testimonials.** **Replace the 3 sample reviews with real customer reviews.** Publishing made-up reviews is illegal in the UK under the DMCC Act 2024.
9. **Instagram-style gallery.** Upload 6 square photos and add your Instagram profile link.
10. **Newsletter.** Sign-ups appear in **Customers** with the tag `newsletter`.

Every heading, text, button, image and colour can be edited in the Theme Editor, and you can add, remove or reorder sections.

---

## 9. Filters, search and checkout

- **Filters.** Install Shopify's free **Search & Discovery** app (made by Shopify, no cost). Under *Filters*, add **Availability**, **Price**, **Product type** and **Weight** (the variant option). The collection page shows them automatically.
- **Search.** Works straight away: predictive results in the header search, and full results at `/search`.
- **Checkout.** Handled by Shopify. The cart drawer and cart page both send customers to Shopify checkout. Set up payments in **Settings › Payments**.
- **Customer login.** The header account icon appears when **Settings › Customer accounts** is enabled. The theme includes templates for classic customer accounts. With *new customer accounts*, Shopify hosts the login pages.

---

## 10. Pre-launch checklist

- [ ] All 7 products Active, with real prices, stock, images and alt text
- [ ] Ingredients and allergens checked against your labels
- [ ] Coconut Paan, Motichoor, Protein Power and Ragi Bites archived or deleted
- [ ] Collections `pinni`, `panjeeri` and `best-sellers` created, each with an image
- [ ] Main menu and footer menu built
- [ ] Logo (high-res), favicon and social sharing image uploaded
- [ ] Real phone number entered (or left empty), plus email and social links
- [ ] Free-shipping rate of £75 set up in Shipping and delivery
- [ ] Policies written
- [ ] Testimonials replaced with real reviews
- [ ] SEO title and description filled in for every product, collection and page
- [ ] Test order placed with Shopify's Bogus Gateway or a real card, then refunded
- [ ] Tested on a phone (360 px), a tablet (768 px) and a desktop (1440 px)
- [ ] Store password removed (**Online Store › Preferences**)
