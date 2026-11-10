<?php

namespace App\Support;

use App\Models\Business;
use App\Models\Campaign;
use App\Models\CampaignVersion;
use App\Models\Insight;
use App\Models\OtpCode;
use App\Models\SocialConnection;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserPreference;
use App\Models\VoiceLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use ZipArchive;

class SettingsHelper
{
    public const TIMEZONE = 'Asia/Jakarta';

    public const PRICE_RANGES = [
        'di bawah Rp 10 ribu',
        'Rp 10-50 ribu',
        'Rp 50-200 ribu',
        'di atas Rp 200 ribu',
    ];

    /**
     * Validate business detail fields (main_products and price_range).
     *
     * @param  array<string, mixed>  $input
     * @return array{is_valid: bool, errors: array<string, string>, data: array{main_products: ?string, price_range: ?string}}
     */
    public static function validateBusinessDetails(array $input): array
    {
        $errors = [];

        // 1. main_products: 0-200 characters after trim & space collapse
        $rawProducts = $input['main_products'] ?? '';
        $cleanProducts = strip_tags((string) $rawProducts);
        $cleanProducts = preg_replace('/[\x00-\x1F\x7F]/u', '', $cleanProducts);
        $cleanProducts = trim((string) preg_replace('/\s+/u', ' ', (string) $cleanProducts));

        if (mb_strlen($cleanProducts, 'UTF-8') > 200) {
            $errors['main_products'] = 'Produk utama maksimal 200 karakter.';
        }

        // 2. price_range: must be in allowed list or null/empty
        $rawPrice = trim((string) ($input['price_range'] ?? ''));
        $cleanPrice = null;

        if ($rawPrice !== '') {
            if (! in_array($rawPrice, self::PRICE_RANGES, true)) {
                $errors['price_range'] = 'Pilihan kisaran harga tidak valid.';
            } else {
                $cleanPrice = $rawPrice;
            }
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors,
            'data' => [
                'main_products' => $cleanProducts !== '' ? $cleanProducts : null,
                'price_range' => $cleanPrice,
            ],
        ];
    }

    /**
     * Confirm account deletion keyword ("HAPUS", case-insensitive, trimmed).
     */
    public static function confirmDeletionWord(?string $input): bool
    {
        if ($input === null) {
            return false;
        }

        return strtolower(trim($input)) === 'hapus';
    }

    /**
     * Normalize and validate text size preference ('normal' or 'besar').
     */
    public static function applyTextSize(?string $size): string
    {
        $clean = strtolower(trim((string) $size));

        return in_array($clean, ['normal', 'besar'], true) ? $clean : 'normal';
    }

    /**
     * Escape cell content for CSV with formula injection protection.
     */
    public static function escapeCsvCell(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        $str = (string) $value;
        if ($str === '') {
            return '';
        }

        // Formula injection protection: prepend ' on formula trigger characters
        $firstChar = $str[0];
        if (in_array($firstChar, ['=', '+', '-', '@', "\t", "\r", "\n"], true)) {
            $str = "'".$str;
        }

        // If string contains comma, double quote, or newlines, wrap in quotes
        if (strpbrk($str, ",\"\r\n") !== false) {
            $str = '"'.str_replace('"', '""', $str).'"';
        }

        return $str;
    }

    /**
     * Build export zip filename: lapak-data-{slug}-{date}.zip
     */
    public static function buildExportFilename(string $businessName, Carbon|string $date): string
    {
        $dateStr = $date instanceof Carbon ? $date->format('Y-m-d') : substr((string) $date, 0, 10);
        $slug = Str::slug($businessName, '-');
        if ($slug === '') {
            $slug = 'usaha';
        }

        return "lapak-data-{$slug}-{$dateStr}.zip";
    }

