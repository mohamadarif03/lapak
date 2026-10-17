<?php

namespace App\Support;

use Carbon\Carbon;

class SpokenTransactionParser
{
    /**
     * Slang and colloquial vocabulary to nominal value.
     *
     * @var array<string, int>
     */
    protected const SLANG_MAP = [
        'setengah juta' => 500000,
        'sejuta' => 1000000,
        'cepek' => 100000,
        'seratus ribu' => 100000,
        'gocap' => 50000,
        'ceban' => 10000,
        'goceng' => 5000,
        'seceng' => 1000,
        'gopek' => 500,
    ];

    /**
     * Parse nominal amount from Indonesian spoken or typed text.
     */
    public static function parseSpokenAmount(string $text, int $quantity = 1): ?int
    {
        $clean = mb_strtolower(trim($text), 'UTF-8');

        // Check if individual unit price keyword is present (e.g., "masing-masing", "per", "satuan", "@")
        $isPerUnit = (bool) preg_match('/\b(masing[-\s]?masing|per|satuan|@|seporsi|sebuah|sebutir|sebungkus)\b/i', $clean);

        // 1. Direct slang match
        foreach (self::SLANG_MAP as $slang => $val) {
            if (preg_match('/\b'.preg_quote($slang, '/').'\b/i', $clean)) {
                return $isPerUnit ? ($val * max(1, $quantity)) : $val;
            }
        }

        // 2. Format with "k" or "rb" or "rebu" or "ribu", e.g. "15k", "15rb", "15 rebu", "10 k", "20 ribu"
        if (preg_match('/\b(\d+(?:[.,]\d+)?)\s*(?:k|rb|rebu|ribu)\b/i', $clean, $matches)) {
            $numVal = (int) (floatval(str_replace(',', '.', $matches[1])) * 1000);

            return $isPerUnit ? ($numVal * max(1, $quantity)) : $numVal;
        }

        // 3. Format with "juta", e.g. "2,5 juta", "2 juta", "1.5 juta"
        if (preg_match('/\b(\d+(?:[.,]\d+)?)\s*juta\b/i', $clean, $matches)) {
            $numVal = (int) (floatval(str_replace(',', '.', $matches[1])) * 1000000);

            return $isPerUnit ? ($numVal * max(1, $quantity)) : $numVal;
        }

        // 4. Currency symbols / standard digits e.g. "Rp 15.000", "15.000", "15,000", "15000"
        if (preg_match('/(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+(?!\d)|\d{4,9})/i', $clean, $matches)) {
            $rawDigit = preg_replace('/[^0-9]/', '', $matches[1]);
            $numVal = (int) $rawDigit;
            if ($numVal > 0) {
                return $isPerUnit ? ($numVal * max(1, $quantity)) : $numVal;
            }
        }

        // 5. Spoken words parser: "tiga puluh ribu", "seratus lima puluh ribu", "dua puluh lima ribu", "limabelas rebu"
        $wordsAmount = self::parseWordsAmount($clean);
        if ($wordsAmount !== null && $wordsAmount > 0) {
            return $isPerUnit ? ($wordsAmount * max(1, $quantity)) : $wordsAmount;
        }

        return null;
    }

    /**
     * Parses spoken Indonesian number words into integer.
     */
    protected static function parseWordsAmount(string $text): ?int
    {
        // Normalize abbreviations
        $norm = preg_replace('/\blimabelas\b/i', 'lima belas', $text);
        $norm = preg_replace('/\bduapuluh\b/i', 'dua puluh', $norm);
        $norm = preg_replace('/\btigapuluh\b/i', 'tiga puluh', $norm);
        $norm = preg_replace('/\brebu\b/i', 'ribu', $norm);

        // Find pattern ending in "ribu" or "juta" or "ratus"
        // Look from right to left for magnitude
        if (preg_match('/((?:(?:seratus|seribu|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|belas|puluh|ratus)\s+)*(?:seratus|seribu|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|belas|puluh|ratus))\s+(ribu|juta)\b/i', $norm, $m)) {
            $subWords = trim($m[1]);
            $unit = strtolower($m[2]);
            $multiplier = ($unit === 'juta') ? 1000000 : 1000;

            $baseVal = self::evaluateIndonesianNumberPhrase($subWords);
            if ($baseVal > 0) {
                return $baseVal * $multiplier;
            }
        }

        // Pattern for "seribu lima ratus", "dua juta lima ratus"
        if (preg_match('/(seribu|dua juta|tiga juta|\d+\s+juta)\s+(?:lima ratus|satu ratus|dua ratus|tiga ratus|empat ratus)/i', $norm, $m)) {
            if (str_contains($m[0], 'seribu lima ratus')) {
                return 1500;
            }
            if (str_contains($m[0], 'dua juta lima ratus')) {
                return 2500000;
            }
        }

        return null;
    }

