import {
    ContentIdea,
    PromoTemplate,
    QuickReply,
    ScheduledPost,
} from '../types/promotion';

export const mockScheduledPosts: ScheduledPost[] = [
    {
        id: 'post-1',
        product_id: '1',
        product_name: 'Keripik Singkong Balado',
        platform: 'instagram',
        date: '2026-10-26',
        time: '12:30',
        caption:
            'Siang-siang gini paling pas ngemil Keripik Singkong Balado yang renyahnya bikin melek! 🌶️ Rasa pedas manisnya pas banget di lidah, dijamin nagih. Yuk stok buat temen kerja!',
        hashtags: [
            '#KeripikSingkong',
            '#CemilanPedas',
            '#UMKMIndonesia',
            '#KulinerLokal',
        ],
        notes: 'Pakai foto produk dekat kemasan yang baru diproduksi',
        status: 'diposting',
        remind_before: 15,
        created_at: '2026-10-24 10:00',
    },
    {
        id: 'post-2',
        product_id: '3',
        product_name: 'Kopi Robusta Temanggung',
        platform: 'whatsapp',
        date: '2026-10-27',
        time: '08:00',
        caption:
            'Selamat pagi! Awali harimu dengan aroma kopi asli Temanggung. Fresh roast setiap minggu! Mau pesan buat seduhan pagi ini? Balas status ini ya kak, langsung kami proses ☕✨',
        hashtags: ['#KopiPagi', '#TemanggungRoast'],
        notes: 'Posting di WA Status jam 8 pas sebelum mulai aktivitas',
        status: 'terjadwal',
        remind_before: 15,
        created_at: '2026-10-25 15:30',
    },
    {
        id: 'post-3',
        product_id: '2',
        product_name: 'Sambal Roa Khas Manado',
        platform: 'tiktok',
        date: '2026-10-28',
        time: '19:00',
        caption:
            'Makan nasi putih hangat + Sambal Roa doang udah senikmat ini! Ikan roa asapnya melimpah, bukan cuma minyak doang yaa. Cobain sekarang mumpung lagi ada promo bundle! 🔥',
        hashtags: [
            '#SambalRoa',
            '#PedasNampol',
            '#KulinerManado',
            '#RacunKuliner',
        ],
        notes: 'Video unboxing dan tuang sambal di atas nasi hangat',
        status: 'terjadwal',
        remind_before: 30,
        created_at: '2026-10-25 16:00',
    },
    {
        id: 'post-4',
        product_id: '5',
        product_name: 'Batik Tulis Motif Parang',
        platform: 'facebook',
        date: '2026-10-30',
        time: '10:00',
        caption:
            'Tahukah Sahabat, motif Parang melambangkan semangat pantang menyerah seperti ombak laut. Dibuat langsung oleh pengrajin lokal dengan penuh ketelitian. Cocok untuk acara formal maupun kerja.',
        hashtags: [
            '#BatikTulis',
            '#CintaProdukIndonesia',
            '#BanggaBuatanIndonesia',
        ],
        notes: 'Tampilkan foto detail canting dan motif kain',
        status: 'terjadwal',
        remind_before: 15,
        created_at: '2026-10-26 09:15',
    },
    {
        id: 'post-5',
        product_id: null,
        product_name: 'Promo Akhir Bulan',
        platform: 'instagram',
        date: '2026-10-31',
        time: '16:00',
        caption:
            'PROMO PAYDAY SPESIAL AKHIR BULAN! 🥳 Nikmati diskon hingga 25% untuk semua cemilan favoritmu. Berlaku cuma 2 hari aja sampai besok malam. Buruan checkout sebelum kehabisan!',
        hashtags: ['#PromoPayday', '#DiskonAkhirBulan', '#JajanHemat'],
        notes: 'Pakai template flyer diskon warna kuning oranye',
        status: 'draft',
        remind_before: 15,
        created_at: '2026-10-26 11:00',
    },
];

