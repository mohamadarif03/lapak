<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ReportDemoSeeder extends Seeder
{
    /**
     * Run the database seeds for Laporan feature demo.
     * Idempotent: checks for existing seeded records by idempotency_key prefix.
     */
    public function run(): void
    {
        $business = Business::first();
        if (! $business) {
            $user = User::first() ?? User::factory()->create([
                'phone' => '081234567890',
                'name' => 'Pak Budi',
            ]);

            $business = Business::create([
                'user_id' => $user->id,
                'owner_name' => 'Pak Budi',
                'business_name' => 'Warung Kopi Mantap Bu Rara',
                'business_type' => 'Kuliner',
                'address' => 'Jl. Malioboro No. 12, Yogyakarta',
                'lat' => -7.7956,
                'lng' => 110.3695,
            ]);
        }

        $now = Carbon::now('Asia/Jakarta');

        // 1. November 2026 (Bulan Ini) - Profitable Period (Laba Bersih)
        $novTransactions = [
            // Pemasukan
            ['type' => 'income', 'amount' => 120000, 'item' => '6x Es Kopi Susu Aren', 'qty' => 6, 'cat' => 'Minuman Kopi', 'source' => 'voice', 'date' => '2026-11-01 09:30:00'],
            ['type' => 'income', 'amount' => 85000, 'item' => '5x Roti Bakar Coklat', 'qty' => 5, 'cat' => 'Makanan Ringan', 'source' => 'manual', 'date' => '2026-11-01 14:15:00'],
            ['type' => 'income', 'amount' => 250000, 'item' => 'Pesanan Rombongan Kopi & Camilan', 'qty' => 1, 'cat' => 'Minuman Kopi', 'source' => 'voice', 'date' => '2026-11-02 11:00:00'],
            ['type' => 'income', 'amount' => 95000, 'item' => '3x Matcha Latte & Toast', 'qty' => 3, 'cat' => 'Non-Kopi', 'source' => 'manual', 'date' => '2026-11-02 16:45:00'],
            ['type' => 'income', 'amount' => 180000, 'item' => 'Kopi Literan Siap Minum', 'qty' => 2, 'cat' => 'Minuman Kopi', 'source' => 'voice', 'date' => '2026-11-03 10:20:00'],

            // Pengeluaran
            ['type' => 'expense', 'amount' => 150000, 'item' => 'Biji Kopi Robusta & Arabika 1kg', 'qty' => 1, 'cat' => 'Bahan Baku', 'source' => 'voice', 'date' => '2026-11-01 08:00:00'],
            ['type' => 'expense', 'amount' => 65000, 'item' => 'Susu UHT Full Cream 4 Kotak', 'qty' => 4, 'cat' => 'Bahan Baku', 'source' => 'manual', 'date' => '2026-11-02 08:30:00'],
            ['type' => 'expense', 'amount' => 45000, 'item' => 'Cup Plastik & Sedotan 100pcs', 'qty' => 1, 'cat' => 'Kemasan', 'source' => 'manual', 'date' => '2026-11-02 13:00:00'],
        ];

        // 2. Oktober 2026 (Bulan Lalu) - Operational Maintenance / Loss Period (Periode Rugi)
        $octTransactions = [
            // Pemasukan
            ['type' => 'income', 'amount' => 300000, 'item' => 'Penjualan Kopi Harian', 'qty' => 15, 'cat' => 'Minuman Kopi', 'source' => 'voice', 'date' => '2026-10-15 15:00:00'],
            ['type' => 'income', 'amount' => 200000, 'item' => 'Snack dan Minuman', 'qty' => 10, 'cat' => 'Makanan Ringan', 'source' => 'manual', 'date' => '2026-10-20 17:00:00'],

            // Pengeluaran Besar (Perbaikan Mesin Kopi & Sewa Tempat) -> Mengakibatkan Rugi
            ['type' => 'expense', 'amount' => 1200000, 'item' => 'Servis & Ganti Sparepart Mesin Espresso', 'qty' => 1, 'cat' => 'Perawatan Alat', 'source' => 'manual', 'date' => '2026-10-16 10:00:00'],
            ['type' => 'expense', 'amount' => 500000, 'item' => 'Iuran Keamanan & Retribusi Bulanan', 'qty' => 1, 'cat' => 'Operasional', 'source' => 'manual', 'date' => '2026-10-18 11:00:00'],
        ];

        $allDemoData = array_merge($novTransactions, $octTransactions);

        foreach ($allDemoData as $idx => $row) {
            $idempKey = "seed-demo-report-{$business->id}-{$idx}-".md5($row['date'].$row['item']);
            $occurredAt = Carbon::createFromFormat('Y-m-d H:i:s', $row['date'], 'Asia/Jakarta')->utc();

            Transaction::updateOrCreate(
                [
                    'business_id' => $business->id,
                    'idempotency_key' => $idempKey,
                ],
                [
                    'type' => $row['type'],
                    'amount' => $row['amount'],
                    'item' => $row['item'],
                    'quantity' => $row['qty'],
                    'category' => $row['cat'],
                    'note' => 'Transaksi percontohan laporan',
                    'source' => $row['source'],
                    'occurred_at' => $occurredAt,
                ]
            );
        }
    }
}
