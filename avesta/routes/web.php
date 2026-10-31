<?php

use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Admin;
use App\Http\Controllers\Admin\Resources;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Store;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Storefront
|--------------------------------------------------------------------------
*/
Route::get('/', [Store\HomeController::class, 'index'])->name('home');
Route::get('/shop', [Store\CatalogController::class, 'shop'])->name('shop');
Route::get('/search', [Store\CatalogController::class, 'shop'])->name('search');
Route::get('/search/suggest', [Store\CatalogController::class, 'suggest'])->middleware('throttle:60,1')->name('search.suggest');
Route::get('/category/{slug}', [Store\CatalogController::class, 'category'])->name('category.show');
Route::get('/brands', [Store\CatalogController::class, 'brands'])->name('brands');
Route::get('/brand/{slug}', [Store\CatalogController::class, 'brand'])->name('brand.show');
Route::get('/product/{slug}', [Store\ProductController::class, 'show'])->name('product.show');
Route::post('/product/{product}/notify', [Store\ProductController::class, 'notify'])->middleware('throttle:10,1')->name('product.notify');
Route::post('/product/{product}/question', [Store\ProductController::class, 'question'])->middleware('throttle:5,1')->name('product.question');

Route::get('/cart', [Store\CartController::class, 'index'])->name('cart');
Route::get('/cart/summary', [Store\CartController::class, 'summary'])->name('cart.summary');
Route::post('/cart', [Store\CartController::class, 'add'])->middleware('throttle:60,1')->name('cart.add');
Route::patch('/cart/{item}', [Store\CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/{item}', [Store\CartController::class, 'remove'])->name('cart.remove');
Route::post('/cart/{item}/save', [Store\CartController::class, 'toggleSaved'])->name('cart.save');
Route::post('/cart-coupon', [Store\CartController::class, 'applyCoupon'])->middleware('throttle:20,1')->name('cart.coupon');
Route::delete('/cart-coupon', [Store\CartController::class, 'removeCoupon'])->name('cart.coupon.remove');

Route::get('/checkout', [Store\CheckoutController::class, 'show'])->name('checkout');
Route::post('/checkout/quote', [Store\CheckoutController::class, 'quote'])->name('checkout.quote');
Route::post('/checkout', [Store\CheckoutController::class, 'store'])->middleware('throttle:10,1')->name('checkout.store');
Route::get('/checkout/success/{number}', [Store\CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/checkout/cancelled/{number}', [Store\CheckoutController::class, 'cancelled'])->name('checkout.cancelled');
Route::post('/stripe/webhook', Store\StripeWebhookController::class)->name('stripe.webhook');

Route::get('/track', [Store\PageController::class, 'track'])->name('track');
Route::get('/invoice/{invoice}', [Store\PageController::class, 'publicInvoice'])->name('invoice.public');
Route::get('/training', [Store\PageController::class, 'training'])->name('training');
Route::post('/training', [Store\PageController::class, 'sendTraining'])->middleware('throttle:5,1')->name('training.store');
Route::get('/contact', [Store\PageController::class, 'contact'])->name('contact');
Route::post('/contact', [Store\PageController::class, 'sendContact'])->middleware('throttle:5,1')->name('contact.store');
Route::get('/trade-accounts', [Store\PageController::class, 'trade'])->name('trade');
Route::post('/newsletter', [Store\PageController::class, 'newsletter'])->middleware('throttle:5,1')->name('newsletter');
Route::post('/currency', [Store\PageController::class, 'currency'])->name('currency');
Route::get('/sitemap.xml', [Store\PageController::class, 'sitemap'])->name('sitemap');
Route::get('/robots.txt', [Store\PageController::class, 'robots'])->name('robots');

/*
|--------------------------------------------------------------------------
| Customer authentication
|--------------------------------------------------------------------------
*/
Route::middleware('guest:web')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1')->name('register.store');
    Route::get('/forgot-password', [AuthController::class, 'showForgot'])->name('password.request');
    Route::post('/forgot-password', [AuthController::class, 'sendReset'])->middleware('throttle:5,1')->name('password.email');
    Route::get('/reset-password', [AuthController::class, 'showReset'])->name('password.reset');
    Route::post('/reset-password', [AuthController::class, 'reset'])->middleware('throttle:10,1')->name('password.update');
});
Route::middleware('auth:web')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/verify', [AuthController::class, 'showVerify'])->name('verify.show');
    Route::post('/verify', [AuthController::class, 'verify'])->middleware('throttle:10,1')->name('verify.store');
    Route::post('/verify/resend', [AuthController::class, 'resend'])->middleware('throttle:3,1')->name('verify.resend');
});

