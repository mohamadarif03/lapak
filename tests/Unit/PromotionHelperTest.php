<?php

namespace Tests\Unit;

use App\Support\PromotionHelper;
use PHPUnit\Framework\TestCase;

class PromotionHelperTest extends TestCase
{
    public function test_normalize_promo_input_trims_and_cleans_strings(): void
    {
        $input = [
            'promo_name' => "  <b>Diskon Merdeka!</b> \n",
            'offer_details' => ' Potongan harga 20% untuk semua varian  ',
            'valid_period' => '  31 Agustus 2026 ',
            'contact' => ' 08123456789 ',
        ];

        $normalized = PromotionHelper::normalizePromoInput($input);

        $this->assertSame('Diskon Merdeka!', $normalized['promo_name']);
        $this->assertSame('Potongan harga 20% untuk semua varian', $normalized['offer_details']);
        $this->assertSame('31 Agustus 2026', $normalized['valid_period']);
        $this->assertSame('08123456789', $normalized['contact']);
    }

    public function test_sanitize_hashtag_removes_symbols_and_formats_cleanly(): void
    {
        $this->assertSame('KopiSusu', PromotionHelper::sanitizeHashtag('#KopiSusu'));
        $this->assertSame('PromoSpesial', PromotionHelper::sanitizeHashtag('###PromoSpesial!@#'));
        $this->assertSame('kopi_aren_mantap', PromotionHelper::sanitizeHashtag('kopi_aren_mantap'));
        $this->assertSame('KopiEnak', PromotionHelper::sanitizeHashtag('Kopi Enak!'));
        $this->assertSame('', PromotionHelper::sanitizeHashtag('   '));
        $this->assertSame('', PromotionHelper::sanitizeHashtag(null));
    }

    public function test_slugify_creates_clean_url_slugs(): void
    {
        $this->assertSame('diskon-kopi-susu-20', PromotionHelper::slugify('Diskon Kopi Susu 20%!'));
        $this->assertSame('promo-merdeka', PromotionHelper::slugify('  Promo   Merdeka  '));
        $this->assertSame('promo', PromotionHelper::slugify(''));
    }

    public function test_validate_copy_numbers_accepts_numbers_present_in_user_input(): void
    {
        $userInput = [
            'promo_name' => 'Paket Hemat 25.000',
            'offer_details' => 'Beli 2 gratis 1 atau diskon 15%',
            'valid_period' => 'sampai 10 November 2026',
        ];

        $validCopy = [
            'headline' => 'Paket Hemat 25.000',
            'subheadline' => 'Beli 2 gratis 1 spesial untukmu',
            'caption' => 'Nikmati promo diskon 15% atau paket 25000 sampai 10 November 2026.',
            'hashtags' => ['Hemat25k', 'Promo15Persen'],
        ];

        $this->assertTrue(PromotionHelper::validateCopyNumbers($validCopy, $userInput));
    }

    public function test_validate_copy_numbers_rejects_hallucinated_numbers(): void
    {
        $userInput = [
            'promo_name' => 'Kopi Mantap',
            'offer_details' => 'Diskon spesial akhir pekan',
            'valid_period' => '',
        ];

        // Copy contains 50% discount not mentioned by user
        $hallucinatedCopy = [
            'headline' => 'Kopi Mantap Diskon 50%',
            'subheadline' => 'Hanya Rp 10.000',
            'caption' => 'Dapatkan potongan sekarang juga!',
            'hashtags' => ['KopiMantap'],
        ];

        $this->assertFalse(PromotionHelper::validateCopyNumbers($hallucinatedCopy, $userInput));
    }

    public function test_contains_forbidden_claims_detects_unprompted_superlatives_and_claims(): void
    {
        $userInput = [
            'promo_name' => 'Keripik Tempe Renyah',
            'offer_details' => 'Camilan gurih khas Malang',
        ];

        // AI generated superlative / medical / legal claims not in user input
        $this->assertTrue(PromotionHelper::containsForbiddenClaims('Keripik tempe terbaik dan termurah di Indonesia!', $userInput));
        $this->assertTrue(PromotionHelper::containsForbiddenClaims('Dijamin 100% halal dan lolos BPOM', $userInput));
        $this->assertTrue(PromotionHelper::containsForbiddenClaims('Bagus untuk kesehatan jantung dan obat alami', $userInput));
        $this->assertTrue(PromotionHelper::containsForbiddenClaims('Ada garansi uang kembali tanpa syarat', $userInput));
    }

    public function test_contains_forbidden_claims_allows_claims_explicitly_stated_by_user(): void
    {
        $userInput = [
            'promo_name' => 'Sambal Bawang Halal BPOM',
            'offer_details' => 'Sudah bersertifikat halal dan BPOM, kualitas terbaik untuk keluarga',
        ];

        // Since user explicitly wrote halal, bpom, and terbaik, it should be allowed
        $this->assertFalse(PromotionHelper::containsForbiddenClaims('Sambal kami bersertifikat halal dan BPOM dengan racikan terbaik.', $userInput));
    }

    public function test_ensure_contrast_enforces_minimum_contrast_ratio(): void
    {
        // Dark text (#1F2937) on dark background (#0F172A) has poor contrast -> should auto fix to white #FFFFFF
        $contrastColor1 = PromotionHelper::ensureContrast('#0F172A', '#1F2937');
        $this->assertSame('#FFFFFF', $contrastColor1);

        // Light text (#F8FAFC) on light background (#FFFFFF) has poor contrast -> should auto fix to black #000000
        $contrastColor2 = PromotionHelper::ensureContrast('#FFFFFF', '#F8FAFC');
        $this->assertSame('#000000', $contrastColor2);

        // Good contrast should preserve original text color
        $contrastColor3 = PromotionHelper::ensureContrast('#FFFFFF', '#1E293B');
        $this->assertSame('#1E293B', $contrastColor3);
    }

    public function test_fit_text_calculates_appropriate_font_size(): void
    {
        $shortTextSize = PromotionHelper::fitText('Promo Kopi', 1080, 64, 36);
        $longTextSize = PromotionHelper::fitText('Promo Diskon Besar-Besaran Spesial Hari Kemerdekaan Republik Indonesia ke-81', 1080, 64, 36);

        $this->assertGreaterThanOrEqual($longTextSize, $shortTextSize);
        $this->assertLessThanOrEqual(64, $shortTextSize);
        $this->assertGreaterThanOrEqual(36, $longTextSize);
    }

    public function test_build_template_copy_creates_structured_fallback_content(): void
    {
        $input = [
            'promo_name' => 'Beli 1 Gratis 1 Es Kopi',
            'offer_details' => 'Setiap pembelian varian apa saja pada jam 13.00-16.00',
            'valid_period' => '10-15 November',
            'contact' => 'WA 08123456789',
        ];

        $copy = PromotionHelper::buildTemplateCopy($input);

        $this->assertArrayHasKey('headline', $copy);
        $this->assertArrayHasKey('subheadline', $copy);
        $this->assertArrayHasKey('caption', $copy);
        $this->assertArrayHasKey('hashtags', $copy);

        $this->assertNotEmpty($copy['headline']);
        $this->assertNotEmpty($copy['caption']);
        $this->assertLessThanOrEqual(2200, mb_strlen($copy['caption']));
        $this->assertLessThanOrEqual(15, count($copy['hashtags']));
        $this->assertSame('template', $copy['generated_by']);
    }
}
