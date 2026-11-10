<?php

namespace Tests\Unit;

use App\Models\Business;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserPreference;
use App\Support\SettingsHelper;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use ZipArchive;

class SettingsHelperTest extends TestCase
{
    use RefreshDatabase;

    public function test_validate_business_details_with_201_chars_is_invalid(): void
    {
        $longProducts = str_repeat('a', 201);
        $result = SettingsHelper::validateBusinessDetails([
            'main_products' => $longProducts,
            'price_range' => 'di bawah Rp 10 ribu',
        ]);

        $this->assertFalse($result['is_valid']);
        $this->assertArrayHasKey('main_products', $result['errors']);
    }

    public function test_validate_business_details_trims_and_collapses_whitespace(): void
    {
        $result = SettingsHelper::validateBusinessDetails([
            'main_products' => "  Nasi   goreng, \n\t es teh  ",
            'price_range' => 'Rp 10-50 ribu',
        ]);

        $this->assertTrue($result['is_valid']);
        $this->assertSame('Nasi goreng, es teh', $result['data']['main_products']);
        $this->assertSame('Rp 10-50 ribu', $result['data']['price_range']);
    }

    public function test_validate_business_details_rejects_disallowed_price_range(): void
    {
        $result = SettingsHelper::validateBusinessDetails([
            'main_products' => 'Sate Ayam',
            'price_range' => 'Rp 1 juta ke atas',
        ]);

        $this->assertFalse($result['is_valid']);
        $this->assertArrayHasKey('price_range', $result['errors']);
    }

    public function test_apply_text_size_falls_back_to_normal(): void
    {
        $this->assertSame('normal', SettingsHelper::applyTextSize('raksasa'));
        $this->assertSame('normal', SettingsHelper::applyTextSize(''));
        $this->assertSame('normal', SettingsHelper::applyTextSize(null));
        $this->assertSame('besar', SettingsHelper::applyTextSize('besar'));
        $this->assertSame('besar', SettingsHelper::applyTextSize(' BESAR '));
        $this->assertSame('normal', SettingsHelper::applyTextSize('normal'));
    }

    public function test_confirm_deletion_word(): void
    {
        $this->assertTrue(SettingsHelper::confirmDeletionWord('hapus'));
        $this->assertTrue(SettingsHelper::confirmDeletionWord(' HAPUS '));
        $this->assertTrue(SettingsHelper::confirmDeletionWord('Hapus'));

        $this->assertFalse(SettingsHelper::confirmDeletionWord('hapus akun'));
        $this->assertFalse(SettingsHelper::confirmDeletionWord(''));
        $this->assertFalse(SettingsHelper::confirmDeletionWord(null));
        $this->assertFalse(SettingsHelper::confirmDeletionWord('batal'));
    }

    public function test_escape_csv_cell_formula_injection_protection(): void
    {
        // Formula injection prefixes: =, +, -, @
        $this->assertSame("'=SUM(A1:A9)", SettingsHelper::escapeCsvCell('=SUM(A1:A9)'));
        $this->assertSame("'+62812345", SettingsHelper::escapeCsvCell('+62812345'));
        $this->assertSame("'-5000", SettingsHelper::escapeCsvCell('-5000'));
        $this->assertSame("'@admin", SettingsHelper::escapeCsvCell('@admin'));

        // Normal strings containing comma, quote, or newline
        $this->assertSame('"Nasi, Goreng"', SettingsHelper::escapeCsvCell('Nasi, Goreng'));
        $this->assertSame('"Menu ""Spesial"""', SettingsHelper::escapeCsvCell('Menu "Spesial"'));
        $this->assertSame("Baris 1\nBaris 2", trim(SettingsHelper::escapeCsvCell("Baris 1\nBaris 2"), '"'));
    }

    public function test_build_export_filename(): void
    {
        $filename = SettingsHelper::buildExportFilename('Warung Kopi & Bakso #1', '2026-11-03');
        $this->assertSame('lapak-data-warung-kopi-bakso-1-2026-11-03.zip', $filename);

        $emptyFilename = SettingsHelper::buildExportFilename('', '2026-11-03');
        $this->assertSame('lapak-data-usaha-2026-11-03.zip', $emptyFilename);
    }

