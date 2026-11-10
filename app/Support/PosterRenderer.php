<?php

namespace App\Support;

class PosterRenderer
{
    /**
     * Render a promotional poster to PNG file.
     *
     * @param  array{
     *     format?: string,
     *     color_scheme?: string,
     *     business_name?: string,
     *     headline?: string,
     *     offer_details?: string,
     *     valid_period?: ?string,
     *     contact?: ?string
     * }  $params
     */
    public static function render(array $params, string $outputPath): bool
    {
        $dir = dirname($outputPath);
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $format = ($params['format'] ?? 'feed') === 'story' ? 'story' : 'feed';
        $width = 1080;
        $height = $format === 'story' ? 1920 : 1350;

        $im = imagecreatetruecolor($width, $height);
        if (! $im) {
            return false;
        }

        imagesavealpha($im, true);

        // Resolve Color Scheme
        $scheme = PromotionHelper::getColorScheme($params['color_scheme'] ?? 'deepgreen');
        $gradColors = $scheme['bg_gradient'] ?? ['#174D3A', '#0D3024'];
        $cTop = self::hexToRgb($gradColors[0]);
        $cBottom = self::hexToRgb($gradColors[1] ?? $gradColors[0]);

        // Draw vertical gradient
        for ($y = 0; $y < $height; $y++) {
            $t = $y / max(1, $height - 1);
            $r = (int) round((1 - $t) * $cTop['r'] + $t * $cBottom['r']);
            $g = (int) round((1 - $t) * $cTop['g'] + $t * $cBottom['g']);
            $b = (int) round((1 - $t) * $cTop['b'] + $t * $cBottom['b']);
            $col = imagecolorallocate($im, $r, $g, $b);
            imageline($im, 0, $y, $width, $y, $col);
        }

        // Draw geometric decorative accents (circles in background with alpha)
        $alphaAccent = imagecolorallocatealpha($im, 255, 255, 255, 118);
        imagefilledellipse($im, 950, 150, 450, 450, $alphaAccent);
        imagefilledellipse($im, 100, $height - 150, 500, 500, $alphaAccent);

        // Font selection
        $fontBold = self::findFont(true);
        $fontRegular = self::findFont(false);

        // Coordinates & Margins
        $paddingX = 90;
        $safeTop = $format === 'story' ? 220 : 120;
        $safeBottom = $format === 'story' ? 220 : 120;

        $white = imagecolorallocate($im, 255, 255, 255);
        $badgeBgRgb = self::hexToRgb($scheme['badge_bg'] ?? '#D8A75B');
        $badgeBg = imagecolorallocate($im, $badgeBgRgb['r'], $badgeBgRgb['g'], $badgeBgRgb['b']);
        $badgeTextRgb = self::hexToRgb($scheme['badge_text'] ?? '#183C30');
        $badgeText = imagecolorallocate($im, $badgeTextRgb['r'], $badgeTextRgb['g'], $badgeTextRgb['b']);

        // 1. TOP HEADER: Business Name & "SPESIAL HARI INI" Badge
        $businessName = mb_strtoupper($params['business_name'] ?? 'LAPAK UMKM', 'UTF-8');
        $badgeLabel = 'SPESIAL HARI INI';

        if ($fontBold) {
            imagettftext($im, 26, 0, $paddingX, $safeTop, $white, $fontBold, $businessName);

            // Draw "SPESIAL HARI INI" badge on top right
            $badgeWidth = 260;
            $badgeHeight = 52;
            $badgeX = $width - $paddingX - $badgeWidth;
            $badgeY = $safeTop - 36;
            self::imagefilledroundedrect($im, $badgeX, $badgeY, $badgeX + $badgeWidth, $badgeY + $badgeHeight, 26, $badgeBg);
            imagettftext($im, 18, 0, $badgeX + 22, $badgeY + 34, $badgeText, $fontBold, $badgeLabel);
        } else {
            imagestring($im, 5, $paddingX, $safeTop - 20, $businessName, $white);
        }

        // 2. CENTER HEADLINE (PROMO TITLE)
        $headline = $params['headline'] ?? 'PROMO SPESIAL';
        $headlineY = $safeTop + ($format === 'story' ? 280 : 200);

        $initialFontSize = $format === 'story' ? 56 : 52;
        $fontSize = PromotionHelper::fitText($headline, $width - ($paddingX * 2), $initialFontSize, 36);

        if ($fontBold) {
            $lines = self::wrapText($headline, $fontSize, 0, $fontBold, $width - ($paddingX * 2));
            foreach ($lines as $line) {
                imagettftext($im, $fontSize, 0, $paddingX, $headlineY, $white, $fontBold, $line);
                $headlineY += (int) round($fontSize * 1.35);
            }
        } else {
            imagestring($im, 5, $paddingX, $headlineY, $headline, $white);
            $headlineY += 40;
        }

        // 3. HIGHLIGHT CARD (OFFER DETAILS)
        $offerDetails = $params['offer_details'] ?? '';
        if ($offerDetails !== '') {
            $cardY = $headlineY + 40;
            $cardWidth = $width - ($paddingX * 2);
            $cardHeight = 160;

            $cardBg = imagecolorallocatealpha($im, 255, 255, 255, 96);
            self::imagefilledroundedrect($im, $paddingX, $cardY, $paddingX + $cardWidth, $cardY + $cardHeight, 24, $cardBg);

            $cardTextRgb = self::hexToRgb($scheme['accent'] ?? '#F6EBD5');
            $cardTextColor = imagecolorallocate($im, $cardTextRgb['r'], $cardTextRgb['g'], $cardTextRgb['b']);

            if ($fontBold) {
                $offerFontSize = 38;
                $offerLines = self::wrapText($offerDetails, $offerFontSize, 0, $fontBold, $cardWidth - 80);
                $textY = $cardY + 68;
                foreach (array_slice($offerLines, 0, 2) as $oline) {
                    imagettftext($im, $offerFontSize, 0, $paddingX + 40, $textY, $cardTextColor, $fontBold, $oline);
                    $textY += 50;
                }
            } else {
                imagestring($im, 5, $paddingX + 30, $cardY + 50, $offerDetails, $cardTextColor);
            }
        }

        // 4. FOOTER: Valid Period & Contact Details
        $footerY = $height - $safeBottom - 40;
        $lineColor = imagecolorallocatealpha($im, 255, 255, 255, 80);
        imageline($im, $paddingX, $footerY - 60, $width - $paddingX, $footerY - 60, $lineColor);

        $validPeriod = $params['valid_period'] ?? null;
        $contact = $params['contact'] ?? null;

        if ($fontRegular) {
            if ($validPeriod) {
                imagettftext($im, 22, 0, $paddingX, $footerY - 15, $white, $fontBold ?: $fontRegular, 'Periode: '.$validPeriod);
            }
            if ($contact) {
                imagettftext($im, 20, 0, $paddingX, $footerY + 28, $white, $fontRegular, 'Pesan / Lokasi: '.$contact);
            }
        } else {
            if ($validPeriod) {
                imagestring($im, 4, $paddingX, $footerY - 30, 'Periode: '.$validPeriod, $white);
            }
            if ($contact) {
                imagestring($im, 4, $paddingX, $footerY + 10, 'Info: '.$contact, $white);
            }
        }

        $success = imagepng($im, $outputPath);
        imagedestroy($im);

        return $success;
    }

