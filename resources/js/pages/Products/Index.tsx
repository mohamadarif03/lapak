import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    AlertTriangle,
    AlignLeft,
    BadgePercent,
    BookOpen,
    Check,
    CheckCircle2,
    ChevronDown,
    Copy,
    Edit2,
    ExternalLink,
    Eye,
    FileText,
    Gift,
    GraduationCap,
    Grid,
    Home,
    Lightbulb,
    LineChart,
    List,
    LogOut,
    Maximize,
    MessageCircle,
    Moon,
    Package,
    PackageCheck,
    PackageX,
    Plus,
    Search,
    Share2,
    ShoppingCart,
    Sparkles,
    Store,
    Trash2,
    Upload,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import AppSidebar from '@/Components/AppSidebar';
import {
    formatRupiah,
    generateWhatsAppLink,
    initialCategories,
    initialProducts,
    initialStoreProfile,
    isProductComplete,
} from '../../data/mockProducts';
import { ProductItem, StoreProfile } from '../../types/product';

// Checklist item kelengkapan etalase toko
interface ShowcaseChecklistItem {
    id: string;
    label: string;
    done: boolean;
    fixAction: string;
}

export default function ProductsIndex() {
    // Shell Layout State
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Data State (Tersimpan di client state untuk simulasi CRUD interaktif)
    const [products, setProducts] = useState<ProductItem[]>(initialProducts);
    const [categories, setCategories] = useState<string[]>(initialCategories);
    const [storeProfile, setStoreProfile] =
        useState<StoreProfile>(initialStoreProfile);

    // Filter, Search, Pagination & View State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [selectedStatus, setSelectedStatus] = useState<
        'Semua' | 'Aktif' | 'Nonaktif'
    >('Semua');
    const [selectedStock, setSelectedStock] = useState<
        'Semua' | 'Tersedia' | 'Menipis' | 'Habis'
    >('Semua');
    const [selectedCompleteness, setSelectedCompleteness] = useState<
        'Semua' | 'Lengkap' | 'Belum Lengkap'
    >('Semua');
    const [sortBy, setSortBy] = useState<
        'terbaru' | 'nama' | 'harga-rendah' | 'harga-tinggi' | 'terlaris'
    >('terbaru');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [visibleCount, setVisibleCount] = useState<number>(6);

    // Toast Feedback
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Modal Form State (Tambah / Edit)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
        null,
    );

    // Form Fields State
    const [formName, setFormName] = useState('');
    const [formCategory, setFormCategory] = useState('Makanan Berat');
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [showNewCategoryField, setShowNewCategoryField] = useState(false);
    const [formPrice, setFormPrice] = useState<number | ''>('');
    const [formOriginalPrice, setFormOriginalPrice] = useState<number | ''>('');
    const [formUnit, setFormUnit] = useState('porsi');
    const [formStock, setFormStock] = useState<number | ''>(10);
    const [formLowStock, setFormLowStock] = useState<number | ''>(5);
    const [formDescription, setFormDescription] = useState('');
    const [formImages, setFormImages] = useState<string[]>([]);
    const [formIsActive, setFormIsActive] = useState(true);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Modal Hapus Konfirmasi
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    // State Pengaturan WhatsApp
    const [waNumberInput, setWaNumberInput] = useState(
        storeProfile.whatsappNumber,
    );
    const [waTemplateInput, setWaTemplateInput] = useState(
        storeProfile.whatsappTemplate,
    );
    const [waError, setWaError] = useState('');

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Fullscreen API Helper
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    // -------------------------------------------------------------
    // STATISTIK KARTU RINGKASAN
    // -------------------------------------------------------------
    const stats = useMemo(() => {
        const total = products.length;
        const active = products.filter((p) => p.isActive).length;
        const lowOrOut = products.filter(
            (p) => p.stock <= p.lowStockThreshold,
        ).length;
        const incomplete = products.filter((p) => !isProductComplete(p)).length;
        return { total, active, lowOrOut, incomplete };
    }, [products]);

    // -------------------------------------------------------------
    // KELENGKAPAN ETALASE (Checklist)
    // -------------------------------------------------------------
    const showcaseChecklist: ShowcaseChecklistItem[] = useMemo(() => {
        const has5Products = products.length >= 5;
        const allHaveImages =
            products.length > 0 && products.every((p) => p.images.length > 0);
        const allHavePriceAndDesc =
            products.length > 0 &&
            products.every(
                (p) => p.price > 0 && p.description.trim().length >= 15,
            );
        const waActive =
            storeProfile.whatsappNumber.startsWith('62') &&
            storeProfile.whatsappNumber.length >= 10;

        return [
            {
                id: '1',
                label: 'Logo dan kontak toko terisi lengkap',
                done: true,
                fixAction: 'Edit Profil',
            },
            {
                id: '2',
                label: 'Minimal 5 produk terdaftar di etalase',
                done: has5Products,
                fixAction: 'Tambah Produk',
            },
            {
                id: '3',
                label: 'Semua produk memiliki foto yang jelas',
                done: allHaveImages,
                fixAction: 'Cek Foto Produk',
            },
            {
                id: '4',
                label: 'Semua produk memiliki harga dan deskripsi lengkap',
                done: allHavePriceAndDesc,
                fixAction: 'Lengkapi Info',
            },
            {
                id: '5',
                label: 'Tombol pesan WhatsApp sudah aktif dan teruji',
                done: waActive,
                fixAction: 'Cek Nomor WhatsApp',
            },
        ];
    }, [products, storeProfile]);

    const completedChecklistCount = showcaseChecklist.filter(
        (item) => item.done,
    ).length;
    const completenessPercent = Math.round(
        (completedChecklistCount / showcaseChecklist.length) * 100,
    );

    // -------------------------------------------------------------
    // FILTER, PENCARIAN & SORTING PRODUK
    // -------------------------------------------------------------
    const filteredProducts = useMemo(() => {
        return products
            .filter((p) => {
                // Search nama & deskripsi
                if (
                    searchQuery.trim() !== '' &&
                    !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                    !p.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                ) {
                    return false;
                }
                // Kategori
                if (
                    selectedCategory !== 'Semua' &&
                    p.category !== selectedCategory
                ) {
                    return false;
                }
                // Status Aktif/Nonaktif
                if (selectedStatus === 'Aktif' && !p.isActive) return false;
                if (selectedStatus === 'Nonaktif' && p.isActive) return false;
                // Stok
                if (
                    selectedStock === 'Tersedia' &&
                    p.stock <= p.lowStockThreshold
                )
                    return false;
                if (
                    selectedStock === 'Menipis' &&
                    (p.stock <= 0 || p.stock > p.lowStockThreshold)
                )
                    return false;
                if (selectedStock === 'Habis' && p.stock > 0) return false;
                // Kelengkapan
                const complete = isProductComplete(p);
                if (selectedCompleteness === 'Lengkap' && !complete)
                    return false;
                if (selectedCompleteness === 'Belum Lengkap' && complete)
                    return false;

                return true;
            })
            .sort((a, b) => {
                if (sortBy === 'terbaru') return b.id - a.id;
                if (sortBy === 'nama') return a.name.localeCompare(b.name);
                if (sortBy === 'harga-rendah') return a.price - b.price;
                if (sortBy === 'harga-tinggi') return b.price - a.price;
                if (sortBy === 'terlaris') return b.soldCount - a.soldCount;
                return 0;
            });
    }, [
        products,
        searchQuery,
        selectedCategory,
        selectedStatus,
        selectedStock,
        selectedCompleteness,
        sortBy,
    ]);

    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    // -------------------------------------------------------------
    // AKSI PER PRODUK (Toggle, Duplikat, Hapus)
    // -------------------------------------------------------------
    const handleToggleStatus = (id: number) => {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, isActive: !p.isActive } : p,
            ),
        );
        showToast('Status produk berhasil diperbarui');
    };

    const handleDuplicateProduct = (p: ProductItem) => {
        const copy: ProductItem = {
            ...p,
            id: Date.now(),
            name: `${p.name} (Salinan)`,
            soldCount: 0,
            createdAt: new Date().toISOString().split('T')[0],
        };
        setProducts((prev) => [copy, ...prev]);
        showToast(`Produk "${p.name}" berhasil digandakan`);
    };

    const handleDeleteProduct = (id: number) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        setDeleteConfirmId(null);
        showToast('Produk berhasil dihapus');
    };

    // -------------------------------------------------------------
    // AKSI MASAL (Desktop)
    // -------------------------------------------------------------
    const handleSelectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map((p) => p.id));
        }
    };

    const handleToggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id],
        );
    };

    const handleBulkActivate = (active: boolean) => {
        setProducts((prev) =>
            prev.map((p) =>
                selectedIds.includes(p.id) ? { ...p, isActive: active } : p,
            ),
        );
        showToast(
            `${selectedIds.length} produk di-${active ? 'aktifkan' : 'nonaktifkan'}`,
        );
        setSelectedIds([]);
    };

    const handleBulkDelete = () => {
        if (
            confirm(
                `Yakin ingin menghapus ${selectedIds.length} produk yang dipilih?`,
            )
        ) {
            setProducts((prev) =>
                prev.filter((p) => !selectedIds.includes(p.id)),
            );
            setSelectedIds([]);
            showToast('Produk terpilih berhasil dihapus');
        }
    };

    // -------------------------------------------------------------
    // FORM TAMBAH / EDIT PRODUK
    // -------------------------------------------------------------
    const openAddModal = () => {
        setEditingProduct(null);
        setFormName('');
        setFormCategory(categories[1] || 'Makanan Berat');
        setFormPrice('');
        setFormOriginalPrice('');
        setFormUnit('porsi');
        setFormStock(10);
        setFormLowStock(5);
        setFormDescription('');
        setFormImages([
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        ]);
        setFormIsActive(true);
        setFormErrors({});
        setShowNewCategoryField(false);
        setIsFormOpen(true);
    };

    const openEditModal = (p: ProductItem) => {
        setEditingProduct(p);
        setFormName(p.name);
        setFormCategory(p.category);
        setFormPrice(p.price);
        setFormOriginalPrice(p.originalPrice || '');
        setFormUnit(p.unit);
        setFormStock(p.stock);
        setFormLowStock(p.lowStockThreshold);
        setFormDescription(p.description);
        setFormImages([...p.images]);
        setFormIsActive(p.isActive);
        setFormErrors({});
        setShowNewCategoryField(false);
        setIsFormOpen(true);
    };

    // Live Check Kelengkapan pada Form
    const liveFormCompleteness = useMemo(() => {
        const hasPhoto = formImages.length > 0;
        const hasName = formName.trim().length > 0;
        const hasCategory = formCategory.trim().length > 0;
        const hasPrice = typeof formPrice === 'number' && formPrice > 0;
        const hasDesc = formDescription.trim().length >= 15;
        const hasStock = typeof formStock === 'number' && formStock >= 0;

        return {
            hasPhoto,
            hasName,
            hasCategory,
            hasPrice,
            hasDesc,
            hasStock,
            percent: Math.round(
                ([
                    hasPhoto,
                    hasName,
                    hasCategory,
                    hasPrice,
                    hasDesc,
                    hasStock,
                ].filter(Boolean).length /
                    6) *
                    100,
            ),
        };
    }, [
        formImages,
        formName,
        formCategory,
        formPrice,
        formDescription,
        formStock,
    ]);

    // Tambah foto dummy cepat (simulasi upload)
    const handleAddMockPhoto = () => {
        if (formImages.length >= 5) {
            alert('Maksimal 5 foto per produk');
            return;
        }
        const sampleImages = [
            'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        ];
        const nextImg = sampleImages[formImages.length % sampleImages.length];
        setFormImages([...formImages, nextImg]);
    };

    // Placeholder AI Copywriter
    const handleGenerateAiDescription = () => {
        if (!formName.trim()) {
            alert(
                'Ketik nama produk terlebih dahulu agar Asisten AI dapat menuliskan deskripsi.',
            );
            return;
        }
        setIsAiLoading(true);
        // Simulasi respon asisten AI (akan dihubungkan ke OpenAI/Gemini di tahap berikutnya)
        setTimeout(() => {
            setFormDescription(
                `${formName} dimasak dengan resep otentik warisan keluarga, menggunakan rempah pilihan segar tanpa bahan pengawet buatan. Rasanya gurih lezat dan cocok dinikmati bersama keluarga tercinta. Higienis, halal, dan siap saji!`,
            );
            setIsAiLoading(false);
            showToast('Deskripsi produk berhasil dibuatkan oleh Asisten AI!');
        }, 800);
    };

    const handleSaveProduct = (keepOpenAfterSave: boolean = false) => {
        const errors: Record<string, string> = {};
        if (!formName.trim()) errors.name = 'Nama produk wajib diisi.';
        if (!formPrice || formPrice <= 0)
            errors.price = 'Harga jual wajib diisi dengan benar.';
        if (formStock === '' || formStock < 0)
            errors.stock = 'Jumlah stok tidak boleh kosong.';

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const categoryToUse =
            showNewCategoryField && newCategoryInput.trim()
                ? newCategoryInput.trim()
                : formCategory;
        if (
            showNewCategoryField &&
            newCategoryInput.trim() &&
            !categories.includes(newCategoryInput.trim())
        ) {
            setCategories([...categories, newCategoryInput.trim()]);
        }

        if (editingProduct) {
            // Update
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === editingProduct.id
                        ? {
                              ...p,
                              name: formName.trim(),
                              category: categoryToUse,
                              price: Number(formPrice),
                              originalPrice: formOriginalPrice
                                  ? Number(formOriginalPrice)
                                  : undefined,
                              unit: formUnit,
                              stock: Number(formStock),
                              lowStockThreshold: Number(formLowStock) || 5,
                              description: formDescription.trim(),
                              images:
                                  formImages.length > 0
                                      ? formImages
                                      : [
                                            'https://placehold.co/400x400/8b5cf6/ffffff?text=Produk',
                                        ],
                              isActive: formIsActive,
                          }
                        : p,
                ),
            );
            showToast('Perubahan produk berhasil disimpan!');
        } else {
            // Tambah Baru
            const newProd: ProductItem = {
                id: Date.now(),
                name: formName.trim(),
                category: categoryToUse,
                price: Number(formPrice),
                originalPrice: formOriginalPrice
                    ? Number(formOriginalPrice)
                    : undefined,
                unit: formUnit,
                stock: Number(formStock),
                lowStockThreshold: Number(formLowStock) || 5,
                description: formDescription.trim(),
                images:
                    formImages.length > 0
                        ? formImages
                        : [
                              'https://placehold.co/400x400/8b5cf6/ffffff?text=Produk',
                          ],
                isActive: formIsActive,
                soldCount: 0,
                createdAt: new Date().toISOString().split('T')[0],
            };
            setProducts((prev) => [newProd, ...prev]);
            showToast('Produk baru berhasil ditambahkan!');
        }

        if (keepOpenAfterSave) {
            openAddModal();
        } else {
            setIsFormOpen(false);
        }
    };

    // -------------------------------------------------------------
    // PENGATURAN WHATSAPP
    // -------------------------------------------------------------
    const handleSaveWhatsAppConfig = () => {
        const clean = waNumberInput.replace(/[^0-9]/g, '');
        if (!clean.startsWith('62') || clean.length < 10) {
            setWaError(
                'Nomor WhatsApp harus berawalan 62 dan minimal 10 digit (contoh: 6281234567890).',
            );
            return;
        }
        setWaError('');
        setStoreProfile((prev) => ({
            ...prev,
            whatsappNumber: clean,
            whatsappTemplate: waTemplateInput,
        }));
        showToast('Pengaturan tombol pesan WhatsApp berhasil disimpan!');
    };

    // Preview URL WhatsApp Test
    const waTestUrl = useMemo(() => {
        const sampleProd = products[0] ? products[0].name : 'Contoh Menu';
        return generateWhatsAppLink(
            waNumberInput,
            waTemplateInput,
            sampleProd,
            2,
        );
    }, [waNumberInput, waTemplateInput, products]);

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb] font-sans text-slate-700 antialiased">
            <Head title="Produk dan Etalase - Lapak UMKM" />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="flex h-screen overflow-hidden">
                <AppSidebar
                    current="produk"
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    counts={{ products: products.length }}
                    onShowToast={showToast}
                />

                {/* ================= MAIN CONTENT AREA ================= */}
                <div className="flex h-screen flex-1 flex-col overflow-hidden">
                    {/* Top Navbar */}
                    <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <button
                                onClick={() => setSidebarOpen((prev) => !prev)}
                                className="rounded-lg p-1 text-slate-500 hover:text-slate-800"
                                title="Buka/Tutup Menu"
                            >
                                <AlignLeft className="h-5 w-5" />
                            </button>
                            <div className="relative w-48 sm:w-72">
                                <input
                                    type="text"
                                    placeholder="Cari menu, harga, kategori..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-slate-200/80 bg-slate-50/70 py-1.5 pl-3.5 pr-9 text-xs text-slate-700 placeholder-slate-400 transition focus:border-purple-400 focus:bg-white focus:outline-none"
                                />
                                <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 sm:space-x-2.5">
                            <button
                                onClick={toggleFullscreen}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-100 text-slate-600 transition hover:bg-slate-50"
                                title="Layar Penuh"
                            >
                                <Maximize className="h-4 w-4" />
                            </button>
                            <div className="flex items-center space-x-2 pl-1">
                                <img
                                    src={storeProfile.logoUrl}
                                    alt="Ibu Siti"
                                    className="h-7 w-7 rounded-full border border-slate-200 object-cover"
                                />
                                <span className="hidden text-xs font-semibold text-slate-700 md:inline-block">
                                    Ibu Siti
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* Scrollable Body */}
                    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                        {/* ================= BAGIAN 1: HEADER HALAMAN ================= */}
                        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                    Produk dan Etalase
                                </h1>
                                <p className="text-xs font-medium text-slate-500">
                                    Kelola daftar produk usahamu dan bagikan
                                    halaman toko online ke pembeli
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Tombol Bagikan Tautan */}
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/etalase`;
                                        navigator.clipboard.writeText(url);
                                        showToast(
                                            'Tautan etalase berhasil disalin ke clipboard!',
                                        );
                                    }}
                                    className="shadow-2xs active:scale-98 inline-flex min-h-[40px] items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                                    <span>Bagikan</span>
                                </button>

                                {/* Tombol Lihat Etalase Publik */}
                                <Link
                                    href="/etalase"
                                    target="_blank"
                                    className="shadow-2xs active:scale-98 inline-flex min-h-[40px] items-center space-x-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-[#8b5cf6] transition hover:bg-purple-100"
                                >
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>Lihat Etalase</span>
                                    <ExternalLink className="ml-0.5 h-3 w-3 text-purple-400" />
                                </Link>

                                {/* Tombol Utama: + Produk Baru */}
                                <button
                                    onClick={openAddModal}
                                    className="shadow-xs active:scale-98 inline-flex min-h-[40px] items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>+ Produk Baru</span>
                                </button>
                            </div>
                        </div>

                        {/* ================= BAGIAN 2: KARTU RINGKASAN (4 KARTU) ================= */}
                        <div className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
                            {/* Kartu 1: Total Produk */}
                            <div className="shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-4">
                                <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#8b5cf6]"></div>
                                <div className="pl-1.5">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Total Produk
                                        </p>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
                                            <Package className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                        {stats.total} Produk
                                    </h3>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Terdaftar di tokomu
                                    </p>
                                </div>
                            </div>

                            {/* Kartu 2: Produk Aktif */}
                            <div className="shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-4">
                                <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-[#10b981]"></div>
                                <div className="pl-1.5">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Produk Aktif
                                        </p>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                            <PackageCheck className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                        {stats.active} Produk
                                    </h3>
                                    <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                                        Tampil di etalase pembeli
                                    </p>
                                </div>
                            </div>

                            {/* Kartu 3: Stok Menipis / Habis */}
                            <div className="shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-4">
                                <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-pink-500"></div>
                                <div className="pl-1.5">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Stok Menipis/Habis
                                        </p>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                                            <PackageX className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                        {stats.lowOrOut} Produk
                                    </h3>
                                    <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                        Perlu tambah persediaan
                                    </p>
                                </div>
                            </div>

                            {/* Kartu 4: Produk Belum Lengkap */}
                            <div className="shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-100 bg-white p-4">
                                <div className="absolute bottom-3 left-0 top-3 w-1 rounded-r-full bg-amber-400"></div>
                                <div className="pl-1.5">
                                    <div className="mb-1 flex items-center justify-between">
                                        <p className="text-xs font-semibold text-slate-500">
                                            Belum Lengkap
                                        </p>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                            <AlertTriangle className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                        {stats.incomplete} Produk
                                    </h3>
                                    <p className="mt-1 text-[11px] font-semibold text-amber-600">
                                        Perlu foto / deskripsi
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ================= BAGIAN 3: KELENGKAPAN ETALASE (PROGRES BAR & CHECKLIST) ================= */}
                        {completenessPercent < 100 && (
                            <div className="shadow-2xs mb-6 rounded-xl border border-purple-100 bg-white p-5">
                                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-sm font-bold text-slate-800">
                                                Kelengkapan Etalase Toko
                                            </h3>
                                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-[#8b5cf6]">
                                                {completenessPercent}% Lengkap
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            Lengkapi toko online-mu agar pembeli
                                            percaya dan mudah memesan
                                        </p>
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">
                                        {completedChecklistCount} dari{' '}
                                        {showcaseChecklist.length} langkah
                                        terpenuhi
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-emerald-500 transition-all duration-500"
                                        style={{
                                            width: `${completenessPercent}%`,
                                        }}
                                    ></div>
                                </div>

                                {/* Checklist Items */}
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                    {showcaseChecklist.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center justify-between rounded-xl border p-2.5 transition ${
                                                item.done
                                                    ? 'border-emerald-100 bg-emerald-50/30 text-slate-700'
                                                    : 'border-slate-200/80 bg-white text-slate-700'
                                            }`}
                                        >
                                            <div className="flex min-w-0 items-center space-x-2 pr-2">
                                                <div
                                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded ${
                                                        item.done
                                                            ? 'bg-emerald-600 text-white'
                                                            : 'border border-slate-300 bg-white'
                                                    }`}
                                                >
                                                    {item.done && (
                                                        <Check className="h-3 w-3 stroke-[3]" />
                                                    )}
                                                </div>
                                                <span
                                                    className={`truncate text-xs ${
                                                        item.done
                                                            ? 'text-slate-400 line-through'
                                                            : 'font-medium'
                                                    }`}
                                                >
                                                    {item.label}
                                                </span>
                                            </div>

                                            {!item.done && (
                                                <button
                                                    onClick={() => {
                                                        if (
                                                            item.id === '2' ||
                                                            item.id === '3' ||
                                                            item.id === '4'
                                                        ) {
                                                            openAddModal();
                                                        } else {
                                                            // Scroll ke panel WhatsApp
                                                            document
                                                                .getElementById(
                                                                    'waSettingsCard',
                                                                )
                                                                ?.scrollIntoView(
                                                                    {
                                                                        behavior:
                                                                            'smooth',
                                                                    },
                                                                );
                                                        }
                                                    }}
                                                    className="shrink-0 rounded bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 hover:underline"
                                                >
                                                    {item.fixAction}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ================= BAGIAN 4: PENCARIAN, FILTER, DAN TAMPILAN ================= */}
                        <div className="shadow-2xs mb-4 space-y-3 rounded-xl border border-slate-100 bg-white p-4">
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                {/* Search Bar */}
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        placeholder="Cari nama produk atau deskripsi..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 py-2 pl-9 pr-4 text-xs text-slate-700 placeholder-slate-400 transition focus:border-purple-400 focus:bg-white focus:outline-none"
                                    />
                                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Filter Controls Row */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Kategori Dropdown */}
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) =>
                                            setSelectedCategory(e.target.value)
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-purple-400 focus:outline-none"
                                    >
                                        {categories.map((c) => (
                                            <option key={c} value={c}>
                                                {c === 'Semua'
                                                    ? 'Semua Kategori'
                                                    : c}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Status Filter */}
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(
                                                e.target.value as
                                                    | 'Semua'
                                                    | 'Aktif'
                                                    | 'Nonaktif',
                                            )
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-purple-400 focus:outline-none"
                                    >
                                        <option value="Semua">
                                            Semua Status
                                        </option>
                                        <option value="Aktif">
                                            Hanya Aktif
                                        </option>
                                        <option value="Nonaktif">
                                            Hanya Nonaktif
                                        </option>
                                    </select>

                                    {/* Stok Filter */}
                                    <select
                                        value={selectedStock}
                                        onChange={(e) =>
                                            setSelectedStock(
                                                e.target.value as
                                                    | 'Semua'
                                                    | 'Tersedia'
                                                    | 'Menipis'
                                                    | 'Habis',
                                            )
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-purple-400 focus:outline-none"
                                    >
                                        <option value="Semua">
                                            Semua Stok
                                        </option>
                                        <option value="Tersedia">
                                            Stok Tersedia
                                        </option>
                                        <option value="Menipis">
                                            Stok Menipis (&lt;=5)
                                        </option>
                                        <option value="Habis">
                                            Stok Habis (0)
                                        </option>
                                    </select>

                                    {/* Pengurutan */}
                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(
                                                e.target.value as
                                                    | 'terbaru'
                                                    | 'nama'
                                                    | 'harga-rendah'
                                                    | 'harga-tinggi'
                                                    | 'terlaris',
                                            )
                                        }
                                        className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-purple-400 focus:outline-none"
                                    >
                                        <option value="terbaru">
                                            Urutkan: Terbaru
                                        </option>
                                        <option value="terlaris">
                                            Urutkan: Paling Laris
                                        </option>
                                        <option value="harga-rendah">
                                            Harga: Termurah
                                        </option>
                                        <option value="harga-tinggi">
                                            Harga: Termahal
                                        </option>
                                        <option value="nama">
                                            Nama (A - Z)
                                        </option>
                                    </select>

                                    {/* Toggle Grid / List View */}
                                    <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`rounded-lg p-1.5 transition ${
                                                viewMode === 'grid'
                                                    ? 'shadow-xs bg-[#8b5cf6] text-white'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                            title="Tampilan Grid Kartu"
                                        >
                                            <Grid className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`rounded-lg p-1.5 transition ${
                                                viewMode === 'list'
                                                    ? 'shadow-xs bg-[#8b5cf6] text-white'
                                                    : 'text-slate-500 hover:text-slate-800'
                                            }`}
                                            title="Tampilan Tabel List"
                                        >
                                            <List className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ================= BAGIAN 6: AKSI MASAL (DESKTOP) ================= */}
                            {selectedIds.length > 0 && (
                                <div className="animate-fade-in flex flex-wrap items-center justify-between gap-2 rounded-xl border border-purple-200 bg-purple-50/80 p-2.5 text-xs">
                                    <div className="flex items-center space-x-2">
                                        <span className="font-bold text-purple-900">
                                            {selectedIds.length} produk terpilih
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <button
                                            onClick={() =>
                                                handleBulkActivate(true)
                                            }
                                            className="shadow-xs rounded-lg bg-emerald-600 px-3 py-1 font-semibold text-white transition hover:bg-emerald-700"
                                        >
                                            Aktifkan
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleBulkActivate(false)
                                            }
                                            className="shadow-xs rounded-lg bg-slate-700 px-3 py-1 font-semibold text-white transition hover:bg-slate-800"
                                        >
                                            Nonaktifkan
                                        </button>
                                        <button
                                            onClick={handleBulkDelete}
                                            className="shadow-xs rounded-lg bg-rose-600 px-3 py-1 font-semibold text-white transition hover:bg-rose-700"
                                        >
                                            Hapus Terpilih
                                        </button>
                                        <button
                                            onClick={() => setSelectedIds([])}
                                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-600 hover:bg-slate-50"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ================= BAGIAN 5: DAFTAR PRODUK (GRID / LIST) ================= */}
                        {filteredProducts.length > 0 ? (
                            <>
                                {viewMode === 'grid' ? (
                                    /* TAMPILAN GRID */
                                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {paginatedProducts.map((p) => {
                                            const complete =
                                                isProductComplete(p);
                                            const isLow =
                                                p.stock > 0 &&
                                                p.stock <= p.lowStockThreshold;
                                            const isOut = p.stock <= 0;
                                            const isSelected =
                                                selectedIds.includes(p.id);

                                            return (
                                                <div
                                                    key={p.id}
                                                    className={`shadow-2xs relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-white p-4 transition hover:shadow-md ${
                                                        isSelected
                                                            ? 'border-purple-300 ring-2 ring-[#8b5cf6]'
                                                            : 'border-slate-100'
                                                    }`}
                                                >
                                                    <div>
                                                        {/* Header Kartu: Checkbox & Status */}
                                                        <div className="mb-2.5 flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        isSelected
                                                                    }
                                                                    onChange={() =>
                                                                        handleToggleSelect(
                                                                            p.id,
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-slate-300 text-[#8b5cf6] focus:ring-purple-400"
                                                                />
                                                                <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-600">
                                                                    {p.category}
                                                                </span>
                                                            </div>

                                                            {/* Switch Aktif / Nonaktif */}
                                                            <button
                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        p.id,
                                                                    )
                                                                }
                                                                className={`flex items-center space-x-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
                                                                    p.isActive
                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                        : 'bg-slate-100 text-slate-500'
                                                                }`}
                                                                title="Klik untuk mengubah status produk"
                                                            >
                                                                <span
                                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                                        p.isActive
                                                                            ? 'bg-emerald-500'
                                                                            : 'bg-slate-400'
                                                                    }`}
                                                                ></span>
                                                                <span>
                                                                    {p.isActive
                                                                        ? 'Aktif'
                                                                        : 'Nonaktif'}
                                                                </span>
                                                            </button>
                                                        </div>

                                                        {/* Foto & Info Utama */}
                                                        <div className="mb-3 flex space-x-3">
                                                            <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                                                <img
                                                                    src={
                                                                        p
                                                                            .images[0] ||
                                                                        'https://placehold.co/100x100/8b5cf6/ffffff?text=P'
                                                                    }
                                                                    alt={p.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                                {p.images
                                                                    .length >
                                                                    1 && (
                                                                    <span className="py-0.2 absolute bottom-1 right-1 rounded bg-slate-900/60 px-1 text-[9px] font-bold text-white">
                                                                        {
                                                                            p
                                                                                .images
                                                                                .length
                                                                        }{' '}
                                                                        foto
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <h3 className="line-clamp-2 text-xs font-bold leading-snug text-slate-800 sm:text-sm">
                                                                    {p.name}
                                                                </h3>
                                                                <div className="mt-1 flex items-baseline space-x-1.5">
                                                                    <span className="text-sm font-extrabold text-purple-700">
                                                                        {formatRupiah(
                                                                            p.price,
                                                                        )}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400">
                                                                        /
                                                                        {p.unit}
                                                                    </span>
                                                                </div>

                                                                {/* Badges Stok & Kelengkapan */}
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {isOut && (
                                                                        <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-600">
                                                                            Stok
                                                                            Habis
                                                                        </span>
                                                                    )}
                                                                    {isLow && (
                                                                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">
                                                                            Sisa{' '}
                                                                            {
                                                                                p.stock
                                                                            }{' '}
                                                                            {
                                                                                p.unit
                                                                            }
                                                                        </span>
                                                                    )}
                                                                    {!isOut &&
                                                                        !isLow && (
                                                                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                                                                                Stok{' '}
                                                                                {
                                                                                    p.stock
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    {!complete && (
                                                                        <span className="flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                                                                            <AlertCircle className="mr-0.5 h-2.5 w-2.5" />
                                                                            Belum
                                                                            Lengkap
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {p.description && (
                                                            <p className="mb-3 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                                                                {p.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Footer Aksi Produk */}
                                                    <div className="mt-2 flex items-center justify-between gap-1 border-t border-slate-100 pt-2.5 text-xs">
                                                        {/* Tombol Buat Konten */}
                                                        {/* TODO: Tautkan ke generator konten & promosi UMKM */}
                                                        <a
                                                            href="#"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                showToast(
                                                                    `Fitur konten promosi untuk "${p.name}" akan hadir di tahap berikutnya!`,
                                                                );
                                                            }}
                                                            className="inline-flex items-center space-x-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800"
                                                            title="Buat materi promosi WhatsApp/Instagram untuk menu ini"
                                                        >
                                                            <Sparkles className="h-3 w-3 text-amber-500" />
                                                            <span>
                                                                Buat Konten
                                                            </span>
                                                        </a>

                                                        <div className="flex items-center space-x-1">
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        p,
                                                                    )
                                                                }
                                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                                                title="Ubah Produk"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleDuplicateProduct(
                                                                        p,
                                                                    )
                                                                }
                                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                                                title="Gandakan Produk"
                                                            >
                                                                <Copy className="h-3.5 w-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    setDeleteConfirmId(
                                                                        p.id,
                                                                    )
                                                                }
                                                                className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                                                                title="Hapus Produk"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* TAMPILAN LIST / TABEL */
                                    <div className="shadow-2xs mb-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                                        <table className="w-full text-left text-xs text-slate-700">
                                            <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase text-slate-500">
                                                <tr>
                                                    <th className="w-8 p-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                selectedIds.length ===
                                                                    filteredProducts.length &&
                                                                filteredProducts.length >
                                                                    0
                                                            }
                                                            onChange={
                                                                handleSelectAll
                                                            }
                                                            className="rounded border-slate-300 text-[#8b5cf6]"
                                                        />
                                                    </th>
                                                    <th className="p-3">
                                                        Produk
                                                    </th>
                                                    <th className="p-3">
                                                        Kategori
                                                    </th>
                                                    <th className="p-3">
                                                        Harga
                                                    </th>
                                                    <th className="p-3">
                                                        Stok
                                                    </th>
                                                    <th className="p-3">
                                                        Status
                                                    </th>
                                                    <th className="p-3 text-right">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {paginatedProducts.map((p) => (
                                                    <tr
                                                        key={p.id}
                                                        className="transition hover:bg-slate-50/60"
                                                    >
                                                        <td className="p-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.includes(
                                                                    p.id,
                                                                )}
                                                                onChange={() =>
                                                                    handleToggleSelect(
                                                                        p.id,
                                                                    )
                                                                }
                                                                className="rounded border-slate-300 text-[#8b5cf6]"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center space-x-3">
                                                                <img
                                                                    src={
                                                                        p
                                                                            .images[0] ||
                                                                        'https://placehold.co/50x50/8b5cf6/ffffff?text=P'
                                                                    }
                                                                    alt={p.name}
                                                                    className="h-10 w-10 shrink-0 rounded-lg object-cover"
                                                                />
                                                                <div>
                                                                    <div className="font-bold text-slate-800">
                                                                        {p.name}
                                                                    </div>
                                                                    <div className="text-[10px] text-slate-400">
                                                                        Terjual:{' '}
                                                                        {
                                                                            p.soldCount
                                                                        }{' '}
                                                                        •{' '}
                                                                        {!isProductComplete(
                                                                            p,
                                                                        ) && (
                                                                            <span className="font-bold text-amber-600">
                                                                                Info
                                                                                Belum
                                                                                Lengkap
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-3 font-medium text-slate-600">
                                                            {p.category}
                                                        </td>
                                                        <td className="p-3 font-bold text-purple-700">
                                                            {formatRupiah(
                                                                p.price,
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            {p.stock <= 0 ? (
                                                                <span className="font-bold text-rose-600">
                                                                    Habis
                                                                </span>
                                                            ) : p.stock <=
                                                              p.lowStockThreshold ? (
                                                                <span className="font-bold text-amber-600">
                                                                    Sisa{' '}
                                                                    {p.stock}
                                                                </span>
                                                            ) : (
                                                                <span>
                                                                    {p.stock}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3">
                                                            <button
                                                                onClick={() =>
                                                                    handleToggleStatus(
                                                                        p.id,
                                                                    )
                                                                }
                                                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                                    p.isActive
                                                                        ? 'bg-emerald-50 text-emerald-700'
                                                                        : 'bg-slate-100 text-slate-500'
                                                                }`}
                                                            >
                                                                {p.isActive
                                                                    ? 'Aktif'
                                                                    : 'Nonaktif'}
                                                            </button>
                                                        </td>
                                                        <td className="p-3 text-right">
                                                            <div className="flex items-center justify-end space-x-1">
                                                                <button
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            p,
                                                                        )
                                                                    }
                                                                    className="p-1 text-slate-500 hover:text-slate-800"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDuplicateProduct(
                                                                            p,
                                                                        )
                                                                    }
                                                                    className="p-1 text-slate-500 hover:text-slate-800"
                                                                    title="Gandakan"
                                                                >
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setDeleteConfirmId(
                                                                            p.id,
                                                                        )
                                                                    }
                                                                    className="p-1 text-rose-500 hover:text-rose-700"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Load More / Pagination */}
                                {filteredProducts.length > visibleCount && (
                                    <div className="mb-8 text-center">
                                        <button
                                            onClick={() =>
                                                setVisibleCount(
                                                    (prev) => prev + 6,
                                                )
                                            }
                                            className="shadow-2xs active:scale-98 inline-flex min-h-[42px] items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                        >
                                            <span>
                                                Muat Lebih Banyak (
                                                {filteredProducts.length -
                                                    visibleCount}{' '}
                                                lagi)
                                            </span>
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* ================= STATE KOSONG (Empty State) ================= */
                            <div className="shadow-2xs mb-8 rounded-2xl border border-dashed border-purple-200 bg-white p-8 text-center">
                                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#8b5cf6]">
                                    <Store className="h-7 w-7" />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {searchQuery ||
                                    selectedCategory !== 'Semua' ||
                                    selectedStatus !== 'Semua'
                                        ? 'Produk tidak ditemukan'
                                        : 'Belum ada produk di etalase tokomu'}
                                </h3>
                                <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                                    {searchQuery ||
                                    selectedCategory !== 'Semua' ||
                                    selectedStatus !== 'Semua'
                                        ? 'Coba ganti kata kunci pencarian atau bersihkan filter yang aktif.'
                                        : 'Tambahkan produk pertamamu sekarang agar pelanggan bisa langsung memesan lewat WhatsApp!'}
                                </p>
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    {searchQuery ||
                                    selectedCategory !== 'Semua' ||
                                    selectedStatus !== 'Semua' ? (
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setSelectedCategory('Semua');
                                                setSelectedStatus('Semua');
                                                setSelectedStock('Semua');
                                                setSelectedCompleteness(
                                                    'Semua',
                                                );
                                            }}
                                            className="rounded-xl bg-purple-50 px-4 py-2 text-xs font-semibold text-[#8b5cf6] hover:bg-purple-100"
                                        >
                                            Reset Semua Filter
                                        </button>
                                    ) : (
                                        <button
                                            onClick={openAddModal}
                                            className="shadow-xs inline-flex min-h-[44px] items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-xs font-semibold text-white hover:bg-purple-700"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>+ Tambah Produk Pertama</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ================= BAGIAN 7: PENGATURAN TOMBOL PESAN WHATSAPP ================= */}
                        <div
                            id="waSettingsCard"
                            className="shadow-2xs mb-6 rounded-xl border border-slate-100 bg-white p-5"
                        >
                            <div className="mb-4 flex flex-col justify-between gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                            <MessageCircle className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800">
                                            Pengaturan Tombol Pesan WhatsApp
                                        </h3>
                                    </div>
                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Saat pembeli menekan tombol &quot;Pesan
                                        via WhatsApp&quot; di etalasemu, pesan
                                        otomatis ini yang akan terkirim
                                    </p>
                                </div>
                                <button
                                    onClick={handleSaveWhatsAppConfig}
                                    className="shadow-xs active:scale-98 inline-flex min-h-[38px] items-center space-x-1.5 self-start rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 sm:self-auto"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Simpan Pengaturan</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                {/* Form Input WA */}
                                <div className="space-y-3.5">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Nomor WhatsApp Usaha:
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={waNumberInput}
                                                onChange={(e) => {
                                                    setWaNumberInput(
                                                        e.target.value,
                                                    );
                                                    setWaError('');
                                                }}
                                                placeholder="6281234567890"
                                                className="w-full rounded-xl border border-slate-200 py-2 pl-3.5 pr-4 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-none"
                                            />
                                        </div>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            Wajib memakai kode negara Indonesia
                                            (contoh:{' '}
                                            <strong className="text-slate-600">
                                                628123456789
                                            </strong>
                                            , tanpa angka 0 di depan).
                                        </p>
                                        {waError && (
                                            <p className="mt-1 flex items-center text-xs font-semibold text-rose-500">
                                                <AlertCircle className="mr-1 h-3 w-3" />
                                                {waError}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Template Pesan Otomatis:
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={waTemplateInput}
                                            onChange={(e) =>
                                                setWaTemplateInput(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 focus:border-purple-500 focus:outline-none"
                                        ></textarea>
                                        <p className="mt-1 text-[10px] text-slate-400">
                                            Gunakan tag{' '}
                                            <code className="py-0.2 rounded bg-purple-50 px-1 font-bold text-purple-700">
                                                &#123;nama_produk&#125;
                                            </code>{' '}
                                            dan{' '}
                                            <code className="py-0.2 rounded bg-purple-50 px-1 font-bold text-purple-700">
                                                &#123;jumlah&#125;
                                            </code>{' '}
                                            agar terisi otomatis saat pembeli
                                            memilih produk.
                                        </p>
                                    </div>
                                </div>

                                {/* Preview & Tes Link */}
                                <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                    <div>
                                        <span className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                            Pratinjau Pesan yang Diterima:
                                        </span>
                                        <div className="shadow-2xs rounded-xl border border-slate-200/80 bg-white p-3 text-xs leading-relaxed text-slate-700">
                                            <div className="mb-1 flex items-center space-x-1.5 font-bold text-emerald-600">
                                                <MessageCircle className="h-3.5 w-3.5" />
                                                <span>
                                                    Pesan Masuk WhatsApp:
                                                </span>
                                            </div>
                                            <p className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-2.5 italic text-slate-600">
                                                &quot;
                                                {waTemplateInput
                                                    .replace(
                                                        '{nama_produk}',
                                                        'Sambal Bawang Spesial 150g',
                                                    )
                                                    .replace('{jumlah}', '2')}
                                                &quot;
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-slate-200/60 pt-3">
                                        <span className="text-[11px] text-slate-400">
                                            Cek apakah nomor dan teks sudah
                                            sesuai
                                        </span>
                                        <a
                                            href={waTestUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center space-x-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                        >
                                            <span>Tes Tombol Sekarang</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* ================= MODAL TAMBAH / EDIT PRODUK (BAGIAN B) ================= */}
            {isFormOpen && (
                <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4">
                    <div
                        className="relative my-6 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header Modal */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                            <div>
                                <h2 className="text-base font-bold text-slate-800 sm:text-lg">
                                    {editingProduct
                                        ? 'Ubah Rincian Produk'
                                        : 'Tambah Produk Baru'}
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Pastikan foto jelas dan harga tepat agar
                                    pelanggan mudah tertarik
                                </p>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body Form Modal (2 Kolom: Form Input & Panel Kelengkapan Live) */}
                        <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-12">
                            {/* Kolom Kiri: Input Form (Span 8) */}
                            <div className="space-y-4 lg:col-span-8">
                                {/* Upload Foto Produk */}
                                <div>
                                    <div className="mb-1.5 flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-700">
                                            Foto Produk ({formImages.length}/5
                                            foto):
                                        </label>
                                        <span className="text-[10px] font-semibold text-purple-600">
                                            Foto pertama akan jadi foto utama
                                        </span>
                                    </div>

                                    {/* Thumbnail Preview Grid */}
                                    <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
                                        {formImages.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                                            >
                                                <img
                                                    src={img}
                                                    alt="Foto produk"
                                                    className="h-full w-full object-cover"
                                                />
                                                {idx === 0 && (
                                                    <span className="py-0.2 absolute left-1 top-1 rounded bg-[#8b5cf6] px-1.5 text-[9px] font-bold text-white">
                                                        Utama
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        setFormImages(
                                                            formImages.filter(
                                                                (_, i) =>
                                                                    i !== idx,
                                                            ),
                                                        )
                                                    }
                                                    className="absolute right-1 top-1 rounded-full bg-slate-900/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                                                    title="Hapus foto ini"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}

                                        {formImages.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={handleAddMockPhoto}
                                                className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-slate-500 transition hover:border-purple-300 hover:bg-purple-50/50 hover:text-[#8b5cf6]"
                                            >
                                                <Upload className="mb-1 h-4 w-4" />
                                                <span className="text-[10px] font-semibold">
                                                    + Tambah Foto
                                                </span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Tips Foto UMKM */}
                                    <div className="mt-2 flex items-start space-x-1.5 rounded-lg border border-amber-100/80 bg-amber-50/70 p-2 text-[11px] text-amber-800">
                                        <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                                        <span>
                                            <strong>Tips Foto:</strong> Gunakan
                                            pencahayaan alami dekat jendela dan
                                            latar belakang polos/bersih agar
                                            warna makanan menggugah selera.
                                        </span>
                                    </div>
                                </div>

                                {/* Nama Produk */}
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Nama Produk{' '}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Rendang Daging Sapi Suwir 250g"
                                        value={formName}
                                        onChange={(e) => {
                                            setFormName(e.target.value);
                                            if (formErrors.name)
                                                setFormErrors({
                                                    ...formErrors,
                                                    name: '',
                                                });
                                        }}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                                    />
                                    {formErrors.name && (
                                        <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                            {formErrors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Kategori */}
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-700">
                                            Kategori Produk:
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowNewCategoryField(
                                                    !showNewCategoryField,
                                                )
                                            }
                                            className="text-[11px] font-semibold text-[#8b5cf6] hover:underline"
                                        >
                                            {showNewCategoryField
                                                ? 'Pilih dari daftar'
                                                : '+ Tambah Kategori Baru'}
                                        </button>
                                    </div>

                                    {showNewCategoryField ? (
                                        <input
                                            type="text"
                                            placeholder="Ketik kategori baru, misal: Frozen Food"
                                            value={newCategoryInput}
                                            onChange={(e) =>
                                                setNewCategoryInput(
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full rounded-xl border border-purple-300 bg-purple-50/20 px-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
                                        />
                                    ) : (
                                        <select
                                            value={formCategory}
                                            onChange={(e) =>
                                                setFormCategory(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
                                        >
                                            {categories
                                                .filter((c) => c !== 'Semua')
                                                .map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                        </select>
                                    )}
                                </div>

                                {/* Harga Jual & Harga Coret */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="sm:col-span-1">
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Harga Jual (Rp){' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            placeholder="25000"
                                            value={formPrice}
                                            onChange={(e) => {
                                                setFormPrice(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : '',
                                                );
                                                if (formErrors.price)
                                                    setFormErrors({
                                                        ...formErrors,
                                                        price: '',
                                                    });
                                            }}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-none"
                                        />
                                        {formErrors.price && (
                                            <p className="mt-1 text-[11px] font-semibold text-rose-500">
                                                {formErrors.price}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                                            Harga Coret (Promo):
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            placeholder="30000"
                                            value={formOriginalPrice}
                                            onChange={(e) =>
                                                setFormOriginalPrice(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : '',
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Satuan Produk:
                                        </label>
                                        <select
                                            value={formUnit}
                                            onChange={(e) =>
                                                setFormUnit(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="porsi">porsi</option>
                                            <option value="botol">botol</option>
                                            <option value="bungkus">
                                                bungkus
                                            </option>
                                            <option value="toples">
                                                toples
                                            </option>
                                            <option value="cup">cup</option>
                                            <option value="pcs">pcs</option>
                                            <option value="kg">kg</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Stok & Batas Stok Menipis */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Jumlah Stok Tersedia:
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            placeholder="10"
                                            value={formStock}
                                            onChange={(e) => {
                                                setFormStock(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : 0,
                                                );
                                                if (formErrors.stock)
                                                    setFormErrors({
                                                        ...formErrors,
                                                        stock: '',
                                                    });
                                            }}
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-slate-600">
                                            Batas Peringatan Menipis:
                                        </label>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            placeholder="5"
                                            value={formLowStock}
                                            onChange={(e) =>
                                                setFormLowStock(
                                                    e.target.value
                                                        ? Number(e.target.value)
                                                        : 5,
                                                )
                                            }
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Deskripsi Produk dengan AI Writer Placeholder */}
                                <div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <label className="text-xs font-bold text-slate-700">
                                            Deskripsi Produk:
                                        </label>
                                        {/* TODO: Tautkan ke API AI Assistant untuk generate copywriting */}
                                        <button
                                            type="button"
                                            onClick={
                                                handleGenerateAiDescription
                                            }
                                            disabled={isAiLoading}
                                            className="inline-flex items-center space-x-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-[#8b5cf6] transition hover:text-purple-800"
                                        >
                                            <Sparkles className="h-3 w-3 text-amber-500" />
                                            <span>
                                                {isAiLoading
                                                    ? 'Menuliskan...'
                                                    : 'Bantu tulis dengan AI'}
                                            </span>
                                        </button>
                                    </div>
                                    <textarea
                                        rows={3}
                                        placeholder="Ceritakan rasa, bahan utama, keunggulan, atau ketahanan produk..."
                                        value={formDescription}
                                        onChange={(e) =>
                                            setFormDescription(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed text-slate-800 focus:border-purple-500 focus:outline-none"
                                    ></textarea>
                                    <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
                                        <span>
                                            Minimal 15 karakter agar produk
                                            berstatus lengkap
                                        </span>
                                        <span>
                                            {formDescription.length} karakter
                                        </span>
                                    </div>
                                </div>

                                {/* Status Produk */}
                                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                                    <div>
                                        <span className="block text-xs font-bold text-slate-800">
                                            Tampilkan di Etalase Toko
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                            Jika dinonaktifkan, pembeli tidak
                                            akan melihat menu ini
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFormIsActive(!formIsActive)
                                        }
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                                            formIsActive
                                                ? 'bg-[#8b5cf6]'
                                                : 'bg-slate-300'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                                formIsActive
                                                    ? 'translate-x-6'
                                                    : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Kolom Kanan: Panel Kelengkapan Info Live (Span 4) */}
                            <div className="lg:col-span-4">
                                <div className="sticky top-0 space-y-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                                    <div>
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-800">
                                                Kelengkapan Info
                                            </span>
                                            <span className="text-xs font-bold text-purple-700">
                                                {liveFormCompleteness.percent}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                                            <div
                                                className="h-full bg-gradient-to-r from-[#8b5cf6] to-emerald-500 transition-all duration-300"
                                                style={{
                                                    width: `${liveFormCompleteness.percent}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Checklist Live */}
                                    <div className="space-y-2 text-xs">
                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`flex h-4 w-4 items-center justify-center rounded ${
                                                    liveFormCompleteness.hasPhoto
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'border border-slate-300 bg-white'
                                                }`}
                                            >
                                                {liveFormCompleteness.hasPhoto && (
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                )}
                                            </span>
                                            <span
                                                className={
                                                    liveFormCompleteness.hasPhoto
                                                        ? 'text-slate-700'
                                                        : 'text-slate-400'
                                                }
                                            >
                                                Foto produk jelas
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`flex h-4 w-4 items-center justify-center rounded ${
                                                    liveFormCompleteness.hasName
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'border border-slate-300 bg-white'
                                                }`}
                                            >
                                                {liveFormCompleteness.hasName && (
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                )}
                                            </span>
                                            <span
                                                className={
                                                    liveFormCompleteness.hasName
                                                        ? 'text-slate-700'
                                                        : 'text-slate-400'
                                                }
                                            >
                                                Nama produk lengkap
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`flex h-4 w-4 items-center justify-center rounded ${
                                                    liveFormCompleteness.hasPrice
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'border border-slate-300 bg-white'
                                                }`}
                                            >
                                                {liveFormCompleteness.hasPrice && (
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                )}
                                            </span>
                                            <span
                                                className={
                                                    liveFormCompleteness.hasPrice
                                                        ? 'text-slate-700'
                                                        : 'text-slate-400'
                                                }
                                            >
                                                Harga jual terisi
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <span
                                                className={`flex h-4 w-4 items-center justify-center rounded ${
                                                    liveFormCompleteness.hasDesc
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'border border-slate-300 bg-white'
                                                }`}
                                            >
                                                {liveFormCompleteness.hasDesc && (
                                                    <Check className="h-3 w-3 stroke-[3]" />
                                                )}
                                            </span>
                                            <span
                                                className={
                                                    liveFormCompleteness.hasDesc
                                                        ? 'text-slate-700'
                                                        : 'text-slate-400'
                                                }
                                            >
                                                Deskripsi menggugah selera
                                            </span>
                                        </div>
                                    </div>

                                    {/* Preview Kartu Mini */}
                                    <div className="border-t border-slate-200 pt-2">
                                        <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Pratinjau di Etalase:
                                        </span>
                                        <div className="shadow-2xs rounded-xl border border-slate-200 bg-white p-2.5">
                                            <div className="mb-2 aspect-square w-full overflow-hidden rounded-lg bg-slate-100">
                                                <img
                                                    src={
                                                        formImages[0] ||
                                                        'https://placehold.co/100x100/8b5cf6/ffffff?text=Foto'
                                                    }
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div className="line-clamp-1 text-xs font-bold text-slate-800">
                                                {formName || 'Nama Menu Produk'}
                                            </div>
                                            <div className="mt-0.5 text-xs font-bold text-purple-700">
                                                {formPrice
                                                    ? formatRupiah(
                                                          Number(formPrice),
                                                      )
                                                    : 'Rp 0'}
                                                <span className="ml-1 text-[10px] font-normal text-slate-400">
                                                    /{formUnit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Modal CTA */}
                        <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50 px-6 py-3.5">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="min-h-[40px] rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            {!editingProduct && (
                                <button
                                    type="button"
                                    onClick={() => handleSaveProduct(true)}
                                    className="min-h-[40px] rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-[#8b5cf6] hover:bg-purple-100"
                                >
                                    Simpan & Tambah Lagi
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleSaveProduct(false)}
                                className="shadow-xs inline-flex min-h-[40px] items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-5 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
                            >
                                <Check className="h-4 w-4" />
                                <span>
                                    {editingProduct
                                        ? 'Simpan Perubahan'
                                        : 'Simpan Produk'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL KONFIRMASI HAPUS ================= */}
            {deleteConfirmId !== null && (
                <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-2xl">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                            <Trash2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">
                            Hapus Produk Ini?
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed text-slate-500">
                            Produk ini akan dihapus dari daftar dan etalase
                            toko. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="mt-5 flex items-center justify-center space-x-2">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() =>
                                    handleDeleteProduct(deleteConfirmId)
                                }
                                className="shadow-xs flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700"
                            >
                                Ya, Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
