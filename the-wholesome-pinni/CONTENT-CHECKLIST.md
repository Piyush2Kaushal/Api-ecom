# Images and content you still need to add

The reference store (`wdrq5p-1t.myshopify.com`) **could not be reached** while this theme was built. The network blocked the connection and the domain did not resolve. Because of that, nothing could be copied from it: no images, prices, variant names, About Us text, policies or footer text. Everything below either needs adding or needs checking against your real store.

## A. Data to verify (highest priority)

| Item | Where it is | What to do |
|---|---|---|
| Variant names and **prices** (GBP) | `products.csv` → *Option1 Value*, *Variant Price* | Replace the draft 500g/1kg prices with your real ones. Add a *Variant Compare At Price* **only** for real discounts (that's what triggers the "Sale" badge). |
| **Ingredients** | CSV column *Ingredients (product.metafields.custom.ingredients)* | Check them against your recipes and labels. |
| **Allergens** | CSV column *Allergens (product.metafields.custom.allergens)* | Check them against your labels. This is a legal requirement. |
| Product descriptions | CSV *Body (HTML)* | Newly written and complete (no truncation). Compare with your old copy and merge anything you want to keep. |
| About Us text | Theme Editor → About page sections | Newly written. Replace it with your real family story if it's different. |
| Policies | Settings › Policies | Copy your existing policies across, or write new ones. |
| Stock quantities | Products › Inventory | Every variant is set to 50 to start. |
| Phone number | Theme settings › Contact details | Left empty on purpose (the fake +44 1234 567 890 is gone). |
| Email address | Theme settings › Contact details | Left empty. Enter your real support email. |
| Social profile URLs | Theme settings › Social media | Empty until you add them, so no `#` links show. |
| Testimonials | Homepage › Testimonials | 3 sample blocks are clearly labelled "Sample review". Replace them with real reviews. |

## B. Images to upload

All images should have **alt text**. Product media alt text is set in each product's media editor. Theme images use the image's own alt text, which you add in **Content › Files**.

| Image | Recommended size | Where |
|---|---|---|
| High-resolution logo (PNG/SVG, transparent or cream background) | 600 px wide or more | Theme settings › Logo |
| Favicon | 32 × 32 PNG | Theme settings › Logo & favicon |
| Social sharing image | 1200 × 628 | Theme settings › Search engine |
| Hero slide 1 – pinni on a brass plate | 2400 × 1200 (+ 750 × 1000 mobile) | Homepage › Hero slider |
| Hero slide 2 – sugar-free pinni on a peach backdrop | 2400 × 1200 | Homepage › Hero slider |
| Hero slide 3 – alsi panjeeri in a bowl | 2400 × 1200 | Homepage › Hero slider |
| Collection images: Pinni, Panjeeri, Best Sellers | 1200 × 900 | Products › Collections |
| Story image (hands rolling pinni / family kitchen) | 1000 × 1250 portrait | Homepage › Image with text |
| Lifestyle banner (pinni with chai, winter scene) | 2400 × 1000 | Homepage › Lifestyle banner |
| Instagram gallery | 6 × 800 × 800 square | Homepage › Gallery |
| About page: intro banner + 2 story images | 2400 × 1000, 1000 × 1250 | About page sections |
| **Product photos** (7 products) | 2–4 each, 1600 × 1600 square, on peach or brass styling | Each product's media |

Until you upload an image, the theme shows a warm maroon-and-gold background with illustrated pinni (in the hero and banners) or a soft peach placeholder (on cards), so nothing looks broken in the meantime.

## C. Optional extras
- Assign a variant image to each weight in the product admin. The product gallery switches to it when a customer picks that weight.
- Add a blog (Online Store › Blog posts), e.g. "The story of pinni" or "How to enjoy panjeeri". Blog and article templates are included.
- Translate the storefront text through **Settings › Languages** (all theme text lives in `locales/en.default.json`).
