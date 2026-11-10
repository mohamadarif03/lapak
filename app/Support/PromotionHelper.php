<?php

namespace App\Support;

use App\Models\Business;
use Illuminate\Support\Str;

class PromotionHelper
{
    /**
     * Forbidden claim keywords that must not be hallucinated by AI
     */
    public const FORBIDDEN_CLAIMS = [
        'halal',
        'bpom',
        'obat',
        'kesehatan',
        'terbaik',
        'termurah',
        'asli 100%',
        '100% asli',
        'garansi',
        'testimoni',
    ];

    /**
     * Preset color schemes with guaranteed contrast
     *
     * @var array<string, array{name: string, bg: string, bg_gradient: list<string>, text: string, accent: string, badge_bg: string, badge_text: string}>
     */
    public const COLOR_SCHEMES = [
        'deepgreen' => [
            'name' => 'Deep Green',
            'bg' => '#174D3A',
            'bg_gradient' => ['#174D3A', '#0D3024'],
            'text' => '#FFFFFF',
            'accent' => '#D8A75B',
            'badge_bg' => '#D8A75B',
            'badge_text' => '#183C30',
        ],
        'warmgold' => [
            'name' => 'Muted Gold',
            'bg' => '#8A5700',
            'bg_gradient' => ['#8A5700', '#5C3A00'],
            'text' => '#FFFFFF',
            'accent' => '#F6EBD5',
            'badge_bg' => '#F6EBD5',
            'badge_text' => '#8A5700',
        ],
        'freshsage' => [
            'name' => 'Sage Mist',
            'bg' => '#2E5948',
            'bg_gradient' => ['#2E5948', '#123C2D'],
            'text' => '#FFFFFF',
            'accent' => '#A8BFA8',
            'badge_bg' => '#A8BFA8',
            'badge_text' => '#183C30',
        ],
        'oceanblue' => [
            'name' => 'Ocean Blue',
            'bg' => '#1E3A8A',
            'bg_gradient' => ['#1E3A8A', '#0F172A'],
            'text' => '#FFFFFF',
            'accent' => '#93C5FD',
            'badge_bg' => '#93C5FD',
            'badge_text' => '#1E3A8A',
        ],
        'terracotta' => [
            'name' => 'Terracotta',
            'bg' => '#9A3412',
            'bg_gradient' => ['#9A3412', '#431407'],
            'text' => '#FFFFFF',
            'accent' => '#FED7AA',
            'badge_bg' => '#FED7AA',
            'badge_text' => '#9A3412',
        ],
        'classicdark' => [
            'name' => 'Classic Dark',
            'bg' => '#18181B',
            'bg_gradient' => ['#27272A', '#09090B'],
            'text' => '#FFFFFF',
            'accent' => '#E4E4E7',
            'badge_bg' => '#F4F4F5',
            'badge_text' => '#18181B',
        ],
    ];

    /**
     * Preset styles
     */
    public const STYLES = ['Hangat', 'Segar', 'Elegan', 'Ceria'];

    /**
     * Normalize form input from user:
     * - trim, collapse whitespace, strip control characters
     * - validate limits
     */
    public static function normalizePromoInput(array $input): array
    {
        $cleanString = function (?string $val, int $max = 0): string {
            if ($val === null) {
                return '';
            }
            $clean = strip_tags($val);
            $clean = preg_replace('/[\x00-\x1F\x7F]/u', '', $clean);
            $clean = trim((string) preg_replace('/\s+/u', ' ', $clean));
            if ($max > 0) {
                $clean = mb_substr($clean, 0, $max, 'UTF-8');
            }

            return $clean;
        };

        $promoName = $cleanString($input['promo_name'] ?? $input['promoTitle'] ?? '', 60);
        $offerDetails = $cleanString($input['offer_details'] ?? $input['discountDetail'] ?? '', 300);
        $validPeriod = $cleanString($input['valid_period'] ?? '', 60);
        $contact = $cleanString($input['contact'] ?? '', 80);

        $style = $input['style'] ?? 'Hangat';
        if (! in_array($style, self::STYLES, true)) {
            $style = 'Hangat';
        }

        $colorScheme = $input['color_scheme'] ?? $input['colorTheme'] ?? 'deepgreen';
        if (! array_key_exists($colorScheme, self::COLOR_SCHEMES)) {
            $colorScheme = 'deepgreen';
        }

        $rawFormat = strtolower((string) ($input['format'] ?? $input['aspectRatio'] ?? 'feed'));
        $format = ($rawFormat === 'story' || $rawFormat === '9:16') ? 'story' : 'feed';

        $useEmoji = (bool) ($input['use_emoji'] ?? false);

        return [
            'promo_name' => $promoName,
            'offer_details' => $offerDetails,
            'valid_period' => $validPeriod !== '' ? $validPeriod : null,
            'contact' => $contact !== '' ? $contact : null,
            'style' => $style,
            'color_scheme' => $colorScheme,
            'format' => $format,
            'use_emoji' => $useEmoji,
        ];
    }

