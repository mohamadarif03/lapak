<?php

namespace App\Support;

class BusinessProfileHelper
{
    /**
     * List of valid business types.
     *
     * @var list<string>
     */
    public const VALID_BUSINESS_TYPES = [
        'kuliner',
        'fashion',
        'kerajinan',
        'jasa',
        'dagang',
        'lainnya',
    ];

    /**
     * Normalize a name or text string:
     * - Trim leading and trailing whitespace
     * - Collapse multiple consecutive whitespace characters into a single space
     * - Strip control characters
     */
    public static function normalizeName(?string $input): string
    {
        if ($input === null) {
            return '';
        }

        // Replace any whitespace sequences (including tabs, newlines) with a single space
        $withSpaces = preg_replace('/\s+/u', ' ', $input) ?? '';

        // Remove non-printable control characters
        $cleaned = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $withSpaces) ?? '';

        return trim($cleaned);
    }

    /**
     * Check if a business type value is valid.
     */
    public static function isValidBusinessType(?string $value): bool
    {
        if ($value === null || $value === '') {
            return false;
        }

        return in_array(strtolower(trim($value)), self::VALID_BUSINESS_TYPES, true);
    }

    /**
     * Check if coordinates lie within Indonesia.
     * Indonesia Bounding Box: lat between -11.5 and 6.5, lng between 94.5 and 141.5.
     * Excludes neighboring enclaves (e.g., Singapore).
     */
    public static function isWithinIndonesia(?float $lat, ?float $lng): bool
    {
        if ($lat === null || $lng === null || is_nan($lat) || is_nan($lng)) {
            return false;
        }

        // General Indonesian bounding box
        if ($lat < -11.5 || $lat > 6.5 || $lng < 94.5 || $lng > 141.5) {
            return false;
        }

        // Exclude Singapore area within the rough box (lat ~1.15 to 1.48, lng ~103.58 to 104.08)
        if ($lat >= 1.15 && $lat <= 1.48 && $lng >= 103.58 && $lng <= 104.08) {
            return false;
        }

        return true;
    }

    /**
     * Validate all business profile fields and return an array of error messages per field.
     *
     * @param  array<string, mixed>  $input
     * @return array<string, string> Keyed by field name ('owner_name', 'business_name', 'business_type', 'location', 'address')
     */
    public static function validateBusinessProfile(array $input): array
    {
        $errors = [];

        // 1. Owner Name Validation
        $rawOwner = isset($input['owner_name']) ? (string) $input['owner_name'] : '';
        $owner = self::normalizeName($rawOwner);

        if ($owner === '') {
            $errors['owner_name'] = 'Nama panggilan belum diisi.';
        } elseif (preg_match('/<[^>]*>/', $rawOwner) || str_contains($rawOwner, '<') || str_contains($rawOwner, '>')) {
            $errors['owner_name'] = 'Nama panggilan mengandung karakter yang tidak diizinkan.';
        } elseif (preg_match('/^\d+$/', str_replace([' ', '.', '-', "'"], '', $owner))) {
            $errors['owner_name'] = 'Nama panggilan tidak boleh hanya angka.';
        } elseif (mb_strlen($owner) < 2) {
            $errors['owner_name'] = 'Nama panggilan minimal 2 karakter.';
        } elseif (mb_strlen($owner) > 40) {
            $errors['owner_name'] = 'Nama panggilan maksimal 40 karakter.';
        } elseif (! preg_match('/^[\p{L}\s.\'\-]+$/u', $owner)) {
            $errors['owner_name'] = 'Nama panggilan hanya boleh berisi huruf, spasi, titik, apostrof, atau tanda hubung.';
        }

        // 2. Business Name Validation
        $rawBizName = isset($input['business_name']) ? (string) $input['business_name'] : '';
        $bizName = self::normalizeName($rawBizName);

        if ($bizName === '') {
            $errors['business_name'] = 'Nama usaha belum diisi.';
        } elseif (preg_match('/<[^>]*>/', $rawBizName) || str_contains($rawBizName, '<') || str_contains($rawBizName, '>')) {
            $errors['business_name'] = 'Nama usaha mengandung karakter yang tidak diizinkan.';
        } elseif (mb_strlen($bizName) < 2) {
            $errors['business_name'] = 'Nama usaha minimal 2 karakter.';
        } elseif (mb_strlen($bizName) > 60) {
            $errors['business_name'] = 'Nama usaha maksimal 60 karakter.';
        } elseif (! preg_match('/^[\p{L}0-9\s&.,\'\-\/]+$/u', $bizName)) {
            $errors['business_name'] = 'Nama usaha hanya boleh berisi huruf, angka, spasi, dan tanda baca umum (& . , \' - /).';
        }

        // 3. Business Type Validation
        $bizType = isset($input['business_type']) ? (string) $input['business_type'] : '';
        if (! self::isValidBusinessType($bizType)) {
            $errors['business_type'] = 'Pilih jenis usahamu.';
        }

        // 4. Location (Lat, Lng) Validation
        $lat = isset($input['lat']) && is_numeric($input['lat']) ? (float) $input['lat'] : null;
        $lng = isset($input['lng']) && is_numeric($input['lng']) ? (float) $input['lng'] : null;

        if ($lat === null || $lng === null) {
            $errors['location'] = 'Tentukan lokasi usahamu di peta.';
        } elseif (! self::isWithinIndonesia($lat, $lng)) {
            $errors['location'] = 'Lokasi harus berada di Indonesia.';
        }

        // 5. Address Validation (Optional string, max 200 chars)
        if (isset($input['address']) && is_string($input['address'])) {
            $address = self::normalizeName($input['address']);
            if (mb_strlen($address) > 200) {
                $errors['address'] = 'Alamat maksimal 200 karakter.';
            }
        }

        return $errors;
    }
}