    /**
     * Build complete export data bundle as in-memory ZIP string.
     *
     * @return array{filename: string, content: string, mime: string}
     */
    public static function buildExportBundle(int $userId): array
    {
        $user = User::find($userId);
        $business = Business::where('user_id', $userId)->first();
        $businessId = $business?->id;
        $nowWib = Carbon::now(self::TIMEZONE);

        $tempZip = tempnam(sys_get_temp_dir(), 'lapak_export_');
        $zip = new ZipArchive;
        $zip->open($tempZip, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        // 1. README.txt
        $readme = "LAPAK UMKM - Berkas Ekspor Seluruh Data\n"
            .'Tanggal Ekspor : '.$nowWib->format('d M Y, H:i')." WIB\n"
            .'Nama Usaha     : '.($business?->business_name ?? 'Usaha')."\n"
            .'Pemilik        : '.($business?->owner_name ?? $user?->name ?? 'Pemilik')."\n\n"
            ."Daftar Berkas:\n"
            ."- profil.json        : Informasi akun pengguna dan profil usaha.\n"
            ."- transaksi.csv     : Rekap transaksi penjualan & pengeluaran (format Excel).\n"
            ."- transaksi.json    : Data mentah seluruh transaksi.\n"
            ."- catatan-suara.json: Riwayat transkripsi suara yang pernah dicatat.\n"
            ."- insight.json      : Riwayat analisis dan wawasan bisnis.\n"
            ."- promosi.json      : Materi dan riwayat kampanye promosi.\n"
            ."- poster/           : Berkas gambar poster promosi aktif (jika total <= 25 MB).\n\n"
            ."Catatan Keamanan:\n"
            ."Berkas ini tidak memuat token rahasia, kunci enkripsi, atau data autentikasi sensitif.\n";

        // 2. profil.json
        $profileData = [
            'akun' => [
                'nomor_hp' => $user?->phone ?? '',
                'nama' => $user?->name ?? '',
                'terdaftar_pada' => $user?->created_at?->setTimezone(self::TIMEZONE)->format('Y-m-d H:i:s'),
                'persetujuan_pada' => $user?->consent_at?->setTimezone(self::TIMEZONE)->format('Y-m-d H:i:s'),
                'versi_persetujuan' => $user?->consent_version ?? '1.0',
            ],
            'usaha' => $business ? [
                'nama_usaha' => $business->business_name,
                'nama_pemilik' => $business->owner_name,
                'jenis_usaha' => $business->business_type,
                'alamat' => $business->address,
                'koordinat' => ['lat' => $business->lat, 'lng' => $business->lng],
                'produk_utama' => $business->main_products,
                'kisaran_harga' => $business->price_range,
            ] : null,
        ];
        $zip->addFromString('profil.json', json_encode($profileData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // 3. transaksi.csv and transaksi.json
        $txQuery = $businessId ? Transaction::where('business_id', $businessId) : Transaction::whereRaw('1 = 0');
        if (Schema::hasColumn('transactions', 'deleted_at')) {
            $txQuery->whereNull('deleted_at');
        }
        $transactions = $txQuery->orderBy('occurred_at', 'asc')->get();

        $txJsonList = [];
        $csvLines = [];
        // UTF-8 BOM for Excel
        $csvLines[] = "\xEF\xBB\xBFID,Tanggal,Jam,Jenis,Item,Jumlah,Kategori,Nominal,Catatan,Sumber";

        foreach ($transactions as $t) {
            $tWib = $t->occurred_at->copy()->setTimezone(self::TIMEZONE);
            $typeLabel = strtolower((string) $t->type) === 'income' ? 'Pemasukan' : 'Pengeluaran';
            $srcLabel = strtolower((string) $t->source) === 'voice' ? 'Suara' : 'Manual';

            $txJsonList[] = [
                'id' => $t->id,
                'tanggal' => $tWib->format('Y-m-d'),
                'jam' => $tWib->format('H:i'),
                'jenis' => $typeLabel,
                'item' => $t->item,
                'jumlah' => (int) $t->quantity,
                'kategori' => $t->category ?? 'Tanpa kategori',
                'nominal' => (int) $t->amount,
                'catatan' => $t->note ?? '',
                'sumber' => $srcLabel,
            ];

            $csvRow = [
                self::escapeCsvCell($t->id),
                self::escapeCsvCell($tWib->format('Y-m-d')),
                self::escapeCsvCell($tWib->format('H:i')),
                self::escapeCsvCell($typeLabel),
                self::escapeCsvCell($t->item),
                self::escapeCsvCell($t->quantity),
                self::escapeCsvCell($t->category ?? 'Tanpa kategori'),
                self::escapeCsvCell($t->amount),
                self::escapeCsvCell($t->note ?? ''),
                self::escapeCsvCell($srcLabel),
            ];
            $csvLines[] = implode(',', $csvRow);
        }

        $zip->addFromString('transaksi.csv', implode("\r\n", $csvLines));
        $zip->addFromString('transaksi.json', json_encode($txJsonList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // 4. catatan-suara.json
        $voiceLogs = [];
        if ($businessId && Schema::hasTable('voice_logs')) {
            $vLogs = VoiceLog::whereHas('transaction', fn ($q) => $q->where('business_id', $businessId))->get();
            foreach ($vLogs as $vl) {
                $voiceLogs[] = [
                    'id' => $vl->id,
                    'transkrip' => $vl->raw_transcript ?? $vl->transcript ?? '',
                    'hasil_parsing' => $vl->parsed_payload ?? $vl->parsed_data ?? [],
                    'dibuat_pada' => $vl->created_at?->setTimezone(self::TIMEZONE)->format('Y-m-d H:i:s'),
                ];
            }
        }
        $zip->addFromString('catatan-suara.json', json_encode($voiceLogs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // 5. insight.json
        $insights = [];
        if ($businessId && Schema::hasTable('insights')) {
            $inList = Insight::where('business_id', $businessId)->get();
            foreach ($inList as $in) {
                $insights[] = [
                    'id' => $in->id,
                    'tipe' => $in->type,
                    'judul' => $in->title,
                    'rekomendasi' => $in->recommendation,
                    'sumber' => $in->source,
                    'tanggal_data' => $in->data_date?->format('Y-m-d') ?? (string) $in->data_date,
                    'dibuat_pada' => $in->created_at?->setTimezone(self::TIMEZONE)->format('Y-m-d H:i:s'),
                ];
            }
        }
        $zip->addFromString('insight.json', json_encode($insights, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // 6. promosi.json and poster/
        $campaigns = [];
        $posterFiles = [];
        $totalPosterBytes = 0;

        if ($businessId && Schema::hasTable('campaigns')) {
            $campList = Campaign::where('business_id', $businessId)->get();
            foreach ($campList as $c) {
                $campaigns[] = [
                    'id' => $c->id,
                    'judul' => $c->title,
                    'nama_promo' => $c->promo_name,
                    'status' => $c->status,
                    'headline' => $c->copy['headline'] ?? '',
                    'subheadline' => $c->copy['subheadline'] ?? '',
                    'caption' => $c->copy['caption'] ?? '',
                    'hashtags' => $c->copy['hashtags'] ?? [],
                    'format' => $c->format ?? 'feed',
                    'diposting_pada' => $c->posted_at?->setTimezone(self::TIMEZONE)->format('Y-m-d H:i:s'),
                    'dibuat_pada' => $c->created_at?->setTimezone(self::TIMEZONE)->format('Y-m-d H:i:s'),
                ];

                if ($c->poster_path) {
                    $fullPath = storage_path("app/private/{$c->poster_path}");
                    if (file_exists($fullPath)) {
                        $size = filesize($fullPath);
                        $totalPosterBytes += $size;
                        $posterFiles[] = [
                            'path' => $fullPath,
                            'name' => basename($c->poster_path),
                        ];
                    }
                }
            }
        }
        $zip->addFromString('promosi.json', json_encode($campaigns, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Check poster folder limit <= 25 MB (26214400 bytes)
        $maxPosterBytes = 25 * 1024 * 1024;
        if ($totalPosterBytes > 0 && $totalPosterBytes <= $maxPosterBytes) {
            foreach ($posterFiles as $pf) {
                $zip->addFile($pf['path'], 'poster/'.$pf['name']);
            }
        } elseif ($totalPosterBytes > $maxPosterBytes) {
            $readme .= "\n[Pemberitahuan Poster]: Folder poster dilewati karena total ukuran gambar ("
                .round($totalPosterBytes / (1024 * 1024), 1)." MB) melebihi batas 25 MB.\n";
        }

        $zip->addFromString('README.txt', $readme);
        $zip->close();

        $content = file_get_contents($tempZip);
        @unlink($tempZip);

        $filename = self::buildExportFilename($business?->business_name ?? 'usaha', $nowWib);

        return [
            'filename' => $filename,
            'content' => $content ?: '',
            'mime' => 'application/zip',
        ];
    }

    /**
     * Delete entire account data for a given user.
     * Idempotent and wrapped in DB transaction.
     */
    public static function deleteAccountData(int $userId): bool
    {
        $user = User::find($userId);
        if (! $user) {
            return true; // Already deleted, idempotent
        }

        $business = Business::where('user_id', $userId)->first();
        $businessId = $business?->id;
        $userPhone = $user->phone;

        // Step 1: Mark deletion requested
        $user->update(['deletion_requested_at' => now()]);

        // Step 2: Revoke and collect external poster files to delete
        $filesToDelete = [];
        if ($businessId && Schema::hasTable('campaigns')) {
            $campaigns = Campaign::where('business_id', $businessId)->get();
            foreach ($campaigns as $camp) {
                if ($camp->poster_path) {
                    $filesToDelete[] = $camp->poster_path;
                }
            }
        }
        if ($businessId && Schema::hasTable('campaign_versions')) {
            $cVersions = CampaignVersion::whereHas('campaign', fn ($q) => $q->where('business_id', $businessId))->get();
            foreach ($cVersions as $cv) {
                if ($cv->poster_path) {
                    $filesToDelete[] = $cv->poster_path;
                }
            }
        }

        // Step 3: Best-effort token revocation
        if ($businessId && Schema::hasTable('social_connections')) {
            SocialConnection::where('business_id', $businessId)->delete();
        }

        // Step 4: Atomic DB transaction
        DB::transaction(function () use ($userId, $businessId, $userPhone) {
            if ($businessId) {
                if (Schema::hasTable('campaign_versions')) {
                    CampaignVersion::whereHas('campaign', fn ($q) => $q->where('business_id', $businessId))->delete();
                }
                if (Schema::hasTable('campaigns')) {
                    Campaign::where('business_id', $businessId)->delete();
                }
                if (Schema::hasTable('insights')) {
                    Insight::where('business_id', $businessId)->delete();
                }
                if (Schema::hasTable('voice_logs')) {
                    VoiceLog::whereHas('transaction', fn ($q) => $q->where('business_id', $businessId))->delete();
                }
                if (Schema::hasTable('transactions')) {
                    Transaction::where('business_id', $businessId)->forceDelete();
                }

                // Delete caches if exists
                if (Schema::hasTable('geo_caches')) {
                    DB::table('geo_caches')->delete();
                }
                if (Schema::hasTable('trend_caches')) {
                    DB::table('trend_caches')->delete();
                }

                Business::where('id', $businessId)->delete();
            }

            if (Schema::hasTable('user_preferences')) {
                UserPreference::where('user_id', $userId)->delete();
            }

            if ($userPhone && Schema::hasTable('otp_codes')) {
                OtpCode::where('phone', $userPhone)->delete();
            }

            // Sessions table if exists
            if (Schema::hasTable('sessions')) {
                DB::table('sessions')->where('user_id', $userId)->delete();
            }

            User::where('id', $userId)->delete();
        });

        // Step 5: Delete poster files on storage (after DB transaction completes)
        foreach ($filesToDelete as $relPath) {
            $fullPath = storage_path("app/private/{$relPath}");
            if (file_exists($fullPath)) {
                @unlink($fullPath);
            }
        }

        return true;
    }
}
