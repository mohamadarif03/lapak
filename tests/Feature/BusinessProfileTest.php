<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_redirected_to_masuk(): void
    {
        $response = $this->get('/profil-usaha');
        $response->assertRedirect('/masuk?next=%2Fprofil-usaha');
    }

    public function test_new_user_without_business_sees_create_mode(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);

        $response = $this->actingAs($user)->get('/profil-usaha');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('BusinessProfile/Index')
            ->where('mode', 'create')
            ->where('business', null)
        );
    }

    public function test_user_with_business_without_ubah_param_is_redirected_to_dashboard(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);
        Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Bu Rara',
            'business_name' => 'Warung Rara',
            'business_type' => 'kuliner',
            'lat' => -7.9797,
            'lng' => 112.6304,
        ]);

        $response = $this->actingAs($user)->get('/profil-usaha');
        $response->assertRedirect(route('dashboard'));
    }

    public function test_user_with_business_with_ubah_param_sees_edit_mode_with_data(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Bu Rara',
            'business_name' => 'Warung Berkah Bu Rara',
            'business_type' => 'kuliner',
            'address' => 'Jl. Merdeka No. 10, Surabaya',
            'lat' => -7.2575,
            'lng' => 112.7521,
        ]);

        $response = $this->actingAs($user)->get('/profil-usaha?ubah=1');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('BusinessProfile/Index')
            ->where('mode', 'edit')
            ->where('business.owner_name', 'Bu Rara')
            ->where('business.business_name', 'Warung Berkah Bu Rara')
            ->where('business.business_type', 'kuliner')
        );
    }

    public function test_store_profile_validation_rejects_missing_fields(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);

        $response = $this->actingAs($user)->postJson('/profil-usaha', [
            'owner_name' => '',
            'business_name' => '',
            'business_type' => '',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['owner_name', 'business_name', 'business_type', 'location']);
    }

    public function test_store_profile_rejects_location_outside_indonesia(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);

        $response = $this->actingAs($user)->postJson('/profil-usaha', [
            'owner_name' => 'Bu Rara',
            'business_name' => 'Warung Rara',
            'business_type' => 'kuliner',
            'lat' => 1.3521, // Singapore
            'lng' => 103.8198,
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Lokasi harus berada di Indonesia.',
        ]);
    }

    public function test_store_profile_success_creates_business_and_redirects_to_dashboard(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);

        $response = $this->actingAs($user)->postJson('/profil-usaha', [
            'owner_name' => '  Bu   Rara ',
            'business_name' => 'Warung Berkah Bu Rara',
            'business_type' => 'kuliner',
            'address' => 'Jl. Diponegoro No. 8, Wonokromo, Surabaya',
            'lat' => -7.2575,
            'lng' => 112.7521,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'redirect' => route('dashboard'),
        ]);

        $this->assertDatabaseHas('businesses', [
            'user_id' => $user->id,
            'owner_name' => 'Bu Rara',
            'business_name' => 'Warung Berkah Bu Rara',
            'business_type' => 'kuliner',
            'address' => 'Jl. Diponegoro No. 8, Wonokromo, Surabaya',
        ]);
    }

    public function test_double_submit_does_not_create_duplicate_businesses(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);

        $payload = [
            'owner_name' => 'Mas Arif',
            'business_name' => 'Toko Arif Kelontong',
            'business_type' => 'dagang',
            'address' => 'Pasar Minggu, Jakarta Selatan',
            'lat' => -6.2847,
            'lng' => 106.8439,
        ];

        // 1st request
        $this->actingAs($user)->postJson('/profil-usaha', $payload)->assertStatus(200);

        // 2nd request (simulating double click or 2nd tab)
        $this->actingAs($user)->postJson('/profil-usaha', $payload)->assertStatus(200);

        $this->assertSame(1, Business::where('user_id', $user->id)->count());
    }

    public function test_edit_mode_updates_business_and_updates_timestamp(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Lama',
            'business_name' => 'Toko Lama',
            'business_type' => 'jasa',
            'lat' => -6.2088,
            'lng' => 106.8456,
        ]);

        $oldUpdatedAt = $business->updated_at;

        // Sleep 1 sec to ensure distinct timestamp
        sleep(1);

        $response = $this->actingAs($user)->postJson('/profil-usaha', [
            'mode' => 'edit',
            'ubah' => '1',
            'owner_name' => 'Baru',
            'business_name' => 'Toko Baru',
            'business_type' => 'fashion',
            'lat' => -7.2575,
            'lng' => 112.7521,
        ]);

        $response->assertStatus(200);

        $business->refresh();
        $this->assertSame('Baru', $business->owner_name);
        $this->assertSame('Toko Baru', $business->business_name);
        $this->assertSame('fashion', $business->business_type);
        $this->assertTrue($business->updated_at->gte($oldUpdatedAt));
    }

    public function test_user_cannot_access_or_modify_other_users_business(): void
    {
        $userA = User::factory()->create(['phone' => '+6281111111111']);
        $userB = User::factory()->create(['phone' => '+6282222222222']);

        Business::create([
            'user_id' => $userA->id,
            'owner_name' => 'Owner A',
            'business_name' => 'Bisnis A',
            'business_type' => 'kuliner',
            'lat' => -6.2,
            'lng' => 106.8,
        ]);

        // User B submits profile
        $this->actingAs($userB)->postJson('/profil-usaha', [
            'owner_name' => 'Owner B',
            'business_name' => 'Bisnis B',
            'business_type' => 'fashion',
            'lat' => -7.2,
            'lng' => 112.7,
        ])->assertStatus(200);

        // User A's business remains completely untouched
        $bizA = Business::where('user_id', $userA->id)->first();
        $this->assertSame('Owner A', $bizA->owner_name);
        $this->assertSame('Bisnis A', $bizA->business_name);
    }

    public function test_location_search_api_returns_suggestions(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);

        $response = $this->actingAs($user)->getJson('/api/location/search?q=Surabaya');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'suggestions' => [
                '*' => ['label', 'address', 'lat', 'lng'],
            ],
        ]);
    }
}