export const mockPromoTemplates: PromoTemplate[] = [
    {
        id: 'promo-1',
        title: 'Diskon Persen (%)',
        category: 'diskon',
        description:
            'Cocok untuk flash sale atau potongan harga menarik pelanggan cepat.',
        fields: [
            {
                key: 'produk',
                label: 'Nama Produk',
                placeholder: 'Keripik Singkong Balado',
                defaultValue: 'Keripik Singkong',
            },
            {
                key: 'diskon',
                label: 'Persen Diskon',
                placeholder: '20%',
                defaultValue: '20%',
            },
            {
                key: 'batas_waktu',
                label: 'Batas Waktu',
                placeholder: 'Hari Minggu ini saja',
                defaultValue: 'sampai Minggu besok',
            },
        ],
        caption_template:
            '🎉 SPESIAL UNTUK KAMU! Dapatkan diskon {diskon} untuk setiap pembelian {produk}. Promo berlaku terbatas {batas_waktu}! Jangan sampai ketinggalan, klik link di bio atau pesan via WhatsApp sekarang ya! 🛒✨',
    },
    {
        id: 'promo-2',
        title: 'Beli 2 Gratis 1',
        category: 'beli2gratis1',
        description:
            'Dorong pelanggan membeli lebih banyak produk sekaligus untuk habiskan stok.',
        fields: [
            {
                key: 'produk',
                label: 'Produk yang Dibeli',
                placeholder: 'Sambal Roa 150gr',
                defaultValue: 'Sambal Roa Khas Manado',
            },
            {
                key: 'hadiah',
                label: 'Produk Gratisan',
                placeholder: '1 pouch Keripik Tempe',
                defaultValue: '1 pouch Keripik Singkong',
            },
            {
                key: 'kuota',
                label: 'Kuota / Batas',
                placeholder: 'Untuk 50 pembeli pertama',
                defaultValue: 'Untuk 30 pembeli tercepat',
            },
        ],
        caption_template:
            '🔥 PROMO BELI 2 GRATIS 1! Beli 2 jar {produk}, langsung dapetin GRATIS {hadiah}! Khusus {kuota}. Stok promo sangat terbatas, yuk langsung amankan pesananmu via chat WhatsApp sekarang! 🚀',
    },
    {
        id: 'promo-3',
        title: 'Gratis Ongkir',
        category: 'gratis_ongkir',
        description:
            'Hilangkan keraguan calon pembeli luar kota dengan subsidi ongkos kirim.',
        fields: [
            {
                key: 'min_belanja',
                label: 'Minimal Belanja',
                placeholder: 'Rp 100.000',
                defaultValue: 'Rp 100.000',
            },
            {
                key: 'wilayah',
                label: 'Wilayah Berlaku',
                placeholder: 'Jabodetabek / Seluruh Jawa',
                defaultValue: 'Seluruh Pulau Jawa',
            },
            {
                key: 'kode_kupon',
                label: 'Kode Kupon / Catatan',
                placeholder: 'GRATISONGKIR',
                defaultValue: 'BEBASONGKIR',
            },
        ],
        caption_template:
            '📦 KABAR GEMBIRA! Nikmati GRATIS ONGKIR ke {wilayah} tanpa ribet dengan minimal belanja {min_belanja}. Cukup sebutkan promo "{kode_kupon}" saat order di WhatsApp. Pesan sekarang sebelum promo berakhir! 🚚💨',
    },
    {
        id: 'promo-4',
        title: 'Promo Akhir Pekan (Weekend Deal)',
        category: 'weekend',
        description:
            'Manfaatkan lonjakan pembeli di hari Sabtu & Minggu saat waktu santai.',
        fields: [
            {
                key: 'produk',
                label: 'Produk Pilihan',
                placeholder: 'Semua Varian Kopi',
                defaultValue: 'Semua Produk',
            },
            {
                key: 'keuntungan',
                label: 'Bonus / Potongan',
                placeholder: 'Potongan Rp 15.000 + Bonus Stiker',
                defaultValue: 'Potongan langsung Rp 15.000',
            },
        ],
        caption_template:
            '☀️ WEEKEND SERU BARENG KAMI! Nikmati akhir pekanmu dengan {produk} favorit. Khusus weekend ini, ada {keuntungan} buat kamu yang checkout hari Sabtu & Minggu ini. Klik link di bio yuk! 🛍️',
    },
    {
        id: 'promo-5',
        title: 'Promo Spesial Hari Raya / Gajian',
        category: 'hari_raya',
        description:
            'Relevan untuk momen gajian (Payday), Natal, Tahun Baru, atau Lebaran.',
        fields: [
            {
                key: 'nama_momen',
                label: 'Nama Momen',
                placeholder: 'Gajian Seru / Semarak Hari Raya',
                defaultValue: 'Payday Spesial',
            },
            {
                key: 'penawaran',
                label: 'Penawaran Spesial',
                placeholder: 'Cashback 15% & Free Pouch',
                defaultValue: 'Diskon 25% + Free Pouch',
            },
            {
                key: 'batas',
                label: 'Periode Tanggal',
                placeholder: '25 - 31 Oktober',
                defaultValue: '26 - 31 Oktober 2026',
            },
        ],
        caption_template:
            '🎊 SEMARAK {nama_momen}! Saatnya self-reward setelah kerja keras! Dapatkan {penawaran} selama periode {batas}. Yuk manjakan diri dan orang tersayang sekarang juga. Chat admin sekarang! 🎁',
    },
    {
        id: 'promo-6',
        title: 'Paket Hemat / Bundle',
        category: 'paket_hemat',
        description:
            'Gabungkan beberapa produk agar nilai transaksi per pembeli lebih tinggi.',
        fields: [
            {
                key: 'nama_paket',
                label: 'Nama Paket',
                placeholder: 'Paket Sarapan Nikmat',
                defaultValue: 'Paket Santai Sore',
            },
            {
                key: 'isi_paket',
                label: 'Isi Paket',
                placeholder: '1 Kopi + 2 Keripik',
                defaultValue: '1 Kopi Robusta + 2 Keripik Singkong',
            },
            {
                key: 'harga_promo',
                label: 'Harga Promo',
                placeholder: 'Rp 65.000 (Hemat 20rb)',
                defaultValue: 'Rp 75.000 (Hemat Rp 25.000)',
            },
        ],
        caption_template:
            '💡 LEBIH HEMAT LEBIH PUAS! Kenalin {nama_paket} yang isinya lengkap: {isi_paket}. Cuma seharga {harga_promo}! Jauh lebih hemat daripada beli satuan. Buruan pesan sekarang ya kak! 🥳',
    },
    {
        id: 'promo-7',
        title: 'Khusus Pelanggan Baru',
        category: 'pelanggan_baru',
        description:
            'Ajak orang yang baru mampir untuk melakukan pembelian pertama kali.',
        fields: [
            {
                key: 'benefit',
                label: 'Keuntungan Pelanggan Baru',
                placeholder: 'Potongan Rp 10.000 untuk order pertama',
                defaultValue: 'Diskon 10% untuk pesanan pertamamu',
            },
            {
                key: 'cara_klaim',
                label: 'Cara Klaim',
                placeholder: 'Ketik "NEWCUSTOMER" di WhatsApp',
                defaultValue: 'Ketik "PELANGGANBARU" saat chat',
            },
        ],
        caption_template:
            '👋 BARU PERTAMA KALI KEMARI? Selamat datang! Spesial buat kamu yang baru pertama kali belanja di toko kami, ada {benefit}. Caranya gampang banget, cukup chat admin dan sebutkan "{cara_klaim}". Ditunggu orderannya! ❤️',
    },
];