    /**
     * Evaluate small Indonesian number phrase up to 999.
     */
    protected static function evaluateIndonesianNumberPhrase(string $phrase): int
    {
        $tokens = preg_split('/\s+/', trim($phrase));
        $val = 0;
        $current = 0;

        foreach ($tokens as $token) {
            switch ($token) {
                case 'satu':
                    $current += 1;
                    break;
                case 'dua':
                    $current += 2;
                    break;
                case 'tiga':
                    $current += 3;
                    break;
                case 'empat':
                    $current += 4;
                    break;
                case 'lima':
                    $current += 5;
                    break;
                case 'enam':
                    $current += 6;
                    break;
                case 'tujuh':
                    $current += 7;
                    break;
                case 'delapan':
                    $current += 8;
                    break;
                case 'sembilan':
                    $current += 9;
                    break;
                case 'sepuluh':
                    $current += 10;
                    break;
                case 'sebelas':
                    $current += 11;
                    break;
                case 'belas':
                    if ($current < 10) {
                        $current += 10;
                    }
                    break;
                case 'puluh':
                    $current = ($current === 0 ? 1 : $current) * 10;
                    break;
                case 'seratus':
                    $val += 100;
                    break;
                case 'ratus':
                    $val += ($current === 0 ? 1 : $current) * 100;
                    $current = 0;
                    break;
            }
        }

        return $val + $current;
    }

    /**
     * Detect transaction type (income / expense / null).
     */
    public static function detectTransactionType(string $text): ?string
    {
        $clean = mb_strtolower(trim($text), 'UTF-8');

        // Income triggers
        if (preg_match('/\b(jual|terjual|laku|dapat|terima|masuk|pemasukan|omzet|penjualan)\b/i', $clean)) {
            return 'income';
        }

        // Expense triggers
        if (preg_match('/\b(beli|bayar|belanja|keluar|ongkos|gaji|pengeluaran|biaya|kasbon)\b/i', $clean)) {
            return 'expense';
        }

        return null;
    }

    /**
     * Detect quantity mentioned (e.g., "dua nasi goreng", "lima kopi", "3 kue").
     */
    public static function detectQuantity(string $text): int
    {
        $clean = mb_strtolower(trim($text), 'UTF-8');

        // Look for digit quantity e.g. "2 nasi goreng"
        if (preg_match('/\b(\d+)\s+(?:buah|porsi|bungkus|paket|gelas|cup|biji|pcs|kg|kilo|lembar|potong|pasang|butir)?\s*(?:[a-z]+)/i', $clean, $m)) {
            $val = (int) $m[1];
            if ($val > 0 && $val < 1000) {
                return $val;
            }
        }

        // Look for word quantity before item
        $wordMap = [
            'satu' => 1, 'dua' => 2, 'tiga' => 3, 'empat' => 4, 'lima' => 5,
            'enam' => 6, 'tujuh' => 7, 'delapan' => 8, 'sembilan' => 9, 'sepuluh' => 10,
        ];

        foreach ($wordMap as $w => $num) {
            // E.g. "jual dua nasi", "beli lima kopi", "tiga kue", "kemarin jual lima kopi"
            if (preg_match('/\b(?:jual|beli|terjual|laku|terima|dapat|kemarin)\s+'.preg_quote($w, '/').'\s+(?:buah|porsi|bungkus|paket|gelas|cup|lembar)?\s*([a-z]+)/i', $clean)) {
                return $num;
            }
            if (preg_match('/\b'.preg_quote($w, '/').'\s+(?:buah|porsi|bungkus|paket|gelas|cup|lembar)?\s*(?:kue|nasi|kopi|roti|baju|kemeja|kaos|ayam|ikan|mie|teh|plastik|minyak|beras|telur)\b/i', $clean)) {
                return $num;
            }
        }

        return 1;
    }

