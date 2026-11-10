<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Campaign;
use App\Models\Insight;
use App\Models\SocialConnection;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserPreference;
use App\Models\VoiceLog;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class SettingsDemoSeeder extends Seeder
{
    /**
     * Run idempotent seeder for Settings testing.
     */
    public function run(): void
    {
        $phone = '+6281234567890';
        $now = Carbon::now('Asia/Jakarta');

        $user = User::updateOrCreate(
            ['phone' => $phone],
            [
                'name' => 'Ibu Siti',
                'email' => 'siti.warungberkah@example.com',
                'password' => bcrypt('password123'),
                'consent_at' => $now->copy()->subDays(60),
                'consent_version' => '1.0',
            ]
        );

        $business = Business::updateOrCreate(
            ['user_id' => $user->id],
            [
                'owner_name' => 'Ibu Siti',
                'business_name' => 'Warung Berkah Bu Siti',
                'business_type' => 'Kuliner',
                'address' => 'Jl. Diponegoro No. 8, Wonokromo, Surabaya',
                'lat' => -7.2950,
                'lng' => 112.7380,
                'main_products' => 'Nasi Rawon Daging, Es Sinom Segar, Tempe Mendoan',
                'price_range' => 'Rp 10-50 ribu',
            ]
        );

        UserPreference::updateOrCreate(
            ['user_id' => $user->id],
            ['text_size' => 'normal']
        );

        SocialConnection::updateOrCreate(
            [
                'business_id' => $business->id,
                'platform' => 'instagram',
            ],
            [
                'external_account_id' => 'ig_warungberkah_123',
                'display_name' => '@warungberkah_busiti',
                'token_encrypted' => encrypt('mock_oauth_access_token_instagram'),
                'expires_at' => $now->copy()->addMonths(2),
            ]
        );

        // Transactions
        if (Transaction::where('business_id', $business->id)->count() === 0) {
            Transaction::create([
                'business_id' => $business->id,
                'occurred_at' => $now->copy()->subDays(2)->setTime(12, 15),
                'type' => 'income',
                'item' => 'Nasi Rawon Daging',
                'quantity' => 4,
                'amount' => 100000,
                'category' => 'Makanan Utama',
                'source' => 'voice',
                'note' => 'Pelanggan makan siang di tempat',
            ]);

            Transaction::create([
                'business_id' => $business->id,
                'occurred_at' => $now->copy()->subDays(1)->setTime(13, 00),
                'type' => 'income',
                'item' => 'Es Sinom Segar',
                'quantity' => 5,
                'amount' => 35000,
                'category' => 'Minuman',
                'source' => 'manual',
                'note' => 'Pesanan bungkus',
            ]);

            Transaction::create([
                'business_id' => $business->id,
                'occurred_at' => $now->copy()->subHours(5),
                'type' => 'expense',
                'item' => 'Belanja Daging Sapi & Bumbu Dapur',
                'quantity' => 1,
                'amount' => 250000,
                'category' => 'Bahan Baku',
                'source' => 'manual',
                'note' => 'Pasar Wonokromo',
            ]);
        }

        // Voice Log
        $firstTx = Transaction::where('business_id', $business->id)->first();
        if ($firstTx && VoiceLog::where('business_id', $business->id)->count() === 0) {
            VoiceLog::create([
                'business_id' => $business->id,
                'transaction_id' => $firstTx->id,
                'transcript' => 'Catat empat porsi nasi rawon daging seratus ribu rupiah makan di tempat',
                'parsed_json' => [
                    'item' => 'Nasi Rawon Daging',
                    'quantity' => 4,
                    'amount' => 100000,
                    'type' => 'income',
                ],
                'confidence' => 0.95,
            ]);
        }

        // Insight
        Insight::updateOrCreate(
            [
                'business_id' => $business->id,
                'type' => 'penjualan',
            ],
            [
                'title' => 'Nasi Rawon Paling Diminati',
                'recommendation' => 'Nasi Rawon paling laris, terutama sekitar jam 12.00-13.00. Coba sediakan paket hemat minum es sinom di jam itu.',
                'source' => 'Data transaksi kamu di LAPAK',
                'data_date' => $now->copy()->subDay()->toDateString(),
                'facts' => [
                    'top_item' => 'Nasi Rawon Daging',
                    'peak_hour' => '12.00-13.00',
                ],
                'facts_hash' => md5('Nasi Rawon Daging|12.00-13.00'),
                'expires_at' => $now->copy()->addDay(),
            ]
        );

        // Poster mock & Campaign
        $posterDir = storage_path('app/private/posters');
        if (! File::exists($posterDir)) {
            File::makeDirectory($posterDir, 0755, true);
        }
        $mockPosterFile = "posters/promo_rawon_{$business->id}.png";
        $fullPosterPath = storage_path("app/private/{$mockPosterFile}");
        if (! file_exists($fullPosterPath)) {
            // 1x1 transparent PNG or placeholder
            file_put_contents($fullPosterPath, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='));
        }

        Campaign::updateOrCreate(
            [
                'business_id' => $business->id,
                'promo_name' => 'Promo Maksi Rawon Nikmat',
            ],
            [
                'title' => 'Diskon Paket Maksi Rawon',
                'status' => 'draf',
                'copy' => [
                    'headline' => 'Makan Siang Segar & Gurih!',
                    'subheadline' => 'Paket Rawon Daging + Es Sinom',
                    'caption' => 'Yuk mampir ke Warung Berkah Bu Siti! Nikmati Rawon Daging empuk kuah mantap.',
                    'hashtags' => ['#RawonSurabaya', '#KulinerSurabaya', '#WarungBerkah'],
                ],
                'poster_path' => $mockPosterFile,
            ]
        );
    }
}
