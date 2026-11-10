<?php

namespace App\Support;

use Carbon\Carbon;
use Illuminate\Support\Collection;

class AnalysisHelper
{
    /**
     * Convert any date/time representation to Carbon in Asia/Jakarta timezone.
     */
    public static function parseWib(mixed $date): Carbon
    {
        if ($date instanceof Carbon) {
            return $date->copy()->setTimezone('Asia/Jakarta');
        }

        if ($date instanceof \DateTimeInterface) {
            return Carbon::instance($date)->setTimezone('Asia/Jakarta');
        }

        return Carbon::parse($date, 'Asia/Jakarta')->setTimezone('Asia/Jakarta');
    }

    /**
     * Get WIB hour (0-23) and day of week (1=Senin to 7=Minggu).
     *
     * @return array{hour: int, day_of_week: int}
     */
    public static function getWibHourAndDay(mixed $date): array
    {
        $wib = self::parseWib($date);

        return [
            'hour' => (int) $wib->format('G'),
            'day_of_week' => (int) $wib->dayOfWeekIso,
        ];
    }

    /**
     * Normalize item name: lowercase, trim, collapse consecutive whitespaces.
     */
    public static function normalizeItemKey(?string $item): string
    {
        if ($item === null) {
            return '';
        }

        $trimmed = trim($item);
        if ($trimmed === '') {
            return '';
        }

        $collapsed = preg_replace('/\s+/u', ' ', $trimmed);

        return mb_strtolower((string) $collapsed, 'UTF-8');
    }

    /**
     * Deterministic hash of facts array.
     */
    public static function hashFacts(array $facts): string
    {
        $sorted = self::sortRecursive($facts);

        return hash('sha256', (string) json_encode($sorted, JSON_UNESCAPED_UNICODE));
    }

    /**
     * Recursively sort array keys for deterministic serialization.
     */
    protected static function sortRecursive(mixed $data): mixed
    {
        if (! is_array($data)) {
            return $data;
        }

        $isAssoc = array_keys($data) !== range(0, count($data) - 1);
        if ($isAssoc) {
            ksort($data);
        }

        foreach ($data as $key => $value) {
            $data[$key] = self::sortRecursive($value);
        }

        return $data;
    }

    /**
     * Sanitize trend keyword/format term:
     * - strip HTML
     * - reject URLs or prompt-injection attempts
     * - limit to 60 characters
     */
    public static function sanitizeTrendTerm(?string $term): string
    {
        if ($term === null) {
            return '';
        }

        $clean = strip_tags($term);
        $clean = preg_replace('/[\x00-\x1F\x7F]/u', '', $clean);
        $clean = trim((string) preg_replace('/\s+/u', ' ', $clean));

        if ($clean === '') {
            return '';
        }

        // Reject if contains URL patterns
        if (preg_match('/(https?:\/\/|www\.|\.com|\.org|\.net|\.id|\.io)/i', $clean)) {
            return '';
        }

        // Reject if contains typical prompt injection markers
        if (preg_match('/(ignore previous|system prompt|you are now|developer mode|dan mode|jailbreak)/i', $clean)) {
            return '';
        }

        return mb_substr($clean, 0, 60, 'UTF-8');
    }

