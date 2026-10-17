<?php

use App\Models\Business;
use App\Models\Campaign;
use App\Models\Insight;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-16 14:00:00', 'Asia/Jakarta'));
});

afterEach(function () {
    Carbon::setTestNow();
});

test('pengguna tanpa sesi dialihkan ke halaman masuk', function () {
    $response = $this->get('/dashboard');

    $response->assertRedirect('/masuk');
    $response->assertSessionHas('message', 'Sesi berakhir, silakan masuk lagi.');
});

test('pengguna yang sudah masuk tapi belum punya profil usaha dialihkan ke profil usaha', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertRedirect('/profil-usaha');
});

test('pengguna yang memiliki profil usaha dapat mengakses dashboard dengan data awal yang bersih', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'user_id' => $user->id,
        'owner_name' => 'Budi Santoso',
        'business_name' => 'Kopi Budi',
        'business_type' => 'kuliner',
        'address' => 'Jl. Merdeka No. 10',
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('dashboard.business.owner_name', 'Budi Santoso')
        ->where('dashboard.business.business_name', 'Kopi Budi')
        ->where('dashboard.summary.income', 0)
        ->where('dashboard.summary.expense', 0)
        ->where('dashboard.summary.profit', 0)
        ->where('dashboard.starter_steps.completed_count', 0)
        ->where('dashboard.starter_steps.example_utterance', 'Jual dua nasi goreng, tiga puluh ribu.')
        ->has('dashboard.recent_transactions', 0)
        ->where('dashboard.latest_insight', null)
    );
});

test('pengguna hanya dapat membaca data bisnis miliknya sendiri (multi-tenant isolation)', function () {
    $userA = User::factory()->create();
    $businessA = Business::create([
        'user_id' => $userA->id,
        'owner_name' => 'Pemilik A',
        'business_name' => 'Usaha A',
        'business_type' => 'jasa',
    ]);
    Transaction::create([
        'business_id' => $businessA->id,
        'type' => 'income',
        'amount' => 500000,
        'item' => 'Servis laptop',
        'quantity' => 1,
        'occurred_at' => Carbon::now('Asia/Jakarta'),
    ]);

    $userB = User::factory()->create();
    $businessB = Business::create([
        'user_id' => $userB->id,
        'owner_name' => 'Pemilik B',
        'business_name' => 'Usaha B',
        'business_type' => 'fashion',
    ]);

    $response = $this->actingAs($userB)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard')
        ->where('dashboard.business.business_name', 'Usaha B')
        ->where('dashboard.summary.income', 0)
        ->has('dashboard.recent_transactions', 0)
    );

    // Pastikan juga di endpoint API
    $apiResponse = $this->actingAs($userB)->getJson('/api/dashboard/data?periode=hari');
    $apiResponse->assertOk()
        ->assertJsonPath('summary.income', 0)
        ->assertJsonCount(0, 'recent_transactions');
});

test('perhitungan agregasi laba rugi dan delta persentase periode bekerja dengan benar', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'user_id' => $user->id,
        'owner_name' => 'Dewi',
        'business_name' => 'Batik Cantik',
        'business_type' => 'fashion',
    ]);

    // Transaksi hari ini: income 300.000, expense 100.000 -> laba 200.000
    Transaction::create([
        'business_id' => $business->id,
        'type' => 'income',
        'amount' => 300000,
        'item' => 'Kain batik',
        'quantity' => 2,
        'occurred_at' => Carbon::parse('2026-10-16 10:00:00', 'Asia/Jakarta'),
    ]);
    Transaction::create([
        'business_id' => $business->id,
        'type' => 'expense',
        'amount' => 100000,
        'item' => 'Malam lilin batik',
        'quantity' => 1,
        'occurred_at' => Carbon::parse('2026-10-16 11:30:00', 'Asia/Jakarta'),
    ]);

    // Transaksi kemarin: income 200.000, expense 500.000
    Transaction::create([
        'business_id' => $business->id,
        'type' => 'income',
        'amount' => 200000,
        'item' => 'Syal batik',
        'quantity' => 1,
        'occurred_at' => Carbon::parse('2026-10-15 14:00:00', 'Asia/Jakarta'),
    ]);
    Transaction::create([
        'business_id' => $business->id,
        'type' => 'expense',
        'amount' => 500000,
        'item' => 'Bahan pewarna',
        'quantity' => 1,
        'occurred_at' => Carbon::parse('2026-10-15 16:00:00', 'Asia/Jakarta'),
    ]);

    $response = $this->actingAs($user)->get('/dashboard?periode=hari');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('dashboard.summary.income', 300000)
        ->where('dashboard.summary.expense', 100000)
        ->where('dashboard.summary.profit', 200000)
        ->where('dashboard.summary.formatted_income', 'Rp 300.000')
        ->where('dashboard.summary.formatted_profit', 'Rp 200.000')
        ->where('dashboard.summary.income_delta', 50) // (300k - 200k)/200k = +50%
    );
});

