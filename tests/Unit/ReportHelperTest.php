<?php

namespace Tests\Unit;

use App\Models\Business;
use App\Models\Transaction;
use App\Models\User;
use App\Support\ReportHelper;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportHelperTest extends TestCase
{
    use RefreshDatabase;

    protected Carbon $nowWib;

    protected function setUp(): void
    {
        parent::setUp();
        // Assume today is Tuesday, 3 Nov 2026, 14:00 WIB
        $this->nowWib = Carbon::create(2026, 11, 3, 14, 0, 0, 'Asia/Jakarta');
    }

    public function test_periode_bulan_starts_at_first_of_month_to_now(): void
    {
        $range = ReportHelper::getReportRange('bulan', null, null, $this->nowWib);

        $this->assertSame('bulan', $range['periode']);
        $this->assertSame('2026-11-01 00:00:00', $range['start']->format('Y-m-d H:i:s'));
        $this->assertSame('2026-11-03 14:00:00', $range['end']->format('Y-m-d H:i:s'));
        $this->assertTrue($range['is_valid']);
        $this->assertFalse($range['is_monthly']);
    }

    public function test_periode_minggu_starts_at_monday_of_current_week(): void
    {
        $range = ReportHelper::getReportRange('minggu', null, null, $this->nowWib);

        $this->assertSame('minggu', $range['periode']);
        // 3 Nov 2026 is Tuesday, so Monday is 2 Nov 2026
        $this->assertSame('2026-11-02 00:00:00', $range['start']->format('Y-m-d H:i:s'));
        $this->assertSame('2026-11-03 14:00:00', $range['end']->format('Y-m-d H:i:s'));
        $this->assertTrue($range['is_valid']);
    }

    public function test_periode_bulan_lalu_covers_full_previous_month(): void
    {
        $range = ReportHelper::getReportRange('bulan-lalu', null, null, $this->nowWib);

        $this->assertSame('bulan-lalu', $range['periode']);
        $this->assertSame('2026-10-01 00:00:00', $range['start']->format('Y-m-d H:i:s'));
        $this->assertSame('2026-10-31 23:59:59', $range['end']->format('Y-m-d H:i:s'));
        $this->assertTrue($range['is_valid']);
    }

    public function test_transaction_in_utc_at_end_of_october_is_treated_as_november_wib(): void
    {
        // 2026-10-31T17:30:00Z in WIB is 2026-11-01 00:30:00 (+7 hours)
        $txUtc = Carbon::parse('2026-10-31T17:30:00Z');
        $txWib = $txUtc->copy()->setTimezone('Asia/Jakarta');

        $this->assertSame('2026-11-01 00:30:00', $txWib->format('Y-m-d H:i:s'));

        $range = ReportHelper::getReportRange('bulan', null, null, $this->nowWib);

        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi',
            'business_name' => 'Kopi Budi',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Test No. 1',
        ]);

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'income',
            'amount' => 50000,
            'item' => 'Kopi Pagi',
            'quantity' => 1,
            'category' => 'Kopi',
            'occurred_at' => $txUtc,
        ]);

        $report = ReportHelper::computeReport($business->id, $range);

        $this->assertSame(50000, $report['summary']['total_income']);
        $this->assertSame(1, $report['summary']['transaction_count']);
    }

    public function test_custom_range_where_dari_is_after_sampai_is_invalid(): void
    {
        $range = ReportHelper::getReportRange('kustom', '2026-11-05', '2026-11-01', $this->nowWib);

        $this->assertFalse($range['is_valid']);
        $this->assertSame('Tanggal mulai tidak boleh setelah tanggal akhir.', $range['error_message']);
        // Fallback to bulan
        $this->assertSame('bulan', $range['periode']);
    }

    public function test_custom_range_with_future_sampai_is_clamped_to_today(): void
    {
        $range = ReportHelper::getReportRange('kustom', '2026-11-01', '2026-12-01', $this->nowWib);

        $this->assertTrue($range['is_valid']);
        $this->assertSame('kustom', $range['periode']);
        $this->assertSame('2026-11-01 00:00:00', $range['start']->format('Y-m-d H:i:s'));
        // Clamped to today (3 Nov 2026 end of day)
        $this->assertSame('2026-11-03 23:59:59', $range['end']->format('Y-m-d H:i:s'));
    }

    public function test_custom_range_exceeding_366_days_is_invalid(): void
    {
        $range = ReportHelper::getReportRange('kustom', '2025-01-01', '2026-03-01', $this->nowWib);

        $this->assertFalse($range['is_valid']);
        $this->assertSame('Rentang maksimal 366 hari.', $range['error_message']);
        $this->assertSame('bulan', $range['periode']);
    }

    public function test_previous_range_calculation_for_three_days(): void
    {
        // 1 Nov to 3 Nov is 3 days -> previous 3 days ending 31 Oct is 29 to 31 Oct
        $range = ReportHelper::getReportRange('kustom', '2026-11-01', '2026-11-03', $this->nowWib);
        $prev = ReportHelper::getPreviousRange($range);

        $this->assertSame('2026-10-29 00:00:00', $prev['start']->format('Y-m-d H:i:s'));
        $this->assertSame('2026-10-31 23:59:59', $prev['end']->format('Y-m-d H:i:s'));
        $this->assertSame(3, $prev['day_count']);
    }

    public function test_income_and_expense_with_loss_shows_negative_and_rugi_label(): void
    {
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi',
            'business_name' => 'Kopi Budi',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Test No. 1',
        ]);

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'income',
            'amount' => 100000,
            'item' => 'Penjualan',
            'occurred_at' => Carbon::create(2026, 11, 2, 10, 0, 0, 'Asia/Jakarta')->utc(),
        ]);

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'amount' => 120000,
            'item' => 'Belanja Bahan',
            'occurred_at' => Carbon::create(2026, 11, 2, 11, 0, 0, 'Asia/Jakarta')->utc(),
        ]);

        $range = ReportHelper::getReportRange('bulan', null, null, $this->nowWib);
        $report = ReportHelper::computeReport($business->id, $range);

        $this->assertSame(100000, $report['summary']['total_income']);
        $this->assertSame(120000, $report['summary']['total_expense']);
        $this->assertSame(-20000, $report['summary']['net_profit']);
        $this->assertSame('Rugi', $report['summary']['profit_label']);
        $this->assertSame('-Rp 20.000', $report['summary']['net_profit_formatted']);
    }

    public function test_transaction_without_category_groups_into_tanpa_kategori(): void
    {
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi',
            'business_name' => 'Kopi Budi',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Test No. 1',
        ]);

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'income',
            'amount' => 50000,
            'item' => 'Kopi Polos',
            'category' => null,
            'occurred_at' => Carbon::create(2026, 11, 2, 10, 0, 0, 'Asia/Jakarta')->utc(),
        ]);

        $range = ReportHelper::getReportRange('bulan', null, null, $this->nowWib);
        $report = ReportHelper::computeReport($business->id, $range);

        $this->assertNotEmpty($report['categories']['income']);
        $this->assertSame('Tanpa kategori', $report['categories']['income'][0]['category']);
        $this->assertSame(100.0, $report['categories']['income'][0]['percentage']);
    }

    public function test_allocate_percentages_sums_to_exactly_one_hundred(): void
    {
        // 1/3, 1/3, 1/3
        $allocated = ReportHelper::allocatePercentages([1, 1, 1]);

        $this->assertSame(100.0, round(array_sum($allocated), 1));
        $this->assertSame([33.4, 33.3, 33.3], array_values($allocated));

        // When all zeroes
        $zeroAllocated = ReportHelper::allocatePercentages([0, 0, 0]);
        $this->assertSame([0.0, 0.0, 0.0], array_values($zeroAllocated));
    }

    public function test_calc_delta_returns_null_when_previous_is_zero(): void
    {
        $this->assertNull(ReportHelper::calcDelta(100000, 0));

        $delta = ReportHelper::calcDelta(120000, 100000);
        $this->assertNotNull($delta);
        $this->assertSame('naik', $delta['direction']);
        $this->assertSame(20.0, $delta['percentage']);
        $this->assertSame('naik 20% dari periode sebelumnya', $delta['text']);
    }

    public function test_escape_spreadsheet_text_neutralizes_formula_injection_characters(): void
    {
        $this->assertSame("'=HYPERLINK(\"http://evil.com\")", ReportHelper::escapeSpreadsheetText('=HYPERLINK("http://evil.com")'));
        $this->assertSame("'+cmd|' /C calc'!A0", ReportHelper::escapeSpreadsheetText("+cmd|' /C calc'!A0"));
        $this->assertSame("'-20000", ReportHelper::escapeSpreadsheetText('-20000'));
        $this->assertSame("'@SUM(A1:A10)", ReportHelper::escapeSpreadsheetText('@SUM(A1:A10)'));
        $this->assertSame("'\tIndentText", ReportHelper::escapeSpreadsheetText("\tIndentText"));
        $this->assertSame('Kopi Mantap', ReportHelper::escapeSpreadsheetText('Kopi Mantap'));
    }

    public function test_build_report_filename_handles_special_characters_and_non_latin(): void
    {
        $filename = ReportHelper::buildReportFilename('Warung Bu Rara & Anak!', '2026-11-01', '2026-11-03', 'pdf');
        $this->assertSame('laporan-warung-bu-rara-anak-2026-11-01-2026-11-03.pdf', $filename);

        $nonLatinFilename = ReportHelper::buildReportFilename('☕️✨🎉', '2026-11-01', '2026-11-03', 'xlsx');
        $this->assertSame('laporan-usaha-2026-11-01-2026-11-03.xlsx', $nonLatinFilename);
    }

    public function test_range_over_62_days_generates_monthly_breakdown(): void
    {
        // 63 days
        $range = ReportHelper::getReportRange('kustom', '2026-08-01', '2026-10-02', $this->nowWib);
        $this->assertTrue($range['is_monthly']);

        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi',
            'business_name' => 'Kopi Budi',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Test No. 1',
        ]);

        $report = ReportHelper::computeReport($business->id, $range);

        $this->assertTrue($report['periodic']['is_monthly']);
        $this->assertSame('monthly', $report['periodic']['type']);
        // August, September, October -> 3 monthly rows
        $this->assertCount(3, $report['periodic']['rows']);
    }

    public function test_periodic_rows_sum_equals_summary_totals(): void
    {
        $user = User::factory()->create();
        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi',
            'business_name' => 'Kopi Budi',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Test No. 1',
        ]);

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'income',
            'amount' => 150000,
            'item' => 'Income 1',
            'occurred_at' => Carbon::create(2026, 11, 1, 10, 0, 0, 'Asia/Jakarta')->utc(),
        ]);

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'income',
            'amount' => 200000,
            'item' => 'Income 2',
            'occurred_at' => Carbon::create(2026, 11, 2, 10, 0, 0, 'Asia/Jakarta')->utc(),
        ]);

        Transaction::create([
            'business_id' => $business->id,
            'type' => 'expense',
            'amount' => 80000,
            'item' => 'Expense 1',
            'occurred_at' => Carbon::create(2026, 11, 2, 12, 0, 0, 'Asia/Jakarta')->utc(),
        ]);

        $range = ReportHelper::getReportRange('bulan', null, null, $this->nowWib);
        $report = ReportHelper::computeReport($business->id, $range);

        $periodicIncomeSum = array_sum(array_column($report['periodic']['rows'], 'income'));
        $periodicExpenseSum = array_sum(array_column($report['periodic']['rows'], 'expense'));

        $this->assertSame($report['summary']['total_income'], $periodicIncomeSum);
        $this->assertSame($report['summary']['total_expense'], $periodicExpenseSum);
    }
}
