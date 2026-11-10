<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ContentAssistantService
{
    /**
     * Batas wajar penggunaan AI harian untuk UMKM (dapat disesuaikan)
     */
    public const DAILY_LIMIT = 15;

    /**
     * Generate 3 variasi caption konten media sosial berdasarkan input UMKM.
     *
     * @param array{
     *     product_name?: string,
     *     goal: string,
     *     platform: string,
     *     tone: string,
     *     notes?: string
     * } $input
     * @return array{
     *     success: bool,
     *     captions: array<int, array{id: int, caption: string, hashtags: array<int, string>, cta: string}>,
     *     quota: array{limit: int, remaining: int, reset_time: string},
     *     is_mock: bool,
     *     message?: string
     * }
     */
    public function generateCaptions(array $input): array
    {
        $apiKey = config('services.ai.key', env('AI_API_KEY'));
        $quota = $this->getUsageQuota();

        if ($quota['remaining'] <= 0) {
            return [
                'success' => false,
                'captions' => [],
                'quota' => $quota,
                'is_mock' => true,
                'message' => 'Batas pembuatan konten harianmu sudah tercapai (15 kali/hari). Kuota akan direset besok pukul 00:00 WIB.',
            ];
        }

        // Jika API Key tidak dikonfigurasi, gunakan generator mock kontekstual yang realistis
        if (empty($apiKey)) {
            $this->decrementQuota();
            $currentQuota = $this->getUsageQuota();

            return [
                'success' => true,
                'captions' => $this->generateMockCaptions($input),
                'quota' => $currentQuota,
                'quota_remaining' => $currentQuota['remaining'],
                'recommended_time' => '12.00 - 13.00 & 19.00 - 21.00 WIB',
                'photo_tips' => 'Tips Visual: Ambil foto produk close-up di bawah sinar matahari pagi alami. Tunjukkan tekstur lezat dan kemasan yang rapi.',
                'is_mock' => true,
                'message' => 'Konten berhasil dibuat menggunakan Asisten Pintar UMKM.',
            ];
        }

        // Panggilan ke Provider AI sungguhan (Gemini / OpenAI API)
        try {
            $prompt = $this->buildCaptionPrompt($input);
            $model = config('services.ai.model', env('AI_MODEL', 'gemini-2.5-flash'));

            // Contoh integrasi ke Google Gemini API dengan timeout aman
            $response = Http::timeout(12)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'responseMimeType' => 'application/json',
                ],
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $rawText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
                $parsed = json_decode($rawText, true);

                if (isset($parsed['captions']) && is_array($parsed['captions'])) {
                    $this->decrementQuota();
                    $currentQuota = $this->getUsageQuota();

                    $formattedCaptions = array_map(function ($c, $idx) use ($input) {
                        $prod = ! empty($input['product_name']) ? $input['product_name'] : 'Menu Spesial';
                        $body = $c['body'] ?? $c['caption'] ?? '';
                        $headline = $c['headline'] ?? ("Pilihan Terbaik: {$prod}");

                        return [
                            'id' => $c['id'] ?? ($idx + 1),
                            'headline' => $headline,
                            'body' => $body,
                            'caption' => $body,
                            'hashtags' => is_array($c['hashtags'] ?? null) ? $c['hashtags'] : ['#Kuliner', '#UMKMIndonesia'],
                            'cta' => $c['cta'] ?? 'Pesan sekarang via WhatsApp!',
                        ];
                    }, $parsed['captions'], array_keys($parsed['captions']));

                    return [
                        'success' => true,
                        'captions' => $formattedCaptions,
                        'quota' => $currentQuota,
                        'quota_remaining' => $currentQuota['remaining'],
                        'recommended_time' => '12.00 - 13.00 & 19.00 - 21.00 WIB',
                        'photo_tips' => 'Tips Visual: Ambil foto produk close-up di bawah sinar matahari pagi alami. Tunjukkan tekstur lezat dan kemasan yang rapi.',
                        'is_mock' => false,
                        'message' => 'Konten berhasil dibuat dengan AI.',
                    ];
                }
            }

            Log::warning('AI Service response unparseable, falling back to mock.', ['status' => $response->status()]);
        } catch (\Throwable $e) {
            Log::error('AI Service request failed: '.$e->getMessage());
        }

        // Fallback anggun (graceful fallback) jika API mengalami gangguan atau timeout
        $this->decrementQuota();
        $currentQuota = $this->getUsageQuota();

        return [
            'success' => true,
            'captions' => $this->generateMockCaptions($input),
            'quota' => $currentQuota,
            'quota_remaining' => $currentQuota['remaining'],
            'recommended_time' => '12.00 - 13.00 & 19.00 - 21.00 WIB',
            'photo_tips' => 'Tips Visual: Ambil foto produk close-up di bawah sinar matahari pagi alami. Tunjukkan tekstur lezat dan kemasan yang rapi.',
            'is_mock' => true,
            'message' => 'Konten berhasil dibuat (mode cadangan pintar).',
        ];
    }

    /**
     * Generate ide konten dan tips visual foto/video
     */
    public function generateIdeas(array $input): array
    {
        $productName = ! empty($input['product_name']) ? $input['product_name'] : 'produk tokomu';
        $goal = $input['goal'] ?? 'Perkenalan produk';

        return [
            'ideas' => [
                [
                    'id' => 1,
                    'type' => 'Foto Produk',
                    'title' => "Foto Close-up Tekstur {$productName}",
                    'description' => "Ambil foto dari jarak dekat dengan pencahayaan jendela alami agar tekstur dan kelezatan {$productName} terlihat jelas.",
                ],
                [
                    'id' => 2,
                    'type' => 'Video Pendek / Reels',
                    'title' => 'Behind The Scenes Pembuatan Higienis',
                    'description' => 'Rekam video 15 detik proses pengolahan bahan segar dan pengemasan rapi untuk membangun kepercayaan pembeli.',
                ],
                [
                    'id' => 3,
                    'type' => 'Ulasan / Testimoni',
                    'title' => 'Tangkapan Layar Chat Pujian Pelanggan',
                    'description' => 'Posting bukti kepuasan pelanggan di WhatsApp Story dengan menambahkan stiker stempel "Terima Kasih".',
                ],
                [
                    'id' => 4,
                    'type' => 'Tips & Solusi',
                    'title' => "Ide Momen Terbaik Menikmati {$productName}",
                    'description' => "Tunjukkan momen pas menikmati {$productName}, misal teman makan siang di kantor atau camilan kumpul keluarga sore hari.",
                ],
                [
                    'id' => 5,
                    'type' => 'Interaktif / Tanya Jawab',
                    'title' => 'Polling Rasa & Menu Favorit',
                    'description' => 'Buat stiker pertanyaan di story: "Tim makan pakai nasi hangat atau dicemil langsung?".',
                ],
            ],
            'photo_tips' => [
                'Gunakan cahaya alami dari samping jendela antara pukul 08.00-10.00 pagi.',
                'Gunakan piring atau alas polos berwarna netral (kayu, putih, atau anyaman bambu).',
                'Pastikan lensa kamera ponsel sudah dilap bersih dengan kain sebelum memotret.',
            ],
        ];
    }

    /**
     * Generate template balasan pesan pelanggan dengan bantuan AI
     */
    public function generateReplyTemplate(array $input): array
    {
        $topic = $input['topic'] ?? 'Sapaan & Info';
        $notes = $input['notes'] ?? '';
        $text = "Halo kak {nama_pelanggan}! Terima kasih sudah menghubungi toko kami 😊 Terkait {$topic}, untuk produk {nama_produk} saat ini siap diproses dengan harga {harga}. Ada yang bisa kami bantu lagi kak?";

        return [
            'title' => "Balasan {$topic}",
            'category' => $topic,
            'template' => $text,
            'reply_text' => $text,
            'explanation' => 'Template balasan ini ramah, menyapa nama pelanggan, dan langsung memberikan panggilan tindakan (CTA) pemesanan yang jelas.',
        ];
    }

    /**
     * Prompt builder terstruktur untuk LLM
     */
    protected function buildCaptionPrompt(array $input): string
    {
        $product = ! empty($input['product_name']) ? $input['product_name'] : 'aneka kuliner lezat UMKM';
        $goal = $input['goal'] ?? 'Promo';
        $platform = $input['platform'] ?? 'Instagram';
        $tone = $input['tone'] ?? 'Ramah';
        $notes = ! empty($input['notes']) ? 'Informasi tambahan: '.$input['notes'] : '';

        return <<<PROMPT
Kamu adalah asisten copywriter digital ahli untuk pelaku UMKM kuliner di Indonesia.
Buat 3 variasi caption promosi berbahasa Indonesia yang memikat, natural, dan siap posting.

Konteks Pembuatan Konten:
- Produk: {$product}
- Tujuan Konten: {$goal}
- Platform Target: {$platform}
- Gaya Bahasa (Tone): {$tone}
{$notes}

Aturan Ketat:
1. Jangan membuat klaim berlebihan atau palsu (misalnya klaim obat/kesehatan tanpa izin).
2. Sesuaikan format dan panjang teks dengan platform {$platform} (WhatsApp Story singkat & padat, Instagram dilengkapi hashtag, TikTok seru & to the point).
3. Berikan hashtag yang relevan khas UMKM lokal Indonesia (3-6 hashtag).
4. Berikan Call to Action (CTA) ramah memesan via WhatsApp.

Keluarkan hasil HANYA dalam format JSON valid berikut tanpa markdown formatting tambahan:
{
  "captions": [
    {
      "id": 1,
      "headline": "Judul headline menarik",
      "body": "Teks caption lengkap variasi 1",
      "caption": "Teks caption lengkap variasi 1",
      "hashtags": ["#kuliner", "#makananenak"],
      "cta": "Pesan sekarang lewat link WhatsApp di bio!"
    },
    {
      "id": 2,
      "headline": "Judul headline kedua",
      "body": "Teks caption lengkap variasi 2",
      "caption": "Teks caption lengkap variasi 2",
      "hashtags": ["#kuliner", "#umkm"],
      "cta": "Yuk order sekarang sebelum kehabisan!"
    },
    {
      "id": 3,
      "headline": "Judul headline ketiga",
      "body": "Teks caption lengkap variasi 3",
      "caption": "Teks caption lengkap variasi 3",
      "hashtags": ["#kulinerindonesia", "#homemade"],
      "cta": "Klik tombol chat untuk langsung pesan ya kak!"
    }
  ]
}
PROMPT;
    }

    /**
     * Generator Mock Caption Contextual yang Realistis untuk Pengujian Tanpa Kunci API
     */
    protected function generateMockCaptions(array $input): array
    {
        $prod = ! empty($input['product_name']) ? $input['product_name'] : 'Menu Spesial Dapur Bu Siti';
        $goal = $input['goal'] ?? 'Perkenalan produk';
        $platform = $input['platform'] ?? 'Instagram';
        $tone = $input['tone'] ?? 'Ramah';
        $notes = ! empty($input['notes']) ? ' '.$input['notes'] : '';

        // Variasi 1: Cerita & Emosional (Storytelling)
        $caption1 = match ($tone) {
            'Santai' => "Lagi mager tapi pengen yang nampol di lidah? Nih kenalan sama {$prod}! Dibuat dari bumbu ulek fresh tiap pagi, aromanya aja udah bikin perut keroncongan.{$notes}\n\nCocok banget buat temen makan siang santai di rumah bareng keluarga.",
            'Islami/religius' => "Bismillah, menyambut hari berkah dengan sajian yang halal dan thoyyib. {$prod} siap menemani santap keluarga Anda. Diracik dari bahan alami pilihan dengan sepenuh hati.{$notes}\n\nSemoga membawa keberkahan dan kehangatan di meja makan.",
            'Formal' => "Kami dengan bangga mempersembahkan {$prod}. Diproduksi secara higienis menggunakan standar olahan dapur terpercaya untuk menjamin cita rasa otentik khas nusantara.{$notes}\n\nPilihan tepat untuk hidangan jamuan dan santap bersama rekan kerja.",
            default => "Hai Kak! Ada yang baru nih dari dapur kami: {$prod}! Diracik dengan bumbu rempah pilihan tanpa bahan pengawet kimia. Sekali coba, dijamin nagih dan bikin kangen masakan rumah.{$notes}",
        };

        // Variasi 2: Fokus Manfaat & Promo (Benefit-driven)
        $caption2 = match ($goal) {
            'Promo/diskon' => "PROMO SPESIAL HARI INI! 🎉 Nikmati kelezatan {$prod} dengan penawaran istimewa.{$notes}\n\nJangan sampai kehabisan ya, porsi terbatas dibuat segar setiap hari!",
            'Testimoni' => "Kata pelanggan kemarin: 'Rasanya beneran kayak masakan ibu di kampung!'. Seneng banget rasanya {$prod} bisa jadi favorit keluarga Kakak. Terima kasih yang sudah berlangganan setia!{$notes}",
            'Cerita di balik usaha' => "Dimulai dari resep turun-temurun keluarga di dapur kecil kami, kini {$prod} bisa sampai ke meja makan Kakak semua. Perjalanan panjang yang selalu dijaga kualitas rasanya dari dulu sampai sekarang.{$notes}",
            default => "Kenapa harus coba {$prod}? Karena kami hanya memakai bahan segar lokal pilihan, higienis, dan tanpa bahan pengawet. Praktis tinggal santap bersama nasi hangat!{$notes}",
        };

        // Variasi 3: Singkat & Call to Action Cepat (Cocok untuk WhatsApp / TikTok)
        $caption3 = match ($platform) {
            'WhatsApp Status' => "Siap kirim siang ini! {$prod} baru matang, aromanya sedap banget.{$notes}\n\nYang mau keep porsi langsung balas status ini yaa sebelum jam 13.00 WIB! 🛵",
            'TikTok' => "POV: Nemuin menu yang bikin nasi sebakul langsung abis! Auto nambah terus tiap makan {$prod}.{$notes}\n\nSiapa yang udah pernah coba? Klik link di bio buat order sekarang!",
            'Facebook' => "Ibu-ibu dan Bapak-bapak, bingung mau masak apa hari ini? {$prod} siap jadi solusi praktis dan lezat untuk keluarga di rumah. Higienis, bergizi, dan rasanya pas di lidah.{$notes}",
            default => "Sudah waktunya manjain lidah kamu dengan {$prod}! Stok hari ini terbatas ya Kak.{$notes}\n\nYuk langsung amankan pesananmu hari ini juga!",
        };

        return [
            [
                'id' => 1,
                'headline' => "Cita Rasa Istimewa {$prod}",
                'body' => $caption1,
                'caption' => $caption1,
                'hashtags' => ['#DapurBuSiti', '#KulinerNusantara', '#MasakanRumahan', '#UMKMIndonesia', '#HalalFood'],
                'cta' => 'Pesan sekarang via WhatsApp dengan klik tombol di bio!',
            ],
            [
                'id' => 2,
                'headline' => "Kenapa Harus Coba {$prod} Hari Ini?",
                'body' => $caption2,
                'caption' => $caption2,
                'hashtags' => ['#PromoKuliner', '#RekomendasiMakanan', '#MenuFavorit', '#LapakUMKM'],
                'cta' => 'Yuk amankan porsimu sekarang sebelum kehabisan!',
            ],
            [
                'id' => 3,
                'headline' => 'Spesial Buat Kamu Pecinta Kuliner Enak',
                'body' => $caption3,
                'caption' => $caption3,
                'hashtags' => ['#KulinerHits', '#MakananEnak', '#PesanSekarang'],
                'cta' => 'Chat langsung ke nomor WhatsApp toko kami untuk pesan cepat.',
            ],
        ];
    }

    /**
     * Manajemen Kuota Harian Sederhana berbasis Sesi / Cache
     */
    protected function getUsageQuota(): array
    {
        $used = session()->get('ai_content_usage_today', 3); // Seed 3 kali terpakai untuk simulasi awal
        $remaining = max(0, self::DAILY_LIMIT - $used);

        return [
            'limit' => self::DAILY_LIMIT,
            'remaining' => $remaining,
            'reset_time' => 'Besok, 00:00 WIB',
        ];
    }

    protected function decrementQuota(): void
    {
        $used = session()->get('ai_content_usage_today', 3);
        session()->put('ai_content_usage_today', min(self::DAILY_LIMIT, $used + 1));
    }
}
