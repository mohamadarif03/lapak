<?php

use App\Support\SpokenTransactionParser;
use Carbon\Carbon;

beforeEach(function () {
    Carbon::setTestNow(Carbon::parse('2026-10-16 14:30:00', 'Asia/Jakarta'));
});

afterEach(function () {
    Carbon::setTestNow();
});

test('1. Jual dua nasi goreng tiga puluh ribu', function () {
    $result = SpokenTransactionParser::parse('Jual dua nasi goreng tiga puluh ribu');

    expect($result['type'])->toBe('income')
        ->and($result['amount'])->toBe(30000)
        ->and($result['item'])->toBe('Nasi goreng')
        ->and($result['quantity'])->toBe(2)
        ->and($result['needs_review'])->toBeFalse();
});

test('2. Beli gula dua puluh ribu', function () {
    $result = SpokenTransactionParser::parse('Beli gula dua puluh ribu');

    expect($result['type'])->toBe('expense')
        ->and($result['amount'])->toBe(20000)
        ->and($result['item'])->toBe('Gula')
        ->and($result['quantity'])->toBe(1)
        ->and($result['needs_review'])->toBeFalse();
});

test('3. Terjual es kopi goceng', function () {
    $result = SpokenTransactionParser::parse('Terjual es kopi goceng');

    expect($result['type'])->toBe('income')
        ->and($result['amount'])->toBe(5000)
        ->and($result['item'])->toBe('Es kopi')
        ->and($result['quantity'])->toBe(1)
        ->and($result['needs_review'])->toBeFalse();
});

test('4. Laku kemeja batik seratus lima puluh ribu', function () {
    $result = SpokenTransactionParser::parse('Laku kemeja batik seratus lima puluh ribu');

    expect($result['type'])->toBe('income')
        ->and($result['amount'])->toBe(150000)
        ->and($result['item'])->toBe('Kemeja batik')
        ->and($result['quantity'])->toBe(1)
        ->and($result['needs_review'])->toBeFalse();
});

test('5. Bayar listrik limabelas rebu', function () {
    $result = SpokenTransactionParser::parse('Bayar listrik limabelas rebu');

    expect($result['type'])->toBe('expense')
        ->and($result['amount'])->toBe(15000)
        ->and($result['item'])->toBe('Listrik')
        ->and($result['quantity'])->toBe(1)
        ->and($result['needs_review'])->toBeFalse();
});

test('6. Beli bensin ceban', function () {
    $result = SpokenTransactionParser::parse('Beli bensin ceban');

    expect($result['type'])->toBe('expense')
        ->and($result['amount'])->toBe(10000)
        ->and($result['item'])->toBe('Bensin')
        ->and($result['quantity'])->toBe(1)
        ->and($result['needs_review'])->toBeFalse();
});

test('7. Jual tiga kue masing-masing lima ribu', function () {
    $result = SpokenTransactionParser::parse('Jual tiga kue masing-masing lima ribu');

    expect($result['type'])->toBe('income')
        ->and($result['amount'])->toBe(15000)
        ->and($result['item'])->toBe('Kue')
        ->and($result['quantity'])->toBe(3)
        ->and($result['needs_review'])->toBeFalse();
});

test('8. Terima pembayaran servis sejuta', function () {
    $result = SpokenTransactionParser::parse('Terima pembayaran servis sejuta');

    expect($result['type'])->toBe('income')
        ->and($result['amount'])->toBe(1000000)
        ->and($result['item'])->toBe('Servis')
        ->and($result['quantity'])->toBe(1)
        ->and($result['needs_review'])->toBeFalse();
});

test('9. Beli plastik setengah juta', function () {
    $result = SpokenTransactionParser::parse('Beli plastik setengah juta');

    expect($result['type'])->toBe('expense')
        ->and($result['amount'])->toBe(500000)
        ->and($result['item'])->toBe('Plastik')
        ->and($result['quantity'])->toBe(1)
        ->and($result['needs_review'])->toBeFalse();
});

test('10. Kemarin jual lima kopi dua puluh lima ribu', function () {
    $result = SpokenTransactionParser::parse('Kemarin jual lima kopi dua puluh lima ribu');

    expect($result['type'])->toBe('income')
        ->and($result['amount'])->toBe(25000)
        ->and($result['item'])->toBe('Kopi')
        ->and($result['quantity'])->toBe(5);

    $occurredDate = Carbon::parse($result['occurred_at'])->setTimezone('Asia/Jakarta');
    expect($occurredDate->toDateString())->toBe('2026-10-15');
});

test('11. Jual nasi goreng (tanpa nominal)', function () {
    $result = SpokenTransactionParser::parse('Jual nasi goreng');

    expect($result['type'])->toBe('income')
        ->and($result['amount'])->toBeNull()
        ->and($result['item'])->toBe('Nasi goreng')
        ->and($result['quantity'])->toBe(1)
        ->and($result['needs_review'])->toBeTrue();
});

test('12. Ongkos kirim dua puluh ribu', function () {
    $result = SpokenTransactionParser::parse('Ongkos kirim dua puluh ribu');

    expect($result['type'])->toBe('expense')
        ->and($result['amount'])->toBe(20000)
        ->and($result['item'])->toBe('Ongkos kirim')
        ->and($result['quantity'])->toBe(1)
        ->and($result['needs_review'])->toBeFalse();
});

test('deteksi transaksi majemuk (multiple_detected) mengembalikan transaksi pertama', function () {
    $result = SpokenTransactionParser::parse('Jual dua nasi goreng tiga puluh ribu lalu beli es batu goceng');

    expect($result['multiple_detected'])->toBeTrue()
        ->and($result['type'])->toBe('income')
        ->and($result['item'])->toBe('Nasi goreng')
        ->and($result['amount'])->toBe(30000);
});

test('variasi penulisan nominal k, rb, koma, titik, dan dialek gocap cepek', function () {
    expect(SpokenTransactionParser::parseSpokenAmount('jual baju 50k'))->toBe(50000)
        ->and(SpokenTransactionParser::parseSpokenAmount('beli bensin 15rb'))->toBe(15000)
        ->and(SpokenTransactionParser::parseSpokenAmount('servis 15.000'))->toBe(15000)
        ->and(SpokenTransactionParser::parseSpokenAmount('jual celana gocap'))->toBe(50000)
        ->and(SpokenTransactionParser::parseSpokenAmount('laku jaket cepek'))->toBe(100000);
});
