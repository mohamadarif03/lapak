import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Calendar,
    Check,
    CheckCircle2,
    Copy,
    Download,
    Eye,
    Hash,
    Image as ImageIcon,
    Instagram,
    Megaphone,
    MessageCircle,
    Mic,
    Palette,
    RefreshCw,
    Share2,
    Sparkles,
    Tag,
    Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PromosiIndex() {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const initialTopic = urlParams.get('topic') || 'Paket Ngemil Sore Kopi dan Roti';

    // Form inputs (MKT-01)
    const [promoTitle, setPromoTitle] = useState(initialTopic);
    const [discountDetail, setDiscountDetail] = useState('Diskon 15% Jam 15.00 - 17.00 WIB');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '9:16'>('1:1');
    const [colorTheme, setColorTheme] = useState<'deepgreen' | 'warmgold' | 'freshsage'>('deepgreen');
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedCaption, setCopiedCaption] = useState(false);
    const [shareNotification, setShareNotification] = useState<string | null>(null);

    // AI Generated Content (MKT-02, MKT-03)
    const [generatedCaption, setGeneratedCaption] = useState(
        `Sore-sore paling pas ngopi santai bareng teman kerja!\n\n` +
        `Yuk mampir ke Warung Kopi Mantap Bu Rara! Ada PROMO PAKET NGEMIL SORE:\n` +
        `Es Kopi Susu Aren + Roti Bakar Coklat Keju cuma Rp25.000 (Hemat 15%)!\n\n` +
        `Khusus jam 15.00 - 17.00 WIB setiap Senin - Jumat.\n` +
        `Bisa pesan langsung di tempat atau WhatsApp ke 0812-3456-7890.\n\n` +
        `#KopiSore #KulinerSurabaya #KopiSusuAren #RotiBakar #PromoKuliner #UMKMIndonesia`
    );

    const [hashtags, setHashtags] = useState([
        '#KopiSore',
        '#KulinerSurabaya',
        '#KopiSusuAren',
        '#RotiBakar',
        '#PromoKuliner',
        '#UMKMIndonesia',
    ]);

    // Handle Regenerate AI Copy & Visual
    const handleGenerateAI = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setGeneratedCaption(
                `Lagi suntuk kerja sore hari? Jangan lupa recharge energi!\n\n` +
                `Spesial buat kamu hari ini: ${promoTitle.toUpperCase()}!\n` +
                `Nikmati penawaran spesial: ${discountDetail}.\n\n` +
                `Dibuat segar dengan biji kopi pilihan dan bahan berkualitas.\n` +
                `Yuk ramaikan lapak kami di Jl. Pasar Wonokromo No. 14, Surabaya.\n\n` +
                hashtags.join(' ')
            );
        }, 800);
    };

    // Copy caption to clipboard
    const handleCopyCaption = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(generatedCaption);
            setCopiedCaption(true);
            setTimeout(() => setCopiedCaption(false), 2500);
        }
    };

    // Handle Share / Post (MKT-05)
    const handleShare = (channel: string) => {
        setShareNotification(`Materi promosi siap dibagikan ke ${channel}!`);
        setTimeout(() => setShareNotification(null), 3500);
    };

    // Calendar recommendations (MKT-07, MKT-08)
    const weeklyCalendar = [
        { day: 'Senin', topic: 'Semangat Awal Pekan', time: '08.00 WIB', status: 'Rekomendasi' },
        { day: 'Rabu', topic: 'Promo Tengah Minggu Es Teh', time: '12.00 WIB', status: 'Rekomendasi' },
        { day: 'Jumat', topic: 'Paket Sore Ngopi Santai', time: '16.00 WIB', status: 'Terjadwal' },
        { day: 'Sabtu', topic: 'Diskon Akhir Pekan Keluarga', time: '10.00 WIB', status: 'Rekomendasi' },
    ];

    return (
        <>
            <Head title="Pembuat Promosi & Poster Otomatis - LAPAK UMKM" />

            <div className="w-full max-w-[1400px] mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/80 pb-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-primary mb-1.5">
                            <Megaphone className="size-3.5" />
                            Modul INOV &bull; Pemasaran Cerdas
                        </div>
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            Bikin Promosi Jualan Otomatis
                        </h1>
                        <p className="text-sm text-lapak-body">
                            Poster dan caption dibuatkan AI berdasarkan data penjualan tokomu. Siap posting ke WhatsApp & Instagram.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setPromoTitle('Diskon Gajian Serba Ceban');
                                setDiscountDetail('Semua Minuman Kopi Cuma Rp10.000');
                                handleGenerateAI();
                            }}
                            className="text-xs font-heading"
                        >
                            <Sparkles className="size-3.5" />
                            Pakai Template Gajian
                        </Button>
                    </div>
                </div>

                {/* Toast Notification */}
                {shareNotification && (
                    <div className="flex items-center gap-2 rounded-xl border border-[#216E45]/40 bg-[#E4F3E8] p-3.5 text-xs font-semibold text-[#216E45] animate-in fade-in duration-200">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>{shareNotification}</span>
                    </div>
                )}

                {/* MAIN 2-COLUMN WORKSPACE: FORM INPUT & POSTER PREVIEW */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* LEFT COLUMN: FORM PENGATURAN PROMOSI (MKT-01) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <h2 className="font-heading text-base font-bold text-foreground">
                                    Detail Penawaran Promosi
                                </h2>
                                <span className="text-[11px] font-semibold text-primary">
                                    Langkah 1 dari 2
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="promo-title" className="text-xs font-semibold text-foreground">
                                        Tema / Nama Promosi
                                    </Label>
                                    <Input
                                        id="promo-title"
                                        value={promoTitle}
                                        onChange={(e) => setPromoTitle(e.target.value)}
                                        placeholder="Contoh: Paket Ngemil Sore Kopi Mantap"
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="promo-detail" className="text-xs font-semibold text-foreground">
                                        Detail Diskon / Keuntungan
                                    </Label>
                                    <Input
                                        id="promo-detail"
                                        value={discountDetail}
                                        onChange={(e) => setDiscountDetail(e.target.value)}
                                        placeholder="Contoh: Beli 2 Gratis 1, Diskon 15%"
                                        className="h-11"
                                    />
                                </div>

                                {/* Pilihan Ukuran Rasio Poster (MKT-02) */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Ukuran Poster Visual
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                                        <button
                                            type="button"
                                            onClick={() => setAspectRatio('1:1')}
                                            className={`rounded-xl border p-2.5 text-center cursor-pointer transition-all ${
                                                aspectRatio === '1:1'
                                                    ? 'border-primary bg-secondary text-primary ring-1 ring-primary'
                                                    : 'border-border bg-card text-muted-foreground'
                                            }`}
                                        >
                                            Persegi (Feed / WA) &bull; 1:1
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAspectRatio('9:16')}
                                            className={`rounded-xl border p-2.5 text-center cursor-pointer transition-all ${
                                                aspectRatio === '9:16'
                                                    ? 'border-primary bg-secondary text-primary ring-1 ring-primary'
                                                    : 'border-border bg-card text-muted-foreground'
                                            }`}
                                        >
                                            Vertikal (Story) &bull; 9:16
                                        </button>
                                    </div>
                                </div>

                                {/* Tema Warna Poster (design.md tokens) */}
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-foreground">
                                        Nuansa Warna Poster
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setColorTheme('deepgreen')}
                                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                                                colorTheme === 'deepgreen'
                                                    ? 'border-primary bg-[#174D3A] text-white'
                                                    : 'border-border text-foreground'
                                            }`}
                                        >
                                            <span className="size-3 rounded-full bg-[#174D3A]" />
                                            Deep Green
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setColorTheme('warmgold')}
                                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                                                colorTheme === 'warmgold'
                                                    ? 'border-lapak-gold bg-[#F6EBD5] text-[#8A5700]'
                                                    : 'border-border text-foreground'
                                            }`}
                                        >
                                            <span className="size-3 rounded-full bg-[#D8A75B]" />
                                            Muted Gold
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setColorTheme('freshsage')}
                                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                                                colorTheme === 'freshsage'
                                                    ? 'border-secondary bg-secondary text-primary'
                                                    : 'border-border text-foreground'
                                            }`}
                                        >
                                            <span className="size-3 rounded-full bg-[#A8BFA8]" />
                                            Sage Mist
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="button"
                                onClick={handleGenerateAI}
                                disabled={isGenerating}
                                className="w-full font-heading text-sm"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="size-4 animate-spin" />
                                        Meracik Poster & Caption...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="size-4" />
                                        Perbarui Desain & Tulisan AI
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Jadwal Kalender Konten Rekomendasi (MKT-07, MKT-08) */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Calendar className="size-4 text-primary" />
                                    <h3 className="font-heading text-sm font-bold text-foreground">
                                        Kalender Promosi Minggu Ini
                                    </h3>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-semibold">Otomatis AI</span>
                            </div>

                            <div className="space-y-2">
                                {weeklyCalendar.map((cal, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between rounded-xl border border-border p-2.5 text-xs bg-muted/20"
                                    >
                                        <div>
                                            <p className="font-bold text-foreground">{cal.day}: {cal.topic}</p>
                                            <p className="text-[11px] text-muted-foreground">Jam posting: {cal.time}</p>
                                        </div>
                                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-primary">
                                            {cal.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PRATINJAU POSTER & CAPTION (MKT-02, MKT-03, MKT-04) */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Poster Canvas Preview */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div className="flex items-center gap-2">
                                    <Eye className="size-4 text-primary" />
                                    <h3 className="font-heading text-base font-bold text-foreground">
                                        Pratinjau Poster Promosi
                                    </h3>
                                </div>
                                <span className="text-xs text-muted-foreground font-semibold">
                                    Rasio: {aspectRatio}
                                </span>
                            </div>

                            {/* Rendered Poster UI Container */}
                            <div className="flex items-center justify-center p-2 bg-muted/30 rounded-2xl">
                                <div
                                    className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-8 shadow-md transition-all text-white overflow-hidden ${
                                        aspectRatio === '1:1' ? 'w-full max-w-sm aspect-square' : 'w-full max-w-xs aspect-[9/16]'
                                    } ${
                                        colorTheme === 'deepgreen'
                                            ? 'bg-gradient-to-br from-[#174D3A] to-[#0D3024]'
                                            : colorTheme === 'warmgold'
                                            ? 'bg-gradient-to-br from-[#8A5700] to-[#5C3A00]'
                                            : 'bg-gradient-to-br from-[#2E5948] to-[#123C2D]'
                                    }`}
                                >
                                    {/* Poster Top Badge */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-7 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center">
                                                <Sparkles className="size-4 text-white" />
                                            </div>
                                            <span className="font-heading text-xs font-bold tracking-wide uppercase text-white/90">
                                                Warung Kopi Bu Rara
                                            </span>
                                        </div>
                                        <span className="rounded-full bg-[#D8A75B] text-[#183C30] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                                            Spesial Hari Ini
                                        </span>
                                    </div>

                                    {/* Poster Center Headline */}
                                    <div className="space-y-2 py-4">
                                        <p className="font-heading text-xl sm:text-2xl font-extrabold uppercase tracking-tight leading-tight drop-shadow-sm">
                                            {promoTitle}
                                        </p>
                                        <div className="inline-block rounded-xl bg-white/15 px-3 py-1.5 backdrop-blur-sm border border-white/20">
                                            <p className="font-heading text-sm sm:text-base font-bold text-[#F6EBD5]">
                                                {discountDetail}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Poster Footer Address & Contact */}
                                    <div className="border-t border-white/20 pt-3 text-[11px] text-white/80 space-y-0.5">
                                        <p className="font-bold text-white">Jl. Pasar Wonokromo No. 14, Surabaya</p>
                                        <p>Pesan Cepat via WhatsApp: 0812-3456-7890</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons for Poster */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleShare('Galeri HP')}
                                    className="font-heading text-xs"
                                >
                                    <Download className="size-4" />
                                    Unduh Gambar Poster
                                </Button>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShare('WhatsApp Status')}
                                        className="font-heading text-xs border-[#216E45] text-[#216E45] hover:bg-[#E4F3E8]"
                                    >
                                        <MessageCircle className="size-4" />
                                        Ke WhatsApp Status
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={() => handleShare('Instagram Feed')}
                                        className="font-heading text-xs"
                                    >
                                        <Instagram className="size-4" />
                                        Posting ke Instagram
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Caption & Hashtag Box (MKT-03) */}
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-3">
                                <div className="flex items-center gap-2">
                                    <Tag className="size-4 text-primary" />
                                    <h3 className="font-heading text-base font-bold text-foreground">
                                        Caption & Rekomendasi Hashtag
                                    </h3>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopyCaption}
                                    className="text-xs font-semibold text-primary"
                                >
                                    {copiedCaption ? (
                                        <>
                                            <Check className="size-3.5" />
                                            Tersalin!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-3.5" />
                                            Salin Caption
                                        </>
                                    )}
                                </Button>
                            </div>

                            <textarea
                                value={generatedCaption}
                                onChange={(e) => setGeneratedCaption(e.target.value)}
                                rows={6}
                                className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs leading-relaxed text-foreground outline-none focus:border-primary"
                            />

                            {/* Hashtag Chips */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] font-bold text-muted-foreground uppercase">
                                    Hashtag yang Disarankan AI:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    {hashtags.map((tag, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

PromosiIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Promosi Otomatis', href: '/promosi' },
    ],
};