    /**
     * Compute sales stats from transactions for the past 28 days (WIB).
     *
     * @param  iterable<mixed>  $transactions
     * @return array<string, mixed>
     */
    public static function computeSalesStats(iterable $transactions, mixed $now = null): array
    {
        $nowWib = self::parseWib($now ?? Carbon::now('Asia/Jakarta'));
        $startWindow = $nowWib->copy()->subDays(28)->startOfDay();

        $txList = $transactions instanceof Collection ? $transactions : collect($transactions);

        // Filter: only income, within 28 days up to nowWib
        $validIncomes = $txList->filter(function ($tx) use ($startWindow, $nowWib) {
            $type = is_array($tx) ? ($tx['type'] ?? null) : ($tx->type ?? null);
            if ($type !== 'income') {
                return false;
            }

            $rawOccurred = is_array($tx) ? ($tx['occurred_at'] ?? null) : ($tx->occurred_at ?? null);
            if (! $rawOccurred) {
                return false;
            }

            $occurredWib = self::parseWib($rawOccurred);

            return $occurredWib->gte($startWindow) && $occurredWib->lte($nowWib);
        });

        $incomeCount = $validIncomes->count();

        // Calculate distinct dates (Y-m-d WIB)
        $distinctDates = $validIncomes->map(function ($tx) {
            $rawOccurred = is_array($tx) ? ($tx['occurred_at'] ?? null) : ($tx->occurred_at ?? null);

            return self::parseWib($rawOccurred)->format('Y-m-d');
        })->unique();

        $distinctDaysCount = $distinctDates->count();

        // Check sufficiency: >= 10 transactions AND >= 3 distinct days
        $isSufficient = ($incomeCount >= 10 && $distinctDaysCount >= 3);

        if (! $isSufficient) {
            return [
                'sufficient_data' => false,
                'income_count' => $incomeCount,
                'distinct_days_count' => $distinctDaysCount,
                'min_transactions_required' => 10,
                'min_days_required' => 3,
                'progress_text' => "{$incomeCount} dari 10 transaksi",
                'message' => 'Catat lebih banyak transaksi agar analisis muncul',
            ];
        }

        $totalRevenue = 0;
        $itemGroups = [];
        $hourlyBuckets = array_fill(0, 24, ['count' => 0, 'revenue' => 0]);
        $dayBuckets = [];
        for ($i = 1; $i <= 7; $i++) {
            $dayBuckets[$i] = [
                'dates' => [], // unique Y-m-d for this weekday
                'total_revenue' => 0,
                'count' => 0,
            ];
        }

        $latestDate = null;

        foreach ($validIncomes as $tx) {
            $amount = (int) (is_array($tx) ? ($tx['amount'] ?? 0) : ($tx->amount ?? 0));
            $qty = (int) (is_array($tx) ? ($tx['quantity'] ?? 1) : ($tx->quantity ?? 1));
            if ($qty < 1) {
                $qty = 1;
            }

            $rawItem = is_array($tx) ? ($tx['item'] ?? '') : ($tx->item ?? '');
            $rawOccurred = is_array($tx) ? ($tx['occurred_at'] ?? null) : ($tx->occurred_at ?? null);
            $occurredWib = self::parseWib($rawOccurred);

            $totalRevenue += $amount;

            if ($latestDate === null || $occurredWib->gt($latestDate)) {
                $latestDate = $occurredWib;
            }

            // Group item
            $normalizedItem = self::normalizeItemKey($rawItem);
            $groupKey = $normalizedItem === '' ? 'Tanpa nama item' : $normalizedItem;

            if (! isset($itemGroups[$groupKey])) {
                $itemGroups[$groupKey] = [
                    'item' => $groupKey === 'Tanpa nama item' ? 'Tanpa nama item' : trim((string) $rawItem),
                    'normalized_key' => $normalizedItem,
                    'quantity' => 0,
                    'total_revenue' => 0,
                ];
            }
            $itemGroups[$groupKey]['quantity'] += $qty;
            $itemGroups[$groupKey]['total_revenue'] += $amount;

            // Hourly bucket
            $hour = (int) $occurredWib->format('G');
            $hourlyBuckets[$hour]['count']++;
            $hourlyBuckets[$hour]['revenue'] += $amount;

            // Day bucket (1=Senin ... 7=Minggu)
            $dayOfWeek = (int) $occurredWib->dayOfWeekIso;
            $dateStr = $occurredWib->format('Y-m-d');
            $dayBuckets[$dayOfWeek]['dates'][$dateStr] = true;
            $dayBuckets[$dayOfWeek]['total_revenue'] += $amount;
            $dayBuckets[$dayOfWeek]['count']++;
        }

        // Top 3 Products: exclude "Tanpa nama item"
        $validItems = array_filter($itemGroups, function ($group) {
            return $group['normalized_key'] !== '';
        });

        usort($validItems, function ($a, $b) {
            if ($a['total_revenue'] !== $b['total_revenue']) {
                return $b['total_revenue'] <=> $a['total_revenue'];
            }

            return $b['quantity'] <=> $a['quantity'];
        });

        $top3Products = array_slice($validItems, 0, 3);

        // Peak Hour: highest count; tie break with higher revenue; then earlier hour
        $peakHour = 0;
        $maxHourCount = -1;
        $maxHourRevenue = -1;

        foreach ($hourlyBuckets as $h => $stats) {
            if ($stats['count'] > $maxHourCount || ($stats['count'] === $maxHourCount && $stats['revenue'] > $maxHourRevenue)) {
                $peakHour = $h;
                $maxHourCount = $stats['count'];
                $maxHourRevenue = $stats['revenue'];
            }
        }

        $nextHour = ($peakHour + 1) % 24;
        $peakHourLabel = sprintf('%02d.00-%02d.00', $peakHour, $nextHour);

        // Peak Day: highest average revenue per date (rata-rata pendapatan per tanggal tertinggi)
        $dayNames = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ];

