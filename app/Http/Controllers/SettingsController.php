<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\OtpCode;
use App\Models\SocialConnection;
use App\Models\UserPreference;
use App\Services\OtpSenderService;
use App\Support\AuthHelper;
use App\Support\SettingsHelper;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SettingsController extends Controller
{
    /**
     * Show Profil & Pengaturan unified page.
     */
    public function index(Request $request): InertiaResponse|RedirectResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return $auth;
        }

        $user = $auth['user'];
        $business = $auth['business'];

        // Flash message from redirect (e.g. ?pesan=profil-tersimpan)
        $notice = null;
        if ($request->query('pesan') === 'profil-tersimpan' || $request->session()->get('pesan') === 'profil-tersimpan') {
            $notice = 'Profil usaha tersimpan.';
        }

        // User preference: text_size
        $pref = UserPreference::where('user_id', $user->id)->first();
        $textSize = $pref?->text_size ?? $request->cookie('lapak_text_size', 'normal');
        $textSize = SettingsHelper::applyTextSize($textSize);

        // Social connections for this business
        $socialConnections = SocialConnection::where('business_id', $business->id)->get()->map(function ($conn) {
            $isExpired = $conn->expires_at && $conn->expires_at->isPast();

            return [
                'id' => $conn->id,
                'platform' => $conn->platform,
                'display_name' => $conn->display_name ?? '@akun',
                'status' => $isExpired ? 'Berakhir, hubungkan ulang' : 'Terhubung',
                'is_expired' => $isExpired,
            ];
        });

        // Format dates
        $joinedDate = $user->created_at
            ? $user->created_at->setTimezone(SettingsHelper::TIMEZONE)->translatedFormat('d F Y')
            : '-';
        $consentDate = $user->consent_at
            ? $user->consent_at->setTimezone(SettingsHelper::TIMEZONE)->translatedFormat('d F Y, H:i')
            : '-';

        $viewName = class_exists('\Laravel\Fortify\Fortify') ? 'settings/usaha' : 'Settings/Index';

        return Inertia::render($viewName, [
            'user' => [
                'id' => $user->id,
                'phone_masked' => AuthHelper::maskPhone($user->phone),
                'joined_at' => $joinedDate,
                'consent_at' => $consentDate,
                'consent_version' => $user->consent_version ?? '1.0',
            ],
            'business' => [
                'id' => $business->id,
                'owner_name' => $business->owner_name ?? '',
                'business_name' => $business->business_name ?? '',
                'business_type' => $business->business_type ?? '',
                'address' => $business->address ?? '',
                'main_products' => $business->main_products ?? '',
                'price_range' => $business->price_range ?? '',
                'open_hours' => $business->open_hours ?? '',
                'reminder_enabled' => (bool) ($business->reminder_enabled ?? true),
                'reminder_time' => $business->reminder_time ?? '20:30',
            ],
            'textSize' => $textSize,
            'socialConnections' => $socialConnections,
            'priceRanges' => SettingsHelper::PRICE_RANGES,
            'notice' => $notice,
        ]);
    }

    /**
     * Update business details (main_products and price_range).
     */
    public function updateBusinessDetails(Request $request): JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['success' => false, 'message' => 'Sesi berakhir, silakan masuk lagi.'], 401);
        }

        $business = $auth['business'];

        $validation = SettingsHelper::validateBusinessDetails($request->only(['main_products', 'price_range']));
        if (! $validation['is_valid']) {
            return response()->json([
                'success' => false,
                'message' => reset($validation['errors']),
                'errors' => $validation['errors'],
            ], 422);
        }

        $business->update($validation['data']);

        return response()->json([
            'success' => true,
            'message' => 'Tersimpan.',
            'business' => [
                'main_products' => $business->main_products,
                'price_range' => $business->price_range,
            ],
        ]);
    }

    /**
     * Update text size preference ('normal' or 'besar').
     */
    public function updateTextSize(Request $request): JsonResponse
    {
        $auth = AuthHelper::requireUser($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['success' => false, 'message' => 'Sesi berakhir, silakan masuk lagi.'], 401);
        }

        $user = $auth;
        $textSize = SettingsHelper::applyTextSize($request->input('text_size'));

        UserPreference::updateOrCreate(
            ['user_id' => $user->id],
            ['text_size' => $textSize]
        );

        // Queue cookie (1 year duration, non-httpOnly so script can read before paint)
        Cookie::queue('lapak_text_size', $textSize, 60 * 24 * 365, '/', null, false, false, false, 'Lax');

        return response()->json([
            'success' => true,
            'message' => 'Tersimpan.',
            'text_size' => $textSize,
        ])->withCookie(cookie('lapak_text_size', $textSize, 60 * 24 * 365, '/', null, false, false, false, 'Lax'));
    }

    /**
     * Disconnect a connected social media account.
     */
    public function disconnectSocial(Request $request, int $id): JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['success' => false, 'message' => 'Sesi berakhir, silakan masuk lagi.'], 401);
        }

        $business = $auth['business'];
        $connection = SocialConnection::where('id', $id)->where('business_id', $business->id)->first();

        if (! $connection) {
            return response()->json(['success' => false, 'message' => 'Akun media sosial tidak ditemukan.'], 404);
        }

        // Best effort token revocation at provider (mock/stub if external)
        // Failure to revoke external token does NOT block local deletion
        $connection->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun diputus.',
        ]);
    }

    /**
     * Export all user and business data as ZIP bundle.
     * Rate limited to 3 exports per hour per user. Timeout 60s.
     */
    public function exportData(Request $request): Response|JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['success' => false, 'message' => 'Sesi berakhir, silakan masuk lagi.'], 401);
        }

        $user = $auth['user'];

        // Rate limit: max 3 per hour per user
        $rateKey = 'settings_export_user:'.$user->id;
        if (RateLimiter::tooManyAttempts($rateKey, 3)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak ekspor. Coba lagi nanti.',
            ], 429);
        }

        // Set execution timeout 60 seconds
        if (! App::runningUnitTests()) {
            @set_time_limit(60);
        }

        try {
            $bundle = SettingsHelper::buildExportBundle($user->id);
            RateLimiter::hit($rateKey, 3600);

            return response($bundle['content'], 200, [
                'Content-Type' => $bundle['mime'],
                'Content-Disposition' => 'attachment; filename="'.$bundle['filename'].'"',
                'Cache-Control' => 'no-cache, no-store, must-revalidate',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ekspor gagal. Coba lagi.',
            ], 500);
        }
    }

    /**
     * Request OTP for account deletion.
     * Rate limit: max 3 requests per hour per user.
     * Purpose: 'hapus-akun'.
     */
    public function requestDeleteOtp(Request $request, OtpSenderService $otpSender): JsonResponse
    {
        $auth = AuthHelper::requireUser($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['success' => false, 'message' => 'Sesi berakhir, silakan masuk lagi.'], 401);
        }

        $user = $auth;

        if ($user->is_demo) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak tersedia di mode demo.',
            ], 403);
        }

        $phone = $user->phone;

        // Rate limit: max 3 per hour per user
        $rateKey = 'settings_delete_otp_user:'.$user->id;
        if (RateLimiter::tooManyAttempts($rateKey, 3)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak permintaan kode. Coba lagi nanti.',
            ], 429);
        }

        // Cooldown 60s
        $latestOtp = OtpCode::where('phone', $phone)
            ->where('purpose', 'hapus-akun')
            ->latest()
            ->first();

        if ($latestOtp) {
            $diff = Carbon::now()->diffInSeconds($latestOtp->created_at);
            if ($diff < 60) {
                return response()->json([
                    'success' => false,
                    'message' => 'Harap tunggu sebelum meminta kode baru.',
                    'resend_in' => 60 - $diff,
                ], 429);
            }
        }

        // Invalidate older delete OTPs
        OtpCode::where('phone', $phone)
            ->where('purpose', 'hapus-akun')
            ->whereNull('consumed_at')
            ->update(['expires_at' => Carbon::now()->subMinute()]);

        // Generate cryptographically secure OTP or retrieve demo code if allowed
        $code = $otpSender->getDemoCodeIfAllowed($phone) ?? AuthHelper::generateOtp();
        $codeHash = AuthHelper::hashOtp($phone, $code);

        OtpCode::create([
            'phone' => $phone,
            'code_hash' => $codeHash,
            'channel' => 'whatsapp',
            'purpose' => 'hapus-akun',
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
            'consumed_at' => null,
        ]);

        $dispatched = $otpSender->sendOtp($phone, $code, 'whatsapp', 'hapus-akun');
        if (! $dispatched) {
            return response()->json([
                'success' => false,
                'message' => 'Kode belum terkirim. Coba lagi atau kirim lewat SMS.',
            ], 500);
        }

        RateLimiter::hit($rateKey, 3600);

        return response()->json([
            'success' => true,
            'message' => 'Kode verifikasi penghapusan akun telah dikirim ke nomor WhatsApp kamu.',
            'phone_masked' => AuthHelper::maskPhone($phone),
        ]);
    }

    /**
     * Delete account and all associated data.
     * Verifies OTP (purpose = 'hapus-akun') and confirmation word ("HAPUS").
     */
    public function deleteAccount(Request $request): JsonResponse|RedirectResponse
    {
        $auth = AuthHelper::requireUser($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['success' => false, 'message' => 'Sesi berakhir, silakan masuk lagi.'], 401);
        }

        $user = $auth;

        if ($user->is_demo) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak tersedia di mode demo.',
            ], 403);
        }

        $userId = $user->id;
        $phone = $user->phone;

        // 1. Verify confirmation word ("HAPUS")
        $confirmation = $request->input('confirmation');
        if (! SettingsHelper::confirmDeletionWord($confirmation)) {
            return response()->json([
                'success' => false,
                'message' => 'Ketik HAPUS untuk melanjutkan.',
            ], 422);
        }

        // 2. Validate OTP code
        $code = trim((string) $request->input('code'));
        if (strlen($code) !== 6 || ! ctype_digit($code)) {
            return response()->json([
                'success' => false,
                'message' => 'Masukkan 6 digit kode OTP secara lengkap.',
            ], 422);
        }

        // 3. Find latest unconsumed OTP for this phone with purpose 'hapus-akun'
        $otp = OtpCode::where('phone', $phone)
            ->where('purpose', 'hapus-akun')
            ->whereNull('consumed_at')
            ->latest()
            ->first();

        $demoEnabled = ! App::environment('production') && (bool) config('services.otp.demo_mode', env('OTP_DEMO_MODE', false));

        if (! $otp || $otp->isExpired()) {
            if (! $demoEnabled || $code !== '123456') {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode sudah kedaluwarsa. Minta kode baru.',
                ], 422);
            }
        }

        if ($otp) {
            // Check max 5 attempts
            if ($otp->attempts >= 5) {
                $otp->update(['consumed_at' => Carbon::now()]);

                return response()->json([
                    'success' => false,
                    'message' => 'Terlalu banyak percobaan. Minta kode baru.',
                ], 429);
            }

            // Verify hash
            $inputHash = AuthHelper::hashOtp($phone, $code);
            $isValid = hash_equals($otp->code_hash, $inputHash) || ($demoEnabled && $code === '123456');

            if (! $isValid) {
                $otp->increment('attempts');
                $remaining = 5 - $otp->attempts;

                if ($remaining <= 0) {
                    $otp->update(['consumed_at' => Carbon::now()]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Terlalu banyak percobaan. Minta kode baru.',
                    ], 429);
                }

                return response()->json([
                    'success' => false,
                    'message' => "Kode salah. Coba lagi. Sisa percobaan: {$remaining}.",
                ], 422);
            }

            // Consume OTP immediately so it cannot be reused
            $otp->update(['consumed_at' => Carbon::now()]);
        }

        // 4. Execute atomic deletion
        try {
            SettingsHelper::deleteAccountData($userId);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Penghapusan gagal. Tidak ada data yang diubah. Coba lagi.',
            ], 500);
        }

        // 5. Invalidate session & forget cookies
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        Cookie::queue(Cookie::forget('lapak_otp_phone'));
        Cookie::queue(Cookie::forget('lapak_text_size'));

        $redirectUrl = route('masuk', ['pesan' => 'akun-dihapus']);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'redirect' => $redirectUrl,
                'message' => 'Akunmu dan semua datanya sudah dihapus.',
            ]);
        }

        return redirect()->to($redirectUrl)->with('status', 'Akunmu dan semua datanya sudah dihapus.');
    }
}