export const mockQuickReplies: QuickReply[] = [
    {
        id: 'qr-1',
        category: 'salam',
        title: 'Salam Ramah Pembuka',
        shortcut: '!halo',
        content:
            'Halo kak {nama_pelanggan}! Terima kasih sudah menghubungi kami 😊 Ada yang bisa kami bantu seputar {nama_produk} hari ini?',
    },
    {
        id: 'qr-2',
        category: 'harga',
        title: 'Info Harga & Ukuran',
        shortcut: '!harga',
        content:
            'Untuk produk {nama_produk}, harganya {harga} ya kak. Kualitas terjamin fresh dan siap dikirim hari ini. Mau kami siapkan berapa pcs kak?',
    },
    {
        id: 'qr-3',
        category: 'cara_pesan',
        title: 'Format Pemesanan Cepat',
        shortcut: '!order',
        content:
            'Bisa banget kak! Untuk pemesanan, silakan kirimkan format ini ya:\n\nNama: {nama_pelanggan}\nNo. HP:\nAlamat Lengkap (beserta kecamatan):\nPesanan: {nama_produk} (jumlah:...)\n\nNanti kami hitungkan total beserta ongkirnya ya kak 🙏',
    },
    {
        id: 'qr-4',
        category: 'stok',
        title: 'Konfirmasi Stok Tersedia',
        shortcut: '!stokready',
        content:
            'Kabar baik kak! Untuk {nama_produk} stoknya masih READY dan siap langsung dikirim. Mau langsung diproses pesanannya kak {nama_pelanggan}?',
    },
    {
        id: 'qr-5',
        category: 'ongkir',
        title: 'Estimasi Pengiriman & Ongkir',
        shortcut: '!ongkir',
        content:
            'Pengiriman kami lakukan dari workshop kami menggunakan kurir J&T, SiCepat, dan Gosend/Grab (instan). Untuk cek ongkir pasti ke tempat kak {nama_pelanggan}, boleh dibantu nama kecamatan dan kotanya ya kak? 🚚',
    },
    {
        id: 'qr-6',
        category: 'pembayaran',
        title: 'Rincian Pembayaran & Rekening',
        shortcut: '!bayar',
        content:
            'Total pesanan kakak adalah {harga}.\n\nPembayaran bisa ditransfer ke rekening resmi kami:\n{nomor_rekening}\n\nSetelah transfer, mohon kirimkan bukti foto/screenshot transfernya ya kak agar langsung kami packing. Terima kasih kak {nama_pelanggan}! 🙏',
    },
    {
        id: 'qr-7',
        category: 'terima_kasih',
        title: 'Ucapan Terima Kasih & Resi',
        shortcut: '!makasih',
        content:
            'Alhamdulillah, pembayaran sudah kami terima dengan baik kak {nama_pelanggan}! Pesanan {nama_produk} sedang kami siapkan dengan rapi dan aman. Nanti nomor resi akan segera kami infokan ya. Terima kasih banyak sudah berbelanja di toko kami! ❤️',
    },
    {
        id: 'qr-8',
        category: 'komplain',
        title: 'Respon Masalah / Komplain Ramah',
        shortcut: '!maaf',
        content:
            'Mohon maaf yang sebesar-besarnya atas ketidaknyamanannya kak {nama_pelanggan}. Kepuasan kakak adalah prioritas kami. Boleh tolong kirimkan foto/video kendala produknya kak? Kami siap bertanggung jawab dan memberikan solusi terbaik/kirim pengganti secepatnya 🙏',
    },
    {
        id: 'qr-9',
        category: 'stok',
        title: 'Stok Habis / Pre-Order',
        shortcut: '!stokhabis',
        content:
            'Mohon maaf sekali kak {nama_pelanggan}, untuk varian {nama_produk} saat ini baru saja habis diborong pembeli lain. Batch baru akan selesai diproduksi dalam 2 hari lagi. Apakah kakak bersedia ikut daftar antrian pre-order duluan?',
    },
    {
        id: 'qr-10',
        category: 'cara_pesan',
        title: 'Link Etalase Belanja Mandiri',
        shortcut: '!etalase',
        content:
            'Kakak juga bisa melihat katalog lengkap foto dan harga produk kami di etalase toko online resmi kami ya: {link_etalase}. Bisa langsung klik untuk pilih-pilih!',
    },
];