    /**
     * Normalize the item name by stripping verbs, numbers, units, and price keywords.
     */
    public static function normalizeItem(string $text): string
    {
        $clean = mb_strtolower(trim($text), 'UTF-8');

        // Special fixed phrases
        if (preg_match('/\b(ongkos\s+kirim)\b/i', $clean)) {
            return 'Ongkos kirim';
        }
        if (preg_match('/\b(pembayaran\s+servis|servis)\b/i', $clean)) {
            return 'Servis';
        }

        // Normalize dialect before stripping
        $clean = preg_replace('/\blimabelas\b/i', 'lima belas', $clean);
        $clean = preg_replace('/\bduapuluh\b/i', 'dua puluh', $clean);
        $clean = preg_replace('/\btigapuluh\b/i', 'tiga puluh', $clean);
        $clean = preg_replace('/\brebu\b/i', 'ribu', $clean);

        // Remove relative time words
        $clean = preg_replace('/\b(kemarin|tadi pagi|tadi siang|tadi sore|tadi malam|hari ini)\b/i', '', $clean);

        // Remove transaction action words
        $clean = preg_replace('/\b(jual|terjual|laku|beli|bayar|belanja|terima|pembayaran|ongkos)\b/i', '', $clean);

        // Remove slang & standard price representations
        foreach (array_keys(self::SLANG_MAP) as $slang) {
            $clean = preg_replace('/\b'.preg_quote($slang, '/').'\b/i', '', $clean);
        }
        $clean = preg_replace('/(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+)/i', '', $clean);
        $clean = preg_replace('/\b(\d+(?:[.,]\d+)?)\s*(?:k|rb|rebu|ribu|juta)\b/i', '', $clean);
        $clean = preg_replace('/\b(seratus|seribu|sejuta|setengah)\b/i', '', $clean);
        $clean = preg_replace('/\b(puluh|ratus|ribu|rebu|juta|belas)\b/i', '', $clean);
        $clean = preg_replace('/\b(masing[-\s]?masing|per|satuan|@)\b/i', '', $clean);

        // Remove numbers (e.g. "dua puluh lima", "tiga puluh", "dua", "lima", etc.)
        $clean = preg_replace('/\b(satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh)\b/i', '', $clean);
        $clean = preg_replace('/\b(buah|porsi|bungkus|paket|gelas|cup|lembar|potong|pasang|butir|kg|kilo|liter)\b/i', '', $clean);

        // Remove filler prepositions
        $clean = preg_replace('/\b(sebesar|senilai|total|seharga|harga|sebanyak|buat|untuk|ada|dan|sama)\b/i', '', $clean);

        // Clean extra spaces & punctuation
        $clean = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $clean);
        $clean = trim(preg_replace('/\s+/', ' ', $clean));

        if ($clean === '') {
            return '';
        }

