<?php

namespace Tests\Unit;

use App\Support\SpokenTransactionParser;
use Carbon\Carbon;
use PHPUnit\Framework\TestCase;

class SpokenTransactionParserTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-10-16 14:30:00', 'Asia/Jakarta'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_1_jual_dua_nasi_goreng_tiga_puluh_ribu(): void
    {
        $result = SpokenTransactionParser::parse('Jual dua nasi goreng tiga puluh ribu');

        $this->assertEquals('income', $result['type']);
        $this->assertEquals(30000, $result['amount']);
        $this->assertEquals('Nasi goreng', $result['item']);
        $this->assertEquals(2, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_2_beli_gula_dua_puluh_ribu(): void
    {
        $result = SpokenTransactionParser::parse('Beli gula dua puluh ribu');

        $this->assertEquals('expense', $result['type']);
        $this->assertEquals(20000, $result['amount']);
        $this->assertEquals('Gula', $result['item']);
        $this->assertEquals(1, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_3_terjual_es_kopi_goceng(): void
    {
        $result = SpokenTransactionParser::parse('Terjual es kopi goceng');

        $this->assertEquals('income', $result['type']);
        $this->assertEquals(5000, $result['amount']);
        $this->assertEquals('Es kopi', $result['item']);
        $this->assertEquals(1, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_4_laku_kemeja_batik_seratus_lima_puluh_ribu(): void
    {
        $result = SpokenTransactionParser::parse('Laku kemeja batik seratus lima puluh ribu');

        $this->assertEquals('income', $result['type']);
        $this->assertEquals(150000, $result['amount']);
        $this->assertEquals('Kemeja batik', $result['item']);
        $this->assertEquals(1, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_5_bayar_listrik_limabelas_rebu(): void
    {
        $result = SpokenTransactionParser::parse('Bayar listrik limabelas rebu');

        $this->assertEquals('expense', $result['type']);
        $this->assertEquals(15000, $result['amount']);
        $this->assertEquals('Listrik', $result['item']);
        $this->assertEquals(1, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_6_beli_bensin_ceban(): void
    {
        $result = SpokenTransactionParser::parse('Beli bensin ceban');

        $this->assertEquals('expense', $result['type']);
        $this->assertEquals(10000, $result['amount']);
        $this->assertEquals('Bensin', $result['item']);
        $this->assertEquals(1, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_7_jual_tiga_kue_masing_masing_lima_ribu(): void
    {
        $result = SpokenTransactionParser::parse('Jual tiga kue masing-masing lima ribu');

        $this->assertEquals('income', $result['type']);
        $this->assertEquals(15000, $result['amount']);
        $this->assertEquals('Kue', $result['item']);
        $this->assertEquals(3, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_8_terima_pembayaran_servis_sejuta(): void
    {
        $result = SpokenTransactionParser::parse('Terima pembayaran servis sejuta');

        $this->assertEquals('income', $result['type']);
        $this->assertEquals(1000000, $result['amount']);
        $this->assertEquals('Servis', $result['item']);
        $this->assertEquals(1, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_9_beli_plastik_setengah_juta(): void
    {
        $result = SpokenTransactionParser::parse('Beli plastik setengah juta');

        $this->assertEquals('expense', $result['type']);
        $this->assertEquals(500000, $result['amount']);
        $this->assertEquals('Plastik', $result['item']);
        $this->assertEquals(1, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_10_kemarin_jual_lima_kopi_dua_puluh_lima_ribu(): void
    {
        $result = SpokenTransactionParser::parse('Kemarin jual lima kopi dua puluh lima ribu');

        $this->assertEquals('income', $result['type']);
        $this->assertEquals(25000, $result['amount']);
        $this->assertEquals('Kopi', $result['item']);
        $this->assertEquals(5, $result['quantity']);

        $occurredDate = Carbon::parse($result['occurred_at'])->setTimezone('Asia/Jakarta');
        $this->assertEquals('2026-10-15', $occurredDate->toDateString());
    }

    public function test_11_jual_nasi_goreng_tanpa_nominal(): void
    {
        $result = SpokenTransactionParser::parse('Jual nasi goreng');

        $this->assertEquals('income', $result['type']);
        $this->assertNull($result['amount']);
        $this->assertEquals('Nasi goreng', $result['item']);
        $this->assertEquals(1, $result['quantity']);
        $this->assertTrue($result['needs_review']);
    }

    public function test_12_ongkos_kirim_dua_puluh_ribu(): void
    {
        $result = SpokenTransactionParser::parse('Ongkos kirim dua puluh ribu');

        $this->assertEquals('expense', $result['type']);
        $this->assertEquals(20000, $result['amount']);
        $this->assertEquals('Ongkos kirim', $result['item']);
        $this->assertEquals(1, $result['quantity']);
        $this->assertFalse($result['needs_review']);
    }

    public function test_deteksi_transaksi_majemuk_mengembalikan_transaksi_pertama(): void
    {
        $result = SpokenTransactionParser::parse('Jual dua nasi goreng tiga puluh ribu lalu beli es batu goceng');

        $this->assertTrue($result['multiple_detected']);
        $this->assertEquals('income', $result['type']);
        $this->assertEquals('Nasi goreng', $result['item']);
        $this->assertEquals(30000, $result['amount']);
    }

    public function test_variasi_penulisan_nominal(): void
    {
        $this->assertEquals(50000, SpokenTransactionParser::parseSpokenAmount('jual baju 50k'));
        $this->assertEquals(15000, SpokenTransactionParser::parseSpokenAmount('beli bensin 15rb'));
        $this->assertEquals(15000, SpokenTransactionParser::parseSpokenAmount('servis 15.000'));
        $this->assertEquals(50000, SpokenTransactionParser::parseSpokenAmount('jual celana gocap'));
        $this->assertEquals(100000, SpokenTransactionParser::parseSpokenAmount('laku jaket cepek'));
    }
}
