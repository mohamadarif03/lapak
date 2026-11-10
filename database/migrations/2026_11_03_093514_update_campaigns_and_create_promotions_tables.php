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
        if (Schema::hasTable('campaigns')) {
            Schema::table('campaigns', function (Blueprint $table) {
                if (! Schema::hasColumn('campaigns', 'insight_id')) {
                    $table->unsignedBigInteger('insight_id')->nullable()->index()->after('business_id');
                }
                if (! Schema::hasColumn('campaigns', 'promo_name')) {
                    $table->string('promo_name')->nullable()->after('title');
                }
                if (! Schema::hasColumn('campaigns', 'offer_details')) {
                    $table->text('offer_details')->nullable()->after('promo_name');
                }
                if (! Schema::hasColumn('campaigns', 'valid_period')) {
                    $table->string('valid_period')->nullable()->after('offer_details');
                }
                if (! Schema::hasColumn('campaigns', 'contact')) {
                    $table->string('contact')->nullable()->after('valid_period');
                }
                if (! Schema::hasColumn('campaigns', 'style')) {
                    $table->string('style')->default('Hangat')->after('contact');
                }
                if (! Schema::hasColumn('campaigns', 'color_scheme')) {
                    $table->string('color_scheme')->default('deepgreen')->after('style');
                }
                if (! Schema::hasColumn('campaigns', 'format')) {
                    $table->string('format')->default('feed')->after('color_scheme');
                }
                if (! Schema::hasColumn('campaigns', 'copy')) {
                    $table->json('copy')->nullable()->after('format');
                }
                if (! Schema::hasColumn('campaigns', 'poster_path')) {
                    $table->string('poster_path')->nullable()->after('copy');
                }
                if (! Schema::hasColumn('campaigns', 'generated_by')) {
                    $table->string('generated_by')->default('template')->after('poster_path');
                }
                if (! Schema::hasColumn('campaigns', 'approved_at')) {
                    $table->timestamp('approved_at')->nullable()->after('status');
                }
                if (! Schema::hasColumn('campaigns', 'posted_at')) {
                    $table->timestamp('posted_at')->nullable()->after('approved_at');
                }
                if (! Schema::hasColumn('campaigns', 'post_platform')) {
                    $table->string('post_platform')->nullable()->after('posted_at');
                }
                if (! Schema::hasColumn('campaigns', 'post_external_id')) {
                    $table->string('post_external_id')->nullable()->after('post_platform');
                }
                if (! Schema::hasColumn('campaigns', 'idempotency_key')) {
                    $table->string('idempotency_key')->nullable()->index()->after('post_external_id');
                }
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
                $table->string('platform');
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

        if (Schema::hasTable('campaigns')) {
            Schema::table('campaigns', function (Blueprint $table) {
                $cols = [
                    'insight_id', 'promo_name', 'offer_details', 'valid_period',
                    'contact', 'style', 'color_scheme', 'format', 'copy',
                    'poster_path', 'generated_by', 'approved_at', 'posted_at',
                    'post_platform', 'post_external_id', 'idempotency_key',
                ];
                foreach ($cols as $col) {
                    if (Schema::hasColumn('campaigns', $col)) {
                        $table->dropColumn($col);
                    }
                }
            });
        }
    }
};
