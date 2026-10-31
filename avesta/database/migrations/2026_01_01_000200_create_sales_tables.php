<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trade_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('requested_tier', 20);
            $table->string('status', 20)->default('pending')->index();
            $table->string('company_name');
            $table->string('vat_number', 50)->nullable();
            $table->string('company_number', 50)->nullable();
            $table->string('business_type', 80)->nullable();
            $table->string('website')->nullable();
            $table->string('business_address', 500)->nullable();
            $table->string('monthly_spend', 50)->nullable();
            $table->text('message')->nullable();
            $table->string('document_path')->nullable();
            $table->string('rejection_reason', 1000)->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('label', 60)->nullable();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->string('company')->nullable();
            $table->string('line1');
            $table->string('line2')->nullable();
            $table->string('city');
            $table->string('county')->nullable();
            $table->string('postcode', 20);
            $table->string('country', 2)->default('GB');
            $table->string('phone', 40)->nullable();
            $table->boolean('is_default_shipping')->default(false);
            $table->boolean('is_default_billing')->default(false);
            $table->timestamps();
        });

        Schema::create('guest_customers', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone', 40)->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->string('description')->nullable();
            $table->string('type', 20)->default('percent');
            $table->decimal('value', 12, 2)->default(0);
            $table->decimal('min_subtotal', 12, 2)->nullable();
            $table->decimal('max_discount', 12, 2)->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_per_customer')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->json('allowed_tiers')->nullable();
            $table->string('applies_to', 20)->default('all');
            $table->json('applies_ids')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('shipping_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->json('countries')->nullable();
            $table->json('postcode_prefixes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shipping_zone_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('delivery_estimate')->nullable();
            $table->string('type', 20)->default('flat');
            $table->decimal('cost', 12, 2)->default(0);
            $table->json('rates')->nullable();
            $table->boolean('free_shipping_eligible')->default(true);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('token', 64)->nullable()->unique();
            $table->string('email')->nullable();
            $table->string('coupon_code', 50)->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->timestamps();
        });

        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cart_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(1);
            $table->boolean('saved_for_later')->default(false);
            $table->timestamps();
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('number', 30)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('guest_customer_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedBigInteger('cart_id')->nullable();
            $table->string('customer_tier', 20)->default('retailer');
            $table->string('email');
            $table->string('phone', 40)->nullable();
            $table->json('shipping_address');
            $table->json('billing_address');
            $table->string('po_reference', 100)->nullable()->index();
            $table->text('customer_notes')->nullable();
            $table->string('currency', 3)->default('GBP');
            $table->decimal('exchange_rate', 12, 6)->default(1);
            $table->decimal('items_subtotal', 12, 2)->default(0);
            $table->decimal('savings_total', 12, 2)->default(0);
            $table->string('coupon_code', 50)->nullable();
            $table->decimal('coupon_discount', 12, 2)->default(0);
            $table->foreignId('shipping_method_id')->nullable()->constrained()->nullOnDelete();
            $table->string('shipping_method_name')->nullable();
            $table->decimal('shipping_total', 12, 2)->default(0);
            $table->decimal('net_total', 12, 2)->default(0);
            $table->decimal('vat_total', 12, 2)->default(0);
            $table->decimal('grand_total', 12, 2)->default(0);
            $table->decimal('refunded_total', 12, 2)->default(0);
            $table->string('status', 30)->default('pending_payment')->index();
            $table->string('payment_status', 30)->default('unpaid');
            $table->string('payment_method', 30)->nullable();
            $table->string('stripe_session_id')->nullable()->index();
            $table->string('stripe_payment_intent')->nullable();
            $table->string('carrier')->nullable();
            $table->string('tracking_number')->nullable();
            $table->string('tracking_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('stock_deducted')->default(false);
            $table->text('admin_notes')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('sku', 100)->nullable();
            $table->string('variant_label')->nullable();
            $table->string('image')->nullable();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_original_price', 12, 2);
            $table->decimal('unit_price', 12, 2);
            $table->decimal('coupon_discount', 12, 2)->default(0);
            $table->string('vat_mode', 10);
            $table->decimal('vat_rate', 5, 2)->default(0);
            $table->decimal('line_net', 12, 2);
            $table->decimal('line_vat', 12, 2);
            $table->decimal('line_total', 12, 2);
            $table->timestamps();
        });

        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('status', 30);
            $table->string('note', 1000)->nullable();
            $table->boolean('customer_notified')->default(false);
            $table->timestamps();
        });

        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('number', 40)->unique();
            $table->string('type', 20)->default('invoice');
            $table->decimal('amount', 12, 2);
            $table->string('note')->nullable();
            $table->timestamp('issued_at');
            $table->timestamps();
        });

        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('reason')->nullable();
            $table->string('stripe_refund_id')->nullable();
            $table->boolean('restocked')->default(false);
            $table->timestamps();
        });

        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['coupon_usages', 'refunds', 'invoices', 'order_status_histories', 'order_items', 'orders', 'cart_items', 'carts',
            'shipping_methods', 'shipping_zones', 'coupons', 'guest_customers', 'addresses', 'trade_applications'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