test('laba negatif diformat dengan tanda minus dan nilai rugi', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'user_id' => $user->id,
        'owner_name' => 'Rahmat',
        'business_name' => 'Bengkel Rahmat',
        'business_type' => 'jasa',
    ]);

    Transaction::create([
        'business_id' => $business->id,
        'type' => 'expense',
        'amount' => 50000,
        'item' => 'Beli oli mesin cadangan',
        'quantity' => 1,
        'occurred_at' => Carbon::now('Asia/Jakarta'),
    ]);

    $response = $this->actingAs($user)->get('/dashboard');
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('dashboard.summary.profit', -50000)
        ->where('dashboard.summary.formatted_profit', '-Rp 50.000')
        ->where('dashboard.summary.is_loss', true)
    );
});

test('kartu langkah awal menghitung progres tugas dan hilang jika semua tugas selesai', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'user_id' => $user->id,
        'owner_name' => 'Siti',
        'business_name' => 'Dapur Siti',
        'business_type' => 'kuliner',
        'analysis_viewed_at' => null,
    ]);

    // Belum ada transaksi, campaign, atau lihat analisis: 0 dari 3
    $response = $this->actingAs($user)->get('/dashboard');
    $response->assertInertia(fn ($page) => $page
        ->where('dashboard.starter_steps.is_all_completed', false)
        ->where('dashboard.starter_steps.completed_count', 0)
    );

    // Tambah 1 transaksi
    Transaction::create([
        'business_id' => $business->id,
        'type' => 'income',
        'amount' => 25000,
        'item' => 'Nasi uduk',
        'quantity' => 1,
        'occurred_at' => Carbon::now('Asia/Jakarta'),
    ]);

    // Buka analisis untuk men-trigger analysis_viewed_at
    $this->actingAs($user)->get('/analisis');
    $business->refresh();
    expect($business->analysis_viewed_at)->not->toBeNull();

    // Tambah 1 campaign
    Campaign::create([
        'business_id' => $business->id,
        'title' => 'Promo Nasi Uduk',
        'status' => 'disetujui',
    ]);

    // Sekarang 3 dari 3 tugas selesai: is_all_completed = true
    $responseDone = $this->actingAs($user)->get('/dashboard');
    $responseDone->assertInertia(fn ($page) => $page
        ->where('dashboard.starter_steps.is_all_completed', true)
        ->where('dashboard.starter_steps.completed_count', 3)
    );
});

test('kartu insight menampilkan insight terbaru atau null jika tidak ada', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'user_id' => $user->id,
        'owner_name' => 'Ahmad',
        'business_name' => 'Toko Ahmad',
        'business_type' => 'dagang',
    ]);

    // Belum ada insight
    $resNoInsight = $this->actingAs($user)->get('/dashboard');
    $resNoInsight->assertInertia(fn ($page) => $page->where('dashboard.latest_insight', null));

    // Buat 1 insight
    $insight = Insight::create([
        'business_id' => $business->id,
        'type' => 'tren_penjualan',
        'title' => 'Kopi sachet paling banyak dibeli pagi hari',
        'recommendation' => 'Sediakan paket sarapan hemat kopi dan biskuit.',
        'source' => 'Data 7 hari terakhir',
        'data_date' => Carbon::parse('2026-10-16', 'Asia/Jakarta'),
    ]);

    $resWithInsight = $this->actingAs($user)->get('/dashboard');
    $resWithInsight->assertInertia(fn ($page) => $page
        ->where('dashboard.latest_insight.id', $insight->id)
        ->where('dashboard.latest_insight.title', 'Kopi sachet paling banyak dibeli pagi hari')
    );
});