        $peakDayIso = 1;
        $maxDayAvgRevenue = -1.0;

        foreach ($dayBuckets as $dayIso => $stats) {
            $numDates = count($stats['dates']);
            $avgRevenue = $numDates > 0 ? ($stats['total_revenue'] / $numDates) : 0.0;

            if ($avgRevenue > $maxDayAvgRevenue) {
                $maxDayAvgRevenue = $avgRevenue;
                $peakDayIso = $dayIso;
            }
        }

        $peakDayName = $dayNames[$peakDayIso];

        // Average transaction value
        $avgTransactionValue = (int) round($totalRevenue / max(1, $incomeCount));

        // Hourly distribution for UI charts
        $hourlyDistribution = [];
        $maxBucketCount = max(1, ...array_map(fn ($b) => $b['count'], $hourlyBuckets));

        for ($h = 0; $h < 24; $h++) {
            $hourlyDistribution[] = [
                'hour' => $h,
                'time' => sprintf('%02d:00', $h),
                'label' => sprintf('%02d.00-%02d.00', $h, ($h + 1) % 24),
                'count' => $hourlyBuckets[$h]['count'],
                'revenue' => $hourlyBuckets[$h]['revenue'],
                'percentage' => round(($hourlyBuckets[$h]['count'] / $maxBucketCount) * 100),
                'is_peak' => ($h === $peakHour),
            ];
        }