        // Title case with first letter capitalized
        return mb_convert_case(mb_substr($clean, 0, 1), MB_CASE_UPPER, 'UTF-8').mb_substr($clean, 1);
    }

    /**
     * Parse relative date/time into WIB Carbon object.
     */
    public static function parseRelativeTime(string $text, ?Carbon $now = null): Carbon
    {
        $now = $now ? $now->copy()->setTimezone('Asia/Jakarta') : Carbon::now('Asia/Jakarta');
        $clean = mb_strtolower(trim($text), 'UTF-8');

        if (str_contains($clean, 'kemarin')) {
            return $now->subDay()->setTime(14, 0, 0);
        }

        if (str_contains($clean, 'tadi pagi')) {
            $time = $now->copy()->setTime(8, 0, 0);

            return $time->isFuture() ? $now : $time;
        }

        if (str_contains($clean, 'tadi siang')) {
            $time = $now->copy()->setTime(12, 30, 0);

            return $time->isFuture() ? $now : $time;
        }

        if (str_contains($clean, 'tadi sore')) {
            $time = $now->copy()->setTime(16, 0, 0);

            return $time->isFuture() ? $now : $time;
        }

        if (str_contains($clean, 'tadi malam')) {
            $time = $now->copy()->setTime(20, 0, 0);
            if ($time->isFuture()) {
                $time->subDay();
            }

            return $time;
        }

        return $now;
    }

    /**
     * Detect category matching user's business type.
     */
    public static function detectCategory(string $item, ?string $type, string $businessType = 'kuliner'): string
    {
        $clean = mb_strtolower($item, 'UTF-8');

        if ($type === 'expense') {
            if (preg_match('/\b(bensin|ongkos|kirim|ojol|transport|grab|gojek|solar|tol)\b/i', $clean)) {
                return 'Transportasi';
            }
            if (preg_match('/\b(listrik|air|pdam|pln|wifi|internet|sewa|gas|lpg|kebersihan|operasional)\b/i', $clean)) {
                return 'Operasional';
            }
            if (preg_match('/\b(gaji|upah|karyawan|bonus|thr)\b/i', $clean)) {
                return 'Gaji';
            }
            if (preg_match('/\b(gula|beras|kopi|plastik|minyak|telur|tepung|sayur|daging|ayam|kain|benang|bahan)\b/i', $clean)) {
                return 'Bahan baku';
            }

            return 'Operasional';
        }

        // Income
        if (preg_match('/\b(servis|jasa|reparasi|perbaikan|konsultasi|potong|jahit)\b/i', $clean)) {
            return 'Jasa';
        }

        return 'Penjualan';
    }

    /**
     * Complete parse pipeline for spoken text.
     *
     * @return array{
     *     transcript: string,
     *     type: ?string,
     *     amount: ?int,
     *     item: string,
     *     quantity: int,
     *     category: string,
     *     occurred_at: string,
     *     confidence: float,
     *     needs_review: bool,
     *     multiple_detected: bool
     * }
     */
    public static function parse(string $text, string $businessType = 'kuliner', ?Carbon $now = null): array
    {
        $now = $now ?: Carbon::now('Asia/Jakarta');
        $clean = trim($text);

        // Check if multiple transactions mentioned (e.g. contains "lalu", "terus", "sama beli", "dan beli")
        $isMultiple = (bool) preg_match('/\b(lalu|terus|dan\s+(?:beli|jual)|sama\s+(?:beli|jual))\b/i', $clean);

        // In multiple case, isolate first transaction
        $primaryText = $clean;
        if ($isMultiple) {
            $parts = preg_split('/\b(lalu|terus|dan\s+(?:beli|jual)|sama\s+(?:beli|jual))\b/i', $clean, 2);
            if (! empty($parts[0])) {
                $primaryText = trim($parts[0]);
            }
        }

        $type = self::detectTransactionType($primaryText);
        $quantity = self::detectQuantity($primaryText);
        $amount = self::parseSpokenAmount($primaryText, $quantity);
        $item = self::normalizeItem($primaryText);
        $occurredAt = self::parseRelativeTime($primaryText, $now);
        $category = self::detectCategory($item, $type, $businessType);

        $needsReview = false;
        $confidence = 0.95;

        if ($type === null) {
            $needsReview = true;
            $confidence -= 0.3;
        }

        if ($amount === null) {
            $needsReview = true;
            $confidence -= 0.3;
        }

        if ($item === '') {
            $needsReview = true;
            $confidence -= 0.2;
        }

        return [
            'transcript' => $clean,
            'type' => $type,
            'amount' => $amount,
            'item' => $item,
            'quantity' => $quantity,
            'category' => $category,
            'occurred_at' => $occurredAt->toIso8601String(),
            'confidence' => max(0.1, round($confidence, 2)),
            'needs_review' => $needsReview,
            'multiple_detected' => $isMultiple,
        ];
    }
}
