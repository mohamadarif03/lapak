<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Transaction;
use App\Models\User;
use App\Models\VoiceLog;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatatTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-10-16 14:00:00', 'Asia/Jakarta'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_tamu_tanpa_sesi_dialihkan_ke_halaman_masuk(): void
    {
        $response = $this->get('/catat');

        $response->assertRedirect('/masuk?next=%2Fcatat');
    }

    public function test_pengguna_belum_punya_profil_usaha_dialihkan_ke_profil_usaha(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/catat');

        $response->assertRedirect('/profil-usaha');
    }

    public function test_pengguna_dapat_membuka_halaman_catat_dan_melihat_ringkasan(): void
    {
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
            ->component('Catat/Index')
            ->where('business.owner_name', 'Bu Rara')
            ->where('dailySummary.total_income', 45000)
            ->where('dailySummary.formatted_income', 'Rp 45.000')
            ->has('transactions', 1)
        );
    }

    public function test_parameter_edit_mengembalikan_data_transaksi_atau_not_found(): void
    {
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
        Business::create([
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
    }

    public function test_endpoint_parse_memproses_transkrip_suara_dan_menyimpan_voicelog(): void
    {
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

        $this->assertEquals(1, VoiceLog::count());
        $this->assertEquals(0, Transaction::count());
    }

    public function test_simpan_transaksi_dengan_idempotency_key_mencegah_duplikasi(): void
    {
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
        $this->assertEquals(1, Transaction::where('business_id', $business->id)->count());
    }

    public function test_validasi_form_menolak_data_tidak_valid(): void
    {
        $user = User::factory()->create();
        Business::create([
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
    }

    public function test_pengguna_hanya_dapat_mengubah_dan_menghapus_transaksi_milik_sendiri(): void
    {
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
        Business::create([
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
        $this->assertNull(Transaction::find($trxA->id));
    }
}
