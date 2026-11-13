<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Campaign;
use App\Models\Insight;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PromotionTest extends TestCase
{
    use RefreshDatabase;

    protected function createBusinessUser(): array
    {
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Pak Budi',
            'business_name' => 'Kopi Mantap',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Malioboro No. 12, Yogyakarta',
            'lat' => -7.7956,
            'lng' => 110.3695,
        ]);

        return [$user, $business];
    }

    public function test_unauthenticated_user_is_redirected_to_masuk(): void
    {
        $response = $this->get('/promosi');
        $response->assertRedirect('/masuk?next=%2Fpromosi');
    }

    public function test_user_without_business_is_redirected_to_profil_usaha(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/promosi');
        $response->assertRedirect('/profil-usaha');
    }

    public function test_authenticated_user_with_business_can_access_promosi(): void
    {
        [$user, $business] = $this->createBusinessUser();

        // Ensure page visit alone does NOT create campaigns
        $this->assertSame(0, Campaign::where('business_id', $business->id)->count());

        $response = $this->actingAs($user)->get('/promosi');
        $response->assertStatus(200);

        // Verify count remains 0 after visit
        $this->assertSame(0, Campaign::where('business_id', $business->id)->count());
    }

    public function test_promosi_with_valid_insight_prefills_insight_data(): void
    {
        [$user, $business] = $this->createBusinessUser();

        $insight = Insight::create([
            'business_id' => $business->id,
            'type' => 'penjualan',
            'title' => 'Menu Es Kopi Susu paling ramai jam 15.00-16.00',
            'recommendation' => 'Buat promo diskon 15% pada jam sepi 13.00-15.00.',
            'source' => 'Data transaksi LAPAK',
            'data_date' => now()->toDateString(),
        ]);

        $response = $this->actingAs($user)->get("/promosi?insight={$insight->id}");
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Promotions/Index')
            ->has('activeInsight')
            ->where('activeInsight.id', $insight->id)
            ->where('activeInsight.title', 'Menu Es Kopi Susu paling ramai jam 15.00-16.00')
        );
    }

    public function test_promosi_with_invalid_insight_shows_warning(): void
    {
        [$user, $business] = $this->createBusinessUser();

        $response = $this->actingAs($user)->get('/promosi?insight=99999');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Promotions/Index')
            ->where('warning', 'Insight tidak ditemukan.')
            ->where('activeInsight', null)
        );
    }

    public function test_create_campaign_draft_via_api(): void
    {
        [$user, $business] = $this->createBusinessUser();

        $payload = [
            'promo_name' => 'Diskon Awal Bulan 20%',
            'offer_details' => 'Potongan 20% untuk semua minuman dingin',
            'valid_period' => '1-5 November 2026',
            'contact' => 'WA 08123456789',
            'style' => 'Hangat',
            'color_scheme' => 'deepgreen',
            'format' => 'feed',
            'idempotency_key' => 'key-test-123',
        ];

        $response = $this->actingAs($user)->postJson('/api/promosi', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'campaign' => [
                    'id',
                    'title',
                    'promo_name',
                    'offer_details',
                    'copy' => ['headline', 'subheadline', 'caption', 'hashtags'],
                    'poster_url',
                    'status',
                ],
                'campaign_id',
                'redirect_url',
            ]);

        $this->assertDatabaseHas('campaigns', [
            'business_id' => $business->id,
            'promo_name' => 'Diskon Awal Bulan 20%',
            'status' => 'draf',
        ]);

        $campaign = Campaign::where('business_id', $business->id)->first();
        $this->assertNotNull($campaign->poster_path);
        $this->assertCount(1, $campaign->versions);
    }

    public function test_create_campaign_is_idempotent_with_same_key(): void
    {
        [$user, $business] = $this->createBusinessUser();

        $payload = [
            'promo_name' => 'Promo Idemp',
            'offer_details' => 'Diskon hemat 10%',
            'idempotency_key' => 'unique-token-abc',
        ];

        $res1 = $this->actingAs($user)->postJson('/api/promosi', $payload);
        $res1->assertStatus(200);
        $campaignId1 = $res1->json('campaign_id');

        $res2 = $this->actingAs($user)->postJson('/api/promosi', $payload);
        $res2->assertStatus(200);
        $campaignId2 = $res2->json('campaign_id');

        $this->assertSame($campaignId1, $campaignId2);
        $this->assertSame(1, Campaign::where('business_id', $business->id)->count());
    }

    public function test_update_campaign_draft_saves_edits(): void
    {
        [$user, $business] = $this->createBusinessUser();

        $campaign = Campaign::create([
            'business_id' => $business->id,
            'title' => 'Promo Es Kopi',
            'promo_name' => 'Promo Es Kopi',
            'offer_details' => 'Diskon 10% setiap Senin',
            'copy' => [
                'headline' => 'Promo Es Kopi',
                'subheadline' => 'Diskon 10% setiap Senin',
                'caption' => 'Yuk mampir hari Senin!',
                'hashtags' => ['kopi', 'promo'],
            ],
            'poster_path' => 'promotions/test.png',
            'status' => 'draf',
            'format' => 'feed',
            'color_scheme' => 'deepgreen',
            'style' => 'Hangat',
        ]);

        $updatePayload = [
            'caption' => 'Caption baru yang lebih menarik!',
            'hashtags' => ['kopienak', 'promosenin', 'ngopihemat'],
            'headline' => 'Promo Es Kopi Mantap',
        ];

        $response = $this->actingAs($user)->putJson("/api/promosi/{$campaign->id}", $updatePayload);
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'campaign' => [
                    'copy' => [
                        'caption' => 'Caption baru yang lebih menarik!',
                        'hashtags' => ['kopienak', 'promosenin', 'ngopihemat'],
                    ],
                ],
            ]);

        $campaign->refresh();
        $this->assertSame('Caption baru yang lebih menarik!', $campaign->copy['caption']);
        $this->assertEquals(['kopienak', 'promosenin', 'ngopihemat'], $campaign->copy['hashtags']);
    }

    public function test_regenerate_campaign_creates_new_version(): void
    {
        [$user, $business] = $this->createBusinessUser();

        $campaign = Campaign::create([
            'business_id' => $business->id,
            'title' => 'Promo Kopi Susu',
            'promo_name' => 'Promo Kopi Susu',
            'offer_details' => 'Beli 2 gratis 1',
            'copy' => [
                'headline' => 'Promo Kopi Susu',
                'subheadline' => 'Beli 2 gratis 1',
                'caption' => 'Versi lama',
                'hashtags' => ['kopi'],
            ],
            'poster_path' => 'promotions/test-regen.png',
            'status' => 'draf',
            'format' => 'feed',
            'color_scheme' => 'deepgreen',
            'style' => 'Hangat',
        ]);

        $response = $this->actingAs($user)->postJson("/api/promosi/{$campaign->id}/regenerate");
        $response->assertStatus(200)->assertJson(['success' => true]);

        $this->assertDatabaseHas('campaign_versions', [
            'campaign_id' => $campaign->id,
        ]);
    }

    public function test_publish_campaign_in_demo_mode(): void
    {
        [$user, $business] = $this->createBusinessUser();

        $campaign = Campaign::create([
            'business_id' => $business->id,
            'title' => 'Diskon Mantap',
            'promo_name' => 'Diskon Mantap',
            'offer_details' => 'Diskon 15%',
            'copy' => [
                'headline' => 'Diskon Mantap',
                'subheadline' => 'Diskon 15%',
                'caption' => 'Ayo beli sekarang!',
                'hashtags' => ['diskon', 'kuliner'],
            ],
            'poster_path' => 'promotions/publish-test.png',
            'status' => 'draf',
            'format' => 'feed',
            'color_scheme' => 'deepgreen',
            'style' => 'Hangat',
        ]);

        $payload = [
            'platform' => 'instagram',
            'idempotency_key' => 'publish-key-001',
        ];

        $response = $this->actingAs($user)->postJson("/api/promosi/{$campaign->id}/publish", $payload);
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'status' => 'terposting',
                'demo' => true,
            ]);

        $campaign->refresh();
        $this->assertSame('terposting', $campaign->status);
        $this->assertNotNull($campaign->posted_at);
        $this->assertNotNull($campaign->post_external_id);
    }

    public function test_multi_tenancy_isolation_prevents_user_accessing_other_business_campaign(): void
    {
        [$userA, $bizA] = $this->createBusinessUser();
        [$userB, $bizB] = $this->createBusinessUser();

        $campaignA = Campaign::create([
            'business_id' => $bizA->id,
            'title' => 'Campaign Milik A',
            'promo_name' => 'Campaign Milik A',
            'offer_details' => 'Promo eksklusif A',
            'copy' => [
                'headline' => 'Headline A',
                'subheadline' => 'Sub A',
                'caption' => 'Caption A',
                'hashtags' => ['a'],
            ],
            'poster_path' => 'promotions/a.png',
            'status' => 'draf',
            'format' => 'feed',
            'color_scheme' => 'deepgreen',
            'style' => 'Hangat',
        ]);

        // User B tries to view via query param
        $resView = $this->actingAs($userB)->get("/promosi?campaign={$campaignA->id}");
        $resView->assertStatus(200);
        $resView->assertInertia(fn ($page) => $page
            ->where('warning', 'Promosi tidak ditemukan.')
            ->where('activeCampaign', null)
        );

        // User B tries to update campaign A
        $resUpdate = $this->actingAs($userB)->putJson("/api/promosi/{$campaignA->id}", [
            'caption' => 'Hacked caption',
        ]);
        $resUpdate->assertStatus(403);

        // User B tries to publish campaign A
        $resPublish = $this->actingAs($userB)->postJson("/api/promosi/{$campaignA->id}/publish", [
            'platform' => 'instagram',
        ]);
        $resPublish->assertStatus(403);

        // User B tries to download campaign A
        $resDownload = $this->actingAs($userB)->get("/api/promosi/{$campaignA->id}/download");
        $resDownload->assertStatus(403);
    }
}