    /**
     * Sanitize a hashtag token:
     * - Strip leading #
     * - Only letters, numbers, and underscores
     * - E.g. "Kopi Susu!" -> "KopiSusu"
     */
    public static function sanitizeHashtag(?string $tag): string
    {
        if ($tag === null) {
            return '';
        }

        $clean = ltrim(trim($tag), '#');
        $clean = preg_replace('/[^\p{L}\p{N}_]+/u', '', $clean);

        return trim((string) $clean);
    }

    /**
     * Slugify string for file downloads (e.g. promosi-kopi-mantap-feed.png)
     */
    public static function slugify(string $text): string
    {
        $slug = Str::slug($text, '-');

        return $slug !== '' ? $slug : 'promo';
    }

    /**
     * Extract all number tokens from input strings or arrays.
     *
     * @return list<string>
     */
    public static function extractNumberTokens(mixed $data): array
    {
        $tokens = [];
        $raw = '';

        if (is_array($data)) {
            foreach ($data as $v) {
                if (is_scalar($v)) {
                    $raw .= ' '.(string) $v;
                }
            }
        } elseif (is_scalar($data)) {
            $raw = (string) $data;
        }

        preg_match_all('/\b\d+(?:[\.,]\d+)?%?\b/u', $raw, $matches);
        foreach ($matches[0] ?? [] as $m) {
            $clean = trim($m, '%');
            // Remove thousands separators
            $unseparated = str_replace(['.', ','], '', $clean);
            $tokens[] = $m;
            $tokens[] = $clean;
            $tokens[] = $unseparated;
            // Also store formatted versions
            if (is_numeric($unseparated)) {
                $num = (float) $unseparated;
                $tokens[] = (string) (int) $num;
                $tokens[] = number_format($num, 0, ',', '.');
                $tokens[] = number_format($num, 0, '.', ',');
                $tokens[] = sprintf('%02d.00', (int) $num);
                $tokens[] = sprintf('%02d:00', (int) $num);
            }
        }

        // Also extract hour range format like 15.00-17.00
        preg_match_all('/\b\d{1,2}[\.:]\d{2}\b/u', $raw, $hourMatches);
        foreach ($hourMatches[0] ?? [] as $hm) {
            $tokens[] = $hm;
            $tokens[] = str_replace(':', '.', $hm);
            $tokens[] = str_replace('.', ':', $hm);
            $tokens[] = (string) (int) substr($hm, 0, 2);
        }

        return array_values(array_unique(array_filter($tokens)));
    }

