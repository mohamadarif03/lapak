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
        if (! Schema::hasTable('campaigns')) {
            Schema::create('campaigns', function (Blueprint $table) {
                $table->id();
                $table->foreignId('business_id')->constrained()->cascadeOnDelete();
                $table->unsignedBigInteger('insight_id')->nullable()->index();
                $table->string('title');
                $table->string('promo_name')->nullable();
                $table->text('offer_details')->nullable();
                $table->string('valid_period')->nullable();
                $table->string('contact')->nullable();
                $table->string('style')->default('Hangat');
                $table->string('color_scheme')->default('deepgreen');
                $table->string('format')->default('feed'); // feed or story
                $table->json('copy')->nullable();
                $table->string('poster_path')->nullable();
                $table->string('generated_by')->default('template');
                $table->string('status')->default('draf'); // draf, disetujui, terjadwal, terposting
                $table->timestamp('approved_at')->nullable();
                $table->timestamp('posted_at')->nullable();
                $table->string('post_platform')->nullable();
                $table->string('post_external_id')->nullable();
                $table->string('idempotency_key')->nullable()->index();
                $table->timestamps();

                $table->index(['business_id', 'created_at']);
            });
        }

        if (! Schema::hasTable('campaign_versions')) {
            Schema::create('campaign_versions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
                $table->json('copy');
                $table->string('poster_path')->nullable();
                $table->timestamps();

                $table->index(['campaign_id', 'created_at']);
            });
        }

        if (! Schema::hasTable('social_connections')) {
            Schema::create('social_connections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('business_id')->constrained()->cascadeOnDelete();
                $table->string('platform'); // instagram, facebook, tiktok
                $table->string('external_account_id');
                $table->string('display_name');
                $table->text('token_encrypted');
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();

                $table->index(['business_id', 'platform']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_connections');
        Schema::dropIfExists('campaign_versions');
        Schema::dropIfExists('campaigns');
    }
};
