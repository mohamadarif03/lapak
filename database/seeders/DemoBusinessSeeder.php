<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Campaign;
use App\Models\Insight;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoBusinessSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Idempotent: can be run repeatedly without duplicating data.
     */
    public function run(): void
    {
        // 1. Ensure Demo User exists
        $user = User::firstOrCreate(
            ['email' => 'demo@lapak.id'],
            [
                'name' => 'Bu Siti',
                'phone' => '081234567890',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Ensure Business exists
        $business = Business::updateOrCreate(
            ['user_id' => $user->id],
            [
                'owner_name' => 'Bu Siti',
                'business_name' => 'Warung Berkah Bu Siti',
                'business_type' => 'kuliner',
                'address' => 'Jl. Dharmawangsa No. 24, Gubeng, Surabaya',
                'lat' => -7.2754438,
                'lng' => 112.7578321,
                'analysis_viewed_at' => null, // Left null so starter steps demonstrate progress
            ]
        );

        // 3. Clear existing related data for idempotency
        Transaction::where('business_id', $business->id)->delete();
        Insight::where('business_id', $business->id)->delete();
        Campaign::where('business_id', $business->id)->delete();

        // 4. Seed 14 Days of Realistic Transactions
        $incomeItems = [
            ['item' => 'Es Kopi Susu Aren', 'unit' => 15000, 'category' => 'Minuman', 'weight' => 35],
            ['item' => 'Nasi Goreng Spesial', 'unit' => 22000, 'category' => 'Makanan', 'weight' => 30],
            ['item' => 'Mie Goreng Jawa', 'unit' => 18000, 'category' => 'Makanan', 'weight' => 15],
            ['item' => 'Teh Manis Dingin', 'unit' => 5000, 'category' => 'Minuman', 'weight' => 10],
            ['item' => 'Roti Bakar Coklat Keju', 'unit' => 16000, 'category' => 'Makanan', 'weight' => 10],
        ];

        $expenseItems = [
            ['item' => 'Beli Beras 5kg', 'amount' => 75000, 'category' => 'Bahan Baku'],
            ['item' => 'Beli Telur Ayam 2kg', 'amount' => 54000, 'category' => 'Bahan Baku'],
            ['item' => 'Beli Es Batu Kristal 3 Kantong', 'amount' => 24000, 'category' => 'Operasional'],
            ['item' => 'Minyak Goreng 2 Liter', 'amount' => 36000, 'category' => 'Bahan Baku'],
            ['item' => 'Gula Aren Cair 2 Botol', 'amount' => 48000, 'category' => 'Bahan Baku'],
            ['item' => 'Cup Gelas & Sedotan 1 Dus', 'amount' => 38000, 'category' => 'Kemasan'],
            ['item' => 'Gas Elpiji 3kg', 'amount' => 22000, 'category' => 'Operasional'],
        ];

        $now = Carbon::now('Asia/Jakarta');

        for ($dayOffset = 13; $dayOffset >= 0; $dayOffset--) {
            $currentDate = $now->copy()->subDays($dayOffset);

            // 5 to 12 transactions per day
            $txCount = rand(6, 11);

            for ($i = 0; $i < $txCount; $i++) {
                // Peak hour bias: late afternoon (15:00 - 20:00 WIB)
                $isPeak = rand(1, 100) <= 65;
                if ($isPeak) {
                    $hour = rand(15, 20);
                } else {
                    $hour = rand(8, 14);
                }
                $minute = rand(0, 59);
                $second = rand(0, 59);

                $occurredAt = $currentDate->copy()->setTime($hour, $minute, $second);

                // If today and time is in future, clamp to now or slightly earlier
                if ($dayOffset === 0 && $occurredAt->isAfter($now)) {
                    $occurredAt = $now->copy()->subMinutes(rand(5, 120));
                }

                // 80% income, 20% expense
                $isExpense = rand(1, 100) <= 22;

                if ($isExpense) {
                    $exp = $expenseItems[array_rand($expenseItems)];
                    Transaction::create([
                        'business_id' => $business->id,
                        'type' => 'expense',
                        'amount' => $exp['amount'],
                        'item' => $exp['item'],
                        'quantity' => 1,
                        'category' => $exp['category'],
                        'note' => 'Belanja operasional warung',
                        'source' => rand(1, 100) <= 70 ? 'voice' : 'manual',
                        'occurred_at' => $occurredAt,
                    ]);
                } else {
                    $inc = $incomeItems[array_rand($incomeItems)];
                    $qty = rand(1, 3);
                    Transaction::create([
                        'business_id' => $business->id,
                        'type' => 'income',
                        'amount' => $inc['unit'] * $qty,
                        'item' => $inc['item'],
                        'quantity' => $qty,
                        'category' => $inc['category'],
                        'note' => null,
                        'source' => rand(1, 100) <= 80 ? 'voice' : 'manual',
                        'occurred_at' => $occurredAt,
                    ]);
                }
            }
        }

        // 5. Seed Insights
        Insight::create([
            'business_id' => $business->id,
            'type' => 'sales_peak',
            'title' => 'Puncak Penjualan Terjadi Sore Hari',
            'recommendation' => 'Siapkan stok es kopi susu lebih banyak mulai pukul 15.00 WIB untuk mengantisipasi lonjakan pembeli pulang kerja.',
            'source' => 'Data Penjualan Toko & Pola Warga Sekitar',
            'data_date' => $now->toDateString(),
        ]);

        Insight::create([
            'business_id' => $business->id,
            'type' => 'trending_product',
            'title' => 'Paket Kombo Nasi Goreng & Kopi Diminati',
            'recommendation' => 'Buat poster promosi paket hemat Nasi Goreng + Es Kopi untuk status WhatsApp di jam makan malam.',
            'source' => 'Analisis Keranjang Belanja Toko',
            'data_date' => $now->toDateString(),
        ]);

        // 6. Seed 1 Campaign
        Campaign::create([
            'business_id' => $business->id,
            'title' => 'Promo Paket Ngemil Sore Kopi & Nasi Goreng',
            'status' => 'terposting',
        ]);
    }
}