export const mockContentIdeas: ContentIdea[] = [
    {
        id: 'idea-1',
        title: 'Proses Dapur / Behind The Scene',
        description:
            'Tunjukkan kebersihan bahan baku dan proses pembuatan produkmu. Konsumen suka melihat kejujuran di balik layar!',
        goal: 'cerita',
        suggested_platform: 'tiktok',
        recommended_time: 'Siang 12:00 - 13:00',
    },
    {
        id: 'idea-2',
        title: 'Testimoni Pembeli Puas',
        description:
            'Screenshot chat kepuasan pelanggan, beri stiker terima kasih, dan ajak orang lain merasakan hal yang sama.',
        goal: 'testimoni',
        suggested_platform: 'whatsapp',
        recommended_time: 'Sore 16:30 - 18:00',
    },
    {
        id: 'idea-3',
        title: 'Tips Cara Menyimpan Makanan Biar Tahan Lama',
        description:
            'Bagikan edukasi cara simpan keripik/kopi agar tetap renyah dan harum hingga berminggu-minggu.',
        goal: 'edukasi',
        suggested_platform: 'instagram',
        recommended_time: 'Pagi 07:30 - 08:30',
    },
    {
        id: 'idea-4',
        title: 'Teka-Teki Tebak Varian Berhadiah',
        description:
            'Post gambar potongan produk dan minta audiens menebak di kolom komentar untuk meningkatkan interaksi.',
        goal: 'promo',
        suggested_platform: 'instagram',
        recommended_time: 'Malam 19:30 - 21:00',
    },
];

export const consistencyTips = [
    {
        title: 'Jadwalkan di Waktu Luang',
        tip: 'Siapkan 3 draft postingan di hari Minggu malam, jadi sepanjang minggu tokomu tetap aktif tanpa mengganggu produksi.',
    },
    {
        title: 'Konsisten > Sempurna',
        tip: 'Foto sederhana dengan pencahayaan sinar matahari alami seringkali lebih dipercaya pelanggan dibanding poster yang terlalu kaku.',
    },
    {
        title: 'Balas Chat < 15 Menit',
        tip: 'Gunakan template Balasan Cepat agar pelanggan yang bertanya langsung merasa diperhatikan sebelum beralih ke toko lain.',
    },
    {
        title: 'Tulis Cerita Usahamu',
        tip: 'Pelanggan tidak hanya membeli produk, mereka juga suka mendukung perjuangan pemilik usaha lokal yang tulus.',
    },
];
