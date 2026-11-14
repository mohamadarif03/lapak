<?php

use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\Auth\PhoneAuthController;
use App\Http\Controllers\BusinessProfileController;
use App\Http\Controllers\CatatController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\ContentPromotionController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\LearningController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SettingsController;
use App\Models\Business;
use App\Models\User;
use App\Support\AuthHelper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root directly to login (or dashboard if already logged in)
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
})->name('home');

Route::get('/lp', [LandingController::class, 'index'])->name('landing');
Route::get('/robots.txt', [LandingController::class, 'robots']);
Route::get('/sitemap.xml', [LandingController::class, 'sitemap']);

// Demo Mode Endpoints
Route::post('/api/demo/start', [LandingController::class, 'startDemo'])->name('api.demo.start');
Route::post('/api/demo/exit', [LandingController::class, 'exitDemo'])->name('api.demo.exit');
Route::post('/api/demo/cleanup', [LandingController::class, 'cleanupDemos'])->name('api.demo.cleanup');

Route::get('/masuk', [PhoneAuthController::class, 'index'])->name('masuk');
Route::post('/auth/login', [PhoneAuthController::class, 'login'])->name('auth.login');
Route::post('/auth/register', [PhoneAuthController::class, 'register'])->name('auth.register');
Route::post('/keluar', [PhoneAuthController::class, 'logout'])->name('keluar');
Route::post('/auth/otp/send', [PhoneAuthController::class, 'sendOtp'])->name('auth.otp.send');
Route::post('/auth/otp/verify', [PhoneAuthController::class, 'verifyOtp'])->name('auth.otp.verify');
Route::post('/auth/otp/cancel', [PhoneAuthController::class, 'cancelOtp'])->name('auth.otp.cancel');

// Informational Placeholder Pages (Syarat & Privasi)
Route::get('/syarat', function () {
    return response('<!DOCTYPE html><html lang="id"><head><title>Syarat Penggunaan LAPAK</title></head><body style="font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;"><h1>Syarat Penggunaan LAPAK</h1><p>Selamat datang di LAPAK, asisten digital pelaku UMKM Indonesia. Dengan menggunakan layanan kami, Anda menyetujui ketentuan pemakaian ini.</p><a href="/masuk">&larr; Kembali ke halaman Masuk</a></body></html>', 200, ['Content-Type' => 'text/html']);
})->name('syarat');

Route::get('/privasi', function () {
    return response('<!DOCTYPE html><html lang="id"><head><title>Kebijakan Privasi LAPAK</title></head><body style="font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;"><h1>Kebijakan Privasi LAPAK</h1><p>Kami menjaga keamanan data dan nomor telepon Anda dengan standar enkripsi terbaik dan tidak membagikannya ke pihak ketiga.</p><a href="/masuk">&larr; Kembali ke halaman Masuk</a></body></html>', 200, ['Content-Type' => 'text/html']);
})->name('privasi');

Route::redirect('/onboarding', '/profil-usaha')->name('onboarding');
Route::get('/profil-usaha', [BusinessProfileController::class, 'index'])->name('profil-usaha');
Route::post('/profil-usaha', [BusinessProfileController::class, 'store'])->name('profil-usaha.store');
Route::get('/api/location/search', [BusinessProfileController::class, 'searchAddress'])->name('api.location.search');
Route::get('/api/location/reverse', [BusinessProfileController::class, 'reverseGeocode'])->name('api.location.reverse');

// Catat - Pencatatan Transaksi Suara & Manual
Route::get('/catat', [CatatController::class, 'index'])->name('catat.index');
Route::post('/catat', [CatatController::class, 'store'])->name('catat.store');
Route::put('/catat/{transaction}', [CatatController::class, 'update'])->name('catat.update');
Route::delete('/catat/{transaction}', [CatatController::class, 'destroy'])->name('catat.destroy');
Route::post('/api/catat/parse', [CatatController::class, 'parse'])
    ->middleware('throttle:30,1')
    ->name('catat.parse');

Route::get('/dashboard', function (Request $request) {
    $auth = AuthHelper::requireBusiness($request);
    if ($auth instanceof RedirectResponse) {
        return $auth;
    }

    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/produk', function () {
    return Inertia::render('Products/Index');
})->name('products.index');

Route::get('/etalase', function () {
    return Inertia::render('Public/Showcase');
})->name('public.showcase');

// Analisis Pasar & Demografi (ISIS, IDATA, INOV)
Route::get('/analisis', [AnalysisController::class, 'index'])->name('analisis.index');
Route::get('/api/analisis/geo', [AnalysisController::class, 'geo'])->name('api.analisis.geo');

// Promosi Otomatis & Pembuat Konten
Route::get('/promosi', [PromotionController::class, 'index'])->name('promotions.index');
Route::post('/api/promosi', [PromotionController::class, 'store'])->name('api.promosi.store');
Route::put('/api/promosi/{campaign}', [PromotionController::class, 'update'])->name('api.promosi.update');
Route::post('/api/promosi/{campaign}/regenerate', [PromotionController::class, 'regenerate'])->name('api.promosi.regenerate');
Route::post('/api/promosi/{campaign}/publish', [PromotionController::class, 'publish'])->name('api.promosi.publish');
Route::get('/api/promosi/{campaign}/download', [PromotionController::class, 'download'])->name('api.promosi.download');
Route::post('/api/promosi/generate-poster-ai', [PromotionController::class, 'generatePosterAi'])
    ->middleware('throttle:30,1')
    ->name('api.promosi.generatePosterAi');