/*
|--------------------------------------------------------------------------
| Customer account
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:web', 'customer'])->group(function () {
    Route::post('/wishlist/{product}', [Store\WishlistController::class, 'toggle'])->name('wishlist.toggle');
    Route::post('/product/{product}/review', [Store\ProductController::class, 'review'])->name('product.review');
    Route::post('/cart/quick-order', [Store\CartController::class, 'quickOrder'])->name('cart.quick');
    Route::get('/cart/quote', [Store\CartController::class, 'quote'])->name('cart.quote');

    Route::prefix('account')->name('account.')->controller(AccountController::class)->group(function () {
        Route::get('/', 'dashboard')->name('dashboard');
        Route::get('/orders', 'orders')->name('orders');
        Route::get('/orders/{number}', 'order')->name('orders.show');
        Route::post('/orders/{number}/reorder', 'reorder')->name('orders.reorder');
        Route::get('/invoices', 'invoices')->name('invoices');
        Route::get('/invoices/{invoice}/download', 'downloadInvoice')->name('invoices.download');
        Route::get('/purchase-orders', 'purchaseOrders')->name('purchase-orders');
        Route::get('/addresses', 'addresses')->name('addresses');
        Route::post('/addresses', 'saveAddress')->name('addresses.store');
        Route::put('/addresses/{address}', 'saveAddress')->name('addresses.update');
        Route::delete('/addresses/{address}', 'deleteAddress')->name('addresses.destroy');
        Route::get('/profile', 'profile')->name('profile');
        Route::put('/profile', 'updateProfile')->name('profile.update');
        Route::put('/password', 'updatePassword')->name('password.update');
        Route::get('/wishlist', 'wishlist')->name('wishlist');
        Route::get('/trade', 'trade')->name('trade');
        Route::post('/trade', 'applyTrade')->name('trade.apply');
        Route::get('/quick-order', 'quickOrder')->name('quick-order');
        Route::get('/enquiries', 'enquiries')->name('enquiries');
    });
});

/*
|--------------------------------------------------------------------------
| Admin panel
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->name('admin.')->group(function () {
    Route::middleware('guest:admin')->group(function () {
        Route::get('/login', [Admin\AuthController::class, 'show'])->name('login');
        Route::post('/login', [Admin\AuthController::class, 'login'])->middleware('throttle:10,1')->name('login.store');
        Route::post('/login/verify', [Admin\AuthController::class, 'verify'])->middleware('throttle:10,1')->name('login.verify');
    });

    Route::middleware('admin')->group(function () {
        Route::post('/logout', [Admin\AuthController::class, 'logout'])->name('logout');
        Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');
        Route::get('/reports', [Admin\DashboardController::class, 'reports'])->name('reports');
        Route::get('/account', [Admin\AuthController::class, 'account'])->name('account');
        Route::put('/account', [Admin\AuthController::class, 'updateAccount'])->name('account.update');
        Route::post('/upload', Admin\UploadController::class)->name('upload');

        // Products
        Route::get('/products/import', [Admin\ProductController::class, 'importForm'])->name('products.import');
        Route::post('/products/import', [Admin\ProductController::class, 'import'])->name('products.import.store');
        Route::get('/products/export', [Admin\ProductController::class, 'export'])->name('products.export');
        Route::get('/products/template', [Admin\ProductController::class, 'template'])->name('products.template');
        Route::post('/products/bulk', [Admin\ProductController::class, 'bulk'])->name('products.bulk');
        Route::post('/products/{product}/duplicate', [Admin\ProductController::class, 'duplicate'])->name('products.duplicate');
        Route::resource('products', Admin\ProductController::class)->except('show');

        // Categories
        Route::get('/categories', [Admin\CategoryController::class, 'index'])->name('categories.index');
        Route::post('/categories', [Admin\CategoryController::class, 'store'])->name('categories.store');
        Route::post('/categories/reorder', [Admin\CategoryController::class, 'reorder'])->name('categories.reorder');
        Route::put('/categories/{category}', [Admin\CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [Admin\CategoryController::class, 'destroy'])->name('categories.destroy');

        // Orders & invoices
        Route::get('/orders', [Admin\OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/export', [Admin\OrderController::class, 'export'])->name('orders.export');
        Route::get('/orders/abandoned', [Admin\OrderController::class, 'abandoned'])->name('orders.abandoned');
        Route::get('/orders/{order}', [Admin\OrderController::class, 'show'])->name('orders.show');
        Route::post('/orders/{order}/status', [Admin\OrderController::class, 'updateStatus'])->name('orders.status');
        Route::post('/orders/{order}/paid', [Admin\OrderController::class, 'markPaid'])->name('orders.paid');
        Route::post('/orders/{order}/notes', [Admin\OrderController::class, 'notes'])->name('orders.notes');
        Route::post('/orders/{order}/refund', [Admin\OrderController::class, 'refund'])->name('orders.refund');
        Route::post('/orders/{order}/resend', [Admin\OrderController::class, 'resendConfirmation'])->name('orders.resend');
        Route::get('/invoices', [Admin\OrderController::class, 'invoices'])->name('invoices.index');
        Route::get('/invoices/{invoice}/download', [Admin\OrderController::class, 'invoice'])->name('invoices.download');
        Route::get('/invoices/{invoice}/view', [Admin\OrderController::class, 'invoicePreview'])->name('invoices.view');

        // Customers & approvals
        Route::get('/customers', [Admin\CustomerController::class, 'index'])->name('customers.index');
        Route::get('/customers/export', [Admin\CustomerController::class, 'export'])->name('customers.export');
        Route::get('/customers/guest/{guest}', [Admin\CustomerController::class, 'showGuest'])->name('customers.guest');
        Route::get('/customers/{user}', [Admin\CustomerController::class, 'show'])->name('customers.show');
        Route::put('/customers/{user}', [Admin\CustomerController::class, 'update'])->name('customers.update');
        Route::delete('/customers/{user}', [Admin\CustomerController::class, 'destroy'])->name('customers.destroy');
        Route::get('/approvals', [Admin\CustomerController::class, 'approvals'])->name('approvals.index');
        Route::post('/approvals/{application}/approve', [Admin\CustomerController::class, 'approve'])->name('approvals.approve');
        Route::post('/approvals/{application}/reject', [Admin\CustomerController::class, 'reject'])->name('approvals.reject');

        // Settings
        Route::get('/settings', [Admin\SettingController::class, 'index'])->name('settings');
        Route::post('/settings', [Admin\SettingController::class, 'update'])->name('settings.update');

        Route::get('/newsletter/export', [Resources\NewsletterResource::class, 'export'])->name('newsletter.export');

        // Schema-driven sections
        foreach ([
            Resources\BrandResource::class, Resources\CouponResource::class, Resources\ShippingZoneResource::class,
            Resources\ShippingMethodResource::class, Resources\HeroSlideResource::class, Resources\HomeSectionResource::class,
            Resources\PageResource::class, Resources\MenuItemResource::class, Resources\PopupResource::class,
            Resources\RedirectResource::class, Resources\TrainingCourseResource::class, Resources\TrainingEnquiryResource::class,
            Resources\ContactEnquiryResource::class, Resources\ReviewResource::class, Resources\NewsletterResource::class,
        ] as $resource) {
            $resource::routes();
        }
    });
});

// CMS pages live at the root (e.g. /delivery, /privacy-policy). Keep this last.
Route::get('/{slug}', [Store\PageController::class, 'show'])->where('slug', '[a-z0-9\-]+')->name('page.show');
