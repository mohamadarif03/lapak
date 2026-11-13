<?php

namespace App\Services;

class LearningService
{
    /**
     * Ambang batas kelulusan tes akhir modul (default 70%)
     */
    public const PASSING_SCORE = 70;

    /**
     * Kunci jawaban rahasia dan pembahasan per modul.
     * Tersimpan aman di backend agar tidak bocor ke browser sebelum tes dikumpulkan.
     *
     * @var array<string, array<string, array<string, array{correct: string, explanation: string}>>>
     */
    protected array $answerBank = [
        'modul-1' => [
            'pre' => [
                'q1_1' => [
                    'correct' => 'B',
                    'explanation' => 'Pemasaran digital menjangkau pelanggan melalui media sosial, aplikasi pesan, dan internet kapan saja tanpa terhalang jarak.',
                ],
                'q1_2' => [
                    'correct' => 'C',
                    'explanation' => 'Mengirim pesan siaran atau posting di WhatsApp Status adalah langkah termudah yang langsung terbaca orang terdekat.',
                ],
                'q1_3' => [
                    'correct' => 'A',
                    'explanation' => 'Mulai dari yang gratis dan sudah biasa dipakai di HP (seperti WhatsApp dan media sosial) adalah cara paling hemat dan efektif.',
                ],
            ],
            'post' => [
                'q1_p1' => [
                    'correct' => 'B',
                    'explanation' => 'Keuntungan utama pemasaran online adalah calon pelanggan bisa melihat produkmu 24 jam meskipun tokomu sedang tutup.',
                ],
                'q1_p2' => [
                    'correct' => 'C',
                    'explanation' => 'WhatsApp Status sangat ampuh karena dilihat langsung oleh teman, keluarga, dan tetangga yang sudah percaya dengan tokomu.',
                ],
                'q1_p3' => [
                    'correct' => 'A',
                    'explanation' => 'Konsisten posting 1-2 kali sehari dengan foto jelas jauh lebih efektif daripada posting banyak hanya di hari pertama lalu menghilang.',
                ],
            ],
        ],
        'modul-2' => [
            'pre' => [
                'q2_1' => [
                    'correct' => 'B',
                    'explanation' => 'Cahaya alami di dekat jendela pagi hari membuat warna asli makanan atau barang terlihat segar tanpa bayangan hitam tajam.',
                ],
                'q2_2' => [
                    'correct' => 'C',
                    'explanation' => 'Latar belakang polos dan bersih (seperti alas kayu atau meja putih) membuat pembeli fokus pada produk utamamu.',
                ],
                'q2_3' => [
                    'correct' => 'A',
                    'explanation' => 'Membersihkan lensa kamera HP dengan kain sebelum memotret langsung menghilangkan noda minyak sehingga foto tidak berkabut.',
                ],
            ],
            'post' => [
                'q2_p1' => [
                    'correct' => 'B',
                    'explanation' => 'Sinar matahari pagi pukul 08.00-10.00 memberikan pencahayaan paling merata dan natural tanpa bantuan lampu mahal.',
                ],
                'q2_p2' => [
                    'correct' => 'A',
                    'explanation' => 'Sudut 45 derajat (seperti sudut mata orang saat makan di meja) adalah sudut terbaik untuk melihat porsi dan kelezatan makanan.',
                ],
                'q2_p3' => [
                    'correct' => 'C',
                    'explanation' => 'Foto yang diedit berlebihan hingga warnanya berubah akan membuat pembeli kecewa saat barang aslinya sampai.',
                ],
            ],
        ],
        'modul-3' => [
            'pre' => [
                'q3_1' => [
                    'correct' => 'C',
                    'explanation' => 'Menuliskan harga dan porsi langsung di postingan menghindarkan pelanggan dari rasa ragu untuk membeli.',
                ],
                'q3_2' => [
                    'correct' => 'B',
                    'explanation' => 'Tautan WhatsApp langsung membuat pelanggan bisa memesan hanya dalam satu ketukan tanpa harus menyimpan nomor manual.',
                ],
                'q3_3' => [
                    'correct' => 'A',
                    'explanation' => 'Sertakan informasi daya tahan dan cara simpan (misal tahan 3 hari di kulkas) agar pembeli luar kota merasa aman.',
                ],
            ],
            'post' => [
                'q3_p1' => [
                    'correct' => 'C',
                    'explanation' => 'Postingan tanpa harga seringkali diabaikan pembeli karena malas bertanya DM atau takut harganya kemahalan.',
                ],
                'q3_p2' => [
                    'correct' => 'B',
                    'explanation' => 'Mencantumkan lokasi pengiriman (misal "Kirim dari Pasar Minggu, Jaksel") membantu pembeli memperkirakan ongkos kirim.',
                ],
                'q3_p3' => [
                    'correct' => 'A',
                    'explanation' => 'Ajakan bertindak yang jelas (misal: "Klik link di bio untuk order") membimbing pembeli langkah berikutnya tanpa bingung.',
                ],
            ],
        ],
        'modul-4' => [
            'pre' => [
                'q4_1' => [
                    'correct' => 'B',
                    'explanation' => 'Fokus pada 1-2 platform yang paling sering dibuka oleh calon pembeli usahamu agar tidak kewalahan mengelolanya.',
                ],
                'q4_2' => [
                    'correct' => 'C',
                    'explanation' => 'Membalas chat di bawah 15 menit meningkatkan peluang penjualan hingga 70% sebelum pembeli berpaling ke toko lain.',
                ],
                'q4_3' => [
                    'correct' => 'A',
                    'explanation' => 'Foto profil toko wajib memakai logo atau foto produk andalan yang jelas, bukan foto pemandangan acak.',
                ],
            ],
            'post' => [
                'q4_p1' => [
                    'correct' => 'B',
                    'explanation' => 'Lebih baik aktif konsisten di WhatsApp Status & Instagram daripada punya 5 akun berbeda tetapi tidak pernah ada postingan.',
                ],
                'q4_p2' => [
                    'correct' => 'A',
                    'explanation' => 'Gunakan template balasan cepat yang ramah agar saat pesanan ramai, chat pelanggan tetap terlayani dengan santun.',
                ],
                'q4_p3' => [
                    'correct' => 'C',
                    'explanation' => 'Bio profil yang bagus memuat: nama usaha, jenis produk, jam buka, dan link pemesanan langsung.',
                ],
            ],
        ],
        'modul-5' => [
            'pre' => [
                'q5_1' => [
                    'correct' => 'B',
                    'explanation' => 'Logo sederhana yang mudah diingat dan terbaca di layar HP jauh lebih kuat daripada logo yang terlalu rumit.',
                ],
                'q5_2' => [
                    'correct' => 'C',
                    'explanation' => 'Kemasan yang rapat dan aman mencegah makanan melempem atau tumpah saat dikirim lewat kurir motor.',
                ],
                'q5_3' => [
                    'correct' => 'A',
                    'explanation' => 'Stiker kemasan wajib mencantumkan nama produk, tanggal kedaluwarsa, dan nomor kontak untuk pemesanan ulang.',
                ],
            ],
            'post' => [
                'q5_p1' => [
                    'correct' => 'B',
                    'explanation' => 'Warna kemasan yang konsisten membuat tokomu langsung dikenali pelanggan di antara tumpukan barang lain.',
                ],
                'q5_p2' => [
                    'correct' => 'A',
                    'explanation' => 'Pastikan kemasan ramah makanan (food grade) dan memiliki perekat zipper agar produk bisa disimpan kembali setelah dibuka.',
                ],
                'q5_p3' => [
                    'correct' => 'C',
                    'explanation' => 'Menambahkan stiker ucapan terima kasih kecil membuat pembeli merasa dihargai dan terdorong memberikan ulasan positif.',
                ],
            ],
        ],
        'modul-6' => [
            'pre' => [
                'q6_1' => [
                    'correct' => 'B',
                    'explanation' => 'Mencampur uang belanja rumah dengan kas jualan seringkali membuat pemilik usaha mengira untung besar padahal modalnya habis terpakai.',
                ],
                'q6_2' => [
                    'correct' => 'C',
                    'explanation' => 'Laba bersih dihitung dari uang masuk dikurangi uang keluar yang digunakan untuk belanja modal dan operasional.',
                ],
                'q6_3' => [
                    'correct' => 'A',
                    'explanation' => 'Catat transaksi tepat setelah uang berpindah tangan agar tidak lupa di malam hari.',
                ],
            ],
            'post' => [
                'q6_p1' => [
                    'correct' => 'B',
                    'explanation' => 'Memisahkan rekening pribadi dan rekening usaha adalah langkah terpenting untuk mengetahui apakah usaha benar-benar untung.',
                ],
                'q6_p2' => [
                    'correct' => 'C',
                    'explanation' => 'Uang kas usaha di dompet bukan keuntungan pribadi; sebagian besar adalah modal yang harus diputar untuk membeli bahan baku esok hari.',
                ],
                'q6_p3' => [
                    'correct' => 'A',
                    'explanation' => 'Rutin mencatat setiap hari selama 5 menit jauh lebih ringan daripada menumpuk bon selama sebulan.',
                ],
            ],
        ],
    ];

