<?php

namespace Tests\Unit;

use App\Support\AuthHelper;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\TestCase;

class AuthHelperTest extends TestCase
{
    public function test_normalize_phone_valid_cases(): void
    {
        $cases = [
            '081234567890' => '+6281234567890',
            '0812-3456-7890' => '+6281234567890',
            '+62 812 3456 7890' => '+6281234567890',
            '6281234567890' => '+6281234567890',
            '81234567890' => '+6281234567890',
            '(0812) 3456 7890' => '+6281234567890',
        ];

        foreach ($cases as $input => $expected) {
            $result = AuthHelper::normalizePhone($input);
            $this->assertTrue($result['ok'], "Failed on input: {$input}");
            $this->assertSame($expected, $result['e164'], "Mismatch on input: {$input}");
        }
    }

    public function test_normalize_phone_invalid_cases(): void
    {
        $invalidInputs = [
            '0812345',         // terlalu pendek
            '+6591234567',     // bukan Indonesia (Singapura)
            '0212345678',      // telepon rumah (awalan 2)
            'abc',             // bukan angka
            '',                // kosong
            '   ',             // spasi saja
            '081234567890123', // terlalu panjang (>12 digit nasional)
        ];

        foreach ($invalidInputs as $input) {
            $result = AuthHelper::normalizePhone($input);
            $this->assertFalse($result['ok'], "Expected invalid for input: {$input}");
        }
    }

    public function test_mask_phone(): void
    {
        $this->assertSame('+62 812-****-7890', AuthHelper::maskPhone('+6281234567890'));
        $this->assertSame('+62 812-****-7890', AuthHelper::maskPhone('081234567890'));
    }

    public function test_safe_redirect_cases(): void
    {
        $cases = [
            '/dashboard' => '/dashboard',
            '/catat?mulai=1' => '/catat?mulai=1',
            '//evil.com' => '/dashboard',
            'https://evil.com' => '/dashboard',
            '/\\evil.com' => '/dashboard',
            '' => '/dashboard',
            null => '/dashboard',
            '/settings/profile' => '/settings/profile',
        ];

        foreach ($cases as $input => $expected) {
            $this->assertSame($expected, AuthHelper::safeRedirect($input), "Failed safeRedirect on input: {$input}");
        }
    }

    public function test_generate_otp(): void
    {
        $code = AuthHelper::generateOtp();
        $this->assertSame(6, strlen($code));
        $this->assertTrue(ctype_digit($code));
    }

    public function test_hash_and_verify_otp(): void
    {
        $phone = '+6281234567890';
        $code = '123456';
        $hash = AuthHelper::hashOtp($phone, $code);

        $this->assertNotSame($code, $hash);
        $this->assertTrue(AuthHelper::verifyOtp($phone, $code, $hash));
        $this->assertFalse(AuthHelper::verifyOtp($phone, '654321', $hash));
        $this->assertFalse(AuthHelper::verifyOtp('+6289999999999', $code, $hash));
    }

    public function test_resend_wait(): void
    {
        $now = Carbon::parse('2026-11-03 10:00:00');
        $sent15SecsAgo = Carbon::parse('2026-11-03 09:59:45');
        $sent70SecsAgo = Carbon::parse('2026-11-03 09:58:50');

        $this->assertSame(45, AuthHelper::getResendWait($sent15SecsAgo, $now));
        $this->assertSame(0, AuthHelper::getResendWait($sent70SecsAgo, $now));
        $this->assertSame(0, AuthHelper::getResendWait(null, $now));
    }
}
