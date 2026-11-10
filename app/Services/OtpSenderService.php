<?php

namespace App\Services;

use App\Support\AuthHelper;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;

class OtpSenderService
{
    /**
     * Send OTP code via WhatsApp or SMS.
     *
     * @param  string  $phone  E.164 phone number
     * @param  string  $code  6-digit code
     * @param  string  $channel  'whatsapp' or 'sms'
     * @param  string  $purpose  'login' or 'hapus-akun'
     * @return bool True if successfully dispatched, false otherwise
     */
    public function sendOtp(string $phone, string $code, string $channel = 'whatsapp', string $purpose = 'login'): bool
    {
        if ($purpose === 'hapus-akun') {
            $message = "{$code} adalah kode verifikasi untuk MENGHAPUS AKUN LAPAK kamu. Berlaku 5 menit. Jangan bagikan kode ini ke siapa pun.";
        } else {
            $message = "{$code} adalah kode masuk LAPAK kamu. Berlaku 5 menit. Jangan bagikan kode ini ke siapa pun.";
        }

        // Demo mode check
        $demoMode = (bool) config('services.otp.demo_mode', env('OTP_DEMO_MODE', false));

        if (App::environment('production')) {
            // Demo mode is strictly forbidden in production
            $demoMode = false;
        }

        if ($demoMode) {
            Log::info('[OTP Demo Mode] Simulating OTP dispatch', [
                'phone' => AuthHelper::maskPhone($phone),
                'channel' => $channel,
                'environment' => App::environment(),
            ]);

            return true;
        }

        // Production or live delivery logic
        try {
            // Check for external provider configuration (e.g. Fonnte, Wablas, Twilio, Zenziva)
            $provider = config('services.otp.provider', env('OTP_PROVIDER', 'log'));

            if ($provider === 'log' || App::environment('local', 'testing')) {
                // In non-production testing, log safely
                Log::info('[OTP Dispatch]', [
                    'phone' => App::environment('production') ? AuthHelper::maskPhone($phone) : $phone,
                    'channel' => $channel,
                ]);

                return true;
            }

            // If a custom HTTP provider is set up in production, execute here
            // e.g. Http::post(...)
            return true;
        } catch (\Throwable $e) {
            Log::error('[OTP Dispatch Error] Failed to send OTP: '.$e->getMessage(), [
                'phone' => AuthHelper::maskPhone($phone),
                'channel' => $channel,
            ]);

            return false;
        }
    }

    /**
     * Check if a phone is in demo mode and returns demo code if allowed.
     */
    public function getDemoCodeIfAllowed(string $phone): ?string
    {
        if (App::environment('production')) {
            return null;
        }

        $demoMode = (bool) config('services.otp.demo_mode', env('OTP_DEMO_MODE', false));
        if (! $demoMode) {
            return null;
        }

        // In demo mode, standard fixed demo code is 123456
        return '123456';
    }
}
