<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Insight;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalysisTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_redirected_to_masuk(): void
    {
        $response = $this->get('/analisis');
        $response->assertRedirect('/masuk?next=%2Fanalisis');
    }

    public function test_user_without_business_is_redirected_to_profil_usaha(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/analisis');
        $response->assertRedirect('/profil-usaha');
    }

    public function test_authenticated_user_with_business_can_access_analisis(): void
    {
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi Santoso',
            'business_name' => 'Kopi Mantap',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Pemuda No. 10, Surabaya',
            'lat' => -7.2575,
            'lng' => 112.7521,
            'analysis_viewed_at' => null,
        ]);

        $this->assertNull($business->analysis_viewed_at);

        $response = $this->actingAs($user)->get('/analisis');
        $response->assertStatus(200);

        // Sets analysis_viewed_at on first successful view
        $business->refresh();
        $this->assertNotNull($business->analysis_viewed_at);
    }

    public function test_analysis_viewed_at_is_not_overwritten_if_already_set(): void
    {
        $originalTime = Carbon::now()->subDays(2);
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi Santoso',
            'business_name' => 'Kopi Mantap',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Pemuda No. 10, Surabaya',
            'lat' => -7.2575,
            'lng' => 112.7521,
            'analysis_viewed_at' => $originalTime,
        ]);

        $response = $this->actingAs($user)->get('/analisis');
        $response->assertStatus(200);

        $business->refresh();
        $this->assertSame($originalTime->toIso8601String(), $business->analysis_viewed_at->toIso8601String());
    }

    public function test_radius_parameter_and_geo_api(): void
    {
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi Santoso',
            'business_name' => 'Kopi Mantap',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Pemuda No. 10, Surabaya',
            'lat' => -7.2575,
            'lng' => 112.7521,
        ]);

        $response = $this->actingAs($user)->get('/api/analisis/geo?radius=500');
        $response->assertStatus(200);
        $response->assertJsonPath('radius', 500);
        $response->assertJsonPath('data.resolution', 'kecamatan');
        $this->assertNotNull($response->json('insight'));
    }

    public function test_sales_insight_generation_with_sufficient_data(): void
    {
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi Santoso',
            'business_name' => 'Kopi Mantap',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Pemuda No. 10, Surabaya',
            'lat' => -7.2575,
            'lng' => 112.7521,
        ]);

        // Create 12 transactions across 4 days
        for ($i = 0; $i < 12; $i++) {
            Transaction::create([
                'business_id' => $business->id,
                'type' => 'income',
                'amount' => 15000,
                'quantity' => 1,
                'item' => 'Kopi Susu',
                'category' => 'Minuman',
                'occurred_at' => now()->subDays($i % 4)->subHours(2),
                'source' => 'manual',
            ]);
        }

        $response = $this->actingAs($user)->get('/analisis');
        $response->assertStatus(200);

        // Check that an insight was saved in the insights table
        $insight = Insight::where('business_id', $business->id)->where('type', 'penjualan')->first();
        $this->assertNotNull($insight);
        $this->assertSame('Data transaksi kamu di LAPAK', $insight->source);
        $this->assertNotEmpty($insight->recommendation);
    }
}
