<?php

use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\Auth\PhoneAuthController;
use App\Http\Controllers\BusinessProfileController;
use App\Http\Controllers\CatatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Settings\BusinessSettingsController;
use App\Http\Controllers\SettingsController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Landing Page & SEO
Route::get('/', [LandingController::class, 'index'])->name('home');
Route::get('/robots.txt', [LandingController::class, 'robots']);
Route::get('/sitemap.xml', [LandingController::class, 'sitemap']);

// Demo Mode Endpoints
Route::post('/api/demo/start', [LandingController::class, 'startDemo'])->name('api.demo.start');
Route::post('/api/demo/exit', [LandingController::class, 'exitDemo'])->name('api.demo.exit');
Route::post('/api/demo/cleanup', [LandingController::class, 'cleanupDemos'])->name('api.demo.cleanup');

// Alias routes for Indonesian navigation & specs
Route::get('/masuk', [PhoneAuthController::class, 'index'])->name('masuk');
Route::post('/keluar', [PhoneAuthController::class, 'logout'])->name('keluar');

Route::get('/profil-usaha', [BusinessProfileController::class, 'index'])->name('profil-usaha');
Route::post('/profil-usaha', [BusinessProfileController::class, 'store'])->name('profil-usaha.store');
Route::get('/api/location/search', [BusinessProfileController::class, 'searchAddress'])->name('api.location.search');
Route::get('/api/location/reverse', [BusinessProfileController::class, 'reverseGeocode'])->name('api.location.reverse');

// Profil & Pengaturan LAPAK
Route::get('/pengaturan', [SettingsController::class, 'index'])->name('pengaturan');
Route::post('/api/pengaturan/business-details', [SettingsController::class, 'updateBusinessDetails'])->name('api.pengaturan.business');
Route::post('/api/pengaturan/text-size', [SettingsController::class, 'updateTextSize'])->name('api.pengaturan.text-size');
Route::delete('/api/pengaturan/social/{id}', [SettingsController::class, 'disconnectSocial'])->name('api.pengaturan.social.disconnect');
Route::post('/api/pengaturan/export', [SettingsController::class, 'exportData'])->name('api.pengaturan.export');
Route::post('/api/pengaturan/delete-otp', [SettingsController::class, 'requestDeleteOtp'])->name('api.pengaturan.delete-otp');
Route::delete('/api/pengaturan/account', [SettingsController::class, 'deleteAccount'])->name('api.pengaturan.account.delete');

// Informational Placeholder Pages (Syarat & Privasi)
Route::get('/syarat', function () {
    return response('<!DOCTYPE html><html lang="id"><head><title>Syarat Penggunaan LAPAK</title></head><body style="font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;"><h1>Syarat Penggunaan LAPAK</h1><p>Selamat datang di LAPAK, asisten digital pelaku UMKM Indonesia. Dengan menggunakan layanan kami, Anda menyetujui ketentuan pemakaian ini.</p><a href="/masuk">&larr; Kembali ke halaman Masuk</a></body></html>', 200, ['Content-Type' => 'text/html']);
})->name('syarat');

Route::get('/privasi', function () {
    return response('<!DOCTYPE html><html lang="id"><head><title>Kebijakan Privasi LAPAK</title></head><body style="font-family:sans-serif;max-width:800px;margin:2rem auto;padding:1rem;"><h1>Kebijakan Privasi LAPAK</h1><p>Kami menjaga keamanan data dan nomor telepon Anda dengan standar enkripsi terbaik dan tidak membagikannya ke pihak ketiga.</p><a href="/masuk">&larr; Kembali ke halaman Masuk</a></body></html>', 200, ['Content-Type' => 'text/html']);
})->name('privasi');

// Phone & WhatsApp OTP Auth
Route::post('/auth/otp/send', [PhoneAuthController::class, 'sendOtp'])->name('auth.otp.send');
Route::post('/auth/otp/verify', [PhoneAuthController::class, 'verifyOtp'])->name('auth.otp.verify');
Route::post('/auth/otp/cancel', [PhoneAuthController::class, 'cancelOtp'])->name('auth.otp.cancel');

// Main Dashboard with server-side protection & data API
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/api/dashboard/data', [DashboardController::class, 'data'])->name('dashboard.data');

// Onboarding Profil Usaha (Legacy compatibility)
Route::get('/onboarding', [OnboardingController::class, 'index'])->name('onboarding');
Route::post('/onboarding', [OnboardingController::class, 'store'])->name('onboarding.store');

// Core LAPAK Module Views (ISIS, IDATA, INOV, Laporan, Bantuan)
Route::get('/catat', [CatatController::class, 'index'])->name('catat.index');
Route::post('/catat', [CatatController::class, 'store'])->name('catat.store');
Route::put('/catat/{transaction}', [CatatController::class, 'update'])->name('catat.update');
Route::delete('/catat/{transaction}', [CatatController::class, 'destroy'])->name('catat.destroy');
Route::post('/api/catat/parse', [CatatController::class, 'parse'])
    ->middleware('throttle:30,1')
    ->name('catat.parse');
Route::get('/laporan', [ReportController::class, 'index'])->name('laporan.index');
Route::get('/api/laporan/export', [ReportController::class, 'export'])->name('api.laporan.export');
Route::get('/analisis', [AnalysisController::class, 'index'])->name('analisis.index');
Route::get('/api/analisis/geo', [AnalysisController::class, 'geo'])->name('api.analisis.geo');
Route::get('/promosi', [PromotionController::class, 'index'])->name('promosi.index');
Route::post('/api/promosi', [PromotionController::class, 'store'])->name('api.promosi.store');
Route::put('/api/promosi/{campaign}', [PromotionController::class, 'update'])->name('api.promosi.update');
Route::post('/api/promosi/{campaign}/regenerate', [PromotionController::class, 'regenerate'])->name('api.promosi.regenerate');
Route::post('/api/promosi/{campaign}/publish', [PromotionController::class, 'publish'])->name('api.promosi.publish');
Route::get('/api/promosi/{campaign}/download', [PromotionController::class, 'download'])->name('api.promosi.download');
Route::post('/api/promosi/transcribe', [PromotionController::class, 'transcribe'])
    ->middleware('throttle:30,1')
    ->name('api.promosi.transcribe');
Route::inertia('/bantuan', 'bantuan/index')->name('bantuan.index');

// Pengaturan Profil Usaha (Legacy route alias)
Route::get('/settings/usaha', [SettingsController::class, 'index'])->name('settings.usaha');
Route::post('/settings/usaha', [BusinessSettingsController::class, 'update'])->name('settings.usaha.update');

require __DIR__.'/settings.php';