    public function test_build_export_bundle_for_empty_account(): void
    {
        $user = User::create([
            'name' => 'Pak Budi',
            'email' => 'budi@example.com',
            'password' => bcrypt('password'),
            'phone' => '+6281299990001',
            'consent_at' => now(),
            'consent_version' => '1.0',
        ]);

        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Pak Budi',
            'business_name' => 'Toko Budi',
            'business_type' => 'Kelontong',
            'address' => 'Jl. Mawar No. 1',
        ]);

        $bundle = SettingsHelper::buildExportBundle($user->id);

        $this->assertStringEndsWith('.zip', $bundle['filename']);
        $this->assertNotEmpty($bundle['content']);
        $this->assertSame('application/zip', $bundle['mime']);

        // Inspect ZIP content
        $tempZip = tempnam(sys_get_temp_dir(), 'test_zip_');
        file_put_contents($tempZip, $bundle['content']);
        $zip = new ZipArchive;
        $this->assertTrue($zip->open($tempZip));

        // Required files
        $this->assertNotFalse($zip->locateName('README.txt'));
        $this->assertNotFalse($zip->locateName('profil.json'));
        $this->assertNotFalse($zip->locateName('transaksi.csv'));
        $this->assertNotFalse($zip->locateName('transaksi.json'));
        $this->assertNotFalse($zip->locateName('catatan-suara.json'));
        $this->assertNotFalse($zip->locateName('insight.json'));
        $this->assertNotFalse($zip->locateName('promosi.json'));

        // Check CSV header
        $csvContent = $zip->getFromName('transaksi.csv');
        $this->assertStringContainsString('ID,Tanggal,Jam,Jenis,Item,Jumlah,Kategori,Nominal,Catatan,Sumber', $csvContent);

        // Check JSON array is empty
        $txJson = json_decode($zip->getFromName('transaksi.json'), true);
        $this->assertIsArray($txJson);
        $this->assertEmpty($txJson);

        // Verify zero secrets/hashes/tokens
        $readme = $zip->getFromName('README.txt');
        $profile = $zip->getFromName('profil.json');
        $this->assertStringNotContainsString('code_hash', $profile);
        $this->assertStringNotContainsString('token_encrypted', $profile);

        $zip->close();
        @unlink($tempZip);
    }

    public function test_soft_deleted_transactions_excluded_from_export(): void
    {
        $user = User::create([
            'name' => 'Ibu Siti',
            'email' => 'siti@example.com',
            'password' => bcrypt('password'),
            'phone' => '+6281299990002',
            'consent_at' => now(),
            'consent_version' => '1.0',
        ]);

        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Ibu Siti',
            'business_name' => 'Warung Siti',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Melati No. 2',
        ]);

        $activeTx = Transaction::create([
            'business_id' => $business->id,
            'occurred_at' => now(),
            'type' => 'income',
            'item' => 'Nasi Rames',
            'quantity' => 1,
            'amount' => 15000,
            'source' => 'manual',
        ]);

        $deletedTx = Transaction::create([
            'business_id' => $business->id,
            'occurred_at' => now(),
            'type' => 'income',
            'item' => 'Es Jeruk Terhapus',
            'quantity' => 1,
            'amount' => 5000,
            'source' => 'manual',
        ]);
        $deletedTx->delete();

        $bundle = SettingsHelper::buildExportBundle($user->id);

        $tempZip = tempnam(sys_get_temp_dir(), 'test_zip_');
        file_put_contents($tempZip, $bundle['content']);
        $zip = new ZipArchive;
        $zip->open($tempZip);

        $csv = $zip->getFromName('transaksi.csv');
        $this->assertStringContainsString('Nasi Rames', $csv);
        $this->assertStringNotContainsString('Es Jeruk Terhapus', $csv);

        $zip->close();
        @unlink($tempZip);
    }

    public function test_delete_account_data_is_idempotent_and_cleans_all_tables(): void
    {
        $user = User::create([
            'name' => 'Akun Hapus',
            'email' => 'hapus@example.com',
            'password' => bcrypt('password'),
            'phone' => '+6281299990003',
            'consent_at' => now(),
            'consent_version' => '1.0',
        ]);

        $business = Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Pemilik Hapus',
            'business_name' => 'Toko Dihapus',
            'business_type' => 'Retail',
            'address' => 'Surabaya',
        ]);

        UserPreference::create([
            'user_id' => $user->id,
            'text_size' => 'besar',
        ]);

        Transaction::create([
            'business_id' => $business->id,
            'occurred_at' => now(),
            'type' => 'income',
            'item' => 'Barang',
            'quantity' => 1,
            'amount' => 10000,
            'source' => 'manual',
        ]);

        // First deletion run
        $this->assertTrue(SettingsHelper::deleteAccountData($user->id));

        // Verify all rows deleted
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertDatabaseMissing('businesses', ['id' => $business->id]);
        $this->assertDatabaseMissing('user_preferences', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('transactions', ['business_id' => $business->id]);

        // Second deletion run (idempotent test)
        $this->assertTrue(SettingsHelper::deleteAccountData($user->id));
    }
}
