<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\OtpCode;
use App\Models\SocialConnection;
use App\Models\User;
use App\Support\AuthHelper;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('settings_export_user:1');
        RateLimiter::clear('settings_delete_otp_user:1');
    }

    protected function createUserAndBusiness(string $phone = '+6281234567890'): array
    {
        $user = User::create([
            'name' => 'Pak Joko',
            'email' => 'joko_'.uniqid().'@example.com',
            'password' => bcrypt('password'),
            'phone' => $phone,
            'consent_at' => Carbon::now('Asia/Jakarta'),
            'consent_version' => '1.0',
        ]);

        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Pak Joko',
            'business_name' => 'Warung Joko',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Pemuda No. 10, Surabaya',
            'main_products' => 'Bebek Goreng, Es Jeruk',
            'price_range' => 'Rp 10-50 ribu',
        ]);

        return [$user, $business];
    }

    public function test_guest_is_redirected_to_masuk(): void
    {
        $response = $this->get('/pengaturan');
        $response->assertRedirect('/masuk?next=%2Fpengaturan');
    }

    public function test_user_without_business_is_redirected_to_profil_usaha(): void
    {
        $user = User::create([
            'name' => 'User Baru',
            'email' => 'baru_'.uniqid().'@example.com',
            'password' => bcrypt('password'),
            'phone' => '+6281299990099',
            'consent_at' => now(),
            'consent_version' => '1.0',
        ]);

        $response = $this->actingAs($user)->get('/pengaturan');
        $response->assertRedirect('/profil-usaha');
    }

    public function test_authenticated_user_with_business_can_access_pengaturan(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        $response = $this->actingAs($user)->get('/pengaturan');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('business.owner_name', 'Pak Joko')
            ->where('business.business_name', 'Warung Joko')
            ->where('user.phone_masked', AuthHelper::maskPhone($user->phone))
        );
    }

    public function test_pengaturan_displays_notice_when_pesan_is_profil_tersimpan(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        $response = $this->actingAs($user)->get('/pengaturan?pesan=profil-tersimpan');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('notice', 'Profil usaha tersimpan.')
        );
    }

    public function test_update_business_details_success(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        $response = $this->actingAs($user)->postJson('/api/pengaturan/business-details', [
            'main_products' => '  Bebek Bakar Madu, Teh Manis  ',
            'price_range' => 'Rp 50-200 ribu',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Tersimpan.',
            'business' => [
                'main_products' => 'Bebek Bakar Madu, Teh Manis',
                'price_range' => 'Rp 50-200 ribu',
            ],
        ]);

        $business->refresh();
        $this->assertSame('Bebek Bakar Madu, Teh Manis', $business->main_products);
        $this->assertSame('Rp 50-200 ribu', $business->price_range);
    }

    public function test_update_business_details_validation_failure(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        $response = $this->actingAs($user)->postJson('/api/pengaturan/business-details', [
            'main_products' => str_repeat('x', 205),
            'price_range' => 'Rp 1 miliar',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['main_products', 'price_range']);
    }

    public function test_update_text_size_preference(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        $response = $this->actingAs($user)->postJson('/api/pengaturan/text-size', [
            'text_size' => 'besar',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'text_size' => 'besar',
        ]);
        $response->assertCookie('lapak_text_size', 'besar');

        $this->assertDatabaseHas('user_preferences', [
            'user_id' => $user->id,
            'text_size' => 'besar',
        ]);

        // Fallback to normal on invalid
        $response2 = $this->actingAs($user)->postJson('/api/pengaturan/text-size', [
            'text_size' => 'raksasa',
        ]);

        $response2->assertStatus(200);
        $response2->assertJson(['text_size' => 'normal']);
    }

    public function test_disconnect_social_connection(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        $social = SocialConnection::create([
            'business_id' => $business->id,
            'platform' => 'instagram',
            'external_account_id' => 'ig_12345',
            'display_name' => '@warungjoko',
            'token_encrypted' => encrypt('secret-token'),
        ]);

        $response = $this->actingAs($user)->deleteJson("/api/pengaturan/social/{$social->id}");
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Akun diputus.',
        ]);

        $this->assertDatabaseMissing('social_connections', ['id' => $social->id]);
    }

    public function test_cannot_disconnect_another_business_social_connection(): void
    {
        [$userA, $businessA] = $this->createUserAndBusiness('+6281200000001');
        [$userB, $businessB] = $this->createUserAndBusiness('+6281200000002');

        $socialB = SocialConnection::create([
            'business_id' => $businessB->id,
            'platform' => 'instagram',
            'external_account_id' => 'ig_99999',
            'display_name' => '@bisnisb',
            'token_encrypted' => encrypt('secret-token-b'),
        ]);

        $response = $this->actingAs($userA)->deleteJson("/api/pengaturan/social/{$socialB->id}");
        $response->assertStatus(404);

        $this->assertDatabaseHas('social_connections', ['id' => $socialB->id]);
    }

    public function test_export_data_rate_limit(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        RateLimiter::clear('settings_export_user:'.$user->id);

        // 3 successful exports
        for ($i = 0; $i < 3; $i++) {
            $res = $this->actingAs($user)->postJson('/api/pengaturan/export');
            $res->assertStatus(200);
        }

        // 4th export exceeds rate limit
        $res4 = $this->actingAs($user)->postJson('/api/pengaturan/export');
        $res4->assertStatus(429);
        $res4->assertJson([
            'success' => false,
            'message' => 'Terlalu banyak ekspor. Coba lagi nanti.',
        ]);
    }

    public function test_request_delete_otp_sends_hapus_akun_otp(): void
    {
        [$user, $business] = $this->createUserAndBusiness();
        RateLimiter::clear('settings_delete_otp_user:'.$user->id);

        $response = $this->actingAs($user)->postJson('/api/pengaturan/delete-otp');
        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $otp = OtpCode::where('phone', $user->phone)->latest()->first();
        $this->assertNotNull($otp);
        $this->assertSame('hapus-akun', $otp->purpose);
    }

    public function test_delete_account_requires_hapus_keyword(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        $response = $this->actingAs($user)->deleteJson('/api/pengaturan/account', [
            'code' => '123456',
            'confirmation' => 'batal',
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Ketik HAPUS untuk melanjutkan.',
        ]);

        // User is not deleted
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_delete_account_full_success_flow(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        // Create delete OTP
        $rawCode = '654321';
        $codeHash = AuthHelper::hashOtp($user->phone, $rawCode);

        $otp = OtpCode::create([
            'phone' => $user->phone,
            'code_hash' => $codeHash,
            'channel' => 'whatsapp',
            'purpose' => 'hapus-akun',
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
        ]);

        $response = $this->actingAs($user)->deleteJson('/api/pengaturan/account', [
            'code' => $rawCode,
            'confirmation' => 'HAPUS',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'message' => 'Akunmu dan semua datanya sudah dihapus.',
        ]);

        // Assert user and business permanently wiped
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('businesses', ['id' => $business->id]);
    }

    public function test_delete_otp_cannot_be_used_to_login(): void
    {
        [$user, $business] = $this->createUserAndBusiness();

        $rawCode = '654321';
        $codeHash = AuthHelper::hashOtp($user->phone, $rawCode);

        OtpCode::create([
            'phone' => $user->phone,
            'code_hash' => $codeHash,
            'channel' => 'whatsapp',
            'purpose' => 'hapus-akun',
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
        ]);

        // Attempt login with this delete OTP
        $response = $this->postJson('/auth/otp/verify', [
            'phone' => $user->phone,
            'code' => $rawCode,
        ]);

        // Verification fails because login endpoint requires purpose 'login'
        $response->assertStatus(422);
    }

    public function test_login_page_displays_account_deleted_notice(): void
    {
        $response = $this->get('/masuk?pesan=akun-dihapus');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('sessionExpiredMessage', 'Akunmu dan semua datanya sudah dihapus.')
        );
    }
}
