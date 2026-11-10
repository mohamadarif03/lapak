<?php

use App\Models\Business;
use App\Models\Transaction;
use App\Models\User;
use App\Models\VoiceLog;
use Carbon\Carbon;

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-16 14:00:00', 'Asia/Jakarta'));
});

afterEach(function () {
    Carbon::setTestNow();
});

test('tamu tanpa sesi dialihkan ke halaman masuk', function () {
    $response = $this->get('/catat');

    $response->assertRedirect('/masuk?next=%2Fcatat');
});

test('pengguna belum punya profil usaha dialihkan ke profil usaha', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get('/catat');

    $response->assertRedirect('/profil-usaha');
});

test('pengguna dapat membuka halaman catat dan melihat ringkasan transaksi hari ini', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'user_id' => $user->id,
        'owner_name' => 'Bu Rara',
        'business_name' => 'Warung Rara',
        'business_type' => 'kuliner',
    ]);

    Transaction::create([
        'business_id' => $business->id,
        'type' => 'income',
        'amount' => 45000,
        'item' => '3 Es Kopi Susu Aren',
        'quantity' => 3,
        'category' => 'Minuman',
        'occurred_at' => Carbon::parse('2026-10-16 10:00:00', 'Asia/Jakarta'),
    ]);

    $response = $this->actingAs($user)->get('/catat');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('catat/index')
        ->where('business.owner_name', 'Bu Rara')
        ->where('dailySummary.total_income', 45000)
        ->where('dailySummary.formatted_income', 'Rp 45.000')
        ->has('transactions', 1)
    );
});

test('parameter edit mengembalikan data transaksi jika milik sendiri atau editNotFound jika bukan', function () {
    $userA = User::factory()->create();
    $businessA = Business::create([
        'user_id' => $userA->id,
        'owner_name' => 'Pemilik A',
        'business_name' => 'Usaha A',
        'business_type' => 'kuliner',
    ]);

    $trxA = Transaction::create([
        'business_id' => $businessA->id,
        'type' => 'income',
        'amount' => 20000,
        'item' => 'Nasi Pecel',
        'quantity' => 1,
        'occurred_at' => Carbon::now('Asia/Jakarta'),
    ]);

    $userB = User::factory()->create();
    $businessB = Business::create([
        'user_id' => $userB->id,
        'owner_name' => 'Pemilik B',
        'business_name' => 'Usaha B',
        'business_type' => 'kuliner',
    ]);

    // User A membuka transaksi miliknya
    $responseA = $this->actingAs($userA)->get("/catat?edit={$trxA->id}");
    $responseA->assertOk();
    $responseA->assertInertia(fn ($page) => $page
        ->where('editTransaction.id', $trxA->id)
        ->where('editNotFound', false)
    );

    // User B mencoba membuka transaksi milik User A
    $responseB = $this->actingAs($userB)->get("/catat?edit={$trxA->id}");
    $responseB->assertOk();
    $responseB->assertInertia(fn ($page) => $page
        ->where('editTransaction', null)
        ->where('editNotFound', true)
    );
});

test('endpoint parse memproses transkrip suara dan menyimpan VoiceLog tanpa langsung membuat transaksi', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'user_id' => $user->id,
        'owner_name' => 'Budi',
        'business_name' => 'Kopi Budi',
        'business_type' => 'kuliner',
    ]);

    $response = $this->actingAs($user)->postJson('/api/catat/parse', [
        'transcript' => 'Jual dua nasi goreng tiga puluh ribu',
    ]);

    $response->assertOk()
        ->assertJsonPath('type', 'income')
        ->assertJsonPath('amount', 30000)
        ->assertJsonPath('item', 'Nasi goreng')
        ->assertJsonPath('quantity', 2);

    expect(VoiceLog::count())->toBe(1);
    expect(Transaction::count())->toBe(0); // Belum disimpan ke transaksi
});

test('simpan transaksi dengan idempotency key mencegah duplikasi', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'user_id' => $user->id,
        'owner_name' => 'Budi',
        'business_name' => 'Kopi Budi',
        'business_type' => 'kuliner',
    ]);

    $payload = [
        'type' => 'income',
        'amount' => 30000,
        'item' => 'Nasi goreng',
        'quantity' => 2,
        'category' => 'Penjualan',
        'source' => 'voice',
        'idempotency_key' => 'unique-key-12345',
        'occurred_at' => Carbon::now('Asia/Jakarta')->toIso8601String(),
    ];

    // Tekanan pertama
    $res1 = $this->actingAs($user)->postJson('/catat', $payload);
    $res1->assertOk();

    // Tekanan kedua dengan idempotency key yang sama
    $res2 = $this->actingAs($user)->postJson('/catat', $payload);
    $res2->assertOk();

    // Pastikan hanya satu record yang tersimpan
    expect(Transaction::where('business_id', $business->id)->count())->toBe(1);
});

test('validasi form menolak data tidak valid', function () {
    $user = User::factory()->create();
    $business = Business::create([
        'user_id' => $user->id,
        'owner_name' => 'Budi',
        'business_name' => 'Kopi Budi',
        'business_type' => 'kuliner',
    ]);

    $response = $this->actingAs($user)->postJson('/catat', [
        'type' => 'invalid_type',
        'amount' => -500,
        'item' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['type', 'amount', 'item']);
});

test('pengguna hanya dapat mengubah dan menghapus transaksi miliknya sendiri', function () {
    $userA = User::factory()->create();
    $businessA = Business::create([
        'user_id' => $userA->id,
        'owner_name' => 'Pemilik A',
        'business_name' => 'Usaha A',
        'business_type' => 'kuliner',
    ]);

    $trxA = Transaction::create([
        'business_id' => $businessA->id,
        'type' => 'income',
        'amount' => 50000,
        'item' => 'Kopi',
        'quantity' => 1,
        'occurred_at' => Carbon::now('Asia/Jakarta'),
    ]);

    $userB = User::factory()->create();
    $businessB = Business::create([
        'user_id' => $userB->id,
        'owner_name' => 'Pemilik B',
        'business_name' => 'Usaha B',
        'business_type' => 'kuliner',
    ]);

    // User B mencoba update transaksi milik User A -> 403 Forbidden
    $updateRes = $this->actingAs($userB)->putJson("/catat/{$trxA->id}", [
        'type' => 'expense',
        'amount' => 10000,
        'item' => 'Hacked',
    ]);
    $updateRes->assertForbidden();

    // User B mencoba delete transaksi milik User A -> 403 Forbidden
    $deleteRes = $this->actingAs($userB)->deleteJson("/catat/{$trxA->id}");
    $deleteRes->assertForbidden();

    // User A menghapus transaksi miliknya -> Berhasil
    $validDelete = $this->actingAs($userA)->deleteJson("/catat/{$trxA->id}");
    $validDelete->assertOk();
    expect(Transaction::find($trxA->id))->toBeNull();
});
