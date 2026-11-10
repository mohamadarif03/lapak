<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected function createBusinessUser(): array
    {
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Pak Budi',
            'business_name' => 'Warung Kopi Mantap',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Malioboro No. 12, Yogyakarta',
            'lat' => -7.7956,
            'lng' => 110.3695,
        ]);

        return [$user, $business];
    }

    public function test_unauthenticated_user_is_redirected_to_masuk(): void
    {
        $response = $this->get('/laporan');
        $response->assertRedirect('/masuk?next=%2Flaporan');
    }

    public function test_user_without_business_is_redirected_to_profil_usaha(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/laporan');
        $response->assertRedirect('/profil-usaha');
    }

    public function test_authenticated_user_with_business_can_access_laporan(): void
    {
        [$user, $business] = $this->createBusinessUser();

        $response = $this->actingAs($user)->get('/laporan');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->has('report')
            ->has('range')
            ->where('report.summary.transaction_count', 0)
            ->where('report.summary.total_income', 0)
            ->where('report.summary.total_expense', 0)
        );
    }

    public function test_laporan_with_transactions_computes_correct_totals(): void
    {
        [$user, $business] = $this->createBusinessUser();

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'income',
            'amount' => 150000,
            'item' => 'Penjualan Kopi',
            'category' => 'Minuman',
            'occurred_at' => Carbon::now()->startOfMonth()->addDays(1)->utc(),
        ]);

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'amount' => 50000,
            'item' => 'Beli Es Batu',
            'category' => 'Bahan Baku',
            'occurred_at' => Carbon::now()->startOfMonth()->addDays(2)->utc(),
        ]);

        $response = $this->actingAs($user)->get('/laporan?periode=bulan');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('report.summary.total_income', 150000)
            ->where('report.summary.total_expense', 50000)
            ->where('report.summary.net_profit', 100000)
            ->where('report.summary.profit_label', 'Laba')
            ->where('report.summary.transaction_count', 2)
        );
    }

    public function test_invalid_custom_date_range_sets_warning_and_falls_back(): void
    {
        [$user, $business] = $this->createBusinessUser();

        // 'dari' after 'sampai'
        $response = $this->actingAs($user)->get('/laporan?periode=kustom&dari=2026-11-10&sampai=2026-11-01');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('warning', 'Tanggal mulai tidak boleh setelah tanggal akhir.')
            ->where('range.periode', 'bulan')
        );
    }

    public function test_export_pdf_returns_valid_binary_attachment(): void
    {
        [$user, $business] = $this->createBusinessUser();

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'income',
            'amount' => 75000,
            'item' => 'Kopi Tubruk',
            'category' => 'Kopi',
            'occurred_at' => Carbon::now()->utc(),
        ]);

        $response = $this->actingAs($user)->get('/api/laporan/export?format=pdf&periode=bulan');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('attachment; filename="laporan-', $response->headers->get('Content-Disposition') ?? '');
        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }

    public function test_export_xlsx_returns_valid_spreadsheet_attachment(): void
    {
        [$user, $business] = $this->createBusinessUser();

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'income',
            'amount' => 75000,
            'item' => '=HYPERLINK("evil.com")',
            'category' => 'Kopi',
            'occurred_at' => Carbon::now()->utc(),
        ]);

        $response = $this->actingAs($user)->get('/api/laporan/export?format=xlsx&periode=bulan');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $this->assertStringContainsString('.xlsx"', $response->headers->get('Content-Disposition') ?? '');
        $this->assertNotEmpty($response->getContent());
    }

    public function test_export_rate_limiting_enforces_max_20_per_hour(): void
    {
        [$user, $business] = $this->createBusinessUser();

        RateLimiter::clear("report-export:user:{$user->id}");

        // Hit 20 times
        for ($i = 0; $i < 20; $i++) {
            RateLimiter::hit("report-export:user:{$user->id}", 3600);
        }

        // 21st attempt
        $response = $this->actingAs($user)->get('/api/laporan/export?format=pdf&periode=bulan');
        $response->assertStatus(429);
        $response->assertJson([
            'message' => 'Terlalu banyak ekspor. Coba lagi nanti.',
        ]);

        RateLimiter::clear("report-export:user:{$user->id}");
    }

    public function test_multi_tenancy_isolation_prevents_accessing_other_business_report(): void
    {
        [$userA, $bizA] = $this->createBusinessUser();
        [$userB, $bizB] = $this->createBusinessUser();

        Transaction::create([
            'business_id' => $bizA->id,
            'type' => 'income',
            'amount' => 500000,
            'item' => 'Penjualan A',
            'occurred_at' => Carbon::now()->utc(),
        ]);

        // User B accesses report -> User B must see 0 income, not User A's 500000
        $response = $this->actingAs($userB)->get('/laporan?periode=bulan');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->where('report.summary.total_income', 0)
            ->where('report.summary.transaction_count', 0)
        );
    }
}
