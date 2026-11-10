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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'is_demo')) {
                $table->boolean('is_demo')->default(false)->after('password');
            }
            if (! Schema::hasColumn('users', 'demo_expires_at')) {
                $table->timestamp('demo_expires_at')->nullable()->after('is_demo');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'is_demo')) {
                $table->dropColumn('is_demo');
            }
            if (Schema::hasColumn('users', 'demo_expires_at')) {
                $table->dropColumn('demo_expires_at');
            }
        });
    }
};
