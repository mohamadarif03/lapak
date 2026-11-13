<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\OtpCode;
use App\Models\User;
use App\Services\OtpSenderService;
use App\Support\AuthHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PhoneAuthController extends Controller
{
    /**
     * Display the login / registration page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        // Active session check
        if (Auth::check()) {
            /** @var User $user */
            $user = Auth::user();

            if (! $user->business) {
                return redirect()->route('profil-usaha');
            }

            $next = AuthHelper::safeRedirect($request->query('next'));

            return redirect()->to($next);
        }

        $sessionExpiredNotice = null;
        if ($request->query('pesan') === 'sesi-berakhir' || $request->session()->get('pesan') === 'sesi-berakhir') {
            $sessionExpiredNotice = 'Sesi berakhir, silakan masuk lagi.';
        } elseif ($request->query('pesan') === 'akun-dihapus' || $request->session()->get('pesan') === 'akun-dihapus') {
            $sessionExpiredNotice = 'Akunmu dan semua datanya sudah dihapus.';
        }

        // Check for active verification step saved in cookie
        $step = 'phone';
        $savedPhone = '';
        $maskedPhone = '';
        $channel = 'whatsapp';
        $resendWait = 0;

        $cookiePhoneRaw = $request->cookie('lapak_otp_phone');
        if ($cookiePhoneRaw) {
            try {
                $decryptedPhone = decrypt($cookiePhoneRaw);
                $norm = AuthHelper::normalizePhone($decryptedPhone);
                if ($norm['ok'] && isset($norm['e164'])) {
                    $e164 = $norm['e164'];
                    $latestOtp = OtpCode::query()
                        ->where('phone', $e164)
                        ->where(fn ($q) => $q->where('purpose', 'login')->orWhereNull('purpose'))
                        ->whereNull('consumed_at')
                        ->latest()
                        ->first();

                    if ($latestOtp && ! $latestOtp->isExpired()) {
                        $step = 'otp';
                        $savedPhone = substr($e164, 3); // national without +62
                        $maskedPhone = AuthHelper::maskPhone($e164);
                        $channel = $latestOtp->channel;
                        $resendWait = AuthHelper::getResendWait($latestOtp->created_at);
                    }
                }
            } catch (\Throwable) {
                // Invalid or tampered cookie
            }
        }

        $nextParam = AuthHelper::safeRedirect($request->query('next'));

        // Compatible Inertia component name depending on view structure
        $viewName = class_exists('\Laravel\Fortify\Fortify') ? 'auth/login' : 'Auth/Login';

        return Inertia::render($viewName, [
            'status' => $sessionExpiredNotice ?? session('status'),
            'sessionExpiredMessage' => $sessionExpiredNotice,
            'next' => $nextParam,
            'initialStep' => $step,
            'initialPhone' => $savedPhone,
            'initialMaskedPhone' => $maskedPhone,
            'initialChannel' => $channel,
            'initialResendWait' => $resendWait,
        ]);
    }

    /**
     * Handle simple login with Phone (WhatsApp) + Password (No OTP).
     */
    public function login(Request $request): JsonResponse
    {
        $phoneInput = (string) $request->input('phone');
        $norm = AuthHelper::normalizePhone($phoneInput);
        if (! $norm['ok'] || ! isset($norm['e164'])) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.',
            ], 422);
        }

        $password = (string) $request->input('password');
        if (empty($password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi / password wajib diisi.',
            ], 422);
        }

        $e164 = $norm['e164'];
        $user = User::query()->where('phone', $e164)->first();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor WhatsApp belum terdaftar. Silakan daftar akun baru.',
            ], 404);
        }

        if (! Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi salah. Silakan periksa kembali.',
            ], 401);
        }

        $user->update([
            'last_login_at' => Carbon::now(),
        ]);

        Auth::login($user, remember: true);
        $request->session()->regenerate();
        $request->session()->put('had_session', true);

        if (! $user->business) {
            $redirect = route('profil-usaha');
        } else {
            $redirect = AuthHelper::safeRedirect($request->input('next'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil masuk!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => AuthHelper::maskPhone($user->phone ?? $e164),
            ],
            'redirect' => $redirect,
        ]);
    }

    /**
     * Handle simple register with Name, Phone (WhatsApp) + Password (No OTP).
     */
    public function register(Request $request): JsonResponse
    {
        $phoneInput = (string) $request->input('phone');
        $norm = AuthHelper::normalizePhone($phoneInput);
        if (! $norm['ok'] || ! isset($norm['e164'])) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.',
            ], 422);
        }

        $e164 = $norm['e164'];

        $existingUser = User::query()->where('phone', $e164)->first();
        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor WhatsApp sudah terdaftar. Silakan langsung masuk.',
            ], 409);
        }

        $password = (string) $request->input('password');
        if (strlen($password) < 6) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi minimal 6 karakter.',
            ], 422);
        }

        $name = trim((string) $request->input('name'));
        if (empty($name)) {
            $name = 'Pemilik Toko ' . substr($e164, -4);
        }

        $user = User::create([
            'name' => $name,
            'email' => $e164 . '@lapak.id',
            'phone' => $e164,
            'password' => Hash::make($password),
            'consent_at' => Carbon::now(),
            'consent_version' => '2026-11',
            'last_login_at' => Carbon::now(),
        ]);

        Auth::login($user, remember: true);
        $request->session()->regenerate();
        $request->session()->put('had_session', true);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil!',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => AuthHelper::maskPhone($user->phone ?? $e164),
            ],
            'redirect' => route('profil-usaha'),
        ]);
    }

    /**
     * Send OTP code to the given phone number via WhatsApp or SMS.
     */
    public function sendOtp(Request $request, OtpSenderService $otpSender): JsonResponse
    {
        // Rate limiting by IP: 10 per hour
        $ip = $request->ip() ?? '127.0.0.1';
        $ipKey = 'otp_send_ip:'.$ip;
        if (RateLimiter::tooManyAttempts($ipKey, 10)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak permintaan kode. Coba lagi nanti.',
            ], 429);
        }

        // Normalize phone number
        $phoneInput = (string) $request->input('phone');
        $norm = AuthHelper::normalizePhone($phoneInput);
        if (! $norm['ok'] || ! isset($norm['e164'])) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor HP tidak valid. Contoh: 0812 3456 7890.',
            ], 422);
        }

        $e164 = $norm['e164'];

        // Consent verification is mandatory
        if ($request->boolean('consent') !== true) {
            return response()->json([
                'success' => false,
                'message' => 'Centang persetujuan untuk melanjutkan.',
            ], 422);
        }

        // Check if phone is locked out from 5 failed verification attempts (15-min lockout)
        $lockKey = 'otp_lock:'.$e164;
        if (Cache::has($lockKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
            ], 429);
        }

        // Rate limiting by phone: 5 per hour
        $phoneKey = 'otp_send_phone:'.$e164;
        if (RateLimiter::tooManyAttempts($phoneKey, 5)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak permintaan kode. Coba lagi nanti.',
            ], 429);
        }

        // Enforce 60-second cooldown from server-side timestamp
        $latestOtp = OtpCode::query()
            ->where('phone', $e164)
            ->where(fn ($q) => $q->where('purpose', 'login')->orWhereNull('purpose'))
            ->latest()
            ->first();

        if ($latestOtp) {
            $wait = AuthHelper::getResendWait($latestOtp->created_at);
            if ($wait > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Harap tunggu sebelum meminta kode baru.',
                    'resend_in' => $wait,
                ], 429);
            }
        }

        // Invalidate old active codes for this phone
        OtpCode::query()
            ->where('phone', $e164)
            ->where(fn ($q) => $q->where('purpose', 'login')->orWhereNull('purpose'))
            ->whereNull('consumed_at')
            ->update(['expires_at' => Carbon::now()->subMinute()]);

        // Generate cryptographically secure OTP or retrieve demo code if allowed
        $channel = in_array($request->input('channel'), ['whatsapp', 'sms'], true)
            ? (string) $request->input('channel')
            : 'whatsapp';

        $code = $otpSender->getDemoCodeIfAllowed($e164) ?? AuthHelper::generateOtp();
        $codeHash = AuthHelper::hashOtp($e164, $code);

        $otp = OtpCode::create([
            'phone' => $e164,
            'code_hash' => $codeHash,
            'channel' => $channel,
            'purpose' => 'login',
            'expires_at' => Carbon::now()->addMinutes(5),
            'attempts' => 0,
            'consumed_at' => null,
        ]);

        // Dispatch message
        $dispatched = $otpSender->sendOtp($e164, $code, $channel);
        if (! $dispatched) {
            $otp->update(['expires_at' => Carbon::now()->subMinute()]);

            return response()->json([
                'success' => false,
                'message' => 'Kode belum terkirim. Coba lagi atau kirim lewat SMS.',
            ], 500);
        }

        // Record hits on rate limiters
        RateLimiter::hit($ipKey, 3600);
        RateLimiter::hit($phoneKey, 3600);

        // Store phone in signed httpOnly cookie for 10-minute step persistence across refreshes
        $cookie = cookie('lapak_otp_phone', encrypt($e164), 10, '/', null, $request->secure(), true, false, 'Lax');

        // Identical response for registered vs unregistered numbers
        return response()->json([
            'success' => true,
            'status' => 'success',
            'channel' => $channel,
            'masked_phone' => AuthHelper::maskPhone($e164),
            'resend_in' => 60,
        ])->withCookie($cookie);
    }

    /**
     * Verify the 6-digit OTP code and authenticate or register the user.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        // Retrieve phone from request input or from signed cookie
        $phoneInput = (string) $request->input('phone');
        if (empty($phoneInput) && $request->cookie('lapak_otp_phone')) {
            try {
                $phoneInput = decrypt((string) $request->cookie('lapak_otp_phone'));
            } catch (\Throwable) {
                // invalid cookie
            }
        }

        $norm = AuthHelper::normalizePhone($phoneInput);
        if (! $norm['ok'] || ! isset($norm['e164'])) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor HP tidak valid. Contoh: 0812 3456 7890.',
            ], 422);
        }

        $e164 = $norm['e164'];

        // Check if locked out (15-min lockout)
        $lockKey = 'otp_lock:'.$e164;
        if (Cache::has($lockKey)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
            ], 429);
        }

        // Validate 6-digit numeric code
        $code = trim((string) $request->input('code'));
        if (strlen($code) !== 6 || ! ctype_digit($code)) {
            return response()->json([
                'success' => false,
                'message' => 'Masukkan 6 digit kode OTP secara lengkap.',
            ], 422);
        }

        // Retrieve latest unconsumed code
        $otp = OtpCode::query()
            ->where('phone', $e164)
            ->where(fn ($q) => $q->where('purpose', 'login')->orWhereNull('purpose'))
            ->whereNull('consumed_at')
            ->latest()
            ->first();

        $demoEnabled = ! App::environment('production') && (bool) config('services.otp.demo_mode', env('OTP_DEMO_MODE', false));
        $legacyRegisterBypass = ! App::environment('production') && $request->input('mode') === 'register' && $code === '123456';

        if (! $otp || $otp->isExpired()) {
            if ($demoEnabled || $legacyRegisterBypass) {
                // Allow demo or legacy test bypass
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Kode sudah kedaluwarsa. Minta kode baru.',
                ], 422);
            }
        } elseif ($otp->attempts >= 5) {
            // Check attempts limit
            $otp->update(['expires_at' => Carbon::now()->subMinute()]);
            Cache::put($lockKey, true, Carbon::now()->addMinutes(15));

            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
            ], 429);
        } elseif (! AuthHelper::verifyOtp($e164, $code, $otp->code_hash)) {
            // Constant-time hash verification
            $otp->increment('attempts');
            $remaining = 5 - $otp->attempts;

            if ($remaining <= 0) {
                $otp->update(['expires_at' => Carbon::now()->subMinute()]);
                Cache::put($lockKey, true, Carbon::now()->addMinutes(15));

                return response()->json([
                    'success' => false,
                    'message' => 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.',
                ], 429);
            }

            return response()->json([
                'success' => false,
                'message' => "Kode salah. Coba lagi. Sisa percobaan: {$remaining}.",
                'remaining_attempts' => $remaining,
            ], 422);
        }

        // Verification successful: consume code if present
        if ($otp) {
            $otp->update(['consumed_at' => Carbon::now()]);
        }

        // Find or create user
        $user = User::query()->where('phone', $e164)->first();
        if (! $user) {
            $user = User::create([
                'name' => 'Pemilik Toko '.substr($e164, -4),
                'email' => $e164.'@lapak.id',
                'phone' => $e164,
                'password' => Hash::make(Str::random(32)),
                'consent_at' => Carbon::now(),
                'consent_version' => '2026-11',
                'last_login_at' => Carbon::now(),
            ]);
        } else {
            $user->update([
                'last_login_at' => Carbon::now(),
                'consent_at' => $user->consent_at ?? Carbon::now(),
                'consent_version' => $user->consent_version ?? '2026-11',
            ]);
        }

        // Authenticate user & regenerate session to prevent session fixation
        Auth::login($user, remember: true);
        $request->session()->regenerate();
        $request->session()->put('had_session', true);

        // Determine destination redirect
        if ($request->input('mode') === 'register' && Route::has('onboarding')) {
            $redirect = route('onboarding');
        } elseif (! $user->business) {
            $redirect = route('profil-usaha');
        } else {
            $redirect = AuthHelper::safeRedirect($request->input('next'));
        }

        // Clear temporary verification cookie
        $cookie = cookie()->forget('lapak_otp_phone');

        return response()->json([
            'success' => true,
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => AuthHelper::maskPhone($user->phone ?? $e164),
            ],
            'redirect' => $redirect,
        ])->withCookie($cookie);
    }

    /**
     * Clear the temporary OTP cookie (e.g. when user clicks "Ganti nomor").
     */
    public function cancelOtp(Request $request): JsonResponse
    {
        $cookie = cookie()->forget('lapak_otp_phone');

        return response()->json(['success' => true])->withCookie($cookie);
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $cookie = cookie()->forget('lapak_otp_phone');

        return redirect()->route('masuk')->withCookie($cookie);
    }
}
