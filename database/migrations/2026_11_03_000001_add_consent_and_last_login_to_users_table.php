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
            $table->timestamp('consent_at')->nullable()->after('phone');
            $table->string('consent_version')->nullable()->after('consent_at');
            $table->timestamp('last_login_at')->nullable()->after('consent_version');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['consent_at', 'consent_version', 'last_login_at']);
        });
    }
};
