<?php

namespace App\Support;

use Carbon\Carbon;

class DashboardHelper
{
    /**
     * Format an integer rupiah amount.
     * Positive/zero: "Rp 15.000"
     * Negative: "-Rp 15.000"
     */
    public static function formatRupiah(int|float $amount): string
    {
        $rounded = (int) round($amount);
        $formatted = number_format(abs($rounded), 0, ',', '.');

        if ($rounded < 0) {
            return "-Rp {$formatted}";
        }

        return "Rp {$formatted}";
    }

    /**
     * Calculate period range and previous comparison range in Asia/Jakarta (WIB).
     * Week starts on Monday.
     *
     * @return array{
     *     periode: string,
     *     start: Carbon,
     *     end: Carbon,
     *     prevStart: Carbon,
     *     prevEnd: Carbon,
     *     prevLabel: string
     * }
     */
    public static function getPeriodRange(string $periode, ?Carbon $now = null): array
    {
        $now = $now ? $now->copy()->timezone('Asia/Jakarta') : Carbon::now('Asia/Jakarta');

        $normalized = match (strtolower(trim($periode))) {
            'minggu' => 'minggu',
            'bulan' => 'bulan',
            default => 'hari',
        };

        if ($normalized === 'hari') {
            $start = $now->copy()->startOfDay();
            $end = $now->copy()->endOfDay();
            $prevStart = $now->copy()->subDay()->startOfDay();
            $prevEnd = $now->copy()->subDay()->endOfDay();
            $prevLabel = 'kemarin';
        } elseif ($normalized === 'minggu') {
            $start = $now->copy()->startOfWeek(Carbon::MONDAY)->startOfDay();
            $end = $now->copy()->endOfWeek(Carbon::SUNDAY)->endOfDay();
            $prevStart = $now->copy()->subWeek()->startOfWeek(Carbon::MONDAY)->startOfDay();
            $prevEnd = $now->copy()->subWeek()->endOfWeek(Carbon::SUNDAY)->endOfDay();
            $prevLabel = 'minggu lalu';
        } else {
            $start = $now->copy()->startOfMonth()->startOfDay();
            $end = $now->copy()->endOfMonth()->endOfDay();
            $prevStart = $now->copy()->subMonthNoOverflow()->startOfMonth()->startOfDay();
            $prevEnd = $now->copy()->subMonthNoOverflow()->endOfMonth()->endOfDay();
            $prevLabel = 'bulan lalu';
        }

        return [
            'periode' => $normalized,
            'start' => $start,
            'end' => $end,
            'prevStart' => $prevStart,
            'prevEnd' => $prevEnd,
            'prevLabel' => $prevLabel,
        ];
    }

    /**
     * Get day range for date in Asia/Jakarta (WIB).
     *
     * @return array{start: Carbon, end: Carbon}
     */
    public static function getDayRange(string|Carbon $date): array
    {
        $c = $date instanceof Carbon
            ? $date->copy()->timezone('Asia/Jakarta')
            : Carbon::parse($date, 'Asia/Jakarta');

        return [
            'start' => $c->copy()->startOfDay(),
            'end' => $c->copy()->endOfDay(),
        ];
    }

    /**
     * Format transaction time display according to spec:
     * - Same day: "14.30"
     * - Different day: "15 Okt, 14.30"
     */
    public static function formatTransactionTime(Carbon|string $date, ?Carbon $now = null): string
    {
        $dt = $date instanceof Carbon ? $date->copy()->timezone('Asia/Jakarta') : Carbon::parse($date)->timezone('Asia/Jakarta');
        $current = $now ? $now->copy()->timezone('Asia/Jakarta') : Carbon::now('Asia/Jakarta');

        if ($dt->isSameDay($current)) {
            return $dt->format('H.i');
        }

        $months = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agu',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];

        $day = $dt->day;
        $month = $months[$dt->month] ?? $dt->format('M');
        $time = $dt->format('H.i');

        return "{$day} {$month}, {$time}";
    }
}
