<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Campaign;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LandingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('demo_create_ip:127.0.0.1');
    }

    public function test_public_landing_page_loads_with_200_for_guests(): void
    {
        $view = class_exists('\Laravel\Fortify\Fortify') ? 'welcome' : 'Welcome';
        $response = $this->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component($view)
            ->has('site')
            ->has('stats')
            ->has('contact')
            ->where('isLoggedIn', false)
            ->where('ctaTarget', '/masuk')
            ->where('ctaLabel', 'Mulai Sekarang')
        );
    }

    public function test_landing_page_updates_cta_for_authenticated_users(): void
    {
        $view = class_exists('\Laravel\Fortify\Fortify') ? 'welcome' : 'Welcome';
        $user = User::create([
            'name' => 'Pemilik Toko',
            'phone' => '081200000001',
            'email' => 'toko@example.com',
            'password' => bcrypt('password'),
        ]);

        Business::create([
            'user_id' => $user->id,
            'business_name' => 'Toko Barokah',
            'owner_name' => 'Pemilik Toko',
            'business_type' => 'Retail',
            'address' => 'Jl. Pasar Baru No. 1',
        ]);

        $response = $this->actingAs($user)->get('/');

        $response->assertStatus(200);
        $response->assertInertia(fn (Assert $page) => $page
            ->component($view)
            ->where('isLoggedIn', true)
            ->where('ctaTarget', '/dashboard')
            ->where('ctaLabel', 'Buka Dashboard')
        );
    }

    public function test_start_demo_returns_404_when_demo_disabled(): void
    {
        Config::set('demo.enabled', false);

        $response = $this->post('/api/demo/start');

        $response->assertStatus(404);
    }

    public function test_start_demo_creates_demo_user_business_and_redirects_to_dashboard(): void
    {
        Config::set('demo.enabled', true);
        Config::set('app.env', 'local');

        $response = $this->post('/api/demo/start');

        $response->assertRedirect('/dashboard');
        $this->assertAuthenticated();

        $user = auth()->user();
        $this->assertTrue((bool) $user->is_demo);
        $this->assertNotNull($user->demo_expires_at);

        $business = Business::where('user_id', $user->id)->first();
        $this->assertNotNull($business);

        // Check seeded data
        $this->assertGreaterThan(0, $business->transactions()->count());
        $this->assertGreaterThan(0, $business->insights()->count());
    }

    public function test_start_demo_reuses_existing_active_demo_session(): void
    {
        Config::set('demo.enabled', true);
        Config::set('app.env', 'local');

        $firstResponse = $this->post('/api/demo/start');
        $firstResponse->assertRedirect('/dashboard');
        $initialUserId = auth()->id();

        // Second call while logged in as demo user
        $secondResponse = $this->post('/api/demo/start');
        $secondResponse->assertRedirect('/dashboard');
        $this->assertSame($initialUserId, auth()->id());
    }

    public function test_start_demo_is_rate_limited_per_ip(): void
    {
        Config::set('demo.enabled', true);
        Config::set('app.env', 'local');

        // Hit rate limiter 5 times
        for ($i = 0; $i < 5; $i++) {
            RateLimiter::hit('demo_create_ip:127.0.0.1', 3600);
        }

        // 6th request from guest
        auth()->logout();
        $response = $this->post('/api/demo/start');

        $response->assertRedirect('/?pesan=demo-sibuk');
    }

    public function test_exit_demo_cleans_up_and_redirects_to_landing(): void
    {
        Config::set('demo.enabled', true);
        Config::set('app.env', 'local');

        $this->post('/api/demo/start');
        $demoUserId = auth()->id();
        $this->assertNotNull($demoUserId);

        $exitResponse = $this->post('/api/demo/exit');
        $exitResponse->assertRedirect('/?pesan=demo-berakhir');

        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['id' => $demoUserId]);
    }

    public function test_demo_user_restrictions_in_settings_and_promotion(): void
    {
        Config::set('demo.enabled', true);
        Config::set('app.env', 'local');

        $this->post('/api/demo/start');
        $user = auth()->user();
        $business = Business::where('user_id', $user->id)->first();

        // 1. Settings restrictions: OTP request blocked
        $otpResponse = $this->postJson('/api/pengaturan/delete-otp');
        $otpResponse->assertStatus(403);
        $otpResponse->assertJsonFragment(['message' => 'Tidak tersedia di mode demo.']);

        // 2. Promotion simulated publishing
        $campaign = Campaign::create([
            'business_id' => $business->id,
            'title' => 'Promo Es Kopi Demo',
            'promo_name' => 'Promo Es Kopi Demo',
            'offer_details' => 'Diskon 20% khusus demo',
            'status' => 'disetujui',
        ]);

        $publishResponse = $this->postJson("/api/promosi/{$campaign->id}/publish", [
            'platform' => 'whatsapp',
        ]);

        $publishResponse->assertStatus(200);
        $publishResponse->assertJsonFragment(['simulated' => true]);
        $this->assertSame('terposting', $campaign->fresh()->status);
    }

    public function test_demo_user_ai_quota_limit(): void
    {
        Config::set('demo.enabled', true);
        Config::set('app.env', 'local');

        $this->post('/api/demo/start');
        $user = auth()->user();

        $demoKey = 'demo_ai_stt:'.$user->id;
        RateLimiter::clear($demoKey);

        // Consume 20 quota attempts
        for ($i = 0; $i < 20; $i++) {
            RateLimiter::hit($demoKey, 3600);
        }

        // 21st attempt to create campaign via API
        $response = $this->postJson('/api/promosi', [
            'promo_name' => 'Promo Ke-21',
            'offer_details' => 'Promo diskon ke-21 yang melebihi kuota',
        ]);

        $response->assertStatus(429);
        $response->assertJsonFragment(['message' => 'Batas demo tercapai. Daftar untuk memakai penuh.']);
    }

    public function test_robots_txt_and_sitemap_xml_endpoints(): void
    {
        $robots = $this->get('/robots.txt');
        $robots->assertStatus(200);
        $robots->assertHeader('Content-Type', 'text/plain; charset=UTF-8');
        $robots->assertSee('User-agent: *');
        $robots->assertSee('Disallow: /dashboard');
        $robots->assertSee('Sitemap:');

        $sitemap = $this->get('/sitemap.xml');
        $sitemap->assertStatus(200);
        $sitemap->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $sitemap->assertSee('<loc>', false);
        $sitemap->assertSee('/syarat', false);
    }
}
