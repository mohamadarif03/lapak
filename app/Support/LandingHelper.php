<?php

namespace App\Support;

use App\Models\Business;
use App\Models\Insight;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class LandingHelper
{
    public const TIMEZONE = 'Asia/Jakarta';

    /**
     * Filter and normalize statistics items.
     * Only items with non-empty source and year are returned.
     *
     * @param  array<int, array<string, mixed>>  $stats
     * @return array<int, array<string, mixed>>
     */
    public static function getVisibleStats(array $stats): array
    {
        $visible = [];

        foreach ($stats as $stat) {
            $source = trim((string) ($stat['source'] ?? ''));
            $year = trim((string) ($stat['year'] ?? ''));

            if ($source === '' || $year === '') {
                continue;
            }

            $sourceUrl = ! empty($stat['source_url']) && filter_var($stat['source_url'], FILTER_VALIDATE_URL)
                ? (string) $stat['source_url']
                : null;

            $visible[] = [
                'value' => (string) ($stat['value'] ?? ''),
                'label' => (string) ($stat['label'] ?? ''),
                'source' => $source,
                'source_url' => $sourceUrl,
                'year' => (int) $year,
                'source_text' => "Sumber: {$source}, {$year}",
            ];
        }

        return $visible;
    }

    /**
     * Build and validate contact links.
     * Invalid email or invalid WhatsApp numbers are hidden (null).
     *
     * @param  array{email?: ?string, whatsapp?: ?string}  $contact
     * @return array{email_url: ?string, whatsapp_url: ?string, email_label: ?string, whatsapp_label: ?string}
     */
    public static function buildContactLinks(array $contact): array
    {
        $email = trim((string) ($contact['email'] ?? ''));
        $wa = trim((string) ($contact['whatsapp'] ?? ''));

        $emailUrl = null;
        $emailLabel = null;
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $emailUrl = 'mailto:'.$email;
            $emailLabel = $email;
        }

        $waUrl = null;
        $waLabel = null;
        // Strictly international digits only (e.g. 6281234567890, 9-16 digits, no +, no spaces, no letters)
        if ($wa !== '' && preg_match('/^[1-9][0-9]{8,15}$/', $wa)) {
            $waUrl = 'https://wa.me/'.$wa;
            $waLabel = '+'.$wa;
        }

        return [
            'email' => $emailLabel,
            'whatsapp' => $waUrl ? $wa : null,
            'email_url' => $emailUrl,
            'whatsapp_url' => $waUrl,
            'email_label' => $emailLabel,
            'whatsapp_label' => $waLabel,
        ];
    }

    /**
     * Parse and sanitize landing page notification message from query ?pesan=.
     */
    public static function parseLandingMessage(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $clean = strtolower(trim($value));

        return match ($clean) {
            'demo-sibuk' => 'Demo sedang ramai. Coba lagi beberapa saat lagi.',
            'demo-gagal' => 'Demo belum bisa dimulai. Coba lagi.',
            'demo-berakhir' => 'Sesi demo berakhir. Mulai demo lagi atau daftar.',
            'akun-dihapus' => 'Akunmu dan semua datanya sudah dihapus.',
            default => null,
        };
    }

    /**
     * Generate sitemap XML string for public landing pages.
     */
    public static function buildSitemap(string $baseUrl): string
    {
        $base = rtrim($baseUrl, '/');
        $date = Carbon::now(self::TIMEZONE)->format('Y-m-d');

        return '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
            .'  <url>'."\n"
            ."    <loc>{$base}/</loc>\n"
            ."    <lastmod>{$date}</lastmod>\n"
            ."    <changefreq>weekly</changefreq>\n"
            ."    <priority>1.0</priority>\n"
            ."  </url>\n"
            .'  <url>'."\n"
            ."    <loc>{$base}/syarat</loc>\n"
            ."    <lastmod>{$date}</lastmod>\n"
            ."    <changefreq>monthly</changefreq>\n"
            ."    <priority>0.5</priority>\n"
            ."  </url>\n"
            .'  <url>'."\n"
            ."    <loc>{$base}/privasi</loc>\n"
            ."    <lastmod>{$date}</lastmod>\n"
            ."    <changefreq>monthly</changefreq>\n"
            ."    <priority>0.5</priority>\n"
            ."  </url>\n"
            .'</urlset>';
    }

    /**
     * Check if demo mode is allowed according to environment and config.
     *
     * @param  array<string, mixed>|null  $config
     */
    public static function isDemoAllowed(?array $config = null): bool
    {
        $cfg = $config ?? config('demo', []);

        $enabledRaw = $cfg['enabled'] ?? env('DEMO_ENABLED', false);
        $enabled = filter_var($enabledRaw, FILTER_VALIDATE_BOOLEAN);

        if (! $enabled) {
            return false;
        }

        if (App::environment('production')) {
            $allowProdRaw = $cfg['allow_production'] ?? env('DEMO_ALLOW_PRODUCTION', false);
            $allowProd = filter_var($allowProdRaw, FILTER_VALIDATE_BOOLEAN);

            if (! $allowProd) {
                Log::warning('[Demo Mode] DEMO_ENABLED=true in production but DEMO_ALLOW_PRODUCTION is not set. Demo disabled.');

                return false;
            }
        }

        return true;
    }

    /**
     * Determine CTA target route and label based on user authentication and business setup.
     *
     * @return array{target: string, label: string, is_logged_in: bool}
     */
    public static function getLandingCtaTarget(?User $user): array
    {
        if (! $user) {
            return [
                'target' => '/masuk',
                'label' => 'Mulai Sekarang',
                'is_logged_in' => false,
            ];
        }

        $hasBusiness = $user->business !== null || Business::where('user_id', $user->id)->exists();

        return [
            'target' => $hasBusiness ? '/dashboard' : '/profil-usaha',
            'label' => 'Buka Dashboard',
            'is_logged_in' => true,
        ];
    }

    /**
     * Seed realistic sample data for demo business (14 days of transactions + 2 insights).
     * Idempotent.
     */
    public static function seedDemoBusiness(int $businessId): void
    {
        $business = Business::find($businessId);
        if (! $business) {
            return;
        }

        // Only seed if no transactions exist yet
        if (Transaction::where('business_id', $businessId)->count() === 0) {
            $now = Carbon::now(self::TIMEZONE);

            $menuItems = [
                ['item' => 'Nasi Rawon Daging', 'amount' => 25000, 'category' => 'Makanan Utama'],
                ['item' => 'Soto Ayam Lamongan', 'amount' => 20000, 'category' => 'Makanan Utama'],
                ['item' => 'Bebek Goreng Sambal Korek', 'amount' => 30000, 'category' => 'Makanan Utama'],
                ['item' => 'Es Teh Manis', 'amount' => 5000, 'category' => 'Minuman'],
                ['item' => 'Es Sinom Segar', 'amount' => 7000, 'category' => 'Minuman'],
                ['item' => 'Tempe Mendoan Porsi', 'amount' => 12000, 'category' => 'Camilan'],
            ];

            // 14 days of history
            for ($daysAgo = 13; $daysAgo >= 0; $daysAgo--) {
                $dayDate = $now->copy()->subDays($daysAgo);

                // 3 to 6 income transactions per day
                $txCount = 3 + ($daysAgo % 4);
                for ($t = 0; $t < $txCount; $t++) {
                    $itemData = $menuItems[($daysAgo + $t) % count($menuItems)];
                    $hour = 10 + ($t * 2);
                    $minute = ($t * 17) % 60;
                    $qty = 1 + ($t % 3);

                    Transaction::create([
                        'business_id' => $businessId,
                        'occurred_at' => $dayDate->copy()->setTime($hour, $minute),
                        'type' => 'income',
                        'item' => $itemData['item'],
                        'quantity' => $qty,
                        'amount' => $itemData['amount'] * $qty,
                        'category' => $itemData['category'],
                        'source' => $t % 2 === 0 ? 'voice' : 'manual',
                        'note' => 'Penjualan makan di tempat',
                    ]);
                }

                // Every 3 days, add an expense transaction
                if ($daysAgo % 3 === 0) {
                    Transaction::create([
                        'business_id' => $businessId,
                        'occurred_at' => $dayDate->copy()->setTime(8, 30),
                        'type' => 'expense',
                        'item' => 'Belanja Bahan Dapur & Daging Segar',
                        'quantity' => 1,
                        'amount' => 150000 + ($daysAgo * 5000),
                        'category' => 'Bahan Baku',
                        'source' => 'manual',
                        'note' => 'Pasar Tradisional Wonokromo',
                    ]);
                }
            }
        }

        // Add 2 Demo Insights
        if (Insight::where('business_id', $businessId)->count() === 0) {
            Insight::create([
                'business_id' => $businessId,
                'type' => 'penjualan',
                'title' => 'Menu Rawon Paling Diminati',
                'recommendation' => 'Nasi Rawon Daging paling laris di jam makan siang (11.00 - 13.00). Sediakan porsi lebih banyak di jam tersebut.',
                'source' => 'Data contoh (mode demo)',
                'data_date' => Carbon::now(self::TIMEZONE)->toDateString(),
                'facts' => ['top_item' => 'Nasi Rawon Daging', 'peak_hour' => '12.00'],
                'facts_hash' => md5('demo_penjualan_'.$businessId),
                'expires_at' => Carbon::now(self::TIMEZONE)->addDays(3),
            ]);

            Insight::create([
                'business_id' => $businessId,
                'type' => 'geodemografis',
                'title' => 'Potensi Pasar Usia Muda di Sekitar',
                'recommendation' => 'Tingkat kunjungan usia 20-35 tahun di Wonokromo tinggi. Menu minuman dingin dan camilan gurih sangat diminati.',
                'source' => 'Data contoh (mode demo)',
                'data_date' => Carbon::now(self::TIMEZONE)->toDateString(),
                'facts' => ['dominant_group' => '20-35', 'density' => 'tinggi'],
                'facts_hash' => md5('demo_geo_'.$businessId),
                'expires_at' => Carbon::now(self::TIMEZONE)->addDays(7),
            ]);
        }
    }

    /**
     * Create a new temporary demo account with rate limiting and concurrency checks.
     *
     * @return array{ok: bool, user?: User, business?: Business, reason?: string, message?: string}
     */
    public static function createDemoAccount(string $ip): array
    {
        if (! self::isDemoAllowed()) {
            return [
                'ok' => false,
                'reason' => 'disabled',
                'message' => 'Mode demo tidak diaktifkan.',
            ];
        }

        // Rate limiting by IP: max 5 demo creations per hour
        $ipKey = 'demo_create_ip:'.$ip;
        if (RateLimiter::tooManyAttempts($ipKey, 5)) {
            return [
                'ok' => false,
                'reason' => 'busy',
                'message' => 'Demo sedang ramai. Coba lagi beberapa saat lagi.',
            ];
        }

        // Concurrency cap: max active demo accounts
        $maxActive = (int) config('demo.max_active', 200);
        $activeCount = User::where('is_demo', true)
            ->where('demo_expires_at', '>', Carbon::now())
            ->count();

        if ($activeCount >= $maxActive) {
            return [
                'ok' => false,
                'reason' => 'busy',
                'message' => 'Demo sedang ramai. Coba lagi beberapa saat lagi.',
            ];
        }

        $ttlHours = (int) config('demo.ttl_hours', 2);
        if ($ttlHours <= 0) {
            $ttlHours = 2;
        }

        try {
            return DB::transaction(function () use ($ipKey, $ttlHours) {
                $uniq = Str::lower(Str::random(10));
                $expiresAt = Carbon::now(self::TIMEZONE)->addHours($ttlHours);

                $user = User::create([
                    'name' => 'Pengguna Demo LAPAK',
                    'email' => "demo_{$uniq}@demo.lapak.id",
                    'password' => bcrypt(Str::random(32)),
                    'phone' => null,
                    'is_demo' => true,
                    'demo_expires_at' => $expiresAt,
                    'consent_at' => Carbon::now(self::TIMEZONE),
                    'consent_version' => '1.0',
                ]);

                $business = Business::create([
                    'user_id' => $user->id,
                    'business_name' => config('demo.business_name', 'Warung Barokah (Demo)'),
                    'owner_name' => config('demo.owner_name', 'Budi Santoso'),
                    'business_type' => config('demo.category', 'Kuliner & Makanan'),
                    'address' => config('demo.address', 'Jl. Wonokromo No. 15, Surabaya'),
                    'lat' => -7.2950,
                    'lng' => 112.7380,
                    'main_products' => 'Nasi Rawon Daging, Soto Ayam, Es Sinom',
                    'price_range' => 'Rp 10-50 ribu',
                ]);

                self::seedDemoBusiness($business->id);

                RateLimiter::hit($ipKey, 3600);

                return [
                    'ok' => true,
                    'user' => $user,
                    'business' => $business,
                ];
            });
        } catch (\Throwable $e) {
            Log::error('[Demo Creation Error] '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return [
                'ok' => false,
                'reason' => 'failed',
                'message' => 'Demo belum bisa dimulai. Coba lagi.',
            ];
        }
    }

    /**
     * Clean up all expired demo accounts and all associated data.
     * Idempotent.
     */
    public static function cleanupExpiredDemos(?Carbon $now = null): int
    {
        $currentTime = $now ?? Carbon::now();

        $expiredUsers = User::where('is_demo', true)
            ->where('demo_expires_at', '<=', $currentTime)
            ->get();

        $cleanedCount = 0;

        foreach ($expiredUsers as $user) {
            try {
                SettingsHelper::deleteAccountData($user->id);
                $cleanedCount++;
            } catch (\Throwable $e) {
                Log::error("[Demo Cleanup Error] User #{$user->id}: ".$e->getMessage());
            }
        }

        return $cleanedCount;
    }
}
