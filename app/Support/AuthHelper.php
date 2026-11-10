<?php

namespace App\Support;

use App\Models\Business;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

class AuthHelper
{
    /**
     * Normalize an Indonesian mobile phone number to E.164 format (+628...).
     *
     * @return array{ok: bool, e164?: string}
     */
    public static function normalizePhone(?string $input): array
    {
        if ($input === null || trim($input) === '') {
            return ['ok' => false];
        }

        $trimmed = trim($input);

        // Disallow letters or characters other than digits, whitespace, +, -, ., (, )
        if (preg_match('/[^0-9\s+\-.\(\)]/', $trimmed)) {
            return ['ok' => false];
        }

        // Clean out whitespace, hyphens, dots, parentheses
        $cleaned = preg_replace('/[\s\-.\(\)]/', '', $trimmed);
        if ($cleaned === '' || $cleaned === null) {
            return ['ok' => false];
        }

        $national = '';

        if (str_starts_with($cleaned, '+')) {
            if (str_starts_with($cleaned, '+62')) {
                $national = substr($cleaned, 3);
            } else {
                // Non-Indonesian country code
                return ['ok' => false];
            }
        } elseif (str_starts_with($cleaned, '62')) {
            $national = substr($cleaned, 2);
        } elseif (str_starts_with($cleaned, '0')) {
            $national = substr($cleaned, 1);
        } else {
            $national = $cleaned;
        }

        // Must consist only of digits
        if (! ctype_digit($national)) {
            return ['ok' => false];
        }

        // Indonesian mobile numbers must start with '8'
        // Numbers starting with '2' or other digits are landlines / invalid
        if (! str_starts_with($national, '8')) {
            return ['ok' => false];
        }

        // National mobile length must be between 9 and 12 digits
        $length = strlen($national);
        if ($length < 9 || $length > 12) {
            return ['ok' => false];
        }

        return [
            'ok' => true,
            'e164' => '+62'.$national,
        ];
    }

    /**
     * Mask an E.164 phone number: +6281234567890 -> +62 812-****-7890.
     */
    public static function maskPhone(string $e164): string
    {
        $normalized = self::normalizePhone($e164);
        $phone = $normalized['ok'] && isset($normalized['e164']) ? $normalized['e164'] : $e164;

        if (str_starts_with($phone, '+62')) {
            $national = substr($phone, 3);
            if (strlen($national) >= 7) {
                $prefix = substr($national, 0, 3);
                $suffix = substr($national, -4);

                return "+62 {$prefix}-****-{$suffix}";
            }
        }

        // Fallback for short or non-standard format
        if (strlen($phone) > 4) {
            return str_repeat('*', strlen($phone) - 4).substr($phone, -4);
        }

        return $phone;
    }

    /**
     * Generate a cryptographically secure 6-digit OTP code.
     */
    public static function generateOtp(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Compute HMAC-SHA256 hash of phone and OTP code using server secret.
     */
    public static function hashOtp(string $phone, string $code): string
    {
        $secret = 'lapak-secure-auth-secret-fallback-key';
        try {
            if (function_exists('config')) {
                $configured = config('app.key');
                if (! empty($configured)) {
                    $secret = (string) $configured;
                }
            }
        } catch (\Throwable) {
            // Container not booted in pure unit test
        }

        return hash_hmac('sha256', $phone.':'.$code, $secret);
    }

    /**
     * Verify an OTP code hash using constant-time comparison.
     */
    public static function verifyOtp(string $phone, string $code, string $storedHash): bool
    {
        $computed = self::hashOtp($phone, $code);

        return hash_equals($storedHash, $computed);
    }

    /**
     * Strictly validate and return safe internal redirect path.
     * Rejects //, /\, control characters, external schemes, etc.
     */
    public static function safeRedirect(?string $next): string
    {
        if (empty($next) || ! is_string($next)) {
            return '/dashboard';
        }

        $trimmed = trim($next);

        // Reject control characters or newlines
        if (preg_match('/[\x00-\x1F\x7F]/', $trimmed)) {
            return '/dashboard';
        }

        // Must start with exactly one '/' and not followed by another '/' or '\'
        if (! str_starts_with($trimmed, '/') || str_starts_with($trimmed, '//') || str_starts_with($trimmed, '/\\')) {
            return '/dashboard';
        }

        // Reject any URL schemes (e.g., http:, https:, javascript:)
        if (preg_match('/^[a-zA-Z][a-zA-Z0-9+.-]*:/', $trimmed)) {
            return '/dashboard';
        }

        // Check host or scheme parsed
        $parsed = parse_url($trimmed);
        if ($parsed === false || isset($parsed['host']) || isset($parsed['scheme'])) {
            return '/dashboard';
        }

        return $trimmed;
    }

    /**
     * Calculate remaining cooldown wait time in seconds (minimum 60s between sends).
     */
    public static function getResendWait(?\DateTimeInterface $lastSentAt, ?\DateTimeInterface $now = null): int
    {
        if (! $lastSentAt) {
            return 0;
        }

        $currentTimestamp = $now ? $now->getTimestamp() : Carbon::now()->getTimestamp();
        $elapsed = $currentTimestamp - $lastSentAt->getTimestamp();

        return max(0, 60 - $elapsed);
    }

    /**
     * Require authenticated user helper for routes.
     * Redirects to /masuk if unauthenticated.
     */
    public static function requireUser(?Request $request = null): User|RedirectResponse
    {
        $req = $request ?? request();

        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();

            return $user;
        }

        $hadPreviousSession = $req->session()->has('had_session') || $req->hasCookie('lapak_session_known');
        $currentPath = '/'.ltrim($req->path(), '/');
        if ($req->getQueryString()) {
            $currentPath .= '?'.$req->getQueryString();
        }

        $params = ['next' => self::safeRedirect($currentPath)];
        if ($hadPreviousSession) {
            $params['pesan'] = 'sesi-berakhir';
        }

        return redirect()->route('masuk', $params)
            ->with('status', 'Sesi berakhir, silakan masuk lagi.')
            ->with('message', 'Sesi berakhir, silakan masuk lagi.');
    }

    /**
     * Require authenticated user with business profile helper.
     * Redirects to /profil-usaha if business is missing.
     *
     * @return array{user: User, business: Business}|RedirectResponse
     */
    public static function requireBusiness(?Request $request = null): array|RedirectResponse
    {
        $userOrRedirect = self::requireUser($request);
        if ($userOrRedirect instanceof RedirectResponse) {
            return $userOrRedirect;
        }

        $business = $userOrRedirect->business;
        if (! $business) {
            return redirect()->route('profil-usaha');
        }

        return [
            'user' => $userOrRedirect,
            'business' => $business,
        ];
    }
}
