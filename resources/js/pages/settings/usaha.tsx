import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    RefreshCw,
    Save,
    ShieldCheck,
    Store,
    Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type BusinessProfileData = {
    name?: string;
    category?: string;
    address?: string;
    open_hours?: string;
    phone?: string;
    reminder_enabled?: boolean;
    reminder_time?: string;
};

type Props = {
    businessProfile?: BusinessProfileData | null;
};

export default function PengaturanUsaha({ businessProfile }: Props) {
    const [savedNotice, setSavedNotice] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [form, setForm] = useState({
        name: businessProfile?.name || '',
        category: businessProfile?.category || '',
        address: businessProfile?.address || '',
        openHours: businessProfile?.open_hours || '',
        whatsapp: businessProfile?.phone || '',
        qrisBank: '',
        reminderTime: businessProfile?.reminder_time || '20:30',
        reminderEnabled: businessProfile?.reminder_enabled ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        router.post(
            '/settings/usaha',
            {
                name: form.name,
                category: form.category,
                address: form.address,
                open_hours: form.openHours,
                phone: form.whatsapp,
                reminder_enabled: form.reminderEnabled,
                reminder_time: form.reminderTime,
            },
            {
                onSuccess: () => {
                    setIsSaving(false);
                    setSavedNotice(true);
                    setTimeout(() => setSavedNotice(false), 3000);
                },
                onError: () => {
                    setIsSaving(false);
                },
            }
        );
    };

    return (
        <>
            <Head title="Pengaturan Usaha - LAPAK UMKM" />

            <div className="w-full max-w-4xl space-y-8 py-2">
                <div className="border-b border-border/80 pb-5">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-0.5 text-xs font-bold text-primary mb-1.5">
                        <Store className="size-3.5" />
                        Profil Lapak Usaha
                    </div>
                    <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Profil & Data Lapak Usahamu
                    </h1>
                    <p className="text-sm text-lapak-body">
                        Informasi ini dipakai untuk analisis geodemografis pasar dan teks promosi otomatis.
                    </p>
                </div>

                {savedNotice && (
                    <div className="flex items-center gap-2 rounded-xl border border-[#216E45]/40 bg-[#E4F3E8] p-3.5 text-xs font-semibold text-[#216E45] animate-in fade-in duration-200">
                        <CheckCircle2 className="size-4 shrink-0" />
                        <span>Profil usaha berhasil disimpan dan disinkronkan ke asisten AI!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-5">
                        <h2 className="font-heading text-base font-bold text-foreground border-b border-border pb-3">
                            Informasi Dasar Toko
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="u-name" className="text-xs font-semibold">Nama Lapak / Toko</Label>
                                <Input
                                    id="u-name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Contoh: Warung Berkah Bu Siti"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="u-cat" className="text-xs font-semibold">Kategori Usaha</Label>
                                <Input
                                    id="u-cat"
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    placeholder="Contoh: Kuliner & Minuman"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="u-addr" className="text-xs font-semibold">Titik Lokasi / Alamat Lapak</Label>
                                <div className="relative">
                                    <Input
                                        id="u-addr"
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        placeholder="Contoh: Jl. Diponegoro No. 8, Wonokromo, Surabaya"
                                        className="pl-9"
                                        required
                                    />
                                    <MapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                    Menjadi acuan pengambilan data kepadatan warga dari BPS.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="u-hours" className="text-xs font-semibold">Jam Operasional</Label>
                                <div className="relative">
                                    <Input
                                        id="u-hours"
                                        value={form.openHours}
                                        onChange={(e) => setForm({ ...form, openHours: e.target.value })}
                                        placeholder="Contoh: 08:00 - 21:00 WIB"
                                        className="pl-9"
                                    />
                                    <Clock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="u-wa" className="text-xs font-semibold">Nomor WhatsApp Pesanan</Label>
                                <div className="relative">
                                    <Input
                                        id="u-wa"
                                        value={form.whatsapp}
                                        onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                                        placeholder="Contoh: 081234567890"
                                        className="pl-9"
                                    />
                                    <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pengingat Catat Harian */}
                    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-4">
                        <h2 className="font-heading text-base font-bold text-foreground border-b border-border pb-3">
                            Pengingat Catatan Keuangan Harian
                        </h2>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-heading text-sm font-bold text-foreground">
                                    Kirim Pengingat Catat Harian
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    LAPAK akan mengirim pesan sapaan ramah agar kamu tidak lupa mencatat penjualan hari ini.
                                </p>
                            </div>

                            <input
                                type="checkbox"
                                checked={form.reminderEnabled}
                                onChange={(e) => setForm({ ...form, reminderEnabled: e.target.checked })}
                                className="size-5 accent-primary cursor-pointer"
                            />
                        </div>

                        {form.reminderEnabled && (
                            <div className="max-w-xs space-y-1.5 pt-2">
                                <Label htmlFor="u-reminder-time" className="text-xs font-semibold">
                                    Waktu Pengingat Setiap Malam
                                </Label>
                                <Input
                                    id="u-reminder-time"
                                    type="time"
                                    value={form.reminderTime}
                                    onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button type="submit" size="lg" disabled={isSaving} className="font-heading">
                            {isSaving ? (
                                <>
                                    <RefreshCw className="size-4 animate-spin" />
                                    Menyimpan Perubahan...
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Simpan Perubahan Profil
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

PengaturanUsaha.layout = {
    breadcrumbs: [
        { title: 'Settings', href: '/settings/profile' },
        { title: 'Pengaturan Usaha', href: '/settings/usaha' },
    ],
};
