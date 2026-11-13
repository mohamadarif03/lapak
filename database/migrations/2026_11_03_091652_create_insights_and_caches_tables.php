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
        if (! Schema::hasTable('insights')) {
            Schema::create('insights', function (Blueprint $table) {
                $table->id();
                $table->foreignId('business_id')->constrained()->cascadeOnDelete();
                $table->string('type');
                $table->string('title');
                $table->text('recommendation');
                $table->string('source');
                $table->date('data_date');
                $table->json('facts')->nullable();
                $table->string('facts_hash')->nullable()->index();
                $table->unsignedInteger('radius_m')->nullable();
                $table->string('generated_by')->default('template');
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();

                $table->index(['business_id', 'type', 'created_at']);
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
        Schema::dropIfExists('insights');
    }
};
