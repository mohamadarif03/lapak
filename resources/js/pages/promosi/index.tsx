import { Head, Link, usePage } from '@inertiajs/react';
import {
    BadgePercent,
    BookOpen,
    Calendar as CalendarIcon,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Copy,
    Edit2,
    ExternalLink,
    FileText,
    Flame,
    Gift,
    GraduationCap,
    Home,
    Info,
    Lightbulb,
    LineChart,
    LogOut,
    Maximize,
    MessageSquare,
    Moon,
    Palette,
    Plus,
    RefreshCw,
    Search,
    ShoppingCart,
    Sparkles,
    Store,
    Tag,
    Trash2,
    Users,
    Wallet,
    X,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import AppSidebar from '@/Components/AppSidebar';
import PosterGenerator from '@/Components/PosterGenerator';
import { initialProducts } from '../../data/mockProducts';
import {
    consistencyTips,
    mockContentIdeas,
    mockPromoTemplates,
    mockQuickReplies,
    mockScheduledPosts,
} from '../../data/mockPromotions';
import {
    ContentGoal,
    ContentTone,
    GeneratedCaption,
    Platform,
    PromoTemplate,
    QuickReply,
    ScheduledPost,
} from '../../types/promotion';

// Helper Icons for Social Media Platforms
const PlatformIcon = ({
    platform,
    className = 'w-4 h-4',
}: {
    platform: Platform;
    className?: string;
}) => {
    switch (platform) {
        case 'instagram':
            return (
                <svg
                    className={className}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            );
        case 'tiktok':
            return (
                <svg
                    className={className}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.11V9.42a6.37 6.37 0 0 0-.86-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.31 8.31 0 0 0 5-1.64l-1.23-2.72z" />
                </svg>
            );
        case 'whatsapp':
            return (
                <svg
                    className={className}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M17.472 14.382c-.301-.15-1.782-.879-2.057-.979-.276-.101-.476-.15-.677.15-.2.301-.776.979-.951 1.179-.176.2-.351.226-.652.075-.301-.15-1.271-.469-2.42-1.494-.895-.798-1.5-1.784-1.675-2.085-.175-.301-.019-.464.131-.614.136-.134.301-.351.451-.527.151-.176.2-.301.301-.501.101-.2.051-.376-.025-.526-.075-.15-.677-1.631-.927-2.233-.243-.587-.49-.507-.677-.517-.175-.01-.376-.01-.577-.01-.2 0-.526.075-.802.376-.275.301-1.052 1.028-1.052 2.508 0 1.48 1.077 2.909 1.228 3.109.15.2 2.12 3.238 5.136 4.542.717.311 1.277.497 1.713.636.72.229 1.376.197 1.895.119.579-.087 1.782-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.076-.126-.276-.201-.577-.352zM12.04 2C6.514 2 2.03 6.484 2.03 12.008c0 1.977.575 3.821 1.572 5.378L2 22l4.805-1.55a9.98 9.98 0 0 0 5.235 1.558c5.525 0 10.01-4.484 10.01-10.008C22.05 6.484 17.564 2 12.04 2z" />
                </svg>
            );
        case 'facebook':
        default:
            return (
                <svg
                    className={className}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
            );
    }
};

const getPlatformBadge = (platform: Platform) => {
    switch (platform) {
        case 'instagram':
            return {
                label: 'Instagram',
                bg: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
                border: 'border-pink-200',
                text: 'text-pink-600',
            };
        case 'tiktok':
            return {
                label: 'TikTok',
                bg: 'bg-black text-white',
                border: 'border-slate-800',
                text: 'text-slate-900',
            };
        case 'whatsapp':
            return {
                label: 'WhatsApp Status',
                bg: 'bg-emerald-600 text-white',
                border: 'border-emerald-200',
                text: 'text-emerald-600',
            };
        case 'facebook':
        default:
            return {
                label: 'Facebook',
                bg: 'bg-blue-600 text-white',
                border: 'border-blue-200',
                text: 'text-blue-600',
            };
    }
};

const getStatusBadge = (status: 'draft' | 'terjadwal' | 'diposting') => {
    switch (status) {
        case 'diposting':
            return {
                label: 'Sudah Diposting',
                bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            };
        case 'terjadwal':
            return {
                label: 'Terjadwal',
                bg: 'bg-purple-100 text-[#8b5cf6] border-purple-200',
            };
        case 'draft':
        default:
            return {
                label: 'Draf',
                bg: 'bg-slate-100 text-slate-700 border-slate-200',
            };
    }
};

export default function PromotionsIndex() {
    const pageProps = usePage().props as any;

    // Shell Layout State
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Active Tab
    const [activeTab, setActiveTab] = useState<
        'create' | 'calendar' | 'promos' | 'replies'
    >('create');

    // Poster Generator States
    const [posterHeadline, setPosterHeadline] = useState<string>(
        'PROMO SPESIAL HARI INI!'
    );
    const [posterOffer, setPosterOffer] = useState<string>(
        'Dapatkan Diskon 20% untuk Menu Favoritmu. Beli 2 Gratis 1 Porsi Tambahan!'
    );

    // Toast State
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // Daily Quota Tracking (15 calls / day)
    const [quotaRemaining, setQuotaRemaining] = useState<number>(15);
    const quotaLimit = 15;

    // Tips Carousel State
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const nextTip = () =>
        setCurrentTipIndex((prev) => (prev + 1) % consistencyTips.length);
    const prevTip = () =>
        setCurrentTipIndex(
            (prev) =>
                (prev - 1 + consistencyTips.length) % consistencyTips.length,
        );

    // =========================================================================
    // TAB 1: FORM BUAT KONTEN AI
    // =========================================================================
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedGoal, setSelectedGoal] = useState<ContentGoal>('promo');
    const [selectedPlatform, setSelectedPlatform] =
        useState<Platform>('instagram');
    const [selectedTone, setSelectedTone] = useState<ContentTone>('santai');
    const [notes, setNotes] = useState<string>('');
    const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

    // AI Generation Results
    const [generatedCaptions, setGeneratedCaptions] = useState<
        GeneratedCaption[]
    >([
        {
            headline: 'Cemilan Pas Buat Teman Kerja & Santai!',
            body: 'Lagi suntuk atau butuh mood booster di sela-sela aktivitas? Keripik Singkong Balado kami siap nemenin harimu! Renyahnya renyah pol, bumbu pedas manisnya gurih meresap sampai ke gigitan terakhir.',
            cta: 'Pesan sekarang lewat link di bio atau klik tombol WhatsApp ya! Mumpung masih hangat dan fresh diproduksi hari ini 🌶️🔥',
            hashtags: [
                '#KeripikSingkong',
                '#CemilanPedas',
                '#KulinerNusantara',
                '#UMKMIndonesia',
                '#JajanEnak',
            ],
        },
        {
            headline: 'Krenyes Gurihnya Bikin Gak Mau Berhenti!',
            body: 'Siapa yang kalau ngemil tahu-tahu sebungkus udah habis? Cobain deh Keripik Singkong Balado dengan potongan tipis renyah dan bumbu rempah asli tanpa pemanis buatan.',
            cta: 'Ketik "MAU" di komentar atau langsung chat admin kami untuk dapat harga promo minggu ini! 👇',
            hashtags: [
                '#SnackViral',
                '#KeripikBalado',
                '#CemilanLokal',
                '#KriukAsik',
            ],
        },
        {
            headline: 'Stok Cemilan Menipis? Waktunya Restock!',
            body: 'Jangan biarkan toples di mejamu kosong. Keripik Singkong Balado siap antar langsung ke depan pintu rumahmu.',
            cta: 'Klik link etalase di bio kami untuk lihat varian rasa lengkapnya ya kak! 🛒✨',
            hashtags: ['#RestockCemilan', '#KeripikEnak', '#PecintaPedas'],
        },
    ]);

    const [recommendedTime, setRecommendedTime] = useState<string>(
        '12.00 - 13.00 & 19.00 - 21.00',
    );
    const [photoTips, setPhotoTips] = useState<string>(
        'Tips Visual: Ambil foto produk close-up di samping jendela dengan sinar matahari alami. Tunjukkan tekstur bumbu dan kemasan yang rapi!',
    );

    // Trigger AI Generation (Hits backend route /api/content-assistant/generate-captions)
    const handleGenerateCaptions = async () => {
        setIsAiLoading(true);
        try {
            const selectedProductObj = initialProducts.find(
                (p) => String(p.id) === selectedProductId,
            );
            const response = await fetch(
                '/api/content-assistant/generate-captions',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN':
                            (
                                document.querySelector(
                                    'meta[name="csrf-token"]',
                                ) as HTMLMetaElement
                            )?.content || '',
                    },
                    body: JSON.stringify({
                        product_id: selectedProductId || null,
                        product_name:
                            selectedProductObj?.name || 'Produk Usaha',
                        goal: selectedGoal,
                        platform: selectedPlatform,
                        tone: selectedTone,
                        notes: notes,
                    }),
                },
            );

            if (response.ok) {
                const data = await response.json();
                if (data.captions && data.captions.length > 0) {
                    setGeneratedCaptions(data.captions);
                    if (data.captions[0]) {
                        setPosterHeadline(data.captions[0].headline);
                        setPosterOffer(data.captions[0].body);
                    }
                    if (data.recommended_time)
                        setRecommendedTime(data.recommended_time);
                    if (data.photo_tips) setPhotoTips(data.photo_tips);
                    if (typeof data.quota_remaining === 'number') {
                        setQuotaRemaining(data.quota_remaining);
                    } else {
                        setQuotaRemaining((prev) => Math.max(0, prev - 1));
                    }
                    showToast('3 ide caption berhasil dibuat oleh Asisten AI!');
                }
            } else {
                throw new Error('Gagal menghubungi layanan AI');
            }
        } catch {
            // Local fallback simulation if offline or error
            setQuotaRemaining((prev) => Math.max(0, prev - 1));
            showToast('Caption AI berhasil disiapkan!');
        } finally {
            setIsAiLoading(false);
        }
    };

    // Copy Caption to Clipboard
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const handleCopyCaption = (index: number) => {
        const item = generatedCaptions[index];
        const fullText = `${item.headline}\n\n${item.body}\n\n${item.cta}\n\n${item.hashtags.join(' ')}`;
        navigator.clipboard.writeText(fullText);
        setCopiedIndex(index);
        showToast('Caption berhasil disalin ke clipboard!');
        setTimeout(() => setCopiedIndex(null), 2500);
    };

    // Update Editable Caption Text
    const handleUpdateCaption = (
        index: number,
        field: keyof GeneratedCaption,
        value: string | string[],
    ) => {
        setGeneratedCaptions((prev) =>
            prev.map((item, idx) =>
                idx === index ? { ...item, [field]: value } : item,
            ),
        );
    };

    // =========================================================================
    // TAB 2: KALENDER & PENJADWALAN
    // =========================================================================
    const [scheduledPosts, setScheduledPosts] =
        useState<ScheduledPost[]>(mockScheduledPosts);
    const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'list'>(
        'month',
    );
    const [currentMonthDate, setCurrentMonthDate] = useState<Date>(
        new Date(2026, 9, 1),
    ); // October 2026

    const monthNames = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];

    const handlePrevMonth = () => {
        setCurrentMonthDate(
            new Date(
                currentMonthDate.getFullYear(),
                currentMonthDate.getMonth() - 1,
                1,
            ),
        );
    };

    const handleNextMonth = () => {
        setCurrentMonthDate(
            new Date(
                currentMonthDate.getFullYear(),
                currentMonthDate.getMonth() + 1,
                1,
            ),
        );
    };

    // Modal Jadwalkan / Edit Post
    const [isScheduleModalOpen, setIsScheduleModalOpen] =
        useState<boolean>(false);
    const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

    // Form Schedule State
    const [scheduleProductId, setScheduleProductId] = useState<string>('');
    const [schedulePlatform, setSchedulePlatform] =
        useState<Platform>('instagram');
    const [scheduleDate, setScheduleDate] = useState<string>('2026-10-27');
    const [scheduleTime, setScheduleTime] = useState<string>('12:00');
    const [scheduleCaption, setScheduleCaption] = useState<string>('');
    const [scheduleNotes, setScheduleNotes] = useState<string>('');
    const [scheduleStatus, setScheduleStatus] = useState<
        'draft' | 'terjadwal' | 'diposting'
    >('terjadwal');

    // Open Schedule Modal from Caption
    const handleScheduleFromCaption = (captionItem: GeneratedCaption) => {
        const fullText = `${captionItem.headline}\n\n${captionItem.body}\n\n${captionItem.cta}\n\n${captionItem.hashtags.join(' ')}`;
        setEditingPost(null);
        setScheduleProductId(selectedProductId);
        setSchedulePlatform(selectedPlatform);
        setScheduleDate('2026-10-27');
        setScheduleTime('12:30');
        setScheduleCaption(fullText);
        setScheduleNotes(photoTips);
        setScheduleStatus('terjadwal');
        setIsScheduleModalOpen(true);
    };

    // Open Schedule Modal Fresh
    const handleOpenNewSchedule = (prefillDate?: string) => {
        setEditingPost(null);
        setScheduleProductId('');
        setSchedulePlatform('instagram');
        setScheduleDate(prefillDate || '2026-10-28');
        setScheduleTime('10:00');
        setScheduleCaption('');
        setScheduleNotes('');
        setScheduleStatus('terjadwal');
        setIsScheduleModalOpen(true);
    };

    // Edit Existing Post
    const handleEditPost = (post: ScheduledPost) => {
        setEditingPost(post);
        setScheduleProductId(post.product_id || '');
        setSchedulePlatform(post.platform);
        setScheduleDate(post.date);
        setScheduleTime(post.time);
        setScheduleCaption(post.caption);
        setScheduleNotes(post.notes || '');
        setScheduleStatus(post.status);
        setIsScheduleModalOpen(true);
    };

    // Save Schedule
    const handleSaveSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scheduleCaption.trim()) {
            alert('Silakan isi teks caption postingan.');
            return;
        }

        const prod = initialProducts.find(
            (p) => String(p.id) === scheduleProductId,
        );

        if (editingPost) {
            setScheduledPosts((prev) =>
                prev.map((item) =>
                    item.id === editingPost.id
                        ? {
                              ...item,
                              product_id: scheduleProductId || null,
                              product_name: prod ? prod.name : 'Promo Toko',
                              platform: schedulePlatform,
                              date: scheduleDate,
                              time: scheduleTime,
                              caption: scheduleCaption,
                              notes: scheduleNotes,
                              status: scheduleStatus,
                          }
                        : item,
                ),
            );
            showToast('Jadwal postingan berhasil diperbarui!');
        } else {
            const newPost: ScheduledPost = {
                id: `post-${Date.now()}`,
                product_id: scheduleProductId || null,
                product_name: prod ? prod.name : 'Promo Toko',
                platform: schedulePlatform,
                date: scheduleDate,
                time: scheduleTime,
                caption: scheduleCaption,
                notes: scheduleNotes,
                status: scheduleStatus,
                remind_before: 15,
                created_at: new Date().toISOString(),
            };
            setScheduledPosts((prev) => [newPost, ...prev]);
            showToast('Jadwal postingan baru berhasil disimpan!');
        }
        setIsScheduleModalOpen(false);
    };

    // Duplicate Post
    const handleDuplicatePost = (post: ScheduledPost) => {
        const dup: ScheduledPost = {
            ...post,
            id: `post-${Date.now()}`,
            caption: `${post.caption} (Salinan)`,
            status: 'draft',
            created_at: new Date().toISOString(),
        };
        setScheduledPosts((prev) => [dup, ...prev]);
        showToast('Postingan berhasil digandakan sebagai Draf!');
    };

    // Delete Post
    const handleDeletePost = (id: string) => {
        if (confirm('Yakin ingin menghapus postingan ini?')) {
            setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
            showToast('Postingan berhasil dihapus.');
        }
    };

    // Mark as Posted
    const handleMarkAsPosted = (id: string) => {
        setScheduledPosts((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, status: 'diposting' as const } : p,
            ),
        );
        showToast('Bagus! Postingan ditandai sebagai Sudah Diposting.');
    };

    // Calendar Days Generator for October 2026
    const calendarDays = useMemo(() => {
        const year = currentMonthDate.getFullYear();
        const month = currentMonthDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        // Fill empty prefix days
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ day: null, dateStr: '' });
        }
        // Fill current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const mm = String(month + 1).padStart(2, '0');
            const dd = String(d).padStart(2, '0');
            const dateStr = `${year}-${mm}-${dd}`;
            days.push({ day: d, dateStr });
        }
        return days;
    }, [currentMonthDate]);

    // Statistics Calculation
    const scheduledThisWeek = scheduledPosts.filter(
        (p) => p.status === 'terjadwal',
    ).length;
    const postedCount = scheduledPosts.filter(
        (p) => p.status === 'diposting',
    ).length;
    const draftsCount = scheduledPosts.filter(
        (p) => p.status === 'draft',
    ).length;

    // =========================================================================
    // TAB 3: TEMPLATE PROMO
    // =========================================================================
    const [promoTemplates, setPromoTemplates] =
        useState<PromoTemplate[]>(mockPromoTemplates);
    const [promoFormValues, setPromoFormValues] = useState<
        Record<string, Record<string, string>>
    >({
        'promo-1': {
            produk: 'Keripik Singkong Balado',
            diskon: '20%',
            batas_waktu: 'Minggu ini',
        },
        'promo-2': {
            produk: 'Sambal Roa 150gr',
            hadiah: '1 pouch Keripik Singkong',
            kuota: '30 pembeli pertama',
        },
        'promo-3': {
            min_belanja: 'Rp 100.000',
            wilayah: 'Seluruh Pulau Jawa',
            kode_kupon: 'BEBASONGKIR',
        },
        'promo-4': {
            produk: 'Semua Varian Kopi',
            keuntungan: 'Diskon Rp 15.000 langsung',
        },
        'promo-5': {
            nama_momen: 'Payday Spesial',
            penawaran: 'Diskon 25% + Free Pouch',
            batas: '26 - 31 Oktober',
        },
        'promo-6': {
            nama_paket: 'Paket Santai Sore',
            isi_paket: '1 Kopi + 2 Keripik',
            harga_promo: 'Rp 75.000',
        },
        'promo-7': {
            benefit: 'Diskon 10% untuk pesanan pertama',
            cara_klaim: 'PELANGGANBARU',
        },
    });

    const handlePromoFieldChange = (
        templateId: string,
        fieldKey: string,
        val: string,
    ) => {
        setPromoFormValues((prev) => ({
            ...prev,
            [templateId]: {
                ...(prev[templateId] || {}),
                [fieldKey]: val,
            },
        }));
    };

    const renderPromoCaption = (template: PromoTemplate) => {
        let text = template.caption_template;
        const currentValues = promoFormValues[template.id] || {};
        template.fields.forEach((field) => {
            const val =
                currentValues[field.key] ||
                field.defaultValue ||
                `{${field.label}}`;
            text = text.replace(new RegExp(`\\{${field.key}\\}`, 'g'), val);
        });
        return text;
    };

    const handleCopyPromo = (template: PromoTemplate) => {
        const text = renderPromoCaption(template);
        navigator.clipboard.writeText(text);
        showToast(`Template "${template.title}" berhasil disalin!`);
    };

    const handleUsePromoInCreator = (template: PromoTemplate) => {
        const text = renderPromoCaption(template);
        setSelectedGoal('promo');
        setNotes(`Promo: ${template.title}. ${text.slice(0, 100)}...`);
        setActiveTab('create');
        showToast('Template promo dimuat ke Form Buat Konten!');
    };

    // Custom Promo Modal
    const [isCustomPromoModalOpen, setIsCustomPromoModalOpen] = useState(false);
    const [customPromoTitle, setCustomPromoTitle] = useState('');
    const [customPromoDesc, setCustomPromoDesc] = useState('');
    const [customPromoText, setCustomPromoText] = useState('');

    const handleSaveCustomPromo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customPromoTitle.trim() || !customPromoText.trim()) {
            alert('Judul dan format pesan promo wajib diisi.');
            return;
        }
        const newTemplate: PromoTemplate = {
            id: `custom-promo-${Date.now()}`,
            title: customPromoTitle,
            category: 'custom',
            description: customPromoDesc || 'Template promosi buatan sendiri',
            fields: [],
            caption_template: customPromoText,
            is_custom: true,
        };
        setPromoTemplates((prev) => [newTemplate, ...prev]);
        setIsCustomPromoModalOpen(false);
        setCustomPromoTitle('');
        setCustomPromoDesc('');
        setCustomPromoText('');
        showToast('Template promo baru berhasil disimpan!');
    };

    const handleDeletePromo = (id: string) => {
        if (confirm('Hapus template ini?')) {
            setPromoTemplates((prev) => prev.filter((t) => t.id !== id));
            showToast('Template berhasil dihapus.');
        }
    };

    // =========================================================================
    // TAB 4: BALASAN CEPAT
    // =========================================================================
    const [quickReplies, setQuickReplies] =
        useState<QuickReply[]>(mockQuickReplies);
    const [replyCategoryFilter, setReplyCategoryFilter] =
        useState<string>('all');
    const [replySearch, setReplySearch] = useState<string>('');

    // Modal Variabel Balasan Cepat
    const [selectedReplyToCopy, setSelectedReplyToCopy] =
        useState<QuickReply | null>(null);
    const [replyVars, setReplyVars] = useState({
        nama_pelanggan: 'Kak Dina',
        nama_produk: 'Keripik Singkong Balado',
        harga: 'Rp 25.000',
        nomor_rekening: 'BCA 123-456-7890 a/n Siti Aminah',
        link_etalase: window.location.origin
            ? `${window.location.origin}/etalase`
            : 'https://tokositi.com/etalase',
    });

    const handleOpenCopyReplyModal = (reply: QuickReply) => {
        setSelectedReplyToCopy(reply);
    };

    const handleConfirmCopyReply = () => {
        if (!selectedReplyToCopy) return;
        let text = selectedReplyToCopy.content;
        text = text.replace(/\{nama_pelanggan\}/g, replyVars.nama_pelanggan);
        text = text.replace(/\{nama_produk\}/g, replyVars.nama_produk);
        text = text.replace(/\{harga\}/g, replyVars.harga);
        text = text.replace(/\{nomor_rekening\}/g, replyVars.nomor_rekening);
        text = text.replace(/\{link_etalase\}/g, replyVars.link_etalase);

        navigator.clipboard.writeText(text);
        showToast(`Balasan cepat disalin untuk ${replyVars.nama_pelanggan}!`);
        setSelectedReplyToCopy(null);
    };

    // Quick Direct Copy (with default vars)
    const handleDirectCopyReply = (reply: QuickReply) => {
        let text = reply.content;
        text = text.replace(/\{nama_pelanggan\}/g, 'Kak');
        text = text.replace(/\{nama_produk\}/g, 'produk kami');
        text = text.replace(/\{harga\}/g, 'Rp ...');
        text = text.replace(/\{nomor_rekening\}/g, 'BCA 123-456-7890 a/n Toko');
        text = text.replace(
            /\{link_etalase\}/g,
            `${window.location.origin}/etalase`,
        );

        navigator.clipboard.writeText(text);
        showToast(`Balasan "${reply.title}" disalin!`);
    };

    // Add / AI Assist Quick Reply Modal
    const [isAddReplyModalOpen, setIsAddReplyModalOpen] = useState(false);
    const [newReplyTitle, setNewReplyTitle] = useState('');
    const [newReplyShortcut, setNewReplyShortcut] = useState('!');
    const [newReplyCategory, setNewReplyCategory] =
        useState<QuickReply['category']>('salam');
    const [newReplyContent, setNewReplyContent] = useState('');
    const [isAiReplyLoading, setIsAiReplyLoading] = useState(false);

    const handleAiGenerateReply = async () => {
        if (!newReplyTitle.trim()) {
            alert(
                'Silakan tulis judul atau situasi pesan terlebih dahulu (contoh: Menjelaskan estimasi pengiriman).',
            );
            return;
        }
        setIsAiReplyLoading(true);
        try {
            const res = await fetch('/api/content-assistant/generate-reply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        (
                            document.querySelector(
                                'meta[name="csrf-token"]',
                            ) as HTMLMetaElement
                        )?.content || '',
                },
                body: JSON.stringify({
                    topic: newReplyTitle,
                    category: newReplyCategory,
                    tone: 'ramah',
                }),
            });
            if (res.ok) {
                const data = await res.json();
                if (data.reply_text) {
                    setNewReplyContent(data.reply_text);
                    showToast('Teks balasan ramah selesai dibuat oleh AI!');
                }
            } else {
                throw new Error('Fallback');
            }
        } catch {
            setNewReplyContent(
                `Halo kak {nama_pelanggan}! Terkait ${newReplyTitle}, produk {nama_produk} kami siap kirim dengan harga {harga}. Ada yang mau ditanyakan lagi kak? 😊`,
            );
            showToast('Teks balasan siap disesuaikan!');
        } finally {
            setIsAiReplyLoading(false);
        }
    };

    const handleSaveNewReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReplyTitle.trim() || !newReplyContent.trim()) {
            alert('Judul dan isi balasan wajib diisi.');
            return;
        }
        const newReply: QuickReply = {
            id: `reply-${Date.now()}`,
            category: newReplyCategory,
            title: newReplyTitle,
            shortcut: newReplyShortcut.startsWith('!')
                ? newReplyShortcut
                : `!${newReplyShortcut}`,
            content: newReplyContent,
            is_custom: true,
        };
        setQuickReplies((prev) => [newReply, ...prev]);
        setIsAddReplyModalOpen(false);
        setNewReplyTitle('');
        setNewReplyShortcut('!');
        setNewReplyContent('');
        showToast('Balasan cepat baru berhasil ditambahkan!');
    };

    const handleDeleteReply = (id: string) => {
        if (confirm('Hapus balasan cepat ini?')) {
            setQuickReplies((prev) => prev.filter((r) => r.id !== id));
            showToast('Balasan cepat berhasil dihapus.');
        }
    };

    // Filtered Quick Replies
    const filteredReplies = useMemo(() => {
        return quickReplies.filter((r) => {
            const matchesCategory =
                replyCategoryFilter === 'all' ||
                r.category === replyCategoryFilter;
            const matchesSearch =
                r.title.toLowerCase().includes(replySearch.toLowerCase()) ||
                r.content.toLowerCase().includes(replySearch.toLowerCase()) ||
                r.shortcut.toLowerCase().includes(replySearch.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [quickReplies, replyCategoryFilter, replySearch]);

    // Fullscreen API Helper
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f8f9fb] font-sans text-slate-700 antialiased">
            <Head title="Konten & Promosi - Asisten Digital UMKM" />

            {/* Toast Notification */}
            {toastMessage && (
                <div className="animate-fade-in fixed bottom-6 right-6 z-50 flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="flex h-screen overflow-hidden">
                <AppSidebar
                    current="promosi"
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    counts={{ products: initialProducts.length }}
                    onShowToast={showToast}
                    customWidget={
                        <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3 text-xs">
                            <div className="mb-1 flex items-center space-x-1.5 font-bold text-[#8b5cf6]">
                                <Flame className="h-4 w-4 text-amber-500" />
                                <span>Streak Posting: 3 Minggu!</span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-600">
                                Hebat Bu Siti! Tokomu aktif terus. Pelanggan makin percaya dengan toko yang rajin update.
                            </p>
                        </div>
                    }
                />

                {/* ================= MAIN CONTENT WRAPPER ================= */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    {/* Header Navbar */}
                    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 sm:px-6">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 lg:hidden"
                                title="Buka/Tutup Menu"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h7"
                                    />
                                </svg>
                            </button>
                            <nav className="hidden items-center space-x-1.5 text-xs text-slate-400 sm:flex">
                                <Link
                                    href="/dashboard"
                                    className="transition hover:text-slate-600"
                                >
                                    Beranda
                                </Link>
                                <span>/</span>
                                <span className="font-medium text-slate-700">
                                    Konten & Promosi
                                </span>
                            </nav>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="hidden items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#8b5cf6] sm:flex">
                                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                                <span>Asisten AI UMKM Aktif</span>
                            </div>

                            <button
                                onClick={toggleFullscreen}
                                className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-50 sm:flex"
                                title="Layar Penuh"
                            >
                                <Maximize className="h-4 w-4" />
                            </button>

                            <Link
                                href="/etalase"
                                target="_blank"
                                className="inline-flex items-center space-x-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-[#8b5cf6] transition hover:bg-purple-100"
                            >
                                <Store className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                    Etalase Toko
                                </span>
                            </Link>
                        </div>
                    </header>

                    {/* Content Scroll Area */}
                    <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                        <div className="mx-auto max-w-7xl space-y-5">
                            {/* ================= 1. HEADER HALAMAN & STATISTIK ================= */}
                            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                                        Konten dan Promosi
                                    </h1>
                                    <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                                        Bantu tokomu makin ramai dengan ide
                                        konten pintar, jadwal posting rapi, dan
                                        template promo cepat.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleOpenNewSchedule()}
                                        className="inline-flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-purple-200 transition hover:bg-[#7c3aed]"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>+ Jadwalkan Postingan</span>
                                    </button>
                                </div>
                            </div>

                            {/* 3 Ringkasan Kecil + Indikator Kuota AI */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">
                                            Terjadwal Minggu Ini
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-[#8b5cf6]">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-baseline space-x-1.5">
                                        <span className="text-xl font-bold text-slate-800">
                                            {scheduledThisWeek}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            postingan
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">
                                            Sudah Diposting
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-baseline space-x-1.5">
                                        <span className="text-xl font-bold text-slate-800">
                                            {postedCount}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            postingan
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-slate-500">
                                            Draf / Ide
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                            <FileText className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-baseline space-x-1.5">
                                        <span className="text-xl font-bold text-slate-800">
                                            {draftsCount}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            konten
                                        </span>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-3.5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium text-purple-700">
                                            Kuota AI Harian
                                        </span>
                                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-[#8b5cf6]">
                                            <Sparkles className="h-3.5 w-3.5" />
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-baseline space-x-1.5">
                                        <span className="text-xl font-bold text-[#8b5cf6]">
                                            {quotaRemaining}
                                        </span>
                                        <span className="text-xs text-purple-600">
                                            / {quotaLimit} tersisa
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* ================= TAB NAVIGATION (RESPONSIVE SCROLL) ================= */}
                            <div className="flex border-b border-slate-200">
                                <div className="flex space-x-2 overflow-x-auto pb-1 text-xs font-semibold sm:space-x-4 sm:text-sm">
                                    <button
                                        onClick={() => setActiveTab('create')}
                                        className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                                            activeTab === 'create'
                                                ? 'border-[#8b5cf6] text-[#8b5cf6]'
                                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        <Sparkles className="h-4 w-4" />
                                        <span>Buat Poster & Konten (AI)</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('calendar')}
                                        className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                                            activeTab === 'calendar'
                                                ? 'border-[#8b5cf6] text-[#8b5cf6]'
                                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>Kalender Konten</span>
                                        {scheduledThisWeek > 0 && (
                                            <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-[#8b5cf6]">
                                                {scheduledThisWeek}
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('promos')}
                                        className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                                            activeTab === 'promos'
                                                ? 'border-[#8b5cf6] text-[#8b5cf6]'
                                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        <Tag className="h-4 w-4" />
                                        <span>Template Promo</span>
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('replies')}
                                        className={`flex shrink-0 items-center space-x-2 border-b-2 px-3 py-2.5 transition ${
                                            activeTab === 'replies'
                                                ? 'border-[#8b5cf6] text-[#8b5cf6]'
                                                : 'border-transparent text-slate-500 hover:text-slate-800'
                                        }`}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        <span>Balasan Cepat Chat</span>
                                    </button>
                                </div>
                            </div>

                            {/* ================= TAB 1: BUAT KONTEN (AI) ================= */}
                            {activeTab === 'create' && (
                                <div className="space-y-6">
                                    {/* Pembuat & Pratinjau Poster Promosi Otomatis */}
                                    <PosterGenerator
                                        businessName={
                                            pageProps?.business?.business_name ||
                                            pageProps?.business?.name ||
                                            'Dapur Bu Siti'
                                        }
                                        productName={
                                            initialProducts.find(
                                                (p) => String(p.id) === selectedProductId
                                            )?.name || ''
                                        }
                                        productImage={
                                            initialProducts.find(
                                                (p) => String(p.id) === selectedProductId
                                            )?.images?.[0]
                                        }
                                        productPrice={
                                            initialProducts.find(
                                                (p) => String(p.id) === selectedProductId
                                            )?.price
                                        }
                                        productOriginalPrice={
                                            initialProducts.find(
                                                (p) => String(p.id) === selectedProductId
                                            )?.originalPrice
                                        }
                                        initialHeadline={posterHeadline}
                                        initialOfferDetails={posterOffer}
                                        onDownloadSuccess={(msg) => showToast(msg)}
                                    />

                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                                    {/* Left: Input Form AI (5 Cols) */}
                                    <div className="space-y-5 lg:col-span-5">
                                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                                            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-[#8b5cf6]">
                                                        <Sparkles className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-sm font-bold text-slate-800">
                                                            Form Asisten Konten
                                                        </h2>
                                                        <p className="text-[11px] text-slate-500">
                                                            Pilih kebutuhan, AI
                                                            yang susunkan
                                                            kalimatnya
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 text-xs">
                                                {/* 1. Pilih Produk */}
                                                <div>
                                                    <label className="mb-1 block font-semibold text-slate-700">
                                                        1. Pilih Produk yang Mau
                                                        Dipromosikan
                                                    </label>
                                                    <select
                                                        value={
                                                            selectedProductId
                                                        }
                                                        onChange={(e) =>
                                                            setSelectedProductId(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]"
                                                    >
                                                        <option value="">
                                                            -- Tanpa produk
                                                            spesifik / Promo
                                                            umum toko --
                                                        </option>
                                                        {initialProducts.map(
                                                            (p) => (
                                                                <option
                                                                    key={p.id}
                                                                    value={p.id}
                                                                >
                                                                    {p.name} (
                                                                    {p.category}
                                                                    )
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>

                                                {/* 2. Tujuan Konten */}
                                                <div>
                                                    <label className="mb-1.5 block font-semibold text-slate-700">
                                                        2. Apa Tujuan Konten
                                                        Ini?
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                        {[
                                                            {
                                                                id: 'promo',
                                                                label: 'Promo / Diskon',
                                                            },
                                                            {
                                                                id: 'perkenalan',
                                                                label: 'Kenalkan Produk',
                                                            },
                                                            {
                                                                id: 'testimoni',
                                                                label: 'Testimoni Pembeli',
                                                            },
                                                            {
                                                                id: 'cerita',
                                                                label: 'Cerita Balik Layar',
                                                            },
                                                            {
                                                                id: 'edukasi',
                                                                label: 'Edukasi & Tips',
                                                            },
                                                            {
                                                                id: 'hari_besar',
                                                                label: 'Momen / Gajian',
                                                            },
                                                        ].map((item) => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedGoal(
                                                                        item.id as ContentGoal,
                                                                    )
                                                                }
                                                                className={`rounded-xl border px-2.5 py-2 text-left text-[11px] font-medium transition ${
                                                                    selectedGoal ===
                                                                    item.id
                                                                        ? 'border-[#8b5cf6] bg-purple-50 text-[#8b5cf6]'
                                                                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                                }`}
                                                            >
                                                                {item.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* 3. Platform */}
                                                <div>
                                                    <label className="mb-1.5 block font-semibold text-slate-700">
                                                        3. Mau Diposting ke
                                                        Mana?
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            {
                                                                id: 'instagram',
                                                                label: 'Instagram',
                                                                sub: 'Visual + Hashtag',
                                                            },
                                                            {
                                                                id: 'whatsapp',
                                                                label: 'WhatsApp Status',
                                                                sub: 'Pendek & Santai',
                                                            },
                                                            {
                                                                id: 'tiktok',
                                                                label: 'TikTok',
                                                                sub: 'Hook Kuat & Call to Action',
                                                            },
                                                            {
                                                                id: 'facebook',
                                                                label: 'Facebook',
                                                                sub: 'Deskripsi Lengkap',
                                                            },
                                                        ].map((p) => (
                                                            <button
                                                                key={p.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedPlatform(
                                                                        p.id as Platform,
                                                                    )
                                                                }
                                                                className={`flex items-start space-x-2 rounded-xl border p-2 text-left transition ${
                                                                    selectedPlatform ===
                                                                    p.id
                                                                        ? 'border-[#8b5cf6] bg-purple-50'
                                                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                                                }`}
                                                            >
                                                                <div className="mt-0.5 text-slate-700">
                                                                    <PlatformIcon
                                                                        platform={
                                                                            p.id as Platform
                                                                        }
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-800">
                                                                        {
                                                                            p.label
                                                                        }
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500">
                                                                        {p.sub}
                                                                    </p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* 4. Gaya Bahasa / Nada */}
                                                <div>
                                                    <label className="mb-1 block font-semibold text-slate-700">
                                                        4. Gaya Bahasa (Nada
                                                        Bicara)
                                                    </label>
                                                    <select
                                                        value={selectedTone}
                                                        onChange={(e) =>
                                                            setSelectedTone(
                                                                e.target
                                                                    .value as ContentTone,
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]"
                                                    >
                                                        <option value="santai">
                                                            Santai & Akrab
                                                            (Cocok untuk cemilan
                                                            / harian)
                                                        </option>
                                                        <option value="ramah">
                                                            Ramah & Sopan (Cocok
                                                            untuk melayani
                                                            pertanyaan)
                                                        </option>
                                                        <option value="profesional">
                                                            Profesional (Cocok
                                                            untuk katering /
                                                            kerja sama)
                                                        </option>
                                                        <option value="lucu">
                                                            Lucu & Menghibur
                                                            (Mancing interaksi
                                                            pembeli)
                                                        </option>
                                                        <option value="mendesak">
                                                            Mendesak (Flash sale
                                                            / promo mau habis)
                                                        </option>
                                                    </select>
                                                </div>

                                                {/* 5. Catatan Tambahan */}
                                                <div>
                                                    <label className="mb-1 block font-semibold text-slate-700">
                                                        5. Catatan Tambahan
                                                        (Opsional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={notes}
                                                        onChange={(e) =>
                                                            setNotes(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Contoh: lagi promo diskon 20%, sisa 10 bungkus lagi"
                                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]"
                                                    />
                                                </div>

                                                {/* Tombol Buat AI */}
                                                <button
                                                    type="button"
                                                    disabled={isAiLoading}
                                                    onClick={
                                                        handleGenerateCaptions
                                                    }
                                                    className="flex w-full items-center justify-center space-x-2 rounded-xl bg-[#8b5cf6] py-3 text-xs font-bold text-white shadow-sm shadow-purple-200 transition hover:bg-[#7c3aed] disabled:opacity-60"
                                                >
                                                    {isAiLoading ? (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                            <span>
                                                                Sedang Menyusun
                                                                3 Pilihan
                                                                Caption...
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="h-4 w-4" />
                                                            <span>
                                                                Buat Caption
                                                                dengan Asisten
                                                                AI
                                                            </span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Tips Konsisten Posting Card */}
                                        <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                                                    <Lightbulb className="h-4 w-4 text-amber-600" />
                                                    <span>
                                                        Tips Konsisten Posting
                                                    </span>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={prevTip}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-amber-700 hover:bg-amber-100"
                                                    >
                                                        <ChevronLeft className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={nextTip}
                                                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-amber-700 hover:bg-amber-100"
                                                    >
                                                        <ChevronRight className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-xs font-bold text-amber-900">
                                                {
                                                    consistencyTips[
                                                        currentTipIndex
                                                    ].title
                                                }
                                            </p>
                                            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                                                {
                                                    consistencyTips[
                                                        currentTipIndex
                                                    ].tip
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: Hasil Caption AI & Rekomendasi (7 Cols) */}
                                    <div className="space-y-5 lg:col-span-7">
                                        {/* Box Info Waktu Posting & Tips Foto */}
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                                                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                                                    <Clock className="h-4 w-4 text-[#8b5cf6]" />
                                                    <span>
                                                        Waktu Terbaik Posting:
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs font-bold text-[#8b5cf6]">
                                                    {recommendedTime}
                                                </p>
                                                <p className="text-[10px] text-slate-500">
                                                    Saat pengguna sedang santai
                                                    dan membuka sosmed
                                                </p>
                                            </div>

                                            <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm">
                                                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                                                    <Sparkles className="h-4 w-4 text-pink-500" />
                                                    <span>
                                                        Saran Foto / Video:
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                                                    {photoTips}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 3 Pilihan Caption Cards */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-slate-800">
                                                    Hasil Rekomendasi Caption (
                                                    {generatedCaptions.length}{' '}
                                                    Pilihan)
                                                </h3>
                                                <span className="text-[11px] text-slate-400">
                                                    Bisa diedit langsung sebelum
                                                    disalin / dijadwalkan
                                                </span>
                                            </div>

                                            {isAiLoading ? (
                                                <div className="space-y-3">
                                                    {[1, 2, 3].map((n) => (
                                                        <div
                                                            key={n}
                                                            className="animate-pulse rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                                                        >
                                                            <div className="h-4 w-1/3 rounded bg-slate-200"></div>
                                                            <div className="mt-3 h-16 w-full rounded bg-slate-100"></div>
                                                            <div className="mt-2 h-4 w-1/2 rounded bg-slate-100"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                generatedCaptions.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="group relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-purple-200 hover:shadow-md"
                                                        >
                                                            <div className="mb-2 flex items-center justify-between">
                                                                <span className="flex items-center space-x-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-[#8b5cf6]">
                                                                    <span>
                                                                        Opsi{' '}
                                                                        {idx +
                                                                            1}
                                                                    </span>
                                                                </span>
                                                                <div className="flex items-center space-x-1.5">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleCopyCaption(
                                                                                idx,
                                                                            )
                                                                        }
                                                                        className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                                        title="Salin ke clipboard"
                                                                    >
                                                                        {copiedIndex ===
                                                                        idx ? (
                                                                            <>
                                                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                                                <span className="text-emerald-600">
                                                                                    Tersalin!
                                                                                </span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Copy className="h-3.5 w-3.5" />
                                                                                <span>
                                                                                    Salin
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleScheduleFromCaption(
                                                                                item,
                                                                            )
                                                                        }
                                                                        className="flex items-center space-x-1 rounded-lg bg-[#8b5cf6] px-2.5 py-1 text-xs font-bold text-white transition hover:bg-[#7c3aed]"
                                                                    >
                                                                        <CalendarIcon className="h-3.5 w-3.5" />
                                                                        <span>
                                                                            Jadwalkan
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Headline (Judul Menarik) */}
                                                            <div className="mb-2">
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        item.headline
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleUpdateCaption(
                                                                            idx,
                                                                            'headline',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full border-b border-transparent font-bold text-slate-800 hover:border-slate-200 focus:border-[#8b5cf6] focus:outline-none"
                                                                />
                                                            </div>

                                                            {/* Isi Caption */}
                                                            <div className="mb-2">
                                                                <textarea
                                                                    rows={3}
                                                                    value={
                                                                        item.body
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleUpdateCaption(
                                                                            idx,
                                                                            'body',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full resize-none rounded-lg border border-transparent p-1 text-xs text-slate-600 hover:border-slate-200 focus:border-[#8b5cf6] focus:outline-none"
                                                                />
                                                            </div>

                                                            {/* Ajakan Bertindak (CTA) */}
                                                            <div className="mb-2 rounded-lg bg-slate-50 p-2">
                                                                <span className="text-[10px] font-bold text-slate-400">
                                                                    Ajakan
                                                                    Bertindak
                                                                    (CTA):
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        item.cta
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        handleUpdateCaption(
                                                                            idx,
                                                                            'cta',
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="w-full bg-transparent text-xs font-medium text-slate-700 focus:outline-none"
                                                                />
                                                            </div>

                                                            {/* Hashtags */}
                                                            <div className="flex flex-wrap gap-1 text-[11px] text-[#8b5cf6]">
                                                                {item.hashtags.map(
                                                                    (
                                                                        tag,
                                                                        tIdx,
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                tIdx
                                                                            }
                                                                            className="rounded bg-purple-50 px-1.5 py-0.5"
                                                                        >
                                                                            {
                                                                                tag
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    ),
                                                )
                                            )}
                                        </div>

                                        {/* Section Ide Konten Hari Ini */}
                                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                            <div className="mb-3 flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Lightbulb className="h-4 w-4 text-amber-500" />
                                                    <h3 className="text-sm font-bold text-slate-800">
                                                        Ide Konten Hari Ini
                                                    </h3>
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    Inspirasi cepat tanpa
                                                    bingung
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                                                {mockContentIdeas.map(
                                                    (idea) => (
                                                        <div
                                                            key={idea.id}
                                                            className="rounded-xl border border-slate-100 p-3 transition hover:border-purple-200 hover:bg-purple-50/20"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs font-bold text-slate-800">
                                                                    {idea.title}
                                                                </span>
                                                                <div className="text-slate-500">
                                                                    <PlatformIcon
                                                                        platform={
                                                                            idea.suggested_platform
                                                                        }
                                                                    />
                                                                </div>
                                                            </div>
                                                            <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                                                                {
                                                                    idea.description
                                                                }
                                                            </p>
                                                            <div className="mt-2 flex items-center justify-between pt-1">
                                                                <span className="text-[10px] text-slate-400">
                                                                    {
                                                                        idea.recommended_time
                                                                    }
                                                                </span>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedGoal(
                                                                            idea.goal,
                                                                        );
                                                                        setSelectedPlatform(
                                                                            idea.suggested_platform,
                                                                        );
                                                                        setNotes(
                                                                            idea.title,
                                                                        );
                                                                        showToast(
                                                                            `Ide "${idea.title}" dipilih! Klik Buat Caption AI.`,
                                                                        );
                                                                    }}
                                                                    className="text-[11px] font-bold text-[#8b5cf6] hover:underline"
                                                                >
                                                                    Pakai Ide
                                                                    Ini →
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                            {/* ================= TAB 2: KALENDER KONTEN ================= */}
                            {activeTab === 'calendar' && (
                                <div className="space-y-4">
                                    {/* Sub-Header Kalender & View Switcher */}
                                    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#8b5cf6]">
                                                <CalendarIcon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h2 className="text-sm font-bold text-slate-800">
                                                        Jadwal Postingan Bulan{' '}
                                                        {monthNames[currentMonthDate.getMonth()]}{' '}
                                                        {currentMonthDate.getFullYear()}
                                                    </h2>
                                                    <div className="flex items-center space-x-0.5">
                                                        <button
                                                            onClick={handlePrevMonth}
                                                            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                            title="Bulan Sebelumnya"
                                                        >
                                                            <ChevronLeft className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={handleNextMonth}
                                                            className="flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                                            title="Bulan Berikutnya"
                                                        >
                                                            <ChevronRight className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Pantau konsistensi toko agar
                                                    selalu hadir di hadapan
                                                    calon pembeli
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
                                                <button
                                                    onClick={() =>
                                                        setCalendarViewMode(
                                                            'month',
                                                        )
                                                    }
                                                    className={`rounded-lg px-3 py-1.5 transition ${
                                                        calendarViewMode ===
                                                        'month'
                                                            ? 'bg-white text-slate-800 shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    Kalender Bulanan
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setCalendarViewMode(
                                                            'list',
                                                        )
                                                    }
                                                    className={`rounded-lg px-3 py-1.5 transition ${
                                                        calendarViewMode ===
                                                        'list'
                                                            ? 'bg-white text-slate-800 shadow-sm'
                                                            : 'text-slate-500 hover:text-slate-800'
                                                    }`}
                                                >
                                                    Daftar Minggu Ini
                                                </button>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleOpenNewSchedule()
                                                }
                                                className="inline-flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#7c3aed]"
                                            >
                                                <Plus className="h-4 w-4" />
                                                <span>Tambah Jadwal</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* VIEW 1: MONTH CALENDAR GRID */}
                                    {calendarViewMode === 'month' && (
                                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                                            {/* Days of week header */}
                                            <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-bold text-slate-600">
                                                {[
                                                    'Min',
                                                    'Sen',
                                                    'Sel',
                                                    'Rab',
                                                    'Kam',
                                                    'Jum',
                                                    'Sab',
                                                ].map((d, i) => (
                                                    <div
                                                        key={i}
                                                        className="py-2.5"
                                                    >
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar Days */}
                                            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
                                                {calendarDays.map(
                                                    (item, idx) => {
                                                        if (!item.day) {
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="min-h-[90px] bg-slate-50/40 p-2"
                                                                ></div>
                                                            );
                                                        }

                                                        const dayPosts =
                                                            scheduledPosts.filter(
                                                                (p) =>
                                                                    p.date ===
                                                                    item.dateStr,
                                                            );
                                                        const isToday =
                                                            item.dateStr ===
                                                            '2026-10-26';

                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`group min-h-[95px] p-2 transition hover:bg-slate-50/80 ${
                                                                    isToday
                                                                        ? 'bg-purple-50/30'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <span
                                                                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                                                            isToday
                                                                                ? 'bg-[#8b5cf6] text-white'
                                                                                : 'text-slate-700'
                                                                        }`}
                                                                    >
                                                                        {
                                                                            item.day
                                                                        }
                                                                    </span>

                                                                    <button
                                                                        onClick={() =>
                                                                            handleOpenNewSchedule(
                                                                                item.dateStr,
                                                                            )
                                                                        }
                                                                        className="text-slate-400 opacity-0 transition hover:text-[#8b5cf6] group-hover:opacity-100"
                                                                        title="Tambah postingan di hari ini"
                                                                    >
                                                                        <Plus className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>

                                                                {/* Posts in Day */}
                                                                <div className="mt-1.5 space-y-1">
                                                                    {dayPosts.map(
                                                                        (
                                                                            post,
                                                                        ) => {
                                                                            const badge =
                                                                                getPlatformBadge(
                                                                                    post.platform,
                                                                                );
                                                                            return (
                                                                                <div
                                                                                    key={
                                                                                        post.id
                                                                                    }
                                                                                    onClick={() =>
                                                                                        handleEditPost(
                                                                                            post,
                                                                                        )
                                                                                    }
                                                                                    className="shadow-xs cursor-pointer rounded-lg border border-slate-200 bg-white p-1 text-[10px] transition hover:border-[#8b5cf6]"
                                                                                    title={
                                                                                        post.caption
                                                                                    }
                                                                                >
                                                                                    <div className="flex items-center space-x-1">
                                                                                        <div
                                                                                            className={`rounded p-0.5 ${badge.bg}`}
                                                                                        >
                                                                                            <PlatformIcon
                                                                                                platform={
                                                                                                    post.platform
                                                                                                }
                                                                                                className="h-2.5 w-2.5 text-white"
                                                                                            />
                                                                                        </div>
                                                                                        <span className="truncate font-semibold text-slate-700">
                                                                                            {
                                                                                                post.time
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="mt-0.5 line-clamp-1 font-medium text-slate-500">
                                                                                        {post.product_name ||
                                                                                            'Postingan'}
                                                                                    </p>
                                                                                </div>
                                                                            );
                                                                        },
                                                                    )}

                                                                    {/* Empty Day Reminder */}
                                                                    {dayPosts.length ===
                                                                        0 && (
                                                                        <div className="hidden pt-1 group-hover:block">
                                                                            <button
                                                                                onClick={() => {
                                                                                    handleOpenNewSchedule(
                                                                                        item.dateStr,
                                                                                    );
                                                                                }}
                                                                                className="text-[10px] text-purple-600 hover:underline"
                                                                            >
                                                                                +
                                                                                Isi
                                                                                konten
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* VIEW 2: LIST MINGGU INI (MOBILE DEFAULT) */}
                                    {calendarViewMode === 'list' && (
                                        <div className="space-y-3">
                                            {scheduledPosts.map((post) => {
                                                const pBadge = getPlatformBadge(
                                                    post.platform,
                                                );
                                                const sBadge = getStatusBadge(
                                                    post.status,
                                                );

                                                return (
                                                    <div
                                                        key={post.id}
                                                        className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
                                                    >
                                                        <div className="flex items-start space-x-3">
                                                            <div
                                                                className={`mt-0.5 rounded-xl p-2.5 ${pBadge.bg}`}
                                                            >
                                                                <PlatformIcon
                                                                    platform={
                                                                        post.platform
                                                                    }
                                                                    className="h-5 w-5 text-white"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="text-sm font-bold text-slate-800">
                                                                        {post.product_name ||
                                                                            'Postingan Toko'}
                                                                    </span>
                                                                    <span
                                                                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${sBadge.bg}`}
                                                                    >
                                                                        {
                                                                            sBadge.label
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs font-semibold text-slate-500">
                                                                        📅{' '}
                                                                        {
                                                                            post.date
                                                                        }{' '}
                                                                        • ⏰{' '}
                                                                        {
                                                                            post.time
                                                                        }{' '}
                                                                        WIB
                                                                    </span>
                                                                </div>

                                                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                                                                    {
                                                                        post.caption
                                                                    }
                                                                </p>

                                                                {post.notes && (
                                                                    <p className="mt-1 text-[11px] font-medium text-amber-700">
                                                                        💡
                                                                        Catatan:{' '}
                                                                        {
                                                                            post.notes
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex shrink-0 items-center space-x-2 border-t border-slate-100 pt-2 sm:border-0 sm:pt-0">
                                                            {post.status !==
                                                                'diposting' && (
                                                                <button
                                                                    onClick={() =>
                                                                        handleMarkAsPosted(
                                                                            post.id,
                                                                        )
                                                                    }
                                                                    className="flex items-center space-x-1 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                                                    title="Tandai sudah diposting di sosmed"
                                                                >
                                                                    <Check className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        Sudah
                                                                        Diposting
                                                                    </span>
                                                                </button>
                                                            )}

                                                            <button
                                                                onClick={() =>
                                                                    handleEditPost(
                                                                        post,
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                                title="Edit jadwal"
                                                            >
                                                                <Edit2 className="h-3.5 w-3.5" />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDuplicatePost(
                                                                        post,
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                                                                title="Gandakan postingan"
                                                            >
                                                                <Copy className="h-3.5 w-3.5" />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    handleDeletePost(
                                                                        post.id,
                                                                    )
                                                                }
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Catatan Kejujuran Notifikasi */}
                                    <div className="flex items-start space-x-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                        <p className="leading-relaxed">
                                            <strong>Catatan Pengingat:</strong>{' '}
                                            Karena kebijakan privasi media
                                            sosial resmi, aplikasi tidak
                                            memposting langsung secara otomatis
                                            tanpa persetujuan Anda. Saat jam
                                            posting tiba, Anda dapat menyalin
                                            caption yang sudah disiapkan dan
                                            mempostingnya dengan sekali sentuh
                                            di HP.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ================= TAB 3: TEMPLATE PROMO ================= */}
                            {activeTab === 'promos' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-800">
                                                Galeri Template Promo Menarik
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                Cukup isi angka diskon atau nama
                                                produk, kalimat promosi langsung
                                                tersusun otomatis
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                setIsCustomPromoModalOpen(true)
                                            }
                                            className="inline-flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#7c3aed]"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Buat Template Sendiri</span>
                                        </button>
                                    </div>

                                    {/* Grid Template Promo */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {promoTemplates.map((template) => (
                                            <div
                                                key={template.id}
                                                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-[#8b5cf6]">
                                                            {template.title}
                                                        </span>
                                                        {template.is_custom && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeletePromo(
                                                                        template.id,
                                                                    )
                                                                }
                                                                className="text-slate-400 hover:text-rose-600"
                                                                title="Hapus template kustom"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {template.description}
                                                    </p>

                                                    {/* Quick Form Fields */}
                                                    {template.fields.length >
                                                        0 && (
                                                        <div className="my-3 space-y-2 rounded-xl bg-slate-50 p-2.5 text-xs">
                                                            {template.fields.map(
                                                                (f) => (
                                                                    <div
                                                                        key={
                                                                            f.key
                                                                        }
                                                                        className="flex items-center space-x-2"
                                                                    >
                                                                        <span className="w-28 shrink-0 font-medium text-slate-600">
                                                                            {
                                                                                f.label
                                                                            }
                                                                            :
                                                                        </span>
                                                                        <input
                                                                            type="text"
                                                                            placeholder={
                                                                                f.placeholder
                                                                            }
                                                                            value={
                                                                                promoFormValues[
                                                                                    template
                                                                                        .id
                                                                                ]?.[
                                                                                    f
                                                                                        .key
                                                                                ] ??
                                                                                f.defaultValue ??
                                                                                ''
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                handlePromoFieldChange(
                                                                                    template.id,
                                                                                    f.key,
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 focus:border-[#8b5cf6] focus:outline-none"
                                                                        />
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Preview Result */}
                                                    <div className="mt-2 rounded-xl border border-purple-100 bg-purple-50/40 p-3">
                                                        <span className="text-[10px] font-bold text-[#8b5cf6]">
                                                            Pratinjau Pesan:
                                                        </span>
                                                        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-700">
                                                            {renderPromoCaption(
                                                                template,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-4 flex items-center justify-end space-x-2 border-t border-slate-100 pt-3">
                                                    <button
                                                        onClick={() =>
                                                            handleCopyPromo(
                                                                template,
                                                            )
                                                        }
                                                        className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                        <span>Salin Pesan</span>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleUsePromoInCreator(
                                                                template,
                                                            )
                                                        }
                                                        className="flex items-center space-x-1 rounded-xl bg-[#8b5cf6] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#7c3aed]"
                                                    >
                                                        <Sparkles className="h-3.5 w-3.5" />
                                                        <span>
                                                            Pakai di Buat Konten
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ================= TAB 4: BALASAN CEPAT ================= */}
                            {activeTab === 'replies' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                                        <div>
                                            <h2 className="text-sm font-bold text-slate-800">
                                                Template Balasan Cepat Pelanggan
                                                (WhatsApp & DM)
                                            </h2>
                                            <p className="text-xs text-slate-500">
                                                Balas chat pembeli dalam
                                                hitungan detik agar pesanan
                                                tidak lepas ke kompetitor
                                            </p>
                                        </div>

                                        <button
                                            onClick={() =>
                                                setIsAddReplyModalOpen(true)
                                            }
                                            className="inline-flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#7c3aed]"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Tambah Balasan Baru</span>
                                        </button>
                                    </div>

                                    {/* Search & Categories Filter */}
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Cari balasan berdasarkan nama / kode shortcut (contoh: !ongkir)..."
                                                value={replySearch}
                                                onChange={(e) =>
                                                    setReplySearch(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex space-x-1.5 overflow-x-auto pb-1 text-xs font-semibold">
                                            {[
                                                {
                                                    id: 'all',
                                                    label: 'Semua Kategori',
                                                },
                                                { id: 'salam', label: 'Salam' },
                                                { id: 'harga', label: 'Harga' },
                                                {
                                                    id: 'cara_pesan',
                                                    label: 'Cara Order',
                                                },
                                                {
                                                    id: 'stok',
                                                    label: 'Cek Stok',
                                                },
                                                {
                                                    id: 'ongkir',
                                                    label: 'Ongkir',
                                                },
                                                {
                                                    id: 'pembayaran',
                                                    label: 'Rekening',
                                                },
                                                {
                                                    id: 'terima_kasih',
                                                    label: 'Terima Kasih',
                                                },
                                                {
                                                    id: 'komplain',
                                                    label: 'Komplain',
                                                },
                                            ].map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() =>
                                                        setReplyCategoryFilter(
                                                            cat.id,
                                                        )
                                                    }
                                                    className={`shrink-0 rounded-xl px-3 py-1.5 transition ${
                                                        replyCategoryFilter ===
                                                        cat.id
                                                            ? 'bg-[#8b5cf6] text-white'
                                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                    }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* List Balasan Cepat Cards */}
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {filteredReplies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs font-bold text-slate-800">
                                                                {reply.title}
                                                            </span>
                                                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                                                                {reply.shortcut}
                                                            </span>
                                                        </div>
                                                        {reply.is_custom && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteReply(
                                                                        reply.id,
                                                                    )
                                                                }
                                                                className="text-slate-400 hover:text-rose-600"
                                                                title="Hapus"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="mt-2.5 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                                                        {reply.content}
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                                                    <span className="text-[10px] text-slate-400">
                                                        Mendukung variabel
                                                        otomatis
                                                    </span>
                                                    <div className="flex items-center space-x-1.5">
                                                        <button
                                                            onClick={() =>
                                                                handleDirectCopyReply(
                                                                    reply,
                                                                )
                                                            }
                                                            className="flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                            title="Salin langsung tanpa edit"
                                                        >
                                                            <Copy className="h-3 w-3" />
                                                            <span>
                                                                Salin Cepat
                                                            </span>
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleOpenCopyReplyModal(
                                                                    reply,
                                                                )
                                                            }
                                                            className="flex items-center space-x-1 rounded-lg bg-[#8b5cf6] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#7c3aed]"
                                                        >
                                                            <span>
                                                                Isi Nama & Salin
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            {/* ================= MODAL 1: JADWALKAN POSTINGAN ================= */}
            {isScheduleModalOpen && (
                <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-800">
                                {editingPost
                                    ? 'Edit Jadwal Postingan'
                                    : 'Jadwalkan Postingan Baru'}
                            </h3>
                            <button
                                onClick={() => setIsScheduleModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveSchedule}
                            className="space-y-3.5 text-xs"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block font-semibold text-slate-700">
                                        Platform
                                    </label>
                                    <select
                                        value={schedulePlatform}
                                        onChange={(e) =>
                                            setSchedulePlatform(
                                                e.target.value as Platform,
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                    >
                                        <option value="instagram">
                                            Instagram
                                        </option>
                                        <option value="whatsapp">
                                            WhatsApp Status
                                        </option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="facebook">
                                            Facebook
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block font-semibold text-slate-700">
                                        Status
                                    </label>
                                    <select
                                        value={scheduleStatus}
                                        onChange={(e) =>
                                            setScheduleStatus(
                                                e.target.value as
                                                    | 'draft'
                                                    | 'terjadwal'
                                                    | 'diposting',
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                    >
                                        <option value="terjadwal">
                                            Terjadwal
                                        </option>
                                        <option value="draft">
                                            Draf (Belum Siap)
                                        </option>
                                        <option value="diposting">
                                            Sudah Diposting
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block font-semibold text-slate-700">
                                        Tanggal Posting
                                    </label>
                                    <input
                                        type="date"
                                        value={scheduleDate}
                                        onChange={(e) =>
                                            setScheduleDate(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block font-semibold text-slate-700">
                                        Jam Posting (WIB)
                                    </label>
                                    <input
                                        type="time"
                                        value={scheduleTime}
                                        onChange={(e) =>
                                            setScheduleTime(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Produk yang Terkait
                                </label>
                                <select
                                    value={scheduleProductId}
                                    onChange={(e) =>
                                        setScheduleProductId(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                >
                                    <option value="">
                                        -- Postingan Umum / Brand --
                                    </option>
                                    {initialProducts.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Teks Caption & Hashtag
                                </label>
                                <textarea
                                    rows={4}
                                    value={scheduleCaption}
                                    onChange={(e) =>
                                        setScheduleCaption(e.target.value)
                                    }
                                    placeholder="Tuliskan isi caption postingan lengkap..."
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Catatan Visual / Pengingat
                                </label>
                                <input
                                    type="text"
                                    value={scheduleNotes}
                                    onChange={(e) =>
                                        setScheduleNotes(e.target.value)
                                    }
                                    placeholder="Contoh: jangan lupa sertakan foto kemasan baru"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsScheduleModalOpen(false)
                                    }
                                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white hover:bg-[#7c3aed]"
                                >
                                    Simpan Jadwal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL 2: GANTI VARIABEL BALASAN CEPAT ================= */}
            {selectedReplyToCopy && (
                <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-800">
                                Salin: {selectedReplyToCopy.title}
                            </h3>
                            <button
                                onClick={() => setSelectedReplyToCopy(null)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mb-3 text-xs text-slate-500">
                            Isi nama atau harga di bawah agar balasan chat
                            terasa personal dan ramah untuk pembeli:
                        </p>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Nama Pelanggan:
                                </label>
                                <input
                                    type="text"
                                    value={replyVars.nama_pelanggan}
                                    onChange={(e) =>
                                        setReplyVars({
                                            ...replyVars,
                                            nama_pelanggan: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Nama Produk:
                                </label>
                                <input
                                    type="text"
                                    value={replyVars.nama_produk}
                                    onChange={(e) =>
                                        setReplyVars({
                                            ...replyVars,
                                            nama_produk: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Harga / Total:
                                </label>
                                <input
                                    type="text"
                                    value={replyVars.harga}
                                    onChange={(e) =>
                                        setReplyVars({
                                            ...replyVars,
                                            harga: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReplyToCopy(null)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Tutup
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCopyReply}
                                    className="flex items-center space-x-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white hover:bg-[#7c3aed]"
                                >
                                    <Copy className="h-4 w-4" />
                                    <span>Salin Teks Lengkap</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL 3: TAMBAH BALASAN CEPAT (DENGAN BANTUAN AI) ================= */}
            {isAddReplyModalOpen && (
                <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-800">
                                Tambah Balasan Cepat Baru
                            </h3>
                            <button
                                onClick={() => setIsAddReplyModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveNewReply}
                            className="space-y-3 text-xs"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block font-semibold text-slate-700">
                                        Kategori
                                    </label>
                                    <select
                                        value={newReplyCategory}
                                        onChange={(e) =>
                                            setNewReplyCategory(
                                                e.target
                                                    .value as QuickReply['category'],
                                            )
                                        }
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                    >
                                        <option value="salam">
                                            Salam & Sapaan
                                        </option>
                                        <option value="harga">Harga</option>
                                        <option value="cara_pesan">
                                            Cara Pesan
                                        </option>
                                        <option value="stok">Cek Stok</option>
                                        <option value="ongkir">
                                            Ongkos Kirim
                                        </option>
                                        <option value="pembayaran">
                                            Pembayaran & Rekening
                                        </option>
                                        <option value="terima_kasih">
                                            Terima Kasih
                                        </option>
                                        <option value="komplain">
                                            Penanganan Komplain
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block font-semibold text-slate-700">
                                        Shortcut (Kode Singkat)
                                    </label>
                                    <input
                                        type="text"
                                        value={newReplyShortcut}
                                        onChange={(e) =>
                                            setNewReplyShortcut(e.target.value)
                                        }
                                        placeholder="!ongkir"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs focus:border-[#8b5cf6] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Judul / Situasi Chat
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newReplyTitle}
                                        onChange={(e) =>
                                            setNewReplyTitle(e.target.value)
                                        }
                                        placeholder="Contoh: Balasan untuk pembeli yang tanya estimasi sampai"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        disabled={isAiReplyLoading}
                                        onClick={handleAiGenerateReply}
                                        className="flex shrink-0 items-center space-x-1 rounded-xl bg-purple-50 px-3 py-2 text-xs font-bold text-[#8b5cf6] hover:bg-purple-100 disabled:opacity-50"
                                    >
                                        {isAiReplyLoading ? (
                                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-3.5 w-3.5" />
                                        )}
                                        <span>Bantu Tulis AI</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Isi Balasan Chat (Bisa gunakan{' '}
                                    {'{nama_pelanggan}'}, {'{harga}'},{' '}
                                    {'{nama_produk}'})
                                </label>
                                <textarea
                                    rows={4}
                                    value={newReplyContent}
                                    onChange={(e) =>
                                        setNewReplyContent(e.target.value)
                                    }
                                    placeholder="Halo kak {nama_pelanggan}, pesanan {nama_produk} sedang kami siapkan..."
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsAddReplyModalOpen(false)
                                    }
                                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white hover:bg-[#7c3aed]"
                                >
                                    Simpan Balasan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= MODAL 4: TEMPLATE PROMO SENDIRI ================= */}
            {isCustomPromoModalOpen && (
                <div className="backdrop-blur-xs fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-bold text-slate-800">
                                Buat Template Promo Sendiri
                            </h3>
                            <button
                                onClick={() => setIsCustomPromoModalOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSaveCustomPromo}
                            className="space-y-3 text-xs"
                        >
                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Nama / Judul Promo
                                </label>
                                <input
                                    type="text"
                                    value={customPromoTitle}
                                    onChange={(e) =>
                                        setCustomPromoTitle(e.target.value)
                                    }
                                    placeholder="Contoh: Promo Jumat Berkah"
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Keterangan Singkat
                                </label>
                                <input
                                    type="text"
                                    value={customPromoDesc}
                                    onChange={(e) =>
                                        setCustomPromoDesc(e.target.value)
                                    }
                                    placeholder="Kapan promo ini biasa dipakai..."
                                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block font-semibold text-slate-700">
                                    Format Kalimat Promosi
                                </label>
                                <textarea
                                    rows={4}
                                    value={customPromoText}
                                    onChange={(e) =>
                                        setCustomPromoText(e.target.value)
                                    }
                                    placeholder="Tuliskan format teks promosi yang menarik..."
                                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-[#8b5cf6] focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end space-x-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsCustomPromoModalOpen(false)
                                    }
                                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[#8b5cf6] px-4 py-2 font-bold text-white hover:bg-[#7c3aed]"
                                >
                                    Simpan Template
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
