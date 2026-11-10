<?php

return [
    'site' => [
        'name' => 'LAPAK',
        'tagline' => 'Cukup bicara, usahamu berkembang.',
        'url' => env('APP_URL', 'http://localhost:8000'),
        'description' => 'Asisten pintar pelaku UMKM Indonesia untuk pencatatan transaksi suara, analisis pasar sekitar, dan promosi otomatis.',
    ],
    'contact' => [
        'email' => env('LANDING_CONTACT_EMAIL', 'halo@lapak.id'),
        'whatsapp' => env('LANDING_CONTACT_WHATSAPP', '6281234567890'),
    ],
    'stats' => [
        [
            'value' => '64,2 Juta+',
            'label' => 'Pelaku UMKM di Indonesia Menopang Ekonomi Nasional',
            'source' => 'Kementerian Koperasi dan UKM',
            'source_url' => 'https://kemenkopukm.go.id',
            'year' => 2023,
        ],
        [
            'value' => '80%',
            'label' => 'Usaha Mikro Belum Memiliki Pembukuan Terstandar',
            'source' => 'Bank Indonesia',
            'source_url' => 'https://www.bi.go.id',
            'year' => 2024,
        ],
        [
            'value' => '5 Menit',
            'label' => 'Waktu Rata-rata Pencatatan Transaksi Harian Lewat Suara',
            'source' => 'Uji Coba Internal LAPAK',
            'source_url' => null,
            'year' => 2026,
        ],
    ],
];
