import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRight,
    Clock,
    MapPin,
    Phone,
    RefreshCw,
    ShieldCheck,
    Store,
    Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BusinessProfileData = {
    name?: string;
    category?: string;
    address?: string;
    price_range?: string;
    phone?: string;
    open_hours?: string;
};

type Props = {
    businessProfile?: BusinessProfileData | null;
    userPhone?: string | null;
};

export default function Onboarding({ businessProfile, userPhone }: Props) {
    const [name, setName] = useState(businessProfile?.name || '');
    const [category, setCategory] = useState(businessProfile?.category || '');
    const [address, setAddress] = useState(businessProfile?.address || '');
    const [priceRange, setPriceRange] = useState(businessProfile?.price_range || '');
    const [phone, setPhone] = useState(businessProfile?.phone || userPhone || '');
    const [openHours, setOpenHours] = useState(businessProfile?.open_hours || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!name.trim()) {
            setErrorMessage('Nama usaha tidak boleh kosong.');
            return;
        }

        if (!category) {
            setErrorMessage('Pilih jenis usaha tokomu.');
            return;
        }

        setIsSubmitting(true);

        router.post(
            '/onboarding',
            {
                name,
                category,
                address,
                price_range: priceRange,
                phone,
                open_hours: openHours,
            },
            {
                onError: (errors) => {
                    setIsSubmitting(false);
                    const firstErr = Object.values(errors)[0];
                    setErrorMessage(
                        typeof firstErr === 'string'
                            ? firstErr
                            : 'Gagal menyimpan profil usaha. Periksa data kembali.'
                    );
                },
                onFinish: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans selection:bg-secondary selection:text-primary">
            <Head title="Pengaturan Profil Usaha - LAPAK UMKM" />

            {/* Header Brand */}
            <header className="mx-auto flex w-full max-w-2xl items-center justify-between pb-6">
                <div className="flex items-center gap-2.5">
                    <img
                        src="/Logo Kanopi dan Grafik Naik.png"
                        alt="Logo LAPAK"
                        className="size-8 object-contain"
                        onError={(e) => {
                            e.currentTarget.src = '/logo-icon.png';
                        }}
                    />
                    <div className="flex flex-col text-left">
                        <span className="font-heading text-base font-bold text-foreground">LAPAK</span>
                        <span className="text-[10px] text-muted-foreground">Profil Lapak Usaha</span>
                    </div>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
                    <Store className="size-3.5" />
                    Langkah Awal Usahamu
                </div>
            </header>

            {/* Main Form Card */}
            <main className="mx-auto w-full max-w-2xl flex-1 flex flex-col justify-center py-4">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1 text-center sm:text-left">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary mb-2">
                                <Store className="size-3.5" />
                                Profil Lapak Usahamu
                            </div>
                            <h1 className="font-heading text-2xl font-bold text-foreground sm:text-3xl">
                                Kenalkan tokomu ke LAPAK
                            </h1>
                            <p className="text-sm text-lapak-body">
                                Data ini tersimpan di akun usahamu dan dipakai AI untuk menyesuaikan rekomendasi pasar serta materi promosi daganganmu.
                            </p>
                        </div>

                        {errorMessage && (
                            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                                {errorMessage}
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Nama Usaha */}
                            <div className="space-y-1.5">
                                <Label htmlFor="biz-name" className="text-sm font-semibold text-foreground">
                                    Nama Usaha / Warung <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="biz-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Warung Berkah Bu Siti"
                                    className="h-12"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Jenis Usaha */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-foreground">
                                    Jenis Usaha
                                </Label>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                    {[
                                        { id: 'kuliner', label: 'Kuliner & Minuman' },
                                        { id: 'kelontong', label: 'Kelontong / Sembako' },
                                        { id: 'fashion', label: 'Fashion & Pakaian' },
                                        { id: 'jasa', label: 'Jasa & Lainnya' },
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all cursor-pointer ${
                                                category === cat.id
                                                    ? 'border-primary bg-secondary text-primary ring-1 ring-primary'
                                                    : 'border-border bg-card hover:bg-muted/50 text-foreground'
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alamat Lapak */}
                            <div className="space-y-1.5">
                                <Label htmlFor="location" className="text-sm font-semibold text-foreground">
                                    Alamat / Titik Wilayah Usaha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="location"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Contoh: Jl. Diponegoro No. 8, Wonokromo, Surabaya"
                                        className="h-12 pl-10"
                                    />
                                    <MapPin className="absolute left-3.5 top-3.5 size-5 text-muted-foreground" />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Digunakan untuk menganalisis kepadatan warga dan tren pasar di sekitarmu.
                                </p>
                            </div>

                            {/* Nomor WhatsApp & Jam Operasional */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="biz-phone" className="text-sm font-semibold text-foreground">
                                        Nomor WhatsApp Usaha
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="biz-phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="08123456789"
                                            className="h-12 pl-10"
                                        />
                                        <Phone className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="open-hours" className="text-sm font-semibold text-foreground">
                                        Jam Operasional (Opsional)
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="open-hours"
                                            value={openHours}
                                            onChange={(e) => setOpenHours(e.target.value)}
                                            placeholder="Contoh: 07:00 - 21:00 WIB"
                                            className="h-12 pl-10"
                                        />
                                        <Clock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            {/* Rata-rata Harga Produk */}
                            <div className="space-y-1.5">
                                <Label htmlFor="price-range" className="text-sm font-semibold text-foreground">
                                    Rata-rata Harga Produk
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="price-range"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(e.target.value)}
                                        placeholder="Contoh: Rp5.000 - Rp30.000"
                                        className="h-12 pl-10"
                                    />
                                    <Tag className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/80">
                            <Link
                                href="/dashboard"
                                className="text-xs font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4"
                            >
                                Lewati untuk sekarang
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                size="lg"
                                className="w-full sm:w-auto font-heading text-base px-6"
                            >
                                {isSubmitting ? (
                                    <>
                                        <RefreshCw className="size-4 animate-spin" />
                                        Menyimpan Profil...
                                    </>
                                ) : (
                                    <>
                                        Simpan & Buka Dashboard
                                        <ArrowRight className="size-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Footer Assurance */}
            <footer className="mx-auto flex w-full max-w-2xl items-center justify-center gap-2 pt-4 text-xs text-muted-foreground text-center">
                <ShieldCheck className="size-4 text-[#216E45]" />
                <span>Seluruh data toko terenkripsi aman dan hanya dapat diakses oleh tokomu.</span>
            </footer>
        </div>
    );
}