        return [
            'sufficient_data' => true,
            'income_count' => $incomeCount,
            'distinct_days_count' => $distinctDaysCount,
            'total_revenue' => $totalRevenue,
            'average_transaction_value' => $avgTransactionValue,
            'top_products' => $top3Products,
            'peak_hour' => [
                'hour' => $peakHour,
                'label' => $peakHourLabel,
                'count' => $maxHourCount,
                'revenue' => $maxHourRevenue,
            ],
            'peak_day' => [
                'day_iso' => $peakDayIso,
                'day_name' => $peakDayName,
                'average_revenue' => (int) round($maxDayAvgRevenue),
            ],
            'periode' => [
                'start' => $startWindow->format('d M Y'),
                'end' => $nowWib->format('d M Y'),
                'start_iso' => $startWindow->toDateString(),
                'end_iso' => $nowWib->toDateString(),
            ],
            'hourly_distribution' => $hourlyDistribution,
            'data_date' => $latestDate ? $latestDate->format('Y-m-d') : $nowWib->format('Y-m-d'),
            'source' => 'Data transaksi kamu di LAPAK',
        ];
    }

    /**
     * Validate that any number that appears in the AI recommendation was present in the provided facts.
     */
    public static function validateRecommendationNumbers(string $recommendation, array $facts): bool
    {
        // Extract all number tokens from the recommendation (e.g. 15, 15.000, 4.500.000, 25%, 3, 100)
        preg_match_all('/\b\d+(?:[\.,]\d+)*%?\b/u', $recommendation, $recMatches);
        $recNumbers = $recMatches[0] ?? [];

        if (empty($recNumbers)) {
            return true;
        }

        // Collect all numeric values and formatted variations from $facts
        $knownNumberTokens = self::extractFactsNumberTokens($facts);

        foreach ($recNumbers as $numToken) {
            $normalizedRec = self::normalizeNumberToken($numToken);
            if (! in_array($normalizedRec, $knownNumberTokens, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Flatten facts array and collect all representations of numbers.
     *
     * @return list<string>
     */
    protected static function extractFactsNumberTokens(mixed $data): array
    {
        $tokens = [];
        $rawValues = [];

        $iterator = function ($item) use (&$iterator, &$rawValues) {
            if (is_array($item)) {
                foreach ($item as $sub) {
                    $iterator($sub);
                }
            } elseif (is_numeric($item)) {
                $rawValues[] = (float) $item;
            } elseif (is_string($item)) {
                preg_match_all('/\b\d+(?:[\.,]\d+)*%?\b/u', $item, $matches);
                foreach ($matches[0] ?? [] as $m) {
                    $rawValues[] = self::normalizeNumberToken($m);
                }
            }
        };

        $iterator($data);

        foreach ($rawValues as $val) {
            if (is_float($val) || is_int($val)) {
                $tokens[] = (string) $val;
                $tokens[] = (string) (int) $val;
                // Indonesian formatted: 15.000
                $tokens[] = number_format($val, 0, ',', '.');
                $tokens[] = number_format($val, 0, '.', ',');
                // Hourly e.g. 15.00 or 15:00
                $tokens[] = sprintf('%02d.00', (int) $val);
                $tokens[] = sprintf('%02d:00', (int) $val);

                // Common Indonesian colloquial units: 4.5 juta, 15rb
                if ($val >= 1000000) {
                    $tokens[] = (string) round($val / 1000000, 1);
                    $tokens[] = str_replace('.', ',', (string) round($val / 1000000, 1));
                    $tokens[] = (string) (int) ($val / 1000000);
                }
                if ($val >= 1000) {
                    $tokens[] = (string) round($val / 1000, 1);
                    $tokens[] = str_replace('.', ',', (string) round($val / 1000, 1));
                    $tokens[] = (string) (int) ($val / 1000);
                }
            } else {
                $tokens[] = (string) $val;
            }
        }

        return array_values(array_unique($tokens));
    }

    /**
     * Normalize a number token for comparison.
     */
    protected static function normalizeNumberToken(string $token): string
    {
        $clean = trim($token, '%');
        // If formatted like 15.000 (thousands dot)
        if (preg_match('/^\d{1,3}(?:\.\d{3})+$/', $clean)) {
            return str_replace('.', '', $clean);
        }
        // If formatted like 15,000 (thousands comma)
        if (preg_match('/^\d{1,3}(?:,\d{3})+$/', $clean)) {
            return str_replace(',', '', $clean);
        }

        return $clean;
    }

    /**
     * Build deterministic template recommendation when AI fails, timeouts, or facts need template.
     *
     * @return array{title: string, recommendation: string}
     */
    public static function buildTemplateRecommendation(string $type, array $facts): array
    {
        if ($type === 'penjualan') {
            $topProduct = $facts['top_products'][0]['item'] ?? null;
            $peakHour = $facts['peak_hour']['label'] ?? null;

            if ($topProduct && $peakHour) {
                return [
                    'title' => 'Peluang Promo Jam Ramai',
                    'recommendation' => "{$topProduct} paling laris, terutama sekitar jam {$peakHour}. Coba promo khusus {$topProduct} di jam itu.",
                ];
            }

            if ($peakHour) {
                return [
                    'title' => 'Optimalkan Waktu Buka',
                    'recommendation' => "Jam {$peakHour} adalah waktu paling ramai tokomu. Siapkan persediaan lebih awal sebelum jam tersebut.",
                ];
            }

            return [
                'title' => 'Pertahankan Konsistensi Penjualan',
                'recommendation' => 'Terus catat transaksi setiap hari untuk memantau produk dan jam paling laris usahamu.',
            ];
        }

        if ($type === 'geodemografis') {
            $ageGroups = $facts['age_groups'] ?? [];
            usort($ageGroups, fn ($a, $b) => ($b['share'] ?? 0) <=> ($a['share'] ?? 0));
            $dominantAge = $ageGroups[0]['label'] ?? 'usia produktif';

            return [
                'title' => 'Pasar Sekitar Lapak',
                'recommendation' => "Kelompok usia {$dominantAge} paling banyak di sekitarmu. Sesuaikan promosi dan produk untuk mereka.",
            ];
        }

        if ($type === 'tren') {
            $term = $facts['keywords'][0]['term'] ?? null;
            if ($term) {
                return [
                    'title' => 'Manfaatkan Tren Pencarian',
                    'recommendation' => "Kata kunci '{$term}' sedang naik. Pakai kata itu di caption promosimu.",
                ];
            }

            return [
                'title' => 'Perhatikan Minat Pembeli',
                'recommendation' => 'Gunakan tren digital terbaru untuk menarik calon pembeli baru di sekitar usahamu.',
            ];
        }

        return [
            'title' => 'Saran Usaha Hari Ini',
            'recommendation' => 'Tingkatkan promosi dan pantau terus riwayat transaksi harian usahamu.',
        ];
    }
}
