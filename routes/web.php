<?php

use App\Http\Controllers\Auth\PhoneAuthController;
use App\Http\Controllers\CatatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\Settings\BusinessSettingsController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

// Alias routes for Indonesian navigation & specs
Route::get('/masuk', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }

    return Inertia::render('auth/login', [
        'status' => session('status'),
    ]);
})->name('masuk');

Route::post('/keluar', function (Request $request) {
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect('/masuk');
})->name('keluar');

Route::redirect('/profil-usaha', '/onboarding')->name('profil-usaha');
Route::redirect('/pengaturan', '/settings/profile')->name('pengaturan');

// Phone & WhatsApp OTP Auth
Route::post('/auth/otp/verify', [PhoneAuthController::class, 'verifyOtp'])->name('auth.otp.verify');

// Main Dashboard with server-side protection & data API
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/api/dashboard/data', [DashboardController::class, 'data'])->name('dashboard.data');

// Onboarding Profil Usaha
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
Route::inertia('/laporan', 'catat/laporan')->name('laporan.index');
Route::get('/analisis', function (Request $request) {
    if ($request->user()?->business && ! $request->user()->business->analysis_viewed_at) {
        $request->user()->business->update(['analysis_viewed_at' => now()]);
    }

    return Inertia::render('analisis/index');
})->name('analisis.index');
Route::inertia('/promosi', 'promosi/index')->name('promosi.index');
Route::inertia('/bantuan', 'bantuan/index')->name('bantuan.index');

// Pengaturan Profil Usaha
Route::get('/settings/usaha', [BusinessSettingsController::class, 'edit'])->name('settings.usaha');
Route::post('/settings/usaha', [BusinessSettingsController::class, 'update'])->name('settings.usaha.update');

require __DIR__.'/settings.php';