Route::post('/api/promosi/transcribe', [PromotionController::class, 'transcribe'])
    ->middleware('throttle:30,1')
    ->name('api.promosi.transcribe');
Route::get('/laporan', [ReportController::class, 'index'])->name('laporan.index');
Route::get('/api/laporan/export', [ReportController::class, 'export'])->name('api.laporan.export');
Route::get('/keuangan', [FinanceController::class, 'index'])->name('finance.index');
Route::get('/catatan-kas', function () {
    return redirect()->route('finance.index');
});
Route::get('/belajar', [LearningController::class, 'index'])->name('learning.index');
Route::get('/modul-belajar', function () {
    return redirect()->route('learning.index');
});

// Bantuan & Konsultasi Mentor
Route::get('/bantuan', [ConsultationController::class, 'index'])->name('consultation.index');
Route::get('/tanya-mentor', function () {
    return redirect()->route('consultation.index');
});
Route::get('/konsultasi', function () {
    return redirect()->route('consultation.index');
});

Route::post('/api/consultation/book', [ConsultationController::class, 'bookConsultation'])->name('api.consultation.book');
Route::post('/api/consultation/{id}/rate', [ConsultationController::class, 'rateConsultation'])->name('api.consultation.rate');
Route::post('/api/consultation/tasks/{id}/toggle', [ConsultationController::class, 'toggleTask'])->name('api.consultation.tasks.toggle');
Route::post('/api/consultation/chat/send', [ConsultationController::class, 'sendMessage'])->name('api.consultation.chat.send');
Route::post('/api/consultation/forum/posts', [ConsultationController::class, 'createForumPost'])->name('api.consultation.forum.create');
Route::post('/api/consultation/forum/posts/{id}/reply', [ConsultationController::class, 'replyForumPost'])->name('api.consultation.forum.reply');
Route::post('/api/consultation/forum/posts/{postId}/best-answer/{replyId}', [ConsultationController::class, 'markBestAnswer'])->name('api.consultation.forum.best');
Route::post('/api/consultation/forum/posts/{postId}/like', [ConsultationController::class, 'toggleLike'])->name('api.consultation.forum.like');
Route::post('/api/consultation/forum/report', [ConsultationController::class, 'reportForumPost'])->name('api.consultation.forum.report');
Route::post('/api/consultation/permissions', [ConsultationController::class, 'updatePermissions'])->name('api.consultation.permissions.update');
Route::post('/api/consultation/permissions/revoke-all', [ConsultationController::class, 'revokeAllPermissions'])->name('api.consultation.permissions.revoke');
Route::post('/api/consultation/feedback', [ConsultationController::class, 'submitFeedback'])->name('api.consultation.feedback');

Route::post('/api/learning/grade-test', [LearningController::class, 'gradeTest'])->name('api.learning.grade');
Route::post('/api/learning/save-progress', [LearningController::class, 'saveProgress'])->name('api.learning.progress');
Route::post('/api/content-assistant/generate-captions', [ContentPromotionController::class, 'generateCaptions'])->name('api.content.captions');
Route::post('/api/content-assistant/generate-ideas', [ContentPromotionController::class, 'generateIdeas'])->name('api.content.ideas');
Route::post('/api/content-assistant/generate-reply', [ContentPromotionController::class, 'generateReply'])->name('api.content.reply');

// Pengaturan & Profil UMKM
Route::get('/pengaturan', [SettingsController::class, 'index'])->name('pengaturan');
Route::post('/api/pengaturan/business-details', [SettingsController::class, 'updateBusinessDetails'])->name('api.pengaturan.business');
Route::post('/api/pengaturan/text-size', [SettingsController::class, 'updateTextSize'])->name('api.pengaturan.text-size');
Route::delete('/api/pengaturan/social/{id}', [SettingsController::class, 'disconnectSocial'])->name('api.pengaturan.social.disconnect');
Route::post('/api/pengaturan/export', [SettingsController::class, 'exportData'])->name('api.pengaturan.export');
Route::post('/api/pengaturan/delete-otp', [SettingsController::class, 'requestDeleteOtp'])->name('api.pengaturan.delete-otp');
Route::delete('/api/pengaturan/account', [SettingsController::class, 'deleteAccount'])->name('api.pengaturan.account.delete');

if (app()->environment('local', 'testing')) {
    Route::get('/demo-auth/{type}', function ($type) {
        $user = User::first() ?? User::create([
            'phone' => '081234567890',
            'name' => 'Bu Siti',
            'role' => 'user',
        ]);
        $business = Business::first() ?? Business::create([
            'user_id' => $user->id,
            'business_name' => 'Dapur Bu Siti',
            'owner_name' => 'Bu Siti',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Sawo Manila No. 14, Pasar Minggu, Jakarta Selatan',
            'onboarding_completed' => ($type !== 'onboarding'),
        ]);
        auth()->login($user);
        session()->put('business_id', $business->id);
        session()->put('user_id', $user->id);

        if ($type === 'onboarding') {
            return redirect('/profil-usaha');
        }

        return redirect('/dashboard');
    })->name('demo-auth');
}

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
