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
        if (Schema::hasTable('insights')) {
            Schema::table('insights', function (Blueprint $table) {
                if (! Schema::hasColumn('insights', 'facts')) {
                    $table->json('facts')->nullable()->after('data_date');
                }
                if (! Schema::hasColumn('insights', 'facts_hash')) {
                    $table->string('facts_hash')->nullable()->index()->after('facts');
                }
                if (! Schema::hasColumn('insights', 'radius_m')) {
                    $table->unsignedInteger('radius_m')->nullable()->after('facts_hash');
                }
                if (! Schema::hasColumn('insights', 'generated_by')) {
                    $table->string('generated_by')->default('template')->after('radius_m');
                }
                if (! Schema::hasColumn('insights', 'expires_at')) {
                    $table->timestamp('expires_at')->nullable()->after('generated_by');
                }
            });
        }

        if (! Schema::hasTable('geo_caches')) {
            Schema::create('geo_caches', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->json('payload');
                $table->string('source')->default('BPS');
                $table->date('data_date')->nullable();
                $table->timestamp('fetched_at');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('trend_caches')) {
            Schema::create('trend_caches', function (Blueprint $table) {
                $table->id();
                $table->string('key')->unique();
                $table->json('payload');
                $table->string('source')->default('Google Trends');
                $table->timestamp('fetched_at');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trend_caches');
        Schema::dropIfExists('geo_caches');

        if (Schema::hasTable('insights')) {
            Schema::table('insights', function (Blueprint $table) {
                $columns = ['facts', 'facts_hash', 'radius_m', 'generated_by', 'expires_at'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('insights', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};