    /**
     * Validate that all numbers in generated copy exist in the user input.
     */
    public static function validateCopyNumbers(array $copy, array $userInput): bool
    {
        $copyText = implode(' ', [
            $copy['headline'] ?? '',
            $copy['subheadline'] ?? '',
            $copy['caption'] ?? '',
            $copy['cta'] ?? '',
        ]);

        preg_match_all('/\b\d+(?:[\.,]\d+)?%?\b/u', $copyText, $copyNumMatches);
        $copyNumbers = $copyNumMatches[0] ?? [];

        if (empty($copyNumbers)) {
            return true;
        }

        $knownTokens = self::extractNumberTokens($userInput);

        foreach ($copyNumbers as $numToken) {
            $clean = trim($numToken, '%');
            $unseparated = str_replace(['.', ','], '', $clean);

            $matched = in_array($numToken, $knownTokens, true)
                || in_array($clean, $knownTokens, true)
                || in_array($unseparated, $knownTokens, true);

            if (! $matched) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if text contains any forbidden claim that was NOT in user input.
     */
    public static function containsForbiddenClaims(string $text, array $userInput): bool
    {
        $lowerText = mb_strtolower($text, 'UTF-8');
        $userText = mb_strtolower(implode(' ', array_filter([
            $userInput['promo_name'] ?? '',
            $userInput['offer_details'] ?? '',
            $userInput['valid_period'] ?? '',
            $userInput['contact'] ?? '',
        ])), 'UTF-8');

        foreach (self::FORBIDDEN_CLAIMS as $claim) {
            if (str_contains($lowerText, $claim)) {
                // If user did not write this claim, it is forbidden!
                if (! str_contains($userText, $claim)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Build deterministic template copy when AI is disabled, fails, or hallucinates.
     *
     * @return array{headline: string, subheadline: string, caption: string, hashtags: list<string>, cta: string}
     */
    public static function buildTemplateCopy(array $input, ?Business $business = null): array
    {
        $promoName = $input['promo_name'] ?? 'Promo Spesial';
        $offerDetails = $input['offer_details'] ?? '';
        $validPeriod = $input['valid_period'] ?? null;
        $contact = $input['contact'] ?? null;
        $businessName = $business?->business_name ?? 'toko kami';
        $businessType = strtolower((string) ($business?->business_type ?? ''));

        $headline = mb_substr($promoName, 0, 40, 'UTF-8');
        $subheadline = mb_substr($offerDetails, 0, 70, 'UTF-8');

        $captionParts = [];
        $captionParts[] = "Spesial buat kamu: {$promoName}!";
        if ($offerDetails !== '') {
            $captionParts[] = "Nikmati penawaran hemat: {$offerDetails}.";
        }
        if ($validPeriod) {
            $captionParts[] = "Periode berlaku: {$validPeriod}.";
        }
        if ($contact) {
            $captionParts[] = "Pesan atau kunjungi kami di: {$contact}.";
        }
        $captionParts[] = "Yuk mampir ke {$businessName}!";

        $caption = implode(' ', $captionParts);
        $caption = mb_substr($caption, 0, 900, 'UTF-8');

        // Curated hashtags based on business type
        $defaultTags = ['umkmindonesia', 'promohariini'];
        if (str_contains($businessType, 'kuliner') || str_contains($businessType, 'makan') || str_contains($businessType, 'kopi')) {
            $defaultTags[] = 'kulinerlokal';
            $defaultTags[] = 'jajananlokal';
            $defaultTags[] = 'ngemilenak';
        } elseif (str_contains($businessType, 'fashion') || str_contains($businessType, 'baju')) {
            $defaultTags[] = 'fashionlokal';
            $defaultTags[] = 'ootdindonesia';
        } elseif (str_contains($businessType, 'jasa')) {
            $defaultTags[] = 'jasalokal';
            $defaultTags[] = 'solusiusaha';
        } elseif (str_contains($businessType, 'sembako') || str_contains($businessType, 'toko')) {
            $defaultTags[] = 'tokolokal';
            $defaultTags[] = 'belanjamurah';
        }

        if ($business?->business_name) {
            $bizTag = self::sanitizeHashtag($business->business_name);
            if ($bizTag !== '') {
                array_unshift($defaultTags, $bizTag);
            }
        }

        $promoTag = self::sanitizeHashtag($promoName);
        if ($promoTag !== '') {
            $defaultTags[] = $promoTag;
        }

        $uniqueTags = array_slice(array_values(array_unique($defaultTags)), 0, 12);

        return [
            'headline' => $headline,
            'subheadline' => $subheadline,
            'caption' => $caption,
            'hashtags' => $uniqueTags,
            'cta' => 'Yuk mampir!',
            'generated_by' => 'template',
        ];
    }

    /**
     * Compute relative luminance of hex color.
     */
    public static function getLuminance(string $hex): float
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        $r = hexdec(substr($hex, 0, 2)) / 255;
        $g = hexdec(substr($hex, 2, 2)) / 255;
        $b = hexdec(substr($hex, 4, 2)) / 255;

        $calc = function (float $c): float {
            return $c <= 0.03928 ? $c / 12.92 : pow(($c + 0.055) / 1.055, 2.4);
        };

        return 0.2126 * $calc($r) + 0.7152 * $calc($g) + 0.0722 * $calc($b);
    }

    /**
     * Calculate contrast ratio between two hex colors.
     */
    public static function getContrastRatio(string $hex1, string $hex2): float
    {
        $l1 = self::getLuminance($hex1);
        $l2 = self::getLuminance($hex2);

        if ($l1 < $l2) {
            [$l1, $l2] = [$l2, $l1];
        }

        return ($l1 + 0.05) / ($l2 + 0.05);
    }

    /**
     * Ensure text has at least 4.5:1 contrast against background.
     * If not, automatically returns either #000000 or #FFFFFF.
     */
    public static function ensureContrast(string $bgHex, string $fgHex): string
    {
        $ratio = self::getContrastRatio($bgHex, $fgHex);
        if ($ratio >= 4.5) {
            return $fgHex;
        }

        $contrastBlack = self::getContrastRatio($bgHex, '#000000');
        $contrastWhite = self::getContrastRatio($bgHex, '#FFFFFF');

        return $contrastWhite >= $contrastBlack ? '#FFFFFF' : '#000000';
    }

    /**
     * Estimate fitting font size for text given box width.
     */
    public static function fitText(string $text, int $maxWidth, int $initialSize = 64, int $minSize = 36): int
    {
        $len = mb_strlen($text, 'UTF-8');
        if ($len <= 0) {
            return $initialSize;
        }

        // Approximate 0.55 width-to-height ratio for sans-serif
        $estimatedCharWidth = $initialSize * 0.55;
        $totalWidth = $len * $estimatedCharWidth;

        if ($totalWidth <= $maxWidth) {
            return $initialSize;
        }

        $reducedSize = (int) floor($maxWidth / ($len * 0.55));

        return max($minSize, min($initialSize, $reducedSize));
    }

    /**
     * Get color scheme details with verified contrast.
     */
    public static function getColorScheme(string $name): array
    {
        $scheme = self::COLOR_SCHEMES[$name] ?? self::COLOR_SCHEMES['deepgreen'];
        $scheme['text'] = self::ensureContrast($scheme['bg'], $scheme['text']);

        return $scheme;
    }
}
