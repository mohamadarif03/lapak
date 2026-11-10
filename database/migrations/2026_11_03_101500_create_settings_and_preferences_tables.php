<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add main_products and price_range to businesses
        Schema::table('businesses', function (Blueprint $table) {
            if (! Schema::hasColumn('businesses', 'main_products')) {
                $table->text('main_products')->nullable()->after('address');
            }
            if (! Schema::hasColumn('businesses', 'price_range')) {
                $table->string('price_range', 60)->nullable()->after('main_products');
            }
        });

        // 2. Add deletion_requested_at to users
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'deletion_requested_at')) {
                $table->timestamp('deletion_requested_at')->nullable()->after('last_login_at');
            }
        });

        // 3. Add purpose to otp_codes
        Schema::table('otp_codes', function (Blueprint $table) {
            if (! Schema::hasColumn('otp_codes', 'purpose')) {
                $table->string('purpose', 40)->default('login')->after('channel');
            }
        });

        // 4. Create user_preferences table
        if (! Schema::hasTable('user_preferences')) {
            Schema::create('user_preferences', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
                $table->string('text_size', 20)->default('normal'); // normal, besar
                $table->timestamps();
            });
        }

        // 5. Add soft deletes to transactions
        if (Schema::hasTable('transactions')) {
            Schema::table('transactions', function (Blueprint $table) {
                if (! Schema::hasColumn('transactions', 'deleted_at')) {
                    $table->softDeletes();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('transactions') && Schema::hasColumn('transactions', 'deleted_at')) {
            Schema::table('transactions', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        Schema::dropIfExists('user_preferences');

        Schema::table('otp_codes', function (Blueprint $table) {
            if (Schema::hasColumn('otp_codes', 'purpose')) {
                $table->dropColumn('purpose');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'deletion_requested_at')) {
                $table->dropColumn('deletion_requested_at');
            }
        });

        Schema::table('businesses', function (Blueprint $table) {
            if (Schema::hasColumn('businesses', 'price_range')) {
                $table->dropColumn('price_range');
            }
            if (Schema::hasColumn('businesses', 'main_products')) {
                $table->dropColumn('main_products');
            }
        });
    }
};
