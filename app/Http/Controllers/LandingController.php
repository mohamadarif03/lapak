<?php

namespace App\Http\Controllers;

use App\Support\LandingHelper;
use App\Support\SettingsHelper;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class LandingController extends Controller
{
    /**
     * Display the public landing page.
     */
    public function index(Request $request): InertiaResponse
    {
        $user = $request->user();
        $cta = LandingHelper::getLandingCtaTarget($user);
        $visibleStats = LandingHelper::getVisibleStats(config('landing-content.stats', []));
        $contactLinks = LandingHelper::buildContactLinks(config('landing-content.contact', []));
        $demoAllowed = LandingHelper::isDemoAllowed();
        $pesanNotice = LandingHelper::parseLandingMessage($request->query('pesan'));

        $view = class_exists('\Laravel\Fortify\Fortify') ? 'welcome' : 'Welcome';

        return Inertia::render($view, [
            'site' => config('landing-content.site', [
                'name' => 'LAPAK',
                'tagline' => 'Cukup bicara, usahamu berkembang.',
                'url' => config('app.url', 'http://localhost:8000'),
                'description' => 'Asisten pintar UMKM Indonesia untuk pencatatan keuangan suara, analisis pasar, dan promosi otomatis.',
            ]),
            'stats' => $visibleStats,
            'contact' => $contactLinks,
            'isLoggedIn' => $cta['is_logged_in'],
            'ctaTarget' => $cta['target'],
            'ctaLabel' => $cta['label'],
            'demoEnabled' => $demoAllowed,
            'pesan' => $pesanNotice,
            'currentYear' => Carbon::now('Asia/Jakarta')->year,
        ]);
    }

    /**
     * Start a temporary demo session.
     * POST /api/demo/start
     */
    public function startDemo(Request $request): RedirectResponse|JsonResponse
    {
        if (! LandingHelper::isDemoAllowed()) {
            abort(404, 'Mode demo tidak diaktifkan.');
        }

        $currentUser = $request->user();

        // 1. If user already has an active demo session, reuse it
        if ($currentUser && $currentUser->is_demo && $currentUser->demo_expires_at && $currentUser->demo_expires_at->isFuture()) {
            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'redirect' => route('dashboard')]);
            }

            return redirect()->route('dashboard');
        }

        // 2. If user already has a regular (non-demo) session, do not overwrite it
        if ($currentUser && ! $currentUser->is_demo) {
            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'redirect' => route('dashboard')]);
            }

            return redirect()->route('dashboard');
        }

        // 3. Create fresh demo account
        $ip = $request->ip() ?? '127.0.0.1';
        $result = LandingHelper::createDemoAccount($ip);

        if (! $result['ok']) {
            $pesan = ($result['reason'] ?? '') === 'busy' ? 'demo-sibuk' : 'demo-gagal';

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Demo belum bisa dimulai.',
                    'redirect' => url('/?pesan='.$pesan),
                ], 429);
            }

            return redirect()->to('/?pesan='.$pesan);
        }

        $demoUser = $result['user'];

        // Log in demo user
        Auth::login($demoUser);
        $request->session()->regenerate();

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'redirect' => route('dashboard')]);
        }

        return redirect()->route('dashboard');
    }

    /**
     * Exit demo mode and delete demo account data permanently.
     * POST /api/demo/exit
     */
    public function exitDemo(Request $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        if ($user && $user->is_demo) {
            SettingsHelper::deleteAccountData($user->id);
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        if ($request->wantsJson()) {
            return response()->json(['success' => true, 'redirect' => url('/?pesan=demo-berakhir')]);
        }

        return redirect()->to('/?pesan=demo-berakhir');
    }

    /**
     * Trigger cleanup for expired demo accounts (CLI / Cron / API).
     * POST /api/demo/cleanup
     */
    public function cleanupDemos(Request $request): JsonResponse
    {
        $token = $request->header('X-Cleanup-Token') ?? $request->query('token');
        $expectedToken = config('demo.cleanup_token', 'lapak-demo-cleanup-secret');

        if (! $token || ! hash_equals($expectedToken, (string) $token)) {
            abort(403, 'Akses pembersihan demo ditolak.');
        }

        $count = LandingHelper::cleanupExpiredDemos();

        return response()->json([
            'success' => true,
            'message' => "Pembersihan selesai. {$count} akun demo kedaluwarsa telah dihapus.",
            'cleaned' => $count,
        ]);
    }

    /**
     * Serve robots.txt for search engines.
     */
    public function robots(): Response
    {
        $baseUrl = rtrim(config('app.url', 'http://localhost:8000'), '/');

        $content = "User-agent: *\n"
            ."Allow: /\n"
            ."Allow: /syarat\n"
            ."Allow: /privasi\n"
            ."Disallow: /masuk\n"
            ."Disallow: /profil-usaha\n"
            ."Disallow: /dashboard\n"
            ."Disallow: /catat\n"
            ."Disallow: /analisis\n"
            ."Disallow: /promosi\n"
            ."Disallow: /laporan\n"
            ."Disallow: /pengaturan\n"
            ."Disallow: /api/\n"
            ."Sitemap: {$baseUrl}/sitemap.xml\n";

        return response($content, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    /**
     * Serve sitemap.xml for search engines.
     */
    public function sitemap(): Response
    {
        $baseUrl = config('app.url', 'http://localhost:8000');
        $xml = LandingHelper::buildSitemap($baseUrl);

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
