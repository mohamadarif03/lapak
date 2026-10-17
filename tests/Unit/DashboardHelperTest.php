<?php

use App\Support\DashboardHelper;
use Carbon\Carbon;

test('formatRupiah formats positive, negative and zero amounts correctly', function () {
    expect(DashboardHelper::formatRupiah(15000))->toBe('Rp 15.000')
        ->and(DashboardHelper::formatRupiah(0))->toBe('Rp 0')
        ->and(DashboardHelper::formatRupiah(-20000))->toBe('-Rp 20.000')
        ->and(DashboardHelper::formatRupiah(1250000))->toBe('Rp 1.250.000');
});

test('getPeriodRange handles hari correctly with yesterday comparison', function () {
    // Wednesday 2026-10-14 15:30:00 WIB
    $now = Carbon::parse('2026-10-14 15:30:00', 'Asia/Jakarta');

    $range = DashboardHelper::getPeriodRange('hari', $now);

    expect($range['periode'])->toBe('hari')
        ->and($range['start']->format('Y-m-d H:i:s'))->toBe('2026-10-14 00:00:00')
        ->and($range['end']->format('Y-m-d H:i:s'))->toBe('2026-10-14 23:59:59')
        ->and($range['prevStart']->format('Y-m-d H:i:s'))->toBe('2026-10-13 00:00:00')
        ->and($range['prevEnd']->format('Y-m-d H:i:s'))->toBe('2026-10-13 23:59:59')
        ->and($range['prevLabel'])->toBe('kemarin');
});

test('getPeriodRange handles minggu starting Monday with last week comparison', function () {
    // Wednesday 2026-10-14 15:30:00 WIB (Monday is 2026-10-12, Sunday is 2026-10-18)
    $now = Carbon::parse('2026-10-14 15:30:00', 'Asia/Jakarta');

    $range = DashboardHelper::getPeriodRange('minggu', $now);

    expect($range['periode'])->toBe('minggu')
        ->and($range['start']->format('Y-m-d H:i:s'))->toBe('2026-10-12 00:00:00')
        ->and($range['end']->format('Y-m-d H:i:s'))->toBe('2026-10-18 23:59:59')
        ->and($range['prevStart']->format('Y-m-d H:i:s'))->toBe('2026-10-05 00:00:00')
        ->and($range['prevEnd']->format('Y-m-d H:i:s'))->toBe('2026-10-11 23:59:59')
        ->and($range['prevLabel'])->toBe('minggu lalu');
});

test('getPeriodRange handles bulan starting 1st with last month comparison', function () {
    // 2026-10-14 15:30:00 WIB
    $now = Carbon::parse('2026-10-14 15:30:00', 'Asia/Jakarta');

    $range = DashboardHelper::getPeriodRange('bulan', $now);

    expect($range['periode'])->toBe('bulan')
        ->and($range['start']->format('Y-m-d H:i:s'))->toBe('2026-10-01 00:00:00')
        ->and($range['end']->format('Y-m-d H:i:s'))->toBe('2026-10-31 23:59:59')
        ->and($range['prevStart']->format('Y-m-d H:i:s'))->toBe('2026-09-01 00:00:00')
        ->and($range['prevEnd']->format('Y-m-d H:i:s'))->toBe('2026-09-30 23:59:59')
        ->and($range['prevLabel'])->toBe('bulan lalu');
});

test('getPeriodRange falls back to hari on invalid period input', function () {
    $now = Carbon::parse('2026-10-14 12:00:00', 'Asia/Jakarta');
    $range = DashboardHelper::getPeriodRange('invalid_string', $now);

    expect($range['periode'])->toBe('hari')
        ->and($range['start']->format('Y-m-d'))->toBe('2026-10-14');
});

test('calcDelta returns percentage or null if previous is zero', function () {
    expect(DashboardHelper::calcDelta(120, 100))->toBe(20)
        ->and(DashboardHelper::calcDelta(80, 100))->toBe(-20)
        ->and(DashboardHelper::calcDelta(50000, 0))->toBeNull()
        ->and(DashboardHelper::calcDelta(0, 0))->toBeNull();
});

test('formatTransactionTime formats today as time and other days as short date', function () {
    $now = Carbon::parse('2026-10-16 16:00:00', 'Asia/Jakarta');

    $todayTrx = Carbon::parse('2026-10-16 14:30:00', 'Asia/Jakarta');
    $yesterdayTrx = Carbon::parse('2026-10-12 09:15:00', 'Asia/Jakarta');

    expect(DashboardHelper::formatTransactionTime($todayTrx, $now))->toBe('14.30')
        ->and(DashboardHelper::formatTransactionTime($yesterdayTrx, $now))->toBe('12 Okt');
});

test('getExampleUtterance returns appropriate sample phrase per business type', function () {
    expect(DashboardHelper::getExampleUtterance('kuliner'))->toBe('Jual dua nasi goreng, tiga puluh ribu.')
        ->and(DashboardHelper::getExampleUtterance('fashion'))->toBe('Jual satu kemeja batik, seratus lima puluh ribu.')
        ->and(DashboardHelper::getExampleUtterance('kerajinan'))->toBe('Jual tiga gantungan kunci, enam puluh ribu.')
        ->and(DashboardHelper::getExampleUtterance('jasa'))->toBe('Terima pembayaran servis, seratus ribu.')
        ->and(DashboardHelper::getExampleUtterance('dagang'))->toBe('Jual lima bungkus kopi, lima puluh ribu.')
        ->and(DashboardHelper::getExampleUtterance('lainnya'))->toBe('Jual dua barang, lima puluh ribu.')
        ->and(DashboardHelper::getExampleUtterance(null))->toBe('Jual dua barang, lima puluh ribu.');
});