    /**
     * Dapatkan daftar seluruh modul belajar mikro (seed data terstruktur)
     *
     * @return array<int, array<string, mixed>>
     */
    public function getModules(): array
    {
        return [
            [
                'id' => 'modul-1',
                'title' => 'Mengenal Pemasaran Digital untuk Pemula',
                'slug' => 'mengenal-pemasaran-digital',
                'category' => 'Dasar Digital',
                'description' => 'Pahami cara kerja internet untuk mendatangkan pembeli tanpa biaya iklan yang mahal.',
                'duration_minutes' => 6,
                'level' => 'Pemula',
                'badge_id' => 'badge-1',
                'badge_title' => 'Langkah Pertama',
                'badge_icon' => 'Compass',
                'objectives' => [
                    'Tahu mengapa tokomu perlu hadir di internet',
                    'Mengenal 3 kanal online termudah (WhatsApp, Sosmed, Etalase)',
                    'Bisa membuat status promosi pertama hari ini juga',
                ],
                'prerequisite_id' => null,
                'prerequisite_title' => null,
                'steps' => [
                    [
                        'id' => 1,
                        'step_number' => 1,
                        'title' => 'Apa Itu Pemasaran Digital?',
                        'content' => "Pemasaran digital sederhananya adalah cara memberitahu orang lain tentang usahamu lewat HP dan internet.\n\nJika dulu kita harus membagikan brosur kertas atau menunggu orang lewat di depan toko, sekarang calon pembeli bisa melihat tokomu dari rumah mereka sendiri kapan saja.",
                        'practical_task' => 'Buka HP-mu dan cek: apakah di bio WhatsApp-mu sudah tertulis nama usahamu?',
                    ],
                    [
                        'id' => 2,
                        'step_number' => 2,
                        'title' => 'Mengapa Sangat Penting untuk Usaha Kecil?',
                        'content' => "1. **Hemat Biaya:** Tidak perlu sewa ruko mahal di pinggir jalan raya.\n2. **Buka 24 Jam:** Informasi produk tetap bisa dibaca saat kamu sedang beristirahat.\n3. **Jangkauan Lebih Luas:** Tetangga di kecamatan lain pun bisa memesan produkmu.",
                        'practical_task' => 'Tuliskan di selembar kertas: 3 orang teman atau keluarga yang menurutmu paling cocok dengan produkmu.',
                    ],
                    [
                        'id' => 3,
                        'step_number' => 3,
                        'title' => 'Tiga Kanal Termudah yang Bisa Dipakai Sekarang',
                        'content' => "- **WhatsApp Status & Grup:** Tempat paling cepat karena orang yang melihat sudah kenal denganmu.\n- **Media Sosial (Instagram/Facebook/TikTok):** Tempat mencari pelanggan baru di luar lingkaran pertemanan.\n- **Etalase Online Mandiri:** Katalog rapi tempat pembeli melihat foto dan harga tanpa perlu bolak-balik bertanya.",
                        'practical_task' => 'Simpan tautan etalase toko barumu di catatan HP agar mudah dibagikan sewaktu-waktu.',
                    ],
                    [
                        'id' => 4,
                        'step_number' => 4,
                        'title' => 'Langkah Pertama yang Bebas Risiko',
                        'content' => "Kunci sukses promosi online bukan langsung viral, melainkan **konsistensi kecil**.\n\nMulailah dengan membuat 1 status foto produk setiap pagi sebelum jam 9 pagi saat orang sedang memulai hari.",
                        'practical_task' => 'Pasang foto produk terbaikmu di status WhatsApp hari ini dengan kalimat sapaan ramah.',
                    ],
                ],
                'pre_test_questions' => [
                    [
                        'id' => 'q1_1',
                        'indicator' => 'Memahami konsep dasar pemasaran digital',
                        'question' => 'Apa keuntungan utama mempromosikan produk lewat internet dibandingkan brosur kertas?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Pasti langsung membuat produk habis terjual dalam 1 jam'],
                            ['id' => 'B', 'text' => 'Bisa dilihat calon pembeli kapan saja tanpa biaya cetak kertas'],
                            ['id' => 'C', 'text' => 'Tidak perlu lagi memasak atau memproduksi barang'],
                        ],
                    ],
                    [
                        'id' => 'q1_2',
                        'indicator' => 'Memilih kanal pemasaran awal',
                        'question' => 'Untuk pemilik usaha baru yang belum punya biaya iklan, kanal online mana yang paling mudah dimulai?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Menyewa papan reklame billboard di jalan tol'],
                            ['id' => 'B', 'text' => 'Membeli aplikasi khusus seharga jutaan rupiah'],
                            ['id' => 'C', 'text' => 'WhatsApp Status dan media sosial gratis di HP'],
                        ],
                    ],
                    [
                        'id' => 'q1_3',
                        'indicator' => 'Membangun kebiasaan promosi',
                        'question' => 'Sikap mana yang paling tepat dalam memulai promosi digital?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Mulai dari yang sederhana dan rutin posting setiap hari'],
                            ['id' => 'B', 'text' => 'Posting sekali saja lalu berhenti jika belum ada yang membeli'],
                            ['id' => 'C', 'text' => 'Menunggu produk sempurna dan punya kamera mahal baru mulai'],
                        ],
                    ],
                ],
                'post_test_questions' => [
                    [
                        'id' => 'q1_p1',
                        'indicator' => 'Memahami konsep dasar pemasaran digital',
                        'question' => 'Mengapa toko online di internet dikatakan "buka 24 jam"?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Karena pemilik usaha tidak boleh tidur sama sekali'],
                            ['id' => 'B', 'text' => 'Karena foto dan katalog produk tetap bisa dibaca pembeli kapan pun'],
                            ['id' => 'C', 'text' => 'Karena kurir pengiriman barang hanya bekerja di tengah malam'],
                        ],
                    ],
                    [
                        'id' => 'q1_p2',
                        'indicator' => 'Memilih kanal pemasaran awal',
                        'question' => 'Mengapa promosi di status WhatsApp sangat efektif untuk pemula?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Karena WhatsApp hanya bisa dipakai di komputer kantor'],
                            ['id' => 'B', 'text' => 'Karena otomatis memaksa semua kontak mentransfer uang'],
                            ['id' => 'C', 'text' => 'Karena pembacanya adalah orang yang sudah menyimpan kontak dan percaya kepadamu'],
                        ],
                    ],
                    [
                        'id' => 'q1_p3',
                        'indicator' => 'Membangun kebiasaan promosi',
                        'question' => 'Langkah mana yang paling terbukti membantu usaha kecil berkembang?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Konsisten memposting produk secara berkala dengan bahasa ramah'],
                            ['id' => 'B', 'text' => 'Mengirim pesan spam ke nomor orang asing tanpa izin'],
                            ['id' => 'C', 'text' => 'Meniru harga toko besar hingga rugi'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'modul-2',
                'title' => 'Foto Produk yang Menarik Hanya dengan HP',
                'slug' => 'foto-produk-menarik-hp',
                'category' => 'Foto dan Konten',
                'description' => 'Pelajari teknik cahaya, alas foto, dan sudut potret agar jualanmu tampak lezat dan profesional.',
                'duration_minutes' => 8,
                'level' => 'Pemula',
                'badge_id' => 'badge-2',
                'badge_title' => 'Fotografer Produk',
                'badge_icon' => 'Camera',
                'objectives' => [
                    'Bisa memanfaatkan cahaya jendela alami tanpa lampu studio',
                    'Tahu sudut foto terbaik untuk makanan dan kemasan',
                    'Menghindari 3 kesalahan fatal foto produk berkabut',
                ],
                'prerequisite_id' => 'modul-1',
                'prerequisite_title' => 'Mengenal Pemasaran Digital',
                'steps' => [
                    [
                        'id' => 1,
                        'step_number' => 1,
                        'title' => 'Bersihkan Lensa Kamera Terlebih Dahulu',
                        'content' => "Kamera HP sering terkena sidik jari atau minyak goreng tanpa kita sadari. Itulah alasan nomor satu mengapa foto sering buram dan berkabut.\n\nSelalu lap kaca kamera belakang HP dengan kain halus (atau ujung kaos bersih) sebelum mulai memotret.",
                        'practical_task' => 'Ambil HP-mu sekarang dan lap lensa kamera belakang dengan kain lembut.',
                    ],
                    [
                        'id' => 2,
                        'step_number' => 2,
                        'title' => 'Manfaatkan Cahaya Alami Dekat Jendela',
                        'content' => "Lampu flash HP sering membuat makanan terlihat pucat dan berminyak.\n\nCahaya terbaik adalah **sinar matahari pagi (jam 8-10 pagi)** di dekat jendela atau teras rumah yang teduh. Cahaya samping ini menonjolkan tekstur renyah dan warna segar.",
                        'practical_task' => 'Cari satu sudut di rumahmu yang terkena cahaya jendela terang tanpa silau.',
                    ],
                    [
                        'id' => 3,
                        'step_number' => 3,
                        'title' => 'Pilih Alas dan Latar Belakang Polos',
                        'content' => "Hindari latar belakang yang berantakan (seperti jemuran atau cucian piring).\n\nGunakan alas meja kayu bersih, kertas karton putih polos seharga Rp 3.000, atau taplak sederhana agar mata pembeli langsung tertuju ke produkmu.",
                        'practical_task' => 'Siapkan selembar kertas karton putih atau meja kayu bersih untuk latihan foto.',
                    ],
                    [
                        'id' => 4,
                        'step_number' => 4,
                        'title' => 'Sudut Pandang Terbaik (45 Derajat)',
                        'content' => "Sudut terbaik untuk memotret makanan di piring adalah **sudut 45 derajat**, persis seperti sudut mata kita saat sedang duduk siap menyantap hidangan.\n\nUntuk produk dalam pouch atau botol berdiri, potretlah sejajar dari depan (eye-level).",
                        'practical_task' => 'Letakkan 1 produkmu di meja, lalu potret dari sudut 45 derajat menggunakan kamera HP.',
                    ],
                ],
                'pre_test_questions' => [
                    [
                        'id' => 'q2_1',
                        'indicator' => 'Pencahayaan foto produk',
                        'question' => 'Cahaya apa yang paling bagus dan gratis untuk memotret produk makanan?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Lampu blitz/flash bawaan HP tepat di depan piring'],
                            ['id' => 'B', 'text' => 'Sinar matahari pagi yang masuk lewat jendela samping'],
                            ['id' => 'C', 'text' => 'Ruangan gelap dengan satu lilin menyala'],
                        ],
                    ],
                    [
                        'id' => 'q2_2',
                        'indicator' => 'Latar belakang foto',
                        'question' => 'Mengapa alas foto yang polos dan bersih sangat dianjurkan?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Agar ukuran file foto menjadi lebih berat'],
                            ['id' => 'B', 'text' => 'Agar produk terlihat murahan'],
                            ['id' => 'C', 'text' => 'Agar mata pembeli fokus pada produk tanpa terganggu barang lain'],
                        ],
                    ],
                    [
                        'id' => 'q2_3',
                        'indicator' => 'Ketajaman lensa',
                        'question' => 'Apa hal paling sederhana yang harus dilakukan sebelum memencet tombol foto di HP?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Mengelap kaca lensa kamera HP dengan kain bersih'],
                            ['id' => 'B', 'text' => 'Membeli tripod kamera studio seharga jutaan'],
                            ['id' => 'C', 'text' => 'Mematikan sinyal internet'],
                        ],
                    ],
                ],
                'post_test_questions' => [
                    [
                        'id' => 'q2_p1',
                        'indicator' => 'Pencahayaan foto produk',
                        'question' => 'Kapan waktu terbaik memotret produk menggunakan cahaya matahari alami?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Tengah malam saat sepi'],
                            ['id' => 'B', 'text' => 'Pagi hari antara pukul 08.00 - 10.00 di tempat teduh'],
                            ['id' => 'C', 'text' => 'Tepat di bawah terik matahari siang bolong jam 12.00'],
                        ],
                    ],
                    [
                        'id' => 'q2_p2',
                        'indicator' => 'Sudut potret makanan',
                        'question' => 'Sudut potret 45 derajat meniru posisi apa dalam kehidupan sehari-hari?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Sudut mata seseorang saat duduk di meja makan bersiap menyantap hidangan'],
                            ['id' => 'B', 'text' => 'Pandangan burung dari atas langit'],
                            ['id' => 'C', 'text' => 'Pandangan dari kolong meja'],
                        ],
                    ],
                    [
                        'id' => 'q2_p3',
                        'indicator' => 'Keaslian warna',
                        'question' => 'Mengapa kita tidak boleh mengedit filter warna foto produk terlalu berlebihan?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Karena dilarang oleh pihak aplikasi media sosial'],
                            ['id' => 'B', 'text' => 'Karena HP bisa cepat panas'],
                            ['id' => 'C', 'text' => 'Agar warna produk asli tidak berbeda dan membuat pembeli kecewa'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'modul-3',
                'title' => 'Menulis Info Produk Lengkap & Memikat',
                'slug' => 'info-produk-lengkap-memikat',
                'category' => 'Media Sosial',
                'description' => 'Susun keterangan produk yang jelas tanpa membuat calon pembeli bolak-balik bertanya harga.',
                'duration_minutes' => 7,
                'level' => 'Pemula',
                'badge_id' => 'badge-3',
                'badge_title' => 'Jago Konten',
                'badge_icon' => 'FileText',
                'objectives' => [
                    'Mengetahui 5 informasi wajib di setiap postingan jualan',
                    'Mampu menyusun kalimat ajakan pesan yang ramah dan cepat',
                    'Mengurangi pertanyaan berulang dari calon pelanggan',
                ],
                'prerequisite_id' => 'modul-1',
                'prerequisite_title' => 'Mengenal Pemasaran Digital',
                'steps' => [
                    [
                        'id' => 1,
                        'step_number' => 1,
                        'title' => 'Lima Info Wajib yang Harus Selalu Ada',
                        'content' => "Banyak pembeli batal pesan karena infonya tersembunyi. Pastikan ada:\n\n1. **Nama Produk:** Jelas dan mudah dibaca.\n2. **Harga:** Cantumkan angka pasti (misal: Rp 25.000).\n3. **Ukuran/Porsi:** Contoh: 150 gram atau isi 10 pcs.\n4. **Lokasi Pengiriman:** Contoh: Dikirim dari Tebet, Jaksel.\n5. **Cara Pesan:** Link WhatsApp langsung.",
                        'practical_task' => 'Cek salah satu postingan jualanmu: apakah kelima hal di atas sudah lengkap tertulis?',
                    ],
                    [
                        'id' => 2,
                        'step_number' => 2,
                        'title' => 'Jangan Sembunyikan Harga di Balik Kata "DM"',
                        'content' => "Menyuruh pembeli 'cek DM untuk harga' membuat sebagian besar orang malas bertanya karena merasa rumit atau curiga harganya mahal.\n\nToko yang jujur dan transparan menuliskan harga di depan terbukti mendapatkan kepercayaan pelanggan lebih cepat.",
                        'practical_task' => 'Tuliskan harga promo di dekat nama produk dengan format Rupiah yang rapi.',
                    ],
                    [
                        'id' => 3,
                        'step_number' => 3,
                        'title' => 'Tuliskan Daya Tahan dan Saran Penyajian',
                        'content' => "Khusus produk kuliner dan oleh-oleh, pembeli selalu ingin tahu:\n- Tahan berapa hari di suhu ruang?\n- Bisa disimpan di kulkas?\n- Apakah sudah bersertifikat halal / higienis?",
                        'practical_task' => 'Tambahkan satu kalimat tentang cara simpan produkmu di deskripsi etalase.',
                    ],
                    [
                        'id' => 4,
                        'step_number' => 4,
                        'title' => 'Tutup dengan Ajakan Bertindak (Call to Action)',
                        'content' => "Bimbing pembeli ke langkah berikutnya secara jelas:\n\nContoh yang baik: *'Mau stok cemilan ini buat akhir pekan? Klik link di bio sekarang untuk pesan via WhatsApp ya kak!'*",
                        'practical_task' => 'Salin contoh kalimat ajakan bertindak di atas dan sesuaikan dengan nama produkmu.',
                    ],
                ],
                'pre_test_questions' => [
                    [
                        'id' => 'q3_1',
                        'indicator' => 'Transparansi harga',
                        'question' => 'Mengapa sebaiknya kita menuliskan harga produk langsung di postingan?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Supaya kompetitor bisa langsung meniru'],
                            ['id' => 'B', 'text' => 'Agar pembeli tidak perlu membeli produk lain'],
                            ['id' => 'C', 'text' => 'Supaya pembeli tidak ragu dan tidak malas bertanya via DM'],
                        ],
                    ],
                    [
                        'id' => 'q3_2',
                        'indicator' => 'Kemudahan cara pemesanan',
                        'question' => 'Cara apa yang paling praktis untuk mengarahkan pembeli dari media sosial ke WhatsApp?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Menyuruh pembeli menghafal 12 digit nomor HP kita'],
                            ['id' => 'B', 'text' => 'Menaruh tautan langsung (link WA) di bio yang bisa diklik satu sentuhan'],
                            ['id' => 'C', 'text' => 'Menulis nomor HP dengan huruf terbalik'],
                        ],
                    ],
                    [
                        'id' => 'q3_3',
                        'indicator' => 'Informasi ketahanan produk',
                        'question' => 'Informasi apa yang wajib disertakan pada produk makanan untuk pembeli luar kota?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Daya simpan dan cara penyimpanan yang benar'],
                            ['id' => 'B', 'text' => 'Riwayat hidup pemilik usaha'],
                            ['id' => 'C', 'text' => 'Daftar nama semua karyawan toko'],
                        ],
                    ],
                ],
                'post_test_questions' => [
                    [
                        'id' => 'q3_p1',
                        'indicator' => 'Transparansi harga',
                        'question' => 'Apa akibat buruk jika kita hanya menulis "Harga via DM ya kak"?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Membuat akun media sosial kita otomatis terblokir'],
                            ['id' => 'B', 'text' => 'Membuat pembeli semakin penasaran dan langsung memborong'],
                            ['id' => 'C', 'text' => 'Banyak calon pembeli urung memesan karena merasa repot atau takut mahal'],
                        ],
                    ],
                    [
                        'id' => 'q3_p2',
                        'indicator' => 'Lokasi pengiriman',
                        'question' => 'Mengapa penting menuliskan lokasi kota atau kecamatan toko di postingan?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Agar petugas pos datang berkunjung'],
                            ['id' => 'B', 'text' => 'Agar pembeli bisa memperkirakan ongkos kirim dan waktu sampai'],
                            ['id' => 'C', 'text' => 'Supaya orang sekampung tahu kita jualan'],
                        ],
                    ],
                    [
                        'id' => 'q3_p3',
                        'indicator' => 'Ajakan bertindak',
                        'question' => 'Manakah contoh kalimat ajakan bertindak (Call to Action) yang paling efektif?',
                        'options' => [
                            ['id' => 'A', 'text' => '"Klik tombol chat di bawah ya kak, kami siap kirim hari ini!"'],
                            ['id' => 'B', 'text' => '"Sekian terima kasih atas perhatiannya"'],
                            ['id' => 'C', 'text' => '"Tolong dibeli kalau merasa kasihan"'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'modul-4',
                'title' => 'Dasar Media Sosial untuk Usaha Rumahan',
                'slug' => 'dasar-media-sosial-usaha',
                'category' => 'Media Sosial',
                'description' => 'Pilih platform yang tepat, rapikan profil toko, dan atur waktu posting tanpa mengganggu produksi.',
                'duration_minutes' => 7,
                'level' => 'Pemula',
                'badge_id' => 'badge-4',
                'badge_title' => 'Rajin Belajar',
                'badge_icon' => 'Share2',
                'objectives' => [
                    'Menentukan 1-2 platform yang paling cocok untuk jenis produkmu',
                    'Mengatur jadwal posting mingguan tanpa mengorbankan waktu masak/produksi',
                    'Membalas chat pembeli dengan cepat menggunakan template ramah',
                ],
                'prerequisite_id' => 'modul-1',
                'prerequisite_title' => 'Mengenal Pemasaran Digital',
                'steps' => [
                    [
                        'id' => 1,
                        'step_number' => 1,
                        'title' => 'Jangan Membuka Semua Akun Sekaligus',
                        'content' => "Banyak pemilik UMKM lelah karena memaksakan diri aktif di 5 media sosial sekaligus.\n\nPilihlah **satu atau dua saja** yang paling kamu kuasai. Untuk kuliner lokal, kombinasi terbaik adalah **WhatsApp Bisnis + Instagram** atau **TikTok**.",
                        'practical_task' => 'Pilih 1 platform utama yang akan kamu fokuskan selama 30 hari ke depan.',
                    ],
                    [
                        'id' => 2,
                        'step_number' => 2,
                        'title' => 'Profil Toko Harus Terbaca Jelas dalam 3 Detik',
                        'content' => "Saat orang membuka profil tokomu, mereka harus langsung tahu:\n- Siapa kamu?\n- Jualan apa?\n- Melayani pengiriman ke mana?\n- Link ke mana untuk pesan?",
                        'practical_task' => 'Tulis ulang bio profil sosmedmu agar memuat nama toko dan link pesan yang jelas.',
                    ],
                    [
                        'id' => 3,
                        'step_number' => 3,
                        'title' => 'Waktu Terbaik Memposting Konten',
                        'content' => "Orang membuka sosmed saat santai:\n- Pagi: 07.00 - 08.30 (sebelum mulai kerja/sekolah)\n- Siang: 12.00 - 13.00 (jam istirahat makan siang)\n- Malam: 19.00 - 21.00 (santai setelah makan malam)\n\nManfaatkan jam-jam ini agar postinganmu banyak yang melihat.",
                        'practical_task' => 'Pasang alarm pengingat di HP untuk jadwal posting siang jam 12.15 WIB.',
                    ],
                    [
                        'id' => 4,
                        'step_number' => 4,
                        'title' => 'Balas Cepat = Pelanggan Selamat',
                        'content' => "Pelanggan online sangat tidak sabaran. Jika chat dibiarkan lebih dari 1 jam, mereka seringkali sudah memesan di toko sebelah.\n\nSiapkan template balasan cepat untuk sapaan, harga, dan rekening agar jempolmu tidak pegal mengetik berulang kali.",
                        'practical_task' => 'Buka menu Balasan Cepat di aplikasi ini dan simpan 1 template salam ramah.',
                    ],
                ],
                'pre_test_questions' => [
                    [
                        'id' => 'q4_1',
                        'indicator' => 'Fokus platform',
                        'question' => 'Strategi apa yang paling bijak untuk pemilik usaha tunggal yang mengelola semuanya sendiri?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Membuat 10 akun di semua media sosial baru'],
                            ['id' => 'B', 'text' => 'Fokus konsisten di 1-2 platform yang paling sering dibuka calon pelanggan'],
                            ['id' => 'C', 'text' => 'Tidak perlu memakai media sosial sama sekali'],
                        ],
                    ],
                    [
                        'id' => 'q4_2',
                        'indicator' => 'Kecepatan respon chat',
                        'question' => 'Mengapa membalas pesan calon pembeli dengan cepat sangat penting?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Supaya kuota internet cepat habis'],
                            ['id' => 'B', 'text' => 'Hanya formalitas saja tidak berpengaruh'],
                            ['id' => 'C', 'text' => 'Agar calon pembeli tidak beralih memesan ke toko lain'],
                        ],
                    ],
                    [
                        'id' => 'q4_3',
                        'indicator' => 'Kelengkapan profil',
                        'question' => 'Foto profil apa yang paling tepat untuk akun usaha tokomu?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Logo toko yang jelas atau foto produk andalan dengan kualitas tajam'],
                            ['id' => 'B', 'text' => 'Foto artis idola atau kartun acak'],
                            ['id' => 'C', 'text' => 'Dibiarkan kosong tanpa gambar'],
                        ],
                    ],
                ],
                'post_test_questions' => [
                    [
                        'id' => 'q4_p1',
                        'indicator' => 'Fokus platform',
                        'question' => 'Mana yang lebih menghasilkan bagi usaha kecil?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Punya banyak akun tapi semuanya terbengkalai tanpa update'],
                            ['id' => 'B', 'text' => 'Aktif teratur di 1 platform dengan pelayanan ramah dan cepat'],
                            ['id' => 'C', 'text' => 'Hanya posting saat butuh uang mendesak'],
                        ],
                    ],
                    [
                        'id' => 'q4_p2',
                        'indicator' => 'Kecepatan respon chat',
                        'question' => 'Apa alat bantu yang memudahkan membalas pertanyaan pembeli saat sedang sibuk produksi?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Fitur template balasan cepat yang sudah disiapkan sebelumnya'],
                            ['id' => 'B', 'text' => 'Mematikan HP agar tidak terganggu'],
                            ['id' => 'C', 'text' => 'Membalas hanya dengan satu huruf "Y"'],
                        ],
                    ],
                    [
                        'id' => 'q4_p3',
                        'indicator' => 'Waktu terbaik posting',
                        'question' => 'Kapan waktu yang paling pas untuk memposting menu makan siang usahamu?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Jam 3 sore saat orang sudah selesai makan siang'],
                            ['id' => 'B', 'text' => 'Tengah malam saat orang sedang tidur nyenyak'],
                            ['id' => 'C', 'text' => 'Antara jam 10.30 - 11.30 siang saat orang mulai lapar memikirkan makan siang'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'modul-5',
                'title' => 'Logo dan Kemasan yang Menarik & Aman',
                'slug' => 'logo-kemasan-menarik-aman',
                'category' => 'Branding dan Kemasan',
                'description' => 'Buat identitas toko yang mudah diingat serta kemasan yang melindungi produk sampai ke tangan pembeli.',
                'duration_minutes' => 6,
                'level' => 'Menengah',
                'badge_id' => 'badge-5',
                'badge_title' => 'Branding Juara',
                'badge_icon' => 'Package',
                'objectives' => [
                    'Memilih logo sederhana yang tidak membingungkan pembeli',
                    'Mengetahui standar kemasan aman untuk pengiriman motor/ekspedisi',
                    'Menjaga konsistensi nama dan warna toko',
                ],
                'prerequisite_id' => 'modul-1',
                'prerequisite_title' => 'Mengenal Pemasaran Digital',
                'steps' => [
                    [
                        'id' => 1,
                        'step_number' => 1,
                        'title' => 'Logo Sederhana Lebih Mudah Diingat',
                        'content' => "Logo tidak harus mahal atau digambar rumit.\n\nYang paling penting: nama usahamu terbaca jelas meski di layar HP yang kecil, dan warnanya konsisten (misal memakai kombinasi ungu dan kuning di semua kemasan).",
                        'practical_task' => 'Perhatikan stiker tokomu: apakah namanya masih terbaca jika dilihat dari jarak 1 meter?',
                    ],
                    [
                        'id' => 2,
                        'step_number' => 2,
                        'title' => 'Keamanan Kemasan Nomor Satu',
                        'content' => "Bagi produk makanan, kemasan punya dua tugas utama:\n1. **Melindungi rasa & kebersihan:** Tidak bocor minyak, tidak masuk udara, dan tidak mudah pecah.\n2. **Tampil memikat:** Bersih, ada stiker label, dan rapi.",
                        'practical_task' => 'Lakukan tes goyang: coba masukkan produkmu ke kantong dan guncangkan sedikit, apakah ada yang tumpah?',
                    ],
                    [
                        'id' => 3,
                        'step_number' => 3,
                        'title' => 'Informasi Wajib pada Stiker Label',
                        'content' => "Stiker kemasan adalah tenaga penjual yang ikut pulang bersama pembeli. Pastikan ada:\n- Nama Produk & Logo\n- Tanggal Kadaluwarsa / Best Before\n- Nomor WhatsApp untuk pesan ulang!",
                        'practical_task' => 'Pastikan nomor WhatsApp pemesanan sudah tercetak jelas di stiker kemasan produkmu.',
                    ],
                ],
                'pre_test_questions' => [
                    [
                        'id' => 'q5_1',
                        'indicator' => 'Karakteristik logo yang baik',
                        'question' => 'Ciri logo yang paling cocok untuk usaha kecil dan mudah diingat adalah...',
                        'options' => [
                            ['id' => 'A', 'text' => 'Menggunakan 10 warna berbeda dan gambar yang sangat rumit'],
                            ['id' => 'B', 'text' => 'Sederhana, nama toko terbaca jelas, dan warnanya konsisten'],
                            ['id' => 'C', 'text' => 'Menjiplak logo merk internasional yang sudah terkenal'],
                        ],
                    ],
                    [
                        'id' => 'q5_2',
                        'indicator' => 'Fungsi utama kemasan',
                        'question' => 'Apa fungsi paling penting dari kemasan produk makanan?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Hanya agar terlihat mahal di mata tetangga'],
                            ['id' => 'B', 'text' => 'Menutupi jika rasa makanan kurang enak'],
                            ['id' => 'C', 'text' => 'Menjaga kebersihan, kerenyahan, dan keamanan produk saat dikirim'],
                        ],
                    ],
                    [
                        'id' => 'q5_3',
                        'indicator' => 'Label pemesanan ulang',
                        'question' => 'Mengapa nomor kontak toko wajib ada di stiker kemasan?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Agar pelanggan yang suka produkmu bisa langsung pesan ulang dengan mudah'],
                            ['id' => 'B', 'text' => 'Agar stiker terlihat penuh sesak'],
                            ['id' => 'C', 'text' => 'Syarat wajib kepolisian'],
                        ],
                    ],
                ],
                'post_test_questions' => [
                    [
                        'id' => 'q5_p1',
                        'indicator' => 'Karakteristik logo yang baik',
                        'question' => 'Mengapa tulisan nama toko pada logo tidak boleh terlalu tipis atau berbelit-belit?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Karena tinta printer akan cepat habis'],
                            ['id' => 'B', 'text' => 'Agar tetap terbaca jelas saat dilihat dalam ukuran kecil di layar ponsel'],
                            ['id' => 'C', 'text' => 'Supaya tidak bisa difotokopi orang lain'],
                        ],
                    ],
                    [
                        'id' => 'q5_p2',
                        'indicator' => 'Fungsi utama kemasan',
                        'question' => 'Bahan kemasan makanan kering yang paling baik untuk menjaga agar tidak melempem adalah...',
                        'options' => [
                            ['id' => 'A', 'text' => 'Standing pouch aluminium foil atau plastik tebal dengan zipper kedap udara'],
                            ['id' => 'B', 'text' => 'Koran bekas basah'],
                            ['id' => 'C', 'text' => 'Kantong kresek hitam tipis tanpa perekat'],
                        ],
                    ],
                    [
                        'id' => 'q5_p3',
                        'indicator' => 'Sentuhan ekstra pelanggan',
                        'question' => 'Apa sentuhan kecil di dalam paket kemasan yang sering membuat pelanggan terkesan dan loyal?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Menyelipkan sampah sisa potongan kertas'],
                            ['id' => 'B', 'text' => 'Menagih ongkos kirim tambahan secara mendadak'],
                            ['id' => 'C', 'text' => 'Kartu ucapan terima kasih kecil yang ditulis ramah dan tulus'],
                        ],
                    ],
                ],
            ],
            [
                'id' => 'modul-6',
                'title' => 'Mencatat Uang Masuk dan Keluar (Pembukuan Sederhana)',
                'slug' => 'mencatat-uang-masuk-keluar',
                'category' => 'Pembukuan',
                'description' => 'Ketahui laba bersih usahamu yang sebenarnya dan pisahkan uang dapur rumah dari modal jualan.',
                'duration_minutes' => 8,
                'level' => 'Pemula',
                'badge_id' => 'badge-6',
                'badge_title' => 'Si Pencatat',
                'badge_icon' => 'Wallet',
                'objectives' => [
                    'Menghentikan kebiasaan mencampur uang usaha dan uang pribadi',
                    'Bisa menghitung laba bersih harian (Uang Masuk dikurangi Keluar)',
                    'Mengetahui kemana bocor halus uang tokomu setiap minggu',
                ],
                'prerequisite_id' => null,
                'prerequisite_title' => null,
                'steps' => [
                    [
                        'id' => 1,
                        'step_number' => 1,
                        'title' => 'Jangan Campur Uang Usaha dan Uang Rumah',
                        'content' => "Kesalahan nomor 1 pemilik UMKM: uang hasil penjualan dipakai langsung untuk belanja sayur rumah, beli pulsa anak, atau bayar listrik keluarga.\n\nAkibatnya: saat stok habis dan harus belanja bahan baku, uang kas toko tiba-tiba kosong dan kita mengira usaha kita merugi padahal uangnya terpakai untuk urusan pribadi.",
                        'practical_task' => 'Siapkan 2 dompet atau 2 rekening berbeda: satu khusus jualan, satu khusus kebutuhan rumah tangga.',
                    ],
                    [
                        'id' => 2,
                        'step_number' => 2,
                        'title' => 'Gaji Diri Sendiri Secara Tetap',
                        'content' => "Sebagai pemilik yang bekerja di toko, tentukan 'gaji' tetap untuk dirimu (misal Rp 500.000 per minggu).\n\nAmbillah uang hanya sebesar gaji tersebut untuk belanja rumah. Jangan mengambil uang kas usaha sembarangan setiap kali ada kebutuhan mendadak.",
                        'practical_task' => 'Tentukan satu angka wajar untuk gaji mingguanmu sebagai pengelola toko.',
                    ],
                    [
                        'id' => 3,
                        'step_number' => 3,
                        'title' => 'Catat Setiap Hari Sebelum Tidur',
                        'content' => "Tidak perlu rumus akuntansi yang rumit (debit, kredit, jurnal).\n\nCukup catat dua hal:\n1. **Uang Masuk:** Dari penjualan apa dan berapa jumlahnya?\n2. **Uang Keluar:** Beli bahan apa saja dan berapa bayarnya?\n\n**Laba Bersihmu = Uang Masuk - Uang Keluar.**",
                        'practical_task' => 'Buka menu Keuangan di aplikasi ini dan catat 1 transaksi uang masuk hari ini.',
                    ],
                ],
                'pre_test_questions' => [
                    [
                        'id' => 'q6_1',
                        'indicator' => 'Pemisahan kas usaha & pribadi',
                        'question' => 'Apa bahaya terbesar jika uang jualan dicampur dalam satu dompet dengan uang belanja dapur rumah?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Dompet menjadi terlalu tebal dan berat'],
                            ['id' => 'B', 'text' => 'Modal belanja bahan baku bisa terpakai tanpa sadar sehingga usaha kekurangan modal'],
                            ['id' => 'C', 'text' => 'Uang kertas bisa robek sendiri'],
                        ],
                    ],
                    [
                        'id' => 'q6_2',
                        'indicator' => 'Konsep laba bersih',
                        'question' => 'Bagaimana cara sederhana menghitung laba bersih usahamu?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Menghitung semua uang yang ada di rekening tanpa memotong biaya bahan'],
                            ['id' => 'B', 'text' => 'Menebak-nebak sesuai perkiraan di kepala'],
                            ['id' => 'C', 'text' => 'Total uang masuk dari penjualan dikurangi seluruh uang keluar untuk biaya belanja dan operasional'],
                        ],
                    ],
                    [
                        'id' => 'q6_3',
                        'indicator' => 'Waktu pencatatan',
                        'question' => 'Kapan waktu terbaik untuk mencatat transaksi keuangan tokomu?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Langsung saat transaksi terjadi atau dirangkum setiap malam sebelum tidur'],
                            ['id' => 'B', 'text' => 'Setahun sekali saat ingat saja'],
                            ['id' => 'C', 'text' => 'Hanya saat toko sedang merugi'],
                        ],
                    ],
                ],
                'post_test_questions' => [
                    [
                        'id' => 'q6_p1',
                        'indicator' => 'Pemisahan kas usaha & pribadi',
                        'question' => 'Langkah pertama yang paling efektif untuk memisahkan keuangan usaha dan pribadi adalah...',
                        'options' => [
                            ['id' => 'A', 'text' => 'Berhenti belanja kebutuhan dapur rumah'],
                            ['id' => 'B', 'text' => 'Menyediakan dompet atau rekening bank terpisah khusus untuk operasional toko'],
                            ['id' => 'C', 'text' => 'Menyerahkan semua uang ke tetangga'],
                        ],
                    ],
                    [
                        'id' => 'q6_p2',
                        'indicator' => 'Konsep modal vs laba',
                        'question' => 'Mengapa semua uang kas di laci toko tidak boleh dianggap sebagai keuntungan yang boleh dihabiskan?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Karena uang tersebut milik bank'],
                            ['id' => 'B', 'text' => 'Karena uang kas tidak bernilai'],
                            ['id' => 'C', 'text' => 'Karena sebagian besar uang tersebut adalah modal untuk membeli bahan baku jualan esok hari'],
                        ],
                    ],
                    [
                        'id' => 'q6_p3',
                        'indicator' => 'Disiplin mencatat',
                        'question' => 'Apa keuntungan rutin mencatat pembukuan setiap hari bagi masa depan usahamu?',
                        'options' => [
                            ['id' => 'A', 'text' => 'Bisa mendeteksi pemborosan lebih cepat dan tahu pasti apakah usahamu benar-benar berkembang'],
                            ['id' => 'B', 'text' => 'Bisa pamer buku catatan ke orang lain'],
                            ['id' => 'C', 'text' => 'Membuat harga produk otomatis naik dua kali lipat'],
                        ],
                    ],
                ],
            ],
        ];
    }

    /**
     * Dapatkan daftar seluruh lencana pencapaian belajar
     *
     * @return array<int, array<string, mixed>>
     */
    public function getBadges(): array
    {
        return [
            [
                'id' => 'badge-1',
                'title' => 'Langkah Pertama',
                'description' => 'Menyelesaikan modul belajar digital pertamamu.',
                'icon' => 'Compass',
                'category' => 'Dasar Digital',
                'requirement' => 'Selesaikan modul "Mengenal Pemasaran Digital"',
                'is_unlocked' => true,
                'unlocked_at' => '2026-10-24',
                'progress_percent' => 100,
            ],
            [
                'id' => 'badge-2',
                'title' => 'Fotografer Produk',
                'description' => 'Mampu memotret produk yang menggugah selera hanya bermodal HP.',
                'icon' => 'Camera',
                'category' => 'Foto dan Konten',
                'requirement' => 'Selesaikan modul "Foto Produk yang Menarik"',
                'is_unlocked' => true,
                'unlocked_at' => '2026-10-25',
                'progress_percent' => 100,
            ],
            [
                'id' => 'badge-3',
                'title' => 'Jago Konten',
                'description' => 'Menyusun deskripsi jualan lengkap dan jelas tanpa membingungkan pembeli.',
                'icon' => 'FileText',
                'category' => 'Media Sosial',
                'requirement' => 'Selesaikan modul "Info Produk Lengkap"',
                'is_unlocked' => true,
                'unlocked_at' => '2026-10-26',
                'progress_percent' => 100,
            ],
            [
                'id' => 'badge-4',
                'title' => 'Rajin Belajar',
                'description' => 'Belajar konsisten 3 hari berturut-turut untuk kemajuan toko.',
                'icon' => 'Flame',
                'category' => 'Konsistensi',
                'requirement' => 'Mencatat aktivitas belajar selama 3 hari berturut-turut',
                'is_unlocked' => true,
                'unlocked_at' => '2026-10-26',
                'progress_percent' => 100,
            ],
            [
                'id' => 'badge-5',
                'title' => 'Branding Juara',
                'description' => 'Memiliki identitas kemasan rapi dan aman sampai ke tangan pelanggan.',
                'icon' => 'Package',
                'category' => 'Branding dan Kemasan',
                'requirement' => 'Selesaikan modul "Logo dan Kemasan"',
                'is_unlocked' => false,
                'unlocked_at' => null,
                'progress_percent' => 33, // Sedang di langkah 1 dari 3
            ],
            [
                'id' => 'badge-6',
                'title' => 'Si Pencatat',
                'description' => 'Menguasai pencatatan arus kas dan tahu laba bersih usaha.',
                'icon' => 'Wallet',
                'category' => 'Pembukuan',
                'requirement' => 'Selesaikan modul "Mencatat Uang Masuk dan Keluar"',
                'is_unlocked' => false,
                'unlocked_at' => null,
                'progress_percent' => 0,
            ],
            [
                'id' => 'badge-7',
                'title' => 'Naik Kelas',
                'description' => 'Mencapai kenaikan pemahaman sebesar 30 poin atau lebih pada tes akhir.',
                'icon' => 'TrendingUp',
                'category' => 'Prestasi',
                'requirement' => 'Kenaikan nilai pre-test ke post-test minimal 30 poin',
                'is_unlocked' => true,
                'unlocked_at' => '2026-10-25',
                'progress_percent' => 100,
            ],
            [
                'id' => 'badge-8',
                'title' => 'Lulusan Dasar UMKM',
                'description' => 'Menyelesaikan seluruh modul keterampilan dasar pendampingan digital.',
                'icon' => 'GraduationCap',
                'category' => 'Kelulusan',
                'requirement' => 'Selesaikan seluruh 6 modul belajar mikro',
                'is_unlocked' => false,
                'unlocked_at' => null,
                'progress_percent' => 50, // 3 dari 6 selesai
            ],
        ];
    }

    /**
     * Dapatkan progres belajar awal pengguna
     *
     * @return array<string, array<string, mixed>>
     */
    public function getInitialUserProgress(): array
    {
        return [
            'modul-1' => [
                'module_id' => 'modul-1',
                'status' => 'selesai',
                'current_step' => 4,
                'total_steps' => 4,
                'pre_test_score' => 67, // 2 dari 3 benar
                'post_test_score' => 100, // 3 dari 3 benar
                'best_post_test_score' => 100,
                'attempts_count' => 1,
                'passed' => true,
                'last_accessed_at' => '2026-10-24 14:30',
                'completed_at' => '2026-10-24 14:45',
            ],
            'modul-2' => [
                'module_id' => 'modul-2',
                'status' => 'selesai',
                'current_step' => 4,
                'total_steps' => 4,
                'pre_test_score' => 33, // 1 dari 3 benar
                'post_test_score' => 100, // 3 dari 3 benar (naik +67%)
                'best_post_test_score' => 100,
                'attempts_count' => 1,
                'passed' => true,
                'last_accessed_at' => '2026-10-25 10:15',
                'completed_at' => '2026-10-25 10:30',
            ],
            'modul-3' => [
                'module_id' => 'modul-3',
                'status' => 'selesai',
                'current_step' => 4,
                'total_steps' => 4,
                'pre_test_score' => 67,
                'post_test_score' => 100,
                'best_post_test_score' => 100,
                'attempts_count' => 1,
                'passed' => true,
                'last_accessed_at' => '2026-10-26 16:00',
                'completed_at' => '2026-10-26 16:15',
            ],
            'modul-4' => [
                'module_id' => 'modul-4',
                'status' => 'sedang_belajar',
                'current_step' => 2,
                'total_steps' => 4,
                'pre_test_score' => 67,
                'post_test_score' => null,
                'best_post_test_score' => null,
                'attempts_count' => 0,
                'passed' => false,
                'last_accessed_at' => '2026-10-27 09:30',
                'completed_at' => null,
            ],
            'modul-5' => [
                'module_id' => 'modul-5',
                'status' => 'belum_dimulai',
                'current_step' => 0,
                'total_steps' => 3,
                'pre_test_score' => null,
                'post_test_score' => null,
                'best_post_test_score' => null,
                'attempts_count' => 0,
                'passed' => false,
                'last_accessed_at' => '2026-10-27 10:00',
                'completed_at' => null,
            ],
            'modul-6' => [
                'module_id' => 'modul-6',
                'status' => 'belum_dimulai',
                'current_step' => 0,
                'total_steps' => 3,
                'pre_test_score' => null,
                'post_test_score' => null,
                'best_post_test_score' => null,
                'attempts_count' => 0,
                'passed' => false,
                'last_accessed_at' => '2026-10-27 10:00',
                'completed_at' => null,
            ],
        ];
    }

    /**
     * Dapatkan riwayat aktivitas pembelajaran
     *
     * @return array<int, array<string, mixed>>
     */
    public function getActivities(): array
    {
        return [
            [
                'id' => 'act-1',
                'title' => 'Menyelesaikan Modul "Info Produk Lengkap"',
                'type' => 'module_completed',
                'description' => 'Skor tes akhir sempurna 100%! Pemahaman naik dari 67%.',
                'date' => 'Kemarin, 26 Okt 2026 • 16:15 WIB',
                'score' => 100,
            ],
            [
                'id' => 'act-2',
                'title' => 'Mendapatkan Lencana "Jago Konten"',
                'type' => 'badge_earned',
                'description' => 'Berhasil membuktikan pemahaman menyusun info produk memikat.',
                'date' => 'Kemarin, 26 Okt 2026 • 16:15 WIB',
            ],
            [
                'id' => 'act-3',
                'title' => 'Mendapatkan Lencana "Naik Kelas"',
                'type' => 'badge_earned',
                'description' => 'Kenaikan nilai luar biasa (+67 poin) pada modul Foto Produk.',
                'date' => '25 Okt 2026 • 10:30 WIB',
            ],
            [
                'id' => 'act-4',
                'title' => 'Menyelesaikan Modul "Foto Produk yang Menarik"',
                'type' => 'module_completed',
                'description' => 'Skor tes akhir 100% setelah mempraktikkan pencahayaan alami.',
                'date' => '25 Okt 2026 • 10:30 WIB',
                'score' => 100,
            ],
            [
                'id' => 'act-5',
                'title' => 'Menyelesaikan Modul "Mengenal Pemasaran Digital"',
                'type' => 'module_completed',
                'description' => 'Langkah awal berhasil diselesaikan dengan skor tes akhir 100%.',
                'date' => '24 Okt 2026 • 14:45 WIB',
                'score' => 100,
            ],
        ];
    }

    /**
     * Penilaian tes terstruktur di backend secara aman (Integritas Tes)
     * Jawaban benar dan pembahasan hanya dikirim kembali setelah tes dikumpulkan.
     *
     * @param  array<string, string>  $answers  Contoh: ['q1_1' => 'B', 'q1_2' => 'C']
     * @return array{
     *     score: int,
     *     correct_count: int,
     *     total_questions: int,
     *     passed: bool,
     *     score_gain: ?int,
     *     gain_message: ?string,
     *     breakdown: array<int, array{question_id: string, user_answer: string, correct_answer: string, is_correct: bool, explanation: string}>
     * }
     */
    public function gradeQuiz(string $moduleId, string $testType, array $answers, ?int $preTestScore = null): array
    {
        $keys = $this->answerBank[$moduleId][$testType] ?? [];
        $totalQuestions = count($keys);

        if ($totalQuestions === 0) {
            return [
                'score' => 100,
                'correct_count' => 0,
                'total_questions' => 0,
                'passed' => true,
                'score_gain' => null,
                'gain_message' => null,
                'breakdown' => [],
            ];
        }

        $correctCount = 0;
        $breakdown = [];

        foreach ($keys as $qId => $data) {
            $userAns = $answers[$qId] ?? '';
            $isCorrect = (strtoupper(trim($userAns)) === strtoupper($data['correct']));

            if ($isCorrect) {
                $correctCount++;
            }

            $breakdown[] = [
                'question_id' => $qId,
                'user_answer' => $userAns,
                'correct_answer' => $data['correct'],
                'is_correct' => $isCorrect,
                'explanation' => $data['explanation'],
            ];
        }

        $score = (int) round(($correctCount / $totalQuestions) * 100);
        $passed = $score >= self::PASSING_SCORE;

        $scoreGain = null;
        $gainMessage = null;

        if ($testType === 'post' && $preTestScore !== null) {
            $scoreGain = max(0, $score - $preTestScore);
            if ($scoreGain > 0) {
                $gainMessage = "Hebat! Pemahamanmu meningkat sebesar {$scoreGain}% (dari {$preTestScore}% menjadi {$score}%)! 🎉";
            } else {
                $gainMessage = "Bagus sekali! Pemahamanmu stabil di angka {$score}%.";
            }
        }

        return [
            'score' => $score,
            'correct_count' => $correctCount,
            'total_questions' => $totalQuestions,
            'passed' => $passed,
            'score_gain' => $scoreGain,
            'gain_message' => $gainMessage,
            'breakdown' => $breakdown,
        ];
    }

    /**
     * Mesin Rekomendasi Modul Belajar (Rule-Based dengan Alasan Jelas)
     *
     * @param  array<string, array<string, mixed>>  $userProgress
     * @return array{module_id: string, module_title: string, reason: string, category: string}
     */
    public function getRecommendedModule(array $userProgress): array
    {
        // Aturan 1: Cek apakah ada modul yang sedang dipelajari (Lanjutkan yang sedang berjalan)
        foreach ($userProgress as $modId => $prog) {
            if ($prog['status'] === 'sedang_belajar') {
                $mod = collect($this->getModules())->firstWhere('id', $modId);
                if ($mod) {
                    return [
                        'module_id' => $mod['id'],
                        'module_title' => $mod['title'],
                        'reason' => "Lanjutkan modul ini ({$prog['current_step']} dari {$prog['total_steps']} langkah selesai). Tinggal sedikit lagi!",
                        'category' => $mod['category'],
                    ];
                }
            }
        }

        // Aturan 2: Cek apakah ada modul selesai dengan skor di bawah ambang batas (Sarankan pendalaman)
        foreach ($userProgress as $modId => $prog) {
            if (! empty($prog['post_test_score']) && $prog['post_test_score'] < self::PASSING_SCORE) {
                $mod = collect($this->getModules())->firstWhere('id', $modId);
                if ($mod) {
                    return [
                        'module_id' => $mod['id'],
                        'module_title' => $mod['title'],
                        'reason' => "Disarankan karena skor tes akhirmu ({$prog['post_test_score']}%) masih bisa ditingkatkan agar pemahamanmu makin matang.",
                        'category' => $mod['category'],
                    ];
                }
            }
        }

        // Aturan 3: Jika belum ada modul yang dibuka sama sekali, sarankan modul pertama
        $hasAnyCompleted = collect($userProgress)->contains(fn ($p) => $p['status'] === 'selesai');
        if (! $hasAnyCompleted) {
            return [
                'module_id' => 'modul-1',
                'module_title' => 'Mengenal Pemasaran Digital untuk Pemula',
                'reason' => 'Rekomendasi awal terbaik untuk memulai langkah digital usahamu dengan percaya diri.',
                'category' => 'Dasar Digital',
            ];
        }

        // Aturan 4: Sarankan modul berikutnya yang belum dimulai
        $modules = $this->getModules();
        foreach ($modules as $m) {
            $prog = $userProgress[$m['id']] ?? null;
            if (! $prog || $prog['status'] === 'belum_dimulai') {
                return [
                    'module_id' => $m['id'],
                    'module_title' => $m['title'],
                    'reason' => 'Keterampilan penting berikutnya setelah kamu menguasai modul sebelumnya.',
                    'category' => $m['category'],
                ];
            }
        }

        // Default jika semua selesai
        // TODO: Sambungkan ke model Machine Learning (Collaborative Filtering / Skill Gap Analysis)
        // ketika dataset interaksi lintas menu (keuangan, transaksi kas, & performa etalase) sudah bertambah besar.
        return [
            'module_id' => 'modul-6',
            'module_title' => 'Mencatat Uang Masuk dan Keluar (Pembukuan Sederhana)',
            'reason' => 'Pertajam kembali ketelitian pencatatan kas tokomu agar laba selalu terpantau.',
            'category' => 'Pembukuan',
        ];
    }
}
