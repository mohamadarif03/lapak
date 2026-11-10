<?php

namespace Tests\Unit;

use App\Models\Business;
use App\Models\User;
use App\Support\LandingHelper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingHelperTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_visible_stats_only_returns_items_with_source_and_year(): void
    {
        $rawStats = [
            [
                'value' => '64,2 Juta+',
                'label' => 'Unit UMKM di Indonesia',
                'source' => 'Kemenkop UKM',
                'source_url' => 'https://kemenkopukm.go.id',
                'year' => 2024,
            ],
            [
                'value' => '99%',
                'label' => 'Tanpa sumber',
                'source' => '',
                'year' => 2024,
            ],
            [
                'value' => '80%',
                'label' => 'Tanpa tahun',
                'source' => 'BPS',
                'year' => null,
            ],
        ];

        $visible = LandingHelper::getVisibleStats($rawStats);

        $this->assertCount(1, $visible);
        $this->assertSame('64,2 Juta+', $visible[0]['value']);
        $this->assertSame('Sumber: Kemenkop UKM, 2024', $visible[0]['source_text']);
        $this->assertSame('https://kemenkopukm.go.id', $visible[0]['source_url']);
    }

    public function test_build_contact_links_validates_email_and_whatsapp(): void
    {
        $rawContact = [
            'email' => 'halo@lapak.id',
            'whatsapp' => '6281234567890',
        ];

        $links = LandingHelper::buildContactLinks($rawContact);

        $this->assertSame('halo@lapak.id', $links['email']);
        $this->assertSame('6281234567890', $links['whatsapp']);
        $this->assertSame('https://wa.me/6281234567890', $links['whatsapp_url']);

        // Test with invalid email and non-international digits
        $invalidContact = [
            'email' => 'bukan-email',
            'whatsapp' => '+62 812-3456-7890', // has '+' and spaces
        ];

        $invalidLinks = LandingHelper::buildContactLinks($invalidContact);
        $this->assertNull($invalidLinks['email']);
        $this->assertNull($invalidLinks['whatsapp']);
        $this->assertNull($invalidLinks['whatsapp_url']);
    }

    public function test_parse_landing_message_maps_expected_codes_and_rejects_malicious_input(): void
    {
        $this->assertSame(
            'Demo sedang ramai. Coba lagi beberapa saat lagi.',
            LandingHelper::parseLandingMessage('demo-sibuk')
        );
        $this->assertSame(
            'Demo belum bisa dimulai. Coba lagi.',
            LandingHelper::parseLandingMessage('demo-gagal')
        );
        $this->assertSame(
            'Sesi demo berakhir. Mulai demo lagi atau daftar.',
            LandingHelper::parseLandingMessage('demo-berakhir')
        );
        $this->assertSame(
            'Akunmu dan semua datanya sudah dihapus.',
            LandingHelper::parseLandingMessage('akun-dihapus')
        );

        // Unknown or malicious input should return null
        $this->assertNull(LandingHelper::parseLandingMessage('unknown-code'));
        $this->assertNull(LandingHelper::parseLandingMessage('<script>alert("xss")</script>'));
        $this->assertNull(LandingHelper::parseLandingMessage("' OR 1=1 --"));
        $this->assertNull(LandingHelper::parseLandingMessage(null));
    }

    public function test_build_sitemap_generates_valid_xml_with_public_urls(): void
    {
        $xml = LandingHelper::buildSitemap('https://lapak.id');

        $this->assertStringContainsString('<?xml version="1.0" encoding="UTF-8"?>', $xml);
        $this->assertStringContainsString('<loc>https://lapak.id/</loc>', $xml);
        $this->assertStringContainsString('<loc>https://lapak.id/syarat</loc>', $xml);
        $this->assertStringContainsString('<loc>https://lapak.id/privasi</loc>', $xml);
    }

    public function test_is_demo_allowed_respects_configuration_and_environment(): void
    {
        $this->assertFalse(LandingHelper::isDemoAllowed(['enabled' => false]));
        $this->assertTrue(LandingHelper::isDemoAllowed(['enabled' => true]));

        // In production, blocked unless demo.allow_production is true
        $this->app->detectEnvironment(fn () => 'production');

        $this->assertFalse(LandingHelper::isDemoAllowed(['enabled' => true, 'allow_production' => false]));
        $this->assertTrue(LandingHelper::isDemoAllowed(['enabled' => true, 'allow_production' => true]));
    }

    public function test_get_landing_cta_target_handles_guests_and_users(): void
    {
        // 1. Guest
        $guestTarget = LandingHelper::getLandingCtaTarget(null);
        $this->assertSame('/masuk', $guestTarget['target']);
        $this->assertSame('Mulai Sekarang', $guestTarget['label']);

        // 2. User with business
        $userWithBiz = User::create([
            'name' => 'Pak Budi',
            'phone' => '081299990001',
            'email' => 'budi@example.com',
            'password' => bcrypt('secret123'),
        ]);
        Business::create([
            'user_id' => $userWithBiz->id,
            'business_name' => 'Warung Budi',
            'owner_name' => 'Budi',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Merdeka No. 10',
        ]);

        $bizTarget = LandingHelper::getLandingCtaTarget($userWithBiz);
        $this->assertSame('/dashboard', $bizTarget['target']);
        $this->assertSame('Buka Dashboard', $bizTarget['label']);

        // 3. User without business
        $userNoBiz = User::create([
            'name' => 'Ibu Siti',
            'phone' => '081299990002',
            'email' => 'siti@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $noBizTarget = LandingHelper::getLandingCtaTarget($userNoBiz);
        $this->assertSame('/profil-usaha', $noBizTarget['target']);
        $this->assertSame('Buka Dashboard', $noBizTarget['label']);
    }

    public function test_cleanup_expired_demos_removes_expired_accounts_and_is_idempotent(): void
    {
        // Expired demo user
        $expiredUser = User::create([
            'name' => 'Demo User Expired',
            'phone' => null,
            'email' => 'demo_expired@lapak.test',
            'password' => bcrypt('demosecret'),
            'is_demo' => true,
            'demo_expires_at' => now()->subMinutes(10),
        ]);
        Business::create([
            'user_id' => $expiredUser->id,
            'business_name' => 'Warung Demo Expired',
            'owner_name' => 'Demo Expired',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Demo Expired',
        ]);

        // Active demo user
        $activeUser = User::create([
            'name' => 'Demo User Active',
            'phone' => null,
            'email' => 'demo_active@lapak.test',
            'password' => bcrypt('demosecret'),
            'is_demo' => true,
            'demo_expires_at' => now()->addHour(),
        ]);
        Business::create([
            'user_id' => $activeUser->id,
            'business_name' => 'Warung Demo Active',
            'owner_name' => 'Demo Active',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Demo Active',
        ]);

        $deletedCount = LandingHelper::cleanupExpiredDemos();
        $this->assertSame(1, $deletedCount);

        $this->assertDatabaseMissing('users', ['id' => $expiredUser->id]);
        $this->assertDatabaseHas('users', ['id' => $activeUser->id]);

        // Idempotent test
        $secondCleanup = LandingHelper::cleanupExpiredDemos();
        $this->assertSame(0, $secondCleanup);
    }
}
