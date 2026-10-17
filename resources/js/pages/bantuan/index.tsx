import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Award,
    CheckCircle2,
    FileQuestion,
    Headset,
    HelpCircle,
    MessageCircle,
    Mic,
    Play,
    PhoneCall,
    ShieldCheck,
    Sparkles,
    UserCheck,
    Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BantuanIndex() {
    const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

    const guides = [
        {
            id: 'v1',
            title: 'Cara Mencatat Transaksi Lewat Suara',
            duration: '1 menit 15 detik',
            desc: 'Panduan menekan tombol mikrofon dan berbicara dengan dialek santai tanpa kaku.',
            icon: Mic,
        },
        {
            id: 'v2',
            title: 'Cara Mengunduh Laporan Laba Rugi untuk KUR',
            duration: '1 menit 40 detik',
            desc: 'Langkah mudah mengekspor laporan bulanan ke format PDF untuk diserahkan ke bank.',
            icon: Award,
        },
        {
            id: 'v3',
            title: 'Cara Membuat Poster Promosi WhatsApp',
            duration: '1 menit 20 detik',
            desc: 'Tips memilih tema promo dan membagikan poster buatan AI ke WhatsApp Status.',
            icon: Sparkles,
        },
    ];

    const faqs = [
        {
            q: 'Bagaimana jika suara saya salah didengar oleh sistem?',
            a: 'Jangan khawatir! Sebelum transaksi disimpan, sistem selalu menampilkan kartu konfirmasi dengan tombol "Ubah Catatan". Kamu bisa langsung mengoreksi angka atau keterangannya.',
        },
        {
            q: 'Apakah saya bisa mencatat menggunakan bahasa daerah?',
            a: 'Ya, LAPAK memahami istilah lisan umum seperti "ceban" (10 ribu), "goceng" (5 ribu), "seceng", "seweke", serta campuran bahasa Jawa santai.',
        },
        {
            q: 'Apakah data keuangan saya aman dan tidak disebar ke orang lain?',
            a: 'Sangat aman. Seluruh data terenkripsi dan patuh pada UU Pelindungan Data Pribadi (UU PDP). Data tokomu hanya bisa diakses oleh kamu sendiri.',
        },
        {
            q: 'Apakah bisa digunakan jika sedang tidak ada koneksi internet?',
            a: 'Kamu bisa mengetik catatan lewat tombol "Ketik Manual", dan rekaman suara akan diproses begitu ponselmu kembali terhubung ke jaringan.',
        },
    ];

    return (
        <>
            <Head title="Pusat Bantuan & Pendampingan - LAPAK UMKM" />

            <div className="w-full max-w-[1400px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-primary mb-1.5">
                            <Headset className="size-3.5" />
                            Layanan Pendampingan Usaha
                        </div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Pusat Bantuan & Kawan Pendamping
                        </h1>
                        <p className="text-sm text-lapak-body">
                            Kami siap membantumu setiap hari. Tanya apa saja seputar pencatatan keuangan dan promosi.
                        </p>
                    </div>

                    <Button
                        size="sm"
                        asChild
                        className="bg-[#216E45] hover:bg-[#1a5737] text-white font-heading"
                    >
                        <a
                            href="https://wa.me/6281234567890?text=Halo%20Pendamping%20LAPAK%2C%20saya%20butuh%20bantuan"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <MessageCircle className="size-4" />
                            Chat WhatsApp Petugas (Langsung)
                        </a>
                    </Button>
                </div>

                {/* SECTION 1: KARTU PENDAMPING RESMI (ACC-06) */}
                <div className="rounded-2xl border border-primary/30 bg-secondary/40 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center font-heading text-xl font-bold shrink-0">
                                RP
                            </div>
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-heading text-lg font-bold text-foreground">
                                        Rahmat Pratama, S.E.
                                    </h3>
                                    <span className="rounded-full bg-[#E4F3E8] px-2 py-0.5 text-[10px] font-bold text-[#216E45]">
                                        Pendamping Aktif
                                    </span>
                                </div>
                                <p className="text-xs text-lapak-body">
                                    Fasilitator Inkubasi Bisnis &bull; Dinas Koperasi & UKM Kota Surabaya
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Wilayah dampingan: Wonokromo, Sawahan, & Tegalsari
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                size="sm"
                                asChild
                                className="font-heading text-xs"
                            >
                                <a
                                    href="https://wa.me/6281234567890?text=Halo%20Pak%20Rahmat"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MessageCircle className="size-3.5 mr-1" />
                                    Tanya Pak Rahmat via WA
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: VIDEO PANDUAN SINGKAT (1 MENITAN) */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Video className="size-5 text-primary" />
                            <h2 className="font-heading text-lg font-bold text-foreground">
                                Video Panduan Praktis (1 Menit)
                            </h2>
                        </div>
                        <span className="text-xs text-muted-foreground">Tonton tanpa kuota boros</span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {guides.map((g) => {
                            const Icon = g.icon;
                            return (
                                <div
                                    key={g.id}
                                    className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-xs space-y-4 transition-all hover:border-primary/40 hover:shadow-md"
                                >
                                    <div className="space-y-3">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                                            <Icon className="size-6" />
                                        </div>
                                        <div>
                                            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                                {g.duration}
                                            </span>
                                            <h3 className="font-heading text-base font-bold text-foreground mt-1.5">
                                                {g.title}
                                            </h3>
                                            <p className="text-xs text-lapak-body mt-1">
                                                {g.desc}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setActiveVideoModal(g.title)}
                                        className="w-full font-heading text-xs"
                                    >
                                        <Play className="size-3.5 mr-1" />
                                        Tonton Video Panduan
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* SECTION 3: FAQ PERTANYAAN POPULER */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
                    <div className="flex items-center gap-2 border-b border-border pb-3">
                        <FileQuestion className="size-5 text-primary" />
                        <div>
                            <h2 className="font-heading text-base font-bold text-foreground">
                                Pertanyaan yang Sering Ditanyakan (FAQ)
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                Jawaban cepat untuk kendala yang sering dialami pemilik usaha
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {faqs.map((faq, i) => (
                            <div key={i} className="rounded-xl border border-border p-4 bg-muted/20 space-y-1.5">
                                <h3 className="font-heading text-sm font-bold text-foreground">
                                    {faq.q}
                                </h3>
                                <p className="text-xs text-lapak-body leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer Security Note */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
                    <ShieldCheck className="size-4 text-[#216E45]" />
                    <span>Layanan resmi didukung oleh Dinas Koperasi dan UKM &bull; Bebas biaya langganan dasar</span>
                </div>
            </div>

            {/* Simulated Video Player Modal */}
            {activeVideoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <h3 className="font-heading text-base font-bold text-foreground">
                                {activeVideoModal}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setActiveVideoModal(null)}
                                className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                Tutup
                            </button>
                        </div>

                        <div className="aspect-video rounded-xl bg-[#174D3A] flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                            <Play className="size-12 opacity-80" />
                            <p className="font-heading text-sm font-bold">Pemutar Video Tutorial</p>
                            <p className="text-xs opacity-75">Durasi singkat &bull; Bahasa Indonesia santai</p>
                        </div>

                        <Button
                            type="button"
                            onClick={() => setActiveVideoModal(null)}
                            className="w-full font-heading"
                        >
                            Saya Sudah Paham
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
}

BantuanIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Pusat Bantuan & Pendampingan', href: '/bantuan' },
    ],
};
