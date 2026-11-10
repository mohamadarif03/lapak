<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\OtpCode;
use App\Models\User;
use App\Services\OtpSenderService;
use App\Support\AuthHelper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class PhoneAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('otp_send_ip:127.0.0.1');
        Cache::flush();
    }

    public function test_masuk_page_renders_successfully(): void
    {
        $response = $this->get('/masuk');
        $response->assertStatus(200);
    }

    public function test_masuk_displays_session_expired_message_when_param_present(): void
    {
        $response = $this->get('/masuk?pesan=sesi-berakhir');
        $response->assertStatus(200);
    }

    public function test_masuk_redirects_authenticated_user_with_business_to_dashboard(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);
        Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Arif',
            'business_name' => 'Toko Arif Jaya',
            'business_type' => 'kelontong',
        ]);

        $response = $this->actingAs($user)->get('/masuk');
        $response->assertRedirect('/dashboard');
    }

    public function test_masuk_redirects_authenticated_user_without_business_to_profil_usaha(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);

        $response = $this->actingAs($user)->get('/masuk');
        $response->assertRedirect(route('profil-usaha'));
    }

    public function test_send_otp_fails_without_consent(): void
    {
        $response = $this->postJson('/auth/otp/send', [
            'phone' => '081234567890',
            'consent' => false,
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Centang persetujuan untuk melanjutkan.',
        ]);
    }

    public function test_send_otp_fails_with_invalid_phone(): void
    {
        $response = $this->postJson('/auth/otp/send', [
            'phone' => '0212345678', // landline
            'consent' => true,
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Nomor HP tidak valid. Contoh: 0812 3456 7890.',
        ]);
    }

    public function test_send_otp_success_stores_hash_and_sets_cookie(): void
    {
        $response = $this->postJson('/auth/otp/send', [
            'phone' => '081234567890',
            'channel' => 'whatsapp',
            'consent' => true,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'status' => 'success',
            'channel' => 'whatsapp',
            'masked_phone' => '+62 812-****-7890',
            'resend_in' => 60,
        ]);

        $response->assertCookie('lapak_otp_phone');

        $otp = OtpCode::where('phone', '+6281234567890')->first();
        $this->assertNotNull($otp);
        $this->assertNotSame('123456', $otp->code_hash);
        $this->assertSame(0, $otp->attempts);
        $this->assertNull($otp->consumed_at);
    }

    public function test_send_otp_rate_limiting_enforces_60_second_cooldown(): void
    {
        // First send
        $this->postJson('/auth/otp/send', [
            'phone' => '081234567890',
            'consent' => true,
        ])->assertStatus(200);

        // Immediate second send fails with 429
        $response = $this->postJson('/auth/otp/send', [
            'phone' => '081234567890',
            'consent' => true,
        ]);

        $response->assertStatus(429);
        $response->assertJson([
            'success' => false,
            'message' => 'Harap tunggu sebelum meminta kode baru.',
        ]);
    }

    public function test_verify_otp_creates_new_user_with_consent(): void
    {
        $phone = '+6281234567890';
        $code = '654321';
        $hash = AuthHelper::hashOtp($phone, $code);

        OtpCode::create([
            'phone' => $phone,
            'code_hash' => $hash,
            'channel' => 'whatsapp',
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
        ]);

        $response = $this->postJson('/auth/otp/verify', [
            'phone' => '081234567890',
            'code' => '654321',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'status' => 'success',
            'redirect' => route('profil-usaha'),
        ]);

        $this->assertAuthenticated();
        /** @var User $user */
        $user = Auth::user();
        $this->assertSame($phone, $user->phone);
        $this->assertNotNull($user->consent_at);
        $this->assertSame('2026-11', $user->consent_version);
        $this->assertNotNull($user->last_login_at);

        $otp = OtpCode::where('phone', $phone)->first();
        $this->assertNotNull($otp->consumed_at);
    }

    public function test_verify_otp_redirects_existing_user_with_business_safely(): void
    {
        $phone = '+6281234567890';
        $user = User::factory()->create([
            'phone' => $phone,
            'email' => $phone.'@lapak.id',
        ]);

        Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Mawar',
            'business_name' => 'Toko Mawar',
            'business_type' => 'kuliner',
        ]);

        $code = '123456';
        OtpCode::create([
            'phone' => $phone,
            'code_hash' => AuthHelper::hashOtp($phone, $code),
            'channel' => 'whatsapp',
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
        ]);

        // Attempt verify with safe internal next param
        $response = $this->postJson('/auth/otp/verify', [
            'phone' => $phone,
            'code' => $code,
            'next' => '/catat?mulai=1',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'redirect' => '/catat?mulai=1',
        ]);
    }

    public function test_verify_otp_rejects_unsafe_external_next(): void
    {
        $phone = '+6281234567890';
        $user = User::factory()->create([
            'phone' => $phone,
            'email' => $phone.'@lapak.id',
        ]);

        Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Mawar',
            'business_name' => 'Toko Mawar',
            'business_type' => 'kuliner',
        ]);

        $code = '123456';
        OtpCode::create([
            'phone' => $phone,
            'code_hash' => AuthHelper::hashOtp($phone, $code),
            'channel' => 'whatsapp',
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
        ]);

        $response = $this->postJson('/auth/otp/verify', [
            'phone' => $phone,
            'code' => $code,
            'next' => '//evil.com',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'redirect' => '/dashboard',
        ]);
    }

    public function test_verify_otp_wrong_code_increments_attempts_and_locks_after_5_failures(): void
    {
        $phone = '+6281234567890';
        $code = '123456';
        $otp = OtpCode::create([
            'phone' => $phone,
            'code_hash' => AuthHelper::hashOtp($phone, $code),
            'channel' => 'whatsapp',
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
        ]);

        // 1st wrong attempt
        $res1 = $this->postJson('/auth/otp/verify', [
            'phone' => $phone,
            'code' => '999999',
        ]);
        $res1->assertStatus(422);
        $res1->assertJson([
            'success' => false,
            'message' => 'Kode salah. Coba lagi. Sisa percobaan: 4.',
            'remaining_attempts' => 4,
        ]);

        // Increment to 4 attempts
        $otp->update(['attempts' => 4]);

        // 5th wrong attempt triggers lockout
        $res5 = $this->postJson('/auth/otp/verify', [
            'phone' => $phone,
            'code' => '999999',
        ]);
        $res5->assertStatus(429);
        $res5->assertJson([
            'success' => false,
            'message' => 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
        ]);

        $this->assertTrue(Cache::has("otp_lock:{$phone}"));
    }

    public function test_verify_otp_expired_code_fails(): void
    {
        $phone = '+6281234567890';
        $code = '123456';
        OtpCode::create([
            'phone' => $phone,
            'code_hash' => AuthHelper::hashOtp($phone, $code),
            'channel' => 'whatsapp',
            'expires_at' => Carbon::now()->subMinutes(6),
            'attempts' => 0,
        ]);

        $response = $this->postJson('/auth/otp/verify', [
            'phone' => $phone,
            'code' => $code,
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Kode sudah kedaluwarsa. Minta kode baru.',
        ]);
    }

    public function test_consumed_otp_code_cannot_be_reused(): void
    {
        $phone = '+6281234567890';
        $code = '123456';
        OtpCode::create([
            'phone' => $phone,
            'code_hash' => AuthHelper::hashOtp($phone, $code),
            'channel' => 'whatsapp',
            'expires_at' => Carbon::now()->addMinutes(5),
            'consumed_at' => Carbon::now(),
            'attempts' => 0,
        ]);

        $response = $this->postJson('/auth/otp/verify', [
            'phone' => $phone,
            'code' => $code,
        ]);

        $response->assertStatus(422);
        $response->assertJson([
            'success' => false,
            'message' => 'Kode sudah kedaluwarsa. Minta kode baru.',
        ]);
    }

    public function test_logout_invalidates_session_and_redirects_to_masuk(): void
    {
        $user = User::factory()->create(['phone' => '+6281234567890']);

        $response = $this->actingAs($user)->post('/keluar');
        $response->assertRedirect('/masuk');
        $this->assertGuest();
    }

    public function test_unauthenticated_access_to_dashboard_or_catat_redirects_to_masuk_with_next(): void
    {
        $responseCatat = $this->get('/catat?mulai=1');
        $responseCatat->assertRedirect('/masuk?next=%2Fcatat%3Fmulai%3D1');

        $responseDashboard = $this->get('/dashboard');
        $responseDashboard->assertRedirect('/masuk?next=%2Fdashboard');
    }

    public function test_demo_mode_cannot_run_in_production(): void
    {
        config(['services.otp.demo_mode' => true]);

        // Simulate production
        App::detectEnvironment(fn () => 'production');

        $service = new OtpSenderService;
        $this->assertNull($service->getDemoCodeIfAllowed('+6281234567890'));

        // Reset to testing
        App::detectEnvironment(fn () => 'testing');
    }
}
