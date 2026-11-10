<?php

namespace App\Support;

use App\Models\Business;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class ReportHelper
{
    public const TIMEZONE = 'Asia/Jakarta';

    /**
     * Determine report date range from period or custom dates.
     *
     * @return array{
     *     start: Carbon,
     *     end: Carbon,
     *     periode: string,
     *     label: string,
     *     is_valid: bool,
     *     error_message: ?string,
     *     dari_input: ?string,
     *     sampai_input: ?string,
     *     is_monthly: bool,
     *     day_count: int
     * }
     */
    public static function getReportRange(
        ?string $periode,
        ?string $dari = null,
        ?string $sampai = null,
        ?Carbon $now = null
    ): array {
        $now = $now ? $now->copy()->setTimezone(self::TIMEZONE) : Carbon::now(self::TIMEZONE);
        $cleanPeriode = in_array($periode, ['minggu', 'bulan', 'bulan-lalu', 'kustom'], true) ? $periode : 'bulan';

        $isValid = true;
        $errorMessage = null;

        if ($cleanPeriode === 'kustom') {
            if (empty($dari) || empty($sampai)) {
                $isValid = false;
                $errorMessage = 'Tanggal mulai dan tanggal akhir wajib diisi.';
                $cleanPeriode = 'bulan';
            } else {
                try {
                    $dariDate = Carbon::createFromFormat('Y-m-d', trim($dari), self::TIMEZONE)->startOfDay();
                    $sampaiDate = Carbon::createFromFormat('Y-m-d', trim($sampai), self::TIMEZONE)->endOfDay();
                } catch (\Throwable) {
                    $isValid = false;
                    $errorMessage = 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD.';
                    $cleanPeriode = 'bulan';
                }

                if ($isValid && isset($dariDate, $sampaiDate)) {
                    // Check: 'dari' cannot be more than 3 years ago
                    $threeYearsAgo = $now->copy()->subYears(3)->startOfDay();
                    if ($dariDate->lt($threeYearsAgo)) {
                        $isValid = false;
                        $errorMessage = 'Tanggal mulai tidak boleh lebih dari 3 tahun ke belakang.';
                        $cleanPeriode = 'bulan';
                    }

                    // Check: clamp 'sampai' if in the future
                    if ($sampaiDate->gt($now->copy()->endOfDay())) {
                        $sampaiDate = $now->copy()->endOfDay();
                    }

                    // Check: dari <= sampai
                    if ($dariDate->gt($sampaiDate)) {
                        $isValid = false;
                        $errorMessage = 'Tanggal mulai tidak boleh setelah tanggal akhir.';
                        $cleanPeriode = 'bulan';
                    }

                    // Check: maximum range 366 days
                    if ($isValid) {
                        $daysDiff = $dariDate->copy()->startOfDay()->diffInDays($sampaiDate->copy()->startOfDay()) + 1;
                        if ($daysDiff > 366) {
                            $isValid = false;
                            $errorMessage = 'Rentang maksimal 366 hari.';
                            $cleanPeriode = 'bulan';
                        }
                    }
                }
            }
        }

        // Build boundaries based on resolved period
        if ($cleanPeriode === 'minggu') {
            $start = $now->copy()->startOfWeek(Carbon::MONDAY);
            $end = $now->copy();
            $label = 'Minggu Ini ('.$start->format('j M Y').' - '.$end->format('j M Y').')';
        } elseif ($cleanPeriode === 'bulan-lalu') {
            $start = $now->copy()->subMonth()->startOfMonth();
            $end = $now->copy()->subMonth()->endOfMonth();
            $label = 'Bulan Lalu ('.$start->format('j M Y').' - '.$end->format('j M Y').')';
        } elseif ($cleanPeriode === 'kustom' && isset($dariDate, $sampaiDate)) {
            $start = $dariDate;
            $end = $sampaiDate;
            $label = $start->format('j M Y').' - '.$end->format('j M Y');
        } else {
            // Default 'bulan' (bulan ini)
            $start = $now->copy()->startOfMonth();
            $end = $now->copy();
            $label = 'Bulan Ini ('.$start->format('j M Y').' - '.$end->format('j M Y').')';
        }

        $dayCount = $start->copy()->startOfDay()->diffInDays($end->copy()->startOfDay()) + 1;
        $isMonthly = $dayCount > 62;

        return [
            'start' => $start,
            'end' => $end,
            'periode' => $cleanPeriode,
            'label' => $label,
            'is_valid' => $isValid,
            'error_message' => $errorMessage,
            'dari_input' => $dari,
            'sampai_input' => $sampai,
            'is_monthly' => $isMonthly,
            'day_count' => $dayCount,
        ];
    }

    /**
     * Compute the matching previous date range immediately before start date.
     *
     * @param  array{start: Carbon, end: Carbon, day_count?: int}  $range
     * @return array{start: Carbon, end: Carbon, day_count: int}
     */
    public static function getPreviousRange(array $range): array
    {
        $start = $range['start']->copy()->setTimezone(self::TIMEZONE);
        $end = $range['end']->copy()->setTimezone(self::TIMEZONE);

        $dayCount = (int) ($range['day_count'] ?? ($start->copy()->startOfDay()->diffInDays($end->copy()->startOfDay()) + 1));

        $prevEnd = $start->copy()->startOfDay()->subSecond();
        $prevStart = $start->copy()->startOfDay()->subDays($dayCount);

        return [
            'start' => $prevStart,
            'end' => $prevEnd,
            'day_count' => $dayCount,
        ];
    }

    /**
     * Calculate delta percentage and direction compared to previous period.
     * Returns null if previous value is 0.
     *
     * @return array{diff: int|float, percentage: float, direction: string, text: string}|null
     */
    public static function calcDelta(int|float $current, int|float $previous): ?array
    {
        if ($previous == 0) {
            return null;
        }

        $diff = $current - $previous;
        $pct = round(($diff / abs($previous)) * 100, 1);

        $direction = 'tetap';
        if ($diff > 0) {
            $direction = 'naik';
        } elseif ($diff < 0) {
            $direction = 'turun';
        }

        $text = $direction === 'tetap'
            ? 'sama dengan periode sebelumnya'
            : "{$direction} ".abs($pct).'% dari periode sebelumnya';

        return [
            'diff' => $diff,
            'percentage' => abs($pct),
            'direction' => $direction,
            'text' => $text,
        ];
    }

    /**
     * Allocate percentages with largest remainder (Hamilton method) to sum exactly to 100.0%.
     *
     * @param  array<array-key, int|float>  $values
     * @return array<array-key, float>
     */
    public static function allocatePercentages(array $values): array
    {
        $sum = array_sum($values);
        $result = [];

        if ($sum <= 0) {
            foreach ($values as $k => $v) {
                $result[$k] = 0.0;
            }

            return $result;
        }

        $tenths = [];
        $remainders = [];
        $totalTenths = 0;

        foreach ($values as $k => $v) {
            $exactTenths = ($v / $sum) * 1000.0;
            $floorTenth = (int) floor($exactTenths);
            $remainder = $exactTenths - $floorTenth;

            $tenths[$k] = $floorTenth;
            $remainders[$k] = $remainder;
            $totalTenths += $floorTenth;
        }

        $diff = 1000 - $totalTenths;
        if ($diff > 0) {
            // Sort remainders descending, preserve keys
            arsort($remainders);
            foreach ($remainders as $k => $r) {
                if ($diff <= 0) {
                    break;
                }
                $tenths[$k]++;
                $diff--;
            }
        }

        foreach ($values as $k => $v) {
            $result[$k] = round($tenths[$k] / 10.0, 1);
        }

        return $result;
    }

    /**
     * Formula injection defense for user text.
     */
    public static function escapeSpreadsheetText(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $str = (string) $value;
        if ($str === '') {
            return '';
        }

        $firstChar = $str[0];
        if (in_array($firstChar, ['=', '+', '-', '@', "\t", "\r", "\n"], true)) {
            return "'".$str;
        }

        return $str;
    }

    /**
     * Build clean export filename.
     */
    public static function buildReportFilename(
        string $businessName,
        Carbon|string $dari,
        Carbon|string $sampai,
        string $extension
    ): string {
        $dariStr = $dari instanceof Carbon ? $dari->format('Y-m-d') : substr((string) $dari, 0, 10);
        $sampaiStr = $sampai instanceof Carbon ? $sampai->format('Y-m-d') : substr((string) $sampai, 0, 10);

        $slug = Str::slug($businessName, '-');
        if ($slug === '') {
            $slug = 'usaha';
        }

        $ext = ltrim(strtolower($extension), '.');

        return "laporan-{$slug}-{$dariStr}-{$sampaiStr}.{$ext}";
    }

    /**
     * Format integer into Indonesian Rupiah format.
     */
    public static function formatRupiah(int $amount, bool $signed = false): string
    {
        $absFormatted = number_format(abs($amount), 0, ',', '.');
        if ($amount < 0) {
            return "-Rp {$absFormatted}";
        }

        if ($signed && $amount > 0) {
            return "+Rp {$absFormatted}";
        }

        return "Rp {$absFormatted}";
    }

    /**
     * Compute full report data for a given business and range.
     * Single source of truth for UI, PDF, and Excel.
     *
     * @param  array{start: Carbon, end: Carbon, label: string, is_monthly: bool, day_count: int}  $range
     * @return array<string, mixed>
     */
    public static function computeReport(int $businessId, array $range): array
    {
        $business = Business::find($businessId);
        $businessName = $business?->business_name ?? 'Usaha';
        $ownerName = $business?->owner_name ?? 'Pemilik';

        $startUtc = $range['start']->copy()->utc();
        $endUtc = $range['end']->copy()->utc();

        // 1. Fetch transactions within range
        $query = Transaction::where('business_id', $businessId)
            ->where('occurred_at', '>=', $startUtc)
            ->where('occurred_at', '<=', $endUtc);

        if (Schema::hasColumn('transactions', 'deleted_at')) {
            $query->whereNull('deleted_at');
        }

        $transactions = $query->orderBy('occurred_at', 'asc')->get();

        // 2. Summary stats
        $totalIncome = 0;
        $totalExpense = 0;
        $incomeCount = 0;
        $expenseCount = 0;

        /** @var array<string, array{count: int, amount: int}> $incomeCatMap */
        $incomeCatMap = [];
        /** @var array<string, array{count: int, amount: int}> $expenseCatMap */
        $expenseCatMap = [];

        /** @var array<string, array{income: int, expense: int}> $periodicMap */
        $periodicMap = [];

        // Prepopulate all dates or months in range
        if ($range['is_monthly']) {
            $curMonth = $range['start']->copy()->setTimezone(self::TIMEZONE)->startOfMonth();
            $lastMonth = $range['end']->copy()->setTimezone(self::TIMEZONE)->startOfMonth();

            while ($curMonth->lte($lastMonth)) {
                $monthKey = $curMonth->format('Y-m');
                $periodicMap[$monthKey] = [
                    'key' => $monthKey,
                    'label' => $curMonth->format('M Y'),
                    'income' => 0,
                    'expense' => 0,
                    'net_profit' => 0,
                ];
                $curMonth->addMonth();
            }
        } else {
            $curDay = $range['start']->copy()->setTimezone(self::TIMEZONE)->startOfDay();
            $lastDay = $range['end']->copy()->setTimezone(self::TIMEZONE)->startOfDay();

            while ($curDay->lte($lastDay)) {
                $dayKey = $curDay->format('Y-m-d');
                $periodicMap[$dayKey] = [
                    'key' => $dayKey,
                    'label' => $curDay->format('d M'),
                    'date_formatted' => $curDay->format('d M Y'),
                    'income' => 0,
                    'expense' => 0,
                    'net_profit' => 0,
                ];
                $curDay->addDay();
            }
        }

        foreach ($transactions as $tx) {
            $type = strtolower($tx->type);
            $amount = (int) $tx->amount;
            $category = trim((string) ($tx->category ?? ''));
            if ($category === '') {
                $category = 'Tanpa kategori';
            }

            $txWib = $tx->occurred_at->copy()->setTimezone(self::TIMEZONE);
            $pKey = $range['is_monthly'] ? $txWib->format('Y-m') : $txWib->format('Y-m-d');

            if ($type === 'income') {
                $totalIncome += $amount;
                $incomeCount++;

                if (! isset($incomeCatMap[$category])) {
                    $incomeCatMap[$category] = ['count' => 0, 'amount' => 0];
                }
                $incomeCatMap[$category]['count']++;
                $incomeCatMap[$category]['amount'] += $amount;

                if (isset($periodicMap[$pKey])) {
                    $periodicMap[$pKey]['income'] += $amount;
                }
            } else {
                $totalExpense += $amount;
                $expenseCount++;

                if (! isset($expenseCatMap[$category])) {
                    $expenseCatMap[$category] = ['count' => 0, 'amount' => 0];
                }
                $expenseCatMap[$category]['count']++;
                $expenseCatMap[$category]['amount'] += $amount;

                if (isset($periodicMap[$pKey])) {
                    $periodicMap[$pKey]['expense'] += $amount;
                }
            }
        }

        $netProfit = $totalIncome - $totalExpense;
        $profitLabel = $netProfit >= 0 ? 'Laba' : 'Rugi';
        $transactionCount = $transactions->count();
        $avgIncomeTransaction = $incomeCount > 0 ? (int) round($totalIncome / $incomeCount) : null;

        // 3. Category Breakdown with Largest Remainder Percentages
        $buildCategoryBreakdown = function (array $catMap, int $totalTypeAmount): array {
            if (empty($catMap)) {
                return [];
            }

            // Sort descending by amount
            uasort($catMap, fn ($a, $b) => $b['amount'] <=> $a['amount']);

            $amounts = array_map(fn ($c) => $c['amount'], $catMap);
            $allocatedPct = self::allocatePercentages($amounts);

            $breakdown = [];
            foreach ($catMap as $catName => $data) {
                $breakdown[] = [
                    'category' => $catName,
                    'count' => $data['count'],
                    'amount' => $data['amount'],
                    'percentage' => $allocatedPct[$catName] ?? 0.0,
                    'amount_formatted' => self::formatRupiah($data['amount']),
                ];
            }

            return $breakdown;
        };

        $incomeBreakdown = $buildCategoryBreakdown($incomeCatMap, $totalIncome);
        $expenseBreakdown = $buildCategoryBreakdown($expenseCatMap, $totalExpense);

        // 4. Periodic Rows (Daily or Monthly)
        $periodicRows = [];
        foreach ($periodicMap as $row) {
            $row['net_profit'] = $row['income'] - $row['expense'];
            $row['income_formatted'] = self::formatRupiah($row['income']);
            $row['expense_formatted'] = self::formatRupiah($row['expense']);
            $row['net_profit_formatted'] = self::formatRupiah($row['net_profit']);
            $periodicRows[] = $row;
        }

        // 5. Compare with Previous Period
        $prevRange = self::getPreviousRange($range);
        $prevQuery = Transaction::where('business_id', $businessId)
            ->where('occurred_at', '>=', $prevRange['start']->copy()->utc())
            ->where('occurred_at', '<=', $prevRange['end']->copy()->utc());

        if (Schema::hasColumn('transactions', 'deleted_at')) {
            $prevQuery->whereNull('deleted_at');
        }

        $prevIncome = (int) (clone $prevQuery)->where('type', 'income')->sum('amount');
        $prevExpense = (int) (clone $prevQuery)->where('type', 'expense')->sum('amount');
        $prevNetProfit = $prevIncome - $prevExpense;

        $incomeDelta = self::calcDelta($totalIncome, $prevIncome);
        $profitDelta = self::calcDelta($netProfit, $prevNetProfit);

        $nowWib = Carbon::now(self::TIMEZONE);

        return [
            'header' => [
                'business_name' => $businessName,
                'owner_name' => $ownerName,
                'periode_label' => $range['label'],
                'dari' => $range['start']->format('Y-m-d'),
                'sampai' => $range['end']->format('Y-m-d'),
                'dari_formatted' => $range['start']->format('d M Y'),
                'sampai_formatted' => $range['end']->format('d M Y'),
                'generated_at' => $nowWib->format('d M Y, H:i').' WIB',
                'disclaimer' => 'Laporan sederhana berdasarkan transaksi yang dicatat pengguna, bukan laporan akuntansi resmi.',
            ],
            'summary' => [
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_profit' => $netProfit,
                'profit_label' => $profitLabel,
                'transaction_count' => $transactionCount,
                'income_count' => $incomeCount,
                'expense_count' => $expenseCount,
                'avg_income_transaction' => $avgIncomeTransaction,
                'total_income_formatted' => self::formatRupiah($totalIncome),
                'total_expense_formatted' => self::formatRupiah($totalExpense),
                'net_profit_formatted' => self::formatRupiah($netProfit),
                'avg_income_formatted' => $avgIncomeTransaction !== null ? self::formatRupiah($avgIncomeTransaction) : '-',
                'income_delta' => $incomeDelta,
                'profit_delta' => $profitDelta,
            ],
            'categories' => [
                'income' => $incomeBreakdown,
                'expense' => $expenseBreakdown,
                'income_total' => $totalIncome,
                'expense_total' => $totalExpense,
            ],
            'periodic' => [
                'is_monthly' => $range['is_monthly'],
                'type' => $range['is_monthly'] ? 'monthly' : 'daily',
                'rows' => $periodicRows,
            ],
            'transactions' => $transactions->map(fn ($t) => [
                'id' => $t->id,
                'date' => $t->occurred_at->copy()->setTimezone(self::TIMEZONE)->format('Y-m-d'),
                'time' => $t->occurred_at->copy()->setTimezone(self::TIMEZONE)->format('H:i'),
                'type' => $t->type,
                'item' => (string) $t->item,
                'quantity' => (int) $t->quantity,
                'category' => (string) ($t->category ?: 'Tanpa kategori'),
                'amount' => (int) $t->amount,
                'note' => (string) ($t->note ?: '-'),
                'source' => strtolower((string) $t->source) === 'voice' ? 'Suara' : 'Manual',
            ])->all(),
        ];
    }
}
