<?php

namespace Tests\Unit;

use App\Support\BusinessProfileHelper;
use PHPUnit\Framework\TestCase;

class BusinessProfileHelperTest extends TestCase
{
    public function test_normalize_name(): void
    {
        $this->assertSame('Bu Rara', BusinessProfileHelper::normalizeName('  Bu   Rara '));
        $this->assertSame('Warung Berkah', BusinessProfileHelper::normalizeName("Warung\n\tBerkah  "));
        $this->assertSame('', BusinessProfileHelper::normalizeName(null));
        $this->assertSame('', BusinessProfileHelper::normalizeName('   '));
    }

    public function test_validate_owner_name_rules(): void
    {
        // Valid
        $errValid = BusinessProfileHelper::validateBusinessProfile([
            'owner_name' => 'Bu Rara',
            'business_name' => 'Warung Rara',
            'business_type' => 'kuliner',
            'lat' => -7.9797,
            'lng' => 112.6304,
        ]);
        $this->assertArrayNotHasKey('owner_name', $errValid);

        // Terlalu pendek ("A")
        $errShort = BusinessProfileHelper::validateBusinessProfile(['owner_name' => 'A']);
        $this->assertArrayHasKey('owner_name', $errShort);
        $this->assertSame('Nama panggilan minimal 2 karakter.', $errShort['owner_name']);

        // Hanya angka ("12345")
        $errNumeric = BusinessProfileHelper::validateBusinessProfile(['owner_name' => '12345']);
        $this->assertArrayHasKey('owner_name', $errNumeric);
        $this->assertSame('Nama panggilan tidak boleh hanya angka.', $errNumeric['owner_name']);

        // Tag HTML ("<b>Rara</b>")
        $errHtml = BusinessProfileHelper::validateBusinessProfile(['owner_name' => '<b>Rara</b>']);
        $this->assertArrayHasKey('owner_name', $errHtml);
        $this->assertSame('Nama panggilan mengandung karakter yang tidak diizinkan.', $errHtml['owner_name']);

        // Kosong
        $errEmpty = BusinessProfileHelper::validateBusinessProfile(['owner_name' => '   ']);
        $this->assertArrayHasKey('owner_name', $errEmpty);
        $this->assertSame('Nama panggilan belum diisi.', $errEmpty['owner_name']);
    }

    public function test_validate_business_name_rules(): void
    {
        // Valid ("Warung Bu Rara & Anak")
        $errValid = BusinessProfileHelper::validateBusinessProfile([
            'owner_name' => 'Rara',
            'business_name' => 'Warung Bu Rara & Anak',
            'business_type' => 'kuliner',
            'lat' => -7.9797,
            'lng' => 112.6304,
        ]);
        $this->assertArrayNotHasKey('business_name', $errValid);

        // 61 karakter (tidak valid)
        $longName = str_repeat('a', 61);
        $errLong = BusinessProfileHelper::validateBusinessProfile(['business_name' => $longName]);
        $this->assertArrayHasKey('business_name', $errLong);
        $this->assertSame('Nama usaha maksimal 60 karakter.', $errLong['business_name']);

        // Tag HTML
        $errHtml = BusinessProfileHelper::validateBusinessProfile(['business_name' => '<script>alert(1)</script>']);
        $this->assertArrayHasKey('business_name', $errHtml);
        $this->assertSame('Nama usaha mengandung karakter yang tidak diizinkan.', $errHtml['business_name']);

        // Kosong
        $errEmpty = BusinessProfileHelper::validateBusinessProfile(['business_name' => '']);
        $this->assertArrayHasKey('business_name', $errEmpty);
        $this->assertSame('Nama usaha belum diisi.', $errEmpty['business_name']);
    }

    public function test_validate_business_type(): void
    {
        $this->assertTrue(BusinessProfileHelper::isValidBusinessType('kuliner'));
        $this->assertTrue(BusinessProfileHelper::isValidBusinessType('fashion'));
        $this->assertTrue(BusinessProfileHelper::isValidBusinessType('kerajinan'));
        $this->assertTrue(BusinessProfileHelper::isValidBusinessType('jasa'));
        $this->assertTrue(BusinessProfileHelper::isValidBusinessType('dagang'));
        $this->assertTrue(BusinessProfileHelper::isValidBusinessType('lainnya'));

        $this->assertFalse(BusinessProfileHelper::isValidBusinessType('otomotif'));
        $this->assertFalse(BusinessProfileHelper::isValidBusinessType(''));
        $this->assertFalse(BusinessProfileHelper::isValidBusinessType(null));

        $errInvalidType = BusinessProfileHelper::validateBusinessProfile(['business_type' => 'otomotif']);
        $this->assertArrayHasKey('business_type', $errInvalidType);
        $this->assertSame('Pilih jenis usahamu.', $errInvalidType['business_type']);
    }

    public function test_is_within_indonesia(): void
    {
        // Malang (-7.9797, 112.6304) -> di Indonesia
        $this->assertTrue(BusinessProfileHelper::isWithinIndonesia(-7.9797, 112.6304));

        // Jakarta (-6.2088, 106.8456) -> di Indonesia
        $this->assertTrue(BusinessProfileHelper::isWithinIndonesia(-6.2088, 106.8456));

        // Singapura (1.3521, 103.8198) -> di luar Indonesia
        $this->assertFalse(BusinessProfileHelper::isWithinIndonesia(1.3521, 103.8198));

        // Titik (0, 0) -> di luar Indonesia
        $this->assertFalse(BusinessProfileHelper::isWithinIndonesia(0.0, 0.0));

        // Kosong atau NaN -> tidak valid
        $this->assertFalse(BusinessProfileHelper::isWithinIndonesia(null, null));
        $this->assertFalse(BusinessProfileHelper::isWithinIndonesia(NAN, 112.6304));
        $this->assertFalse(BusinessProfileHelper::isWithinIndonesia(-7.9797, NAN));
    }
}