    /**
     * Helper to wrap text into multiple lines for TTF bounding box.
     *
     * @return list<string>
     */
    protected static function wrapText(string $text, int $size, int $angle, string $font, int $maxWidth): array
    {
        $words = explode(' ', $text);
        $lines = [];
        $currentLine = '';

        foreach ($words as $word) {
            $testLine = $currentLine === '' ? $word : "{$currentLine} {$word}";
            $box = imagettfbbox($size, $angle, $font, $testLine);
            $width = abs($box[4] - $box[0]);

            if ($width > $maxWidth && $currentLine !== '') {
                $lines[] = $currentLine;
                $currentLine = $word;
            } else {
                $currentLine = $testLine;
            }
        }

        if ($currentLine !== '') {
            $lines[] = $currentLine;
        }

        return $lines;
    }

    /**
     * Draw a rounded filled rectangle in GD.
     */
    protected static function imagefilledroundedrect($im, int $x1, int $y1, int $x2, int $y2, int $radius, int $color): void
    {
        imagefilledrectangle($im, $x1 + $radius, $y1, $x2 - $radius, $y2, $color);
        imagefilledrectangle($im, $x1, $y1 + $radius, $x2, $y2 - $radius, $color);

        imagefilledellipse($im, $x1 + $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
        imagefilledellipse($im, $x2 - $radius, $y1 + $radius, $radius * 2, $radius * 2, $color);
        imagefilledellipse($im, $x1 + $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
        imagefilledellipse($im, $x2 - $radius, $y2 - $radius, $radius * 2, $radius * 2, $color);
    }

    /**
     * Find standard TTF font available on host machine.
     */
    protected static function findFont(bool $bold = false): ?string
    {
        $candidates = $bold
            ? [
                'C:/Windows/Fonts/arialbd.ttf',
                'C:/Windows/Fonts/segoeuib.ttf',
                'C:/Windows/Fonts/calibrib.ttf',
                '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
                '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
            ]
            : [
                'C:/Windows/Fonts/arial.ttf',
                'C:/Windows/Fonts/segoeui.ttf',
                'C:/Windows/Fonts/calibri.ttf',
                '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
                '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
            ];

        foreach ($candidates as $f) {
            if (file_exists($f)) {
                return $f;
            }
        }

        return null;
    }

    /**
     * Convert Hex string to RGB components.
     *
     * @return array{r: int, g: int, b: int}
     */
    protected static function hexToRgb(string $hex): array
    {
        $clean = ltrim($hex, '#');
        if (strlen($clean) === 3) {
            $clean = $clean[0].$clean[0].$clean[1].$clean[1].$clean[2].$clean[2];
        }

        return [
            'r' => hexdec(substr($clean, 0, 2)),
            'g' => hexdec(substr($clean, 2, 2)),
            'b' => hexdec(substr($clean, 4, 2)),
        ];
    }
}
