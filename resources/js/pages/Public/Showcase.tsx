import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    Clock,
    MapPin,
    MessageCircle,
    Minus,
    Plus,
    Search,
    Share2,
    ShoppingBag,
    Store,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    formatRupiah,
    generateWhatsAppLink,
    initialCategories,
    initialProducts,
    initialStoreProfile,
} from '../../data/mockProducts';
import { ProductItem, StoreProfile } from '../../types/product';

export default function Showcase() {
    const [store] = useState<StoreProfile>(initialStoreProfile);
    const [products] = useState<ProductItem[]>(initialProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [copiedToast, setCopiedToast] = useState(false);

    // Detail Modal State
    const [detailProduct, setDetailProduct] = useState<ProductItem | null>(
        null,
    );
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
        null,
    );

    // Filter produk yang AKTIF saja untuk pelanggan publik
    const publicProducts = useMemo(() => {
        return products.filter((p) => {
            if (!p.isActive) return false;
            if (selectedCategory !== 'Semua' && p.category !== selectedCategory)
                return false;
            if (
                searchQuery.trim() !== '' &&
                !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !p.description.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }
            return true;
        });
    }, [products, selectedCategory, searchQuery]);

    // Handle buka modal detail
    const handleOpenDetail = (p: ProductItem) => {
        setDetailProduct(p);
        setSelectedImageIdx(0);
        setQuantity(1);
        setSelectedVariantId(
            p.variants && p.variants.length > 0 ? p.variants[0].id : null,
        );
    };

    // Handle salin link etalase
    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedToast(true);
            setTimeout(() => setCopiedToast(false), 3000);
        });
    };

    // Hitung total harga pada detail modal
    const currentPrice = useMemo(() => {
        if (!detailProduct) return 0;
        let base = detailProduct.price;
        if (selectedVariantId && detailProduct.variants) {
            const v = detailProduct.variants.find(
                (item) => item.id === selectedVariantId,
            );
            if (v && v.priceOffset) {
                base += v.priceOffset;
            }
        }
        return base * quantity;
    }, [detailProduct, selectedVariantId, quantity]);

    // Link WhatsApp untuk pesan langsung
    const getWhatsAppUrl = (p: ProductItem, qty: number = 1) => {
        let nameWithVariant = p.name;
        if (selectedVariantId && p.variants) {
            const v = p.variants.find((item) => item.id === selectedVariantId);
            if (v) {
                nameWithVariant += ` (${v.name})`;
            }
        }
        return generateWhatsAppLink(
            store.whatsappNumber,
            store.whatsappTemplate,
            nameWithVariant,
            qty,
        );
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-sans text-slate-800 antialiased selection:bg-purple-100 selection:text-purple-700">
            <Head title={`${store.name} - Toko Online Resmi`} />

            {/* Top Bar Pengelola (Memudahkan Pemilik UMKM Kembali ke Admin) */}
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-xs text-white">
                <div className="flex items-center space-x-2">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400"></span>
                    <span className="font-medium text-slate-300">
                        Ini adalah pratinjau halaman tokomu yang dilihat
                        pelanggan
                    </span>
                </div>
                <Link
                    href="/produk"
                    className="inline-flex items-center space-x-1.5 font-semibold text-purple-300 transition hover:text-white"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Kembali ke Kelola Produk</span>
                </Link>
            </div>

            {/* Toast Salin Link */}
            {copiedToast && (
                <div className="fixed bottom-6 right-6 z-50 flex animate-bounce items-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Tautan etalase berhasil disalin ke clipboard!</span>
                </div>
            )}

            {/* Header Toko / Hero */}
            <header className="relative border-b border-slate-100 bg-white pb-6 pt-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
                        {/* Logo Toko */}
                        <div className="relative">
                            <img
                                src={store.logoUrl}
                                alt={store.name}
                                className="h-20 w-20 rounded-2xl object-cover shadow-md ring-4 ring-purple-100 sm:h-24 sm:w-24"
                            />
                            <span className="shadow-xs absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-emerald-500 p-1 text-white">
                                <Check className="h-3 w-3 stroke-[3]" />
                            </span>
                        </div>

                        {/* Info Toko */}
                        <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                                    {store.name}
                                </h1>
                                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-[#8b5cf6]">
                                    Buka Sekarang
                                </span>
                            </div>
                            <p className="mb-2 text-xs font-medium text-purple-700 sm:text-sm">
                                {store.tagline}
                            </p>
                            <p className="mb-3 max-w-2xl text-xs leading-relaxed text-slate-500">
                                {store.description}
                            </p>

                            {/* Alamat & Jam Buka */}
                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500 sm:justify-start">
                                <div className="flex items-center space-x-1">
                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{store.address}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    <span>{store.openingHours}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-[#8b5cf6]">
                                    <svg
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect
                                            width="20"
                                            height="20"
                                            x="2"
                                            y="2"
                                            rx="5"
                                            ry="5"
                                        />
                                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                        <line
                                            x1="17.5"
                                            x2="17.51"
                                            y1="6.5"
                                            y2="6.5"
                                        />
                                    </svg>
                                    <span>{store.instagram}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Aksi Toko */}
                        <div className="mt-2 flex w-full flex-col gap-2 sm:mt-0 sm:w-auto sm:flex-row">
                            <a
                                href={`https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(
                                    'Halo ' +
                                        store.name +
                                        ', saya ingin bertanya mengenai produk Anda.',
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="shadow-xs inline-flex min-h-[44px] items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>Chat Toko</span>
                            </a>
                            <button
                                onClick={handleCopyLink}
                                className="inline-flex min-h-[44px] items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
                            >
                                <Share2 className="h-4 w-4 text-slate-500" />
                                <span>Bagikan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Konten Produk Publik */}
            <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
                {/* Search & Kategori */}
                <div className="mb-6 space-y-3">
                    {/* Pencarian */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari makanan, sambal, camilan favoritmu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="shadow-2xs w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 transition focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm"
                        />
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Kategori Chips */}
                    <div className="scrollbar-none flex items-center space-x-2 overflow-x-auto pb-1">
                        {initialCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                                    selectedCategory === cat
                                        ? 'shadow-xs bg-[#8b5cf6] text-white'
                                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info Jumlah Hasil */}
                <div className="mb-4 flex items-center justify-between px-1 text-xs text-slate-500">
                    <span>
                        Menampilkan{' '}
                        <strong className="text-slate-800">
                            {publicProducts.length}
                        </strong>{' '}
                        menu tersedia
                    </span>
                    {selectedCategory !== 'Semua' && (
                        <button
                            onClick={() => setSelectedCategory('Semua')}
                            className="font-semibold text-[#8b5cf6] hover:underline"
                        >
                            Reset Kategori
                        </button>
                    )}
                </div>

                {/* Grid Produk Publik */}
                {publicProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5">
                        {publicProducts.map((p) => {
                            const isDiscount =
                                p.originalPrice && p.originalPrice > p.price;
                            const isOutOfStock = p.stock <= 0;

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => handleOpenDetail(p)}
                                    className="shadow-2xs group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:shadow-md"
                                >
                                    {/* Foto Produk */}
                                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                                        <img
                                            src={p.images[0]}
                                            alt={p.name}
                                            loading="lazy"
                                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        />
                                        {/* Badge Diskon */}
                                        {isDiscount && (
                                            <span className="shadow-xs absolute left-2 top-2 rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                                Hemat{' '}
                                                {formatRupiah(
                                                    (p.originalPrice || 0) -
                                                        p.price,
                                                )}
                                            </span>
                                        )}
                                        {/* Badge Stok Habis */}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px]">
                                                <span className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-bold text-slate-800">
                                                    Habis
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Produk */}
                                    <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                                        <div>
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-purple-600">
                                                {p.category}
                                            </span>
                                            <h3 className="mt-0.5 line-clamp-2 text-xs font-bold text-slate-800 transition group-hover:text-[#8b5cf6] sm:text-sm">
                                                {p.name}
                                            </h3>
                                            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-500">
                                                {p.description ||
                                                    'Pesan sekarang langsung lewat WhatsApp!'}
                                            </p>
                                        </div>

                                        {/* Harga & Tombol Pesan */}
                                        <div className="mt-3 flex flex-col gap-2 border-t border-slate-50 pt-2.5 sm:flex-row sm:items-center sm:justify-between">
                                            <div>
                                                {isDiscount && (
                                                    <span className="block text-[10px] text-slate-400 line-through">
                                                        {formatRupiah(
                                                            p.originalPrice ||
                                                                0,
                                                        )}
                                                    </span>
                                                )}
                                                <div className="text-xs font-bold text-purple-700 sm:text-sm">
                                                    {formatRupiah(p.price)}
                                                    <span className="ml-1 text-[10px] font-normal text-slate-400">
                                                        /{p.unit}
                                                    </span>
                                                </div>
                                            </div>

                                            <a
                                                href={
                                                    isOutOfStock
                                                        ? '#'
                                                        : getWhatsAppUrl(p, 1)
                                                }
                                                target={
                                                    isOutOfStock
                                                        ? undefined
                                                        : '_blank'
                                                }
                                                rel="noreferrer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (isOutOfStock)
                                                        e.preventDefault();
                                                }}
                                                className={`shadow-2xs inline-flex min-h-[38px] items-center justify-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                                                    isOutOfStock
                                                        ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                                                }`}
                                            >
                                                <MessageCircle className="h-3.5 w-3.5" />
                                                <span>Pesan</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* State Kosong Pencarian */
                    <div className="my-6 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                        <ShoppingBag className="mx-auto mb-2 h-10 w-10 text-slate-300" />
                        <h4 className="text-sm font-bold text-slate-800">
                            Menu tidak ditemukan
                        </h4>
                        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                            Tidak ada produk yang cocok dengan kata kunci &quot;
                            {searchQuery}&quot;. Coba cari kata kunci lain atau
                            reset filter.
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('Semua');
                            }}
                            className="mt-3 inline-flex items-center rounded-xl bg-purple-50 px-3.5 py-2 text-xs font-semibold text-[#8b5cf6] hover:bg-purple-100"
                        >
                            Reset Pencarian
                        </button>
                    </div>
                )}
            </main>

            {/* Footer Publik */}
            <footer className="mt-12 border-t border-slate-100 bg-white py-8 text-center text-xs text-slate-500">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="mb-2 flex items-center justify-center space-x-2 font-bold text-slate-800">
                        <Store className="h-4 w-4 text-[#8b5cf6]" />
                        <span>{store.name}</span>
                    </div>
                    <p className="mx-auto mb-4 max-w-md text-[11px] text-slate-400">
                        {store.address} • Kontak: +{store.whatsappNumber}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        Ditenagai oleh Platform Digital UMKM Indonesia
                    </p>
                </div>
            </footer>

            {/* ================= MODAL DETAIL PRODUK ================= */}
            {detailProduct && (
                <div
                    className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4"
                    onClick={() => setDetailProduct(null)}
                >
                    <div
                        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Tombol Tutup */}
                        <button
                            onClick={() => setDetailProduct(null)}
                            className="backdrop-blur-xs absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/40 text-white hover:bg-slate-900/70"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Galeri Gambar */}
                        <div className="aspect-4/3 relative w-full bg-slate-100">
                            <img
                                src={
                                    detailProduct.images[selectedImageIdx] ||
                                    detailProduct.images[0]
                                }
                                alt={detailProduct.name}
                                className="h-full w-full object-cover"
                            />
                            {detailProduct.images.length > 1 && (
                                <div className="backdrop-blur-xs absolute bottom-3 left-1/2 flex -translate-x-1/2 space-x-1.5 rounded-full bg-slate-900/50 px-2 py-1">
                                    {detailProduct.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() =>
                                                setSelectedImageIdx(i)
                                            }
                                            className={`h-2 rounded-full transition-all ${
                                                selectedImageIdx === i
                                                    ? 'w-5 bg-white'
                                                    : 'w-2 bg-white/50'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Konten Detail */}
                        <div className="max-h-[60vh] overflow-y-auto p-5">
                            <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600">
                                {detailProduct.category}
                            </span>
                            <h2 className="mt-1 text-base font-bold text-slate-800 sm:text-lg">
                                {detailProduct.name}
                            </h2>

                            {/* Harga */}
                            <div className="mt-2 flex items-baseline space-x-2">
                                <span className="text-lg font-extrabold text-purple-700">
                                    {formatRupiah(detailProduct.price)}
                                </span>
                                {detailProduct.originalPrice &&
                                    detailProduct.originalPrice >
                                        detailProduct.price && (
                                        <span className="text-xs text-slate-400 line-through">
                                            {formatRupiah(
                                                detailProduct.originalPrice,
                                            )}
                                        </span>
                                    )}
                                <span className="text-xs text-slate-500">
                                    per {detailProduct.unit}
                                </span>
                            </div>

                            {/* Pilihan Varian jika ada */}
                            {detailProduct.variants &&
                                detailProduct.variants.length > 0 && (
                                    <div className="mt-4 border-t border-slate-100 pt-3">
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Pilih Varian / Rasa:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {detailProduct.variants.map((v) => (
                                                <button
                                                    key={v.id}
                                                    onClick={() =>
                                                        setSelectedVariantId(
                                                            v.id,
                                                        )
                                                    }
                                                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                                                        selectedVariantId ===
                                                        v.id
                                                            ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]'
                                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {v.name}
                                                    {v.priceOffset
                                                        ? ` (+${formatRupiah(v.priceOffset)})`
                                                        : ''}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            {/* Deskripsi Lengkap */}
                            <div className="mt-4 border-t border-slate-100 pt-3">
                                <h4 className="mb-1 text-xs font-bold text-slate-700">
                                    Deskripsi Produk:
                                </h4>
                                <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">
                                    {detailProduct.description ||
                                        'Produk olahan spesial buatan tangan langsung dengan bahan-bahan berkualitas terbaik.'}
                                </p>
                            </div>

                            {/* Pilihan Jumlah Stepper */}
                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                <span className="text-xs font-bold text-slate-700">
                                    Jumlah Pesanan:
                                </span>
                                <div className="flex items-center space-x-2 rounded-xl border border-slate-200 p-1">
                                    <button
                                        onClick={() =>
                                            setQuantity((q) =>
                                                Math.max(1, q - 1),
                                            )
                                        }
                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
                                    >
                                        <Minus className="h-3.5 w-3.5" />
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-slate-800">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setQuantity((q) => q + 1)
                                        }
                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-95"
                                    >
                                        <Plus className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer / CTA Pesan WhatsApp */}
                        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 p-4">
                            <div>
                                <span className="block text-[10px] font-medium text-slate-400">
                                    Total Harga
                                </span>
                                <span className="text-base font-extrabold text-slate-800">
                                    {formatRupiah(currentPrice)}
                                </span>
                            </div>
                            <a
                                href={getWhatsAppUrl(detailProduct, quantity)}
                                target="_blank"
                                rel="noreferrer"
                                className="shadow-xs inline-flex min-h-[44px] flex-1 items-center justify-center space-x-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                            >
                                <MessageCircle className="h-4 w-4" />
                                <span>Pesan Sekarang via WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
