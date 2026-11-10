import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
    Download,
    Share2,
    Sparkles,
    CheckCircle2,
    Eye,
    Palette,
    Smartphone,
    Square,
    Check,
    MessageCircle,
    Store,
    Calendar,
    Phone,
    Upload,
    Image as ImageIcon,
    Tag,
    Star,
    Flame,
    Wand2,
    RefreshCw,
    Maximize2,
    Key,
    Info,
    Smile,
    Coffee,
    HelpCircle,
    AlertCircle,
} from 'lucide-react';

export interface PosterGeneratorProps {
    initialHeadline?: string;
    initialOfferDetails?: string;
    initialValidPeriod?: string;
    initialContact?: string;
    businessName?: string;
    productName?: string;
    productImage?: string;
    productPrice?: number;
    productOriginalPrice?: number;
    onDownloadSuccess?: (msg: string) => void;
}

// Preset foto produk kuliner UMKM
interface ProductPreset {
    id: string;
    label: string;
    category: 'sambal' | 'ayam' | 'snack' | 'minuman' | 'manis';
    url: string;
    suggestedMascot: string;
    suggestedTheme: string;
}

const PRODUCT_PRESETS: ProductPreset[] = [
    {
        id: 'sambal_bawang',
        label: 'Sambal Bawang Pedas',
        category: 'sambal',
        url: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800&auto=format&fit=crop&q=80',
        suggestedMascot: 'chili',
        suggestedTheme: 'pedas_api',
    },
    {
        id: 'ayam_bakar',
        label: 'Ayam Bakar Madu',
        category: 'ayam',
        url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80',
        suggestedMascot: 'rooster',
        suggestedTheme: 'madu_hangat',
    },
    {
        id: 'keripik_tempe',
        label: 'Keripik Tempe Renyah',
        category: 'snack',
        url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=800&auto=format&fit=crop&q=80',
        suggestedMascot: 'star',
        suggestedTheme: 'kuning_ceria',
    },
    {
        id: 'kopi_susu',
        label: 'Es Kopi Susu Aren',
        category: 'minuman',
        url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
        suggestedMascot: 'coffee',
        suggestedTheme: 'kopi_karamel',
    },
    {
        id: 'nasi_komplit',
        label: 'Nasi Lauk Spesial',
        category: 'ayam',
        url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        suggestedMascot: 'chef',
        suggestedTheme: 'madu_hangat',
    },
];

// Tema visual poster komersial 3D
interface ThemeStyle {
    id: string;
    name: string;
    bgGradientTop: string;
    bgGradientBottom: string;
    radialCenter: string;
    headlineColor: string;
    headlineStroke: string;
    accentColor: string;
    dripColor: string;
    badgeBg: string;
    badgeText: string;
    starburstBg: string;
    starburstText: string;
    subBannerBg: string;
    subBannerText: string;
}

const THEME_STYLES: ThemeStyle[] = [
    {
        id: 'madu_hangat',
        name: 'Madu & Karamel Manis',
        bgGradientTop: '#f59e0b',
        bgGradientBottom: '#d97706',
        radialCenter: '#fef3c7',
        headlineColor: '#ffffff',
        headlineStroke: '#b45309',
        accentColor: '#fef08a',
        dripColor: '#fbbf24',
        badgeBg: '#b45309',
        badgeText: '#ffffff',
        starburstBg: '#78350f',
        starburstText: '#fef08a',
        subBannerBg: '#ffffff',
        subBannerText: '#92400e',
    },
    {
        id: 'pedas_api',
        name: 'Pedas Nampol & Sambal',
        bgGradientTop: '#ef4444',
        bgGradientBottom: '#991b1b',
        radialCenter: '#fee2e2',
        headlineColor: '#ffffff',
        headlineStroke: '#7f1d1d',
        accentColor: '#fef08a',
        dripColor: '#dc2626',
        badgeBg: '#7f1d1d',
        badgeText: '#ffffff',
        starburstBg: '#450a0a',
        starburstText: '#fef08a',
        subBannerBg: '#ffffff',
        subBannerText: '#b91c1c',
    },
    {
        id: 'kuning_ceria',
        name: 'Kuning Gurih & Renyah',
        bgGradientTop: '#eab308',
        bgGradientBottom: '#ca8a04',
        radialCenter: '#fef9c3',
        headlineColor: '#ffffff',
        headlineStroke: '#854d0e',
        accentColor: '#ffffff',
        dripColor: '#facc15',
        badgeBg: '#a16207',
        badgeText: '#ffffff',
        starburstBg: '#713f12',
        starburstText: '#fef9c3',
        subBannerBg: '#ffffff',
        subBannerText: '#854d0e',
    },
    {
        id: 'kopi_karamel',
        name: 'Kopi Susu & Cokelat',
        bgGradientTop: '#78350f',
        bgGradientBottom: '#451a03',
        radialCenter: '#fed7aa',
        headlineColor: '#ffffff',
        headlineStroke: '#291003',
        accentColor: '#fdba74',
        dripColor: '#92400e',
        badgeBg: '#451a03',
        badgeText: '#ffffff',
        starburstBg: '#1c0a00',
        starburstText: '#fef08a',
        subBannerBg: '#ffffff',
        subBannerText: '#78350f',
    },
    {
        id: 'segar_hijau',
        name: 'Segar Alami & Hijau',
        bgGradientTop: '#10b981',
        bgGradientBottom: '#047857',
        radialCenter: '#d1fae5',
        headlineColor: '#ffffff',
        headlineStroke: '#064e3b',
        accentColor: '#fef08a',
        dripColor: '#059669',
        badgeBg: '#064e3b',
        badgeText: '#ffffff',
        starburstBg: '#022c22',
        starburstText: '#a7f3d0',
        subBannerBg: '#ffffff',
        subBannerText: '#065f46',
    },
];

// Pilihan Maskot Karakter 3D
interface MascotOption {
    id: string;
    label: string;
    emoji: string;
    subtitle: string;
}

const MASCOTS: MascotOption[] = [
    { id: 'chili', label: 'Cabe Pedas', emoji: '🌶️', subtitle: 'Pedas Juara' },
    { id: 'bee', label: 'Lebah Madu', emoji: '🐝', subtitle: 'Manis Alami' },
    { id: 'rooster', label: 'Ayam Jago', emoji: '🍗', subtitle: 'Gurih Mantap' },
    { id: 'coffee', label: 'Gelas Kopi', emoji: '☕', subtitle: 'Segar Nikmat' },
    { id: 'chef', label: 'Koki Cilik', emoji: '👨‍🍳', subtitle: 'Resep Rahasia' },
    { id: 'star', label: 'Bintang Promo', emoji: '⭐', subtitle: 'Paling Laris' },
];

export default function PosterGenerator({
    initialHeadline,
    initialOfferDetails = 'Start from 15k • 100% Halal • Tanpa Pengawet',
    initialValidPeriod = 'Berlaku Setiap Hari • Selama Persediaan Ada',
    initialContact = '0812-3456-7890 (Pesan via WhatsApp)',
    businessName = 'Dapur Bu Siti',
    productName = '',
    productImage,
    productPrice = 25000,
    productOriginalPrice = 35000,
    onDownloadSuccess,
}: PosterGeneratorProps) {
    // Current Active Product Info
    const [currentProductName, setCurrentProductName] = useState(productName || 'Sambal Bawang Spesial');
    const [headline, setHeadline] = useState(
        initialHeadline || `SEMUA ORANG SUKA ${productName ? productName.toUpperCase() : 'MENU SPESIAL'}`
    );
    const [subHeadline, setSubHeadline] = useState('Temukan sensasi lezat istimewa dalam setiap suapan!');
    const [offerDetails, setOfferDetails] = useState(initialOfferDetails);
    const [variantText, setVariantText] = useState('Varian: Original • Pedas • Spesial');
    const [promoPriceText, setPromoPriceText] = useState(
        productPrice ? `Start from ${Math.round(productPrice / 1000)}k` : 'Start from 15k'
    );
    const [contact, setContact] = useState(initialContact);
    const [callToAction, setCallToAction] = useState('Yuk borong sekarang juga!');

    // Styling & Mascot
    const [selectedMascot, setSelectedMascot] = useState<string>('chili');
    const [themeId, setThemeId] = useState<string>('madu_hangat');
    const [activePhoto, setActivePhoto] = useState<string>(
        productImage || PRODUCT_PRESETS[0].url
    );

    // AI Generated Image State
    const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState<string | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
        try {
            return localStorage.getItem('gemini_user_api_key') || '';
        } catch {
            return '';
        }
    });
    const [aiErrorMessage, setAiErrorMessage] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Update state when external product selection changes
    useEffect(() => {
        if (productName) {
            setCurrentProductName(productName);
            setHeadline(`SEMUA ORANG SUKA ${productName.toUpperCase()}`);

            // Otomatis sesuaikan maskot & tema sesuai produk
            const lower = productName.toLowerCase();
            if (lower.includes('sambal') || lower.includes('pedas') || lower.includes('geprek')) {
                setSelectedMascot('chili');
                setThemeId('pedas_api');
                setSubHeadline('Sensasi pedas nampol bumbu rempah nusantara pilihan!');
            } else if (lower.includes('kopi') || lower.includes('minum') || lower.includes('teh') || lower.includes('boba')) {
                setSelectedMascot('coffee');
                setThemeId('kopi_karamel');
                setSubHeadline('Kesegaran dahaga terbaik pelepas penat harimu!');
            } else if (lower.includes('ayam') || lower.includes('bebek') || lower.includes('daging')) {
                setSelectedMascot('rooster');
                setThemeId('madu_hangat');
                setSubHeadline('Daging empuk bumbu meresap sampai ke tulang!');
            } else if (lower.includes('keripik') || lower.includes('tempe') || lower.includes('snack')) {
                setSelectedMascot('star');
                setThemeId('kuning_ceria');
                setSubHeadline('Camilan renyah gurih bikin susah berhenti ngunyah!');
            } else if (lower.includes('roti') || lower.includes('kue') || lower.includes('donat') || lower.includes('madu')) {
                setSelectedMascot('bee');
                setThemeId('madu_hangat');
                setSubHeadline('Tekstur lembut dengan lelehan manis menggoda selera!');
            }
        }
    }, [productName]);

    useEffect(() => {
        if (productImage) {
            setActivePhoto(productImage);
            setAiGeneratedImageUrl(null); // Reset when user switches to real product photo
        }
    }, [productImage]);

    useEffect(() => {
        if (productPrice) {
            const thousands = Math.round(productPrice / 1000);
            setPromoPriceText(`Start from ${thousands}k`);
        }
    }, [productPrice]);

    // Save API key to local storage
    const handleSaveApiKey = (key: string) => {
        setGeminiApiKey(key);
        try {
            localStorage.setItem('gemini_user_api_key', key);
        } catch {
            // Ignore
        }
    };

    const activeTheme = useMemo(() => {
        return THEME_STYLES.find((t) => t.id === themeId) || THEME_STYLES[0];
    }, [themeId]);

    const activeMascotObj = useMemo(() => {
        return MASCOTS.find((m) => m.id === selectedMascot) || MASCOTS[0];
    }, [selectedMascot]);

    // Handle user photo upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setActivePhoto(event.target.result as string);
                    setAiGeneratedImageUrl(null);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Panggil Endpoint AI (Google Imagen 3 via Gemini API)
    const handleGenerateGeminiImage = async () => {
        setIsGeneratingAi(true);
        setAiErrorMessage(null);

        try {
            const csrfToken = (
                document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
            )?.content || '';

            const response = await fetch('/api/promosi/generate-poster-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    product_name: currentProductName,
                    headline: headline,
                    offer_details: promoPriceText,
                    business_name: businessName,
                    aspect_ratio: 'feed',
                    gemini_api_key: geminiApiKey || undefined,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success && data.poster_url) {
                setAiGeneratedImageUrl(data.poster_url);
                if (onDownloadSuccess) {
                    onDownloadSuccess(`Gambar poster AI untuk ${currentProductName} berhasil digenerate!`);
                }
            } else {
                if (data.requires_api_key || !geminiApiKey) {
                    setShowApiKeyModal(true);
                }
                setAiErrorMessage(data.message || 'Gagal generate gambar via Gemini API.');
            }
        } catch (err: any) {
            setAiErrorMessage(err.message || 'Koneksi ke server terputus.');
        } finally {
            setIsGeneratingAi(false);
        }
    };

    // Helper: draw image into canvas with cover mode and rounded corners
    const drawCoverImage = (
        ctx: CanvasRenderingContext2D,
        img: HTMLImageElement,
        x: number,
        y: number,
        w: number,
        h: number,
        radius: number
    ) => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, radius);
        ctx.clip();

        const imgRatio = img.width / img.height;
        const targetRatio = w / h;
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (imgRatio > targetRatio) {
            sWidth = img.height * targetRatio;
            sx = (img.width - sWidth) / 2;
        } else {
            sHeight = img.width / targetRatio;
            sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
        ctx.restore();
    };

    // Draw appetizing dripping sauce on canvas
    const drawSauceDrips = (
        ctx: CanvasRenderingContext2D,
        yStart: number,
        width: number,
        color: string
    ) => {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, yStart);

        // Smooth wave with realistic food sauce drips
        const dripPoints = [
            { x: 0, y: yStart },
            { x: 80, y: yStart + 35 },
            { x: 140, y: yStart + 80 }, // big drip 1
            { x: 190, y: yStart + 30 },
            { x: 270, y: yStart + 15 },
            { x: 350, y: yStart + 110 }, // big drip 2
            { x: 420, y: yStart + 25 },
            { x: 530, y: yStart + 45 },
            { x: 610, y: yStart + 125 }, // big drip 3
            { x: 690, y: yStart + 30 },
            { x: 790, y: yStart + 15 },
            { x: 870, y: yStart + 90 }, // big drip 4
            { x: 950, y: yStart + 35 },
            { x: 1080, y: yStart },
        ];

        for (let i = 1; i < dripPoints.length; i++) {
            const prev = dripPoints[i - 1];
            const curr = dripPoints[i];
            const midX = (prev.x + curr.x) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, midX, (prev.y + curr.y) / 2);
        }

        ctx.lineTo(width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();

        // Shiny glaze highlight line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.restore();
    };

    // Render Full Commercial 3D Poster to Canvas & Download
    const handleDownloadPoster = async () => {
        setIsDownloading(true);
        try {
            const cleanName = currentProductName.toLowerCase().replace(/[^a-z0-9]/g, '_');

            // Jika user punya hasil murni dari Imagen 3 dan memilih download langsung
            if (aiGeneratedImageUrl && aiGeneratedImageUrl.startsWith('data:image')) {
                const a = document.createElement('a');
                a.download = `poster_ai_${cleanName}.jpg`;
                a.href = aiGeneratedImageUrl;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                if (onDownloadSuccess) {
                    onDownloadSuccess(`Poster AI untuk ${currentProductName} berhasil diunduh!`);
                }
                setIsDownloading(false);
                return;
            }

            // Render HD Commercial Poster via HTML5 Canvas (1080 x 1440 HD)
            const width = 1080;
            const height = 1440;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // 1. Background Radiant Gradient
            const bgGrad = ctx.createRadialGradient(
                width / 2,
                height * 0.45,
                80,
                width / 2,
                height * 0.45,
                750
            );
            bgGrad.addColorStop(0, activeTheme.radialCenter);
            bgGrad.addColorStop(0.45, activeTheme.bgGradientTop);
            bgGrad.addColorStop(1, activeTheme.bgGradientBottom);
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // Subtle Sunburst rays effect in background
            ctx.save();
            ctx.translate(width / 2, height * 0.45);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            const numRays = 18;
            for (let i = 0; i < numRays; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const a1 = (i * 2 * Math.PI) / numRays;
                const a2 = a1 + Math.PI / numRays;
                ctx.arc(0, 0, 1100, a1, a2);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();

            // 2. Dripping Food Glaze at the Top
            drawSauceDrips(ctx, 45, width, activeTheme.dripColor);

            // 3. Top Tagline Curved Ribbon
            const ribbonW = 760;
            const ribbonH = 64;
            const ribbonX = (width - ribbonW) / 2;
            const ribbonY = 70;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 15;
            ctx.fillStyle = activeTheme.subBannerBg;
            ctx.beginPath();
            ctx.roundRect(ribbonX, ribbonY, ribbonW, ribbonH, 32);
            ctx.fill();
            ctx.restore();

            ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = activeTheme.subBannerText;
            ctx.textAlign = 'center';
            ctx.fillText(subHeadline, width / 2, ribbonY + 41);

            // 4. Main Product Title (3D Curved Commercial Typography)
            ctx.save();
            ctx.textAlign = 'center';

            // Store Name sub-badge
            ctx.font = '900 26px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = activeTheme.accentColor;
            ctx.fillText(businessName.toUpperCase(), width / 2, 175);

            // Giant Commercial Title
            ctx.font = '900 68px "Plus Jakarta Sans", sans-serif';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 14;
            ctx.strokeStyle = activeTheme.headlineStroke;
            ctx.strokeText(currentProductName.toUpperCase(), width / 2, 255);

            ctx.fillStyle = activeTheme.headlineColor;
            ctx.fillText(currentProductName.toUpperCase(), width / 2, 255);
            ctx.restore();

            // 5. Hero Product Image (3D Floating Oval / Rounded Platter)
            const heroW = 780;
            const heroH = 540;
            const heroX = (width - heroW) / 2;
            const heroY = 300;

            // Platter drop shadow
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
            ctx.shadowBlur = 35;
            ctx.shadowOffsetY = 18;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.roundRect(heroX - 10, heroY - 10, heroW + 20, heroH + 20, 48);
            ctx.fill();
            ctx.restore();

            // Draw product image
            const heroImg = new Image();
            heroImg.crossOrigin = 'anonymous';
            await new Promise<void>((resolve) => {
                heroImg.onload = () => resolve();
                heroImg.onerror = () => resolve();
                heroImg.src = activePhoto;
            });
            drawCoverImage(ctx, heroImg, heroX, heroY, heroW, heroH, 40);

            // 6. Food Drips along Hero Plate bottom
            ctx.save();
            ctx.fillStyle = activeTheme.dripColor;
            ctx.beginPath();
            ctx.roundRect(heroX + 40, heroY + heroH - 25, heroW - 80, 40, 20);
            ctx.fill();
            ctx.restore();

            // 7. Left Side: Variant Tags
            const varCardW = 340;
            const varCardH = 130;
            const varCardX = 60;
            const varCardY = 875;

            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.roundRect(varCardX, varCardY, varCardW, varCardH, 24);
            ctx.fill();
            ctx.restore();

            ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = activeTheme.starburstBg;
            ctx.textAlign = 'left';
            ctx.fillText('✨ Keunggulan & Varian:', varCardX + 24, varCardY + 40);

            ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#334155';
            ctx.fillText(variantText, varCardX + 24, varCardY + 75);
            ctx.fillText('100% Halal & Bahan Segar', varCardX + 24, varCardY + 105);

            // 8. Right Side: Big Starburst Price Badge (e.g. "Start from 15k")
            const badgeRadius = 130;
            const badgeCenterX = width - 180;
            const badgeCenterY = 940;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 24;
            ctx.shadowOffsetY = 10;
            ctx.fillStyle = activeTheme.starburstBg;
            ctx.beginPath();
            ctx.arc(badgeCenterX, badgeCenterY, badgeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Inner dashed ring
            ctx.strokeStyle = activeTheme.starburstText;
            ctx.lineWidth = 4;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(badgeCenterX, badgeCenterY, badgeRadius - 12, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('PROMO SPESIAL', badgeCenterX, badgeCenterY - 45);

            ctx.font = '900 46px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = activeTheme.starburstText;
            ctx.fillText(promoPriceText, badgeCenterX, badgeCenterY + 10);

            ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText('Hanya Hari Ini!', badgeCenterX, badgeCenterY + 55);
            ctx.restore();

            // 9. Cute Mascot Sticker (Near bottom center)
            ctx.save();
            ctx.font = '84px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(activeMascotObj.emoji, width / 2 - 140, 1070);
            ctx.restore();

            // 10. Comic Speech Bubble: "Yuk borong sekarang juga!"
            const bubbleW = 420;
            const bubbleH = 70;
            const bubbleX = width / 2 - 80;
            const bubbleY = 1020;

            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 20);
            ctx.fill();

            // Speech pointer
            ctx.beginPath();
            ctx.moveTo(bubbleX, bubbleY + 35);
            ctx.lineTo(bubbleX - 25, bubbleY + 45);
            ctx.lineTo(bubbleX, bubbleY + 55);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = activeTheme.starburstBg;
            ctx.textAlign = 'center';
            ctx.fillText(`💬 ${callToAction}`, bubbleX + bubbleW / 2, bubbleY + 44);

            // 11. Bottom Banner: WhatsApp Order Bar
            const barW = 960;
            const barH = 100;
            const barX = (width - barW) / 2;
            const barY = height - 145;

            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#22c55e'; // WhatsApp Green
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW, barH, 30);
            ctx.fill();
            ctx.restore();

            ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(`📲 PESAN VIA WHATSAPP: ${contact}`, width / 2, barY + 62);

            // Convert to download
            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            const a = document.createElement('a');
            a.download = `poster_komersial_${cleanName}.jpg`;
            a.href = dataUrl;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            if (onDownloadSuccess) {
                onDownloadSuccess(`Poster komersial untuk ${currentProductName} berhasil diunduh!`);
            }
        } catch (err: any) {
            console.error('Download error:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            {/* Header: Title & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-orange-100">
                        <Wand2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <span>Generator Poster Promosi Komersial</span>
                            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-800">
                                Gaya 3D Ilustrasi & Penjualan
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500">
                            Menghasilkan poster jualan menarik untuk <strong>{currentProductName}</strong> secara otomatis, dapat diunduh dalam kualitas HD.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowApiKeyModal(!showApiKeyModal)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                        <Key className="h-3.5 w-3.5 text-amber-600" />
                        <span>{geminiApiKey ? 'Gemini API: Aktif' : 'Atur Gemini API'}</span>
                    </button>
                </div>
            </div>

            {/* Modal / Pengaturan Kunci Gemini API (Opsional) */}
            {showApiKeyModal && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-amber-700 shrink-0" />
                            <h4 className="text-xs font-black text-amber-900">
                                Pengaturan Google Gemini API (Untuk Gambar AI)
                            </h4>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowApiKeyModal(false)}
                            className="text-xs font-bold text-amber-800 hover:underline"
                        >
                            Tutup
                        </button>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                        Masukkan kunci API Gemini dari <strong>Google AI Studio</strong> (aistudio.google.com) untuk generate ilustrasi baru menggunakan Google Imagen 3. Jika kosong, sistem tetap menyusun poster visual komersial interaktif secara dinamis!
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                        <input
                            type="password"
                            value={geminiApiKey}
                            onChange={(e) => handleSaveApiKey(e.target.value)}
                            placeholder="Tempel Gemini API Key (AIzaSy...)"
                            className="flex-1 rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                handleSaveApiKey(geminiApiKey);
                                setShowApiKeyModal(false);
                            }}
                            className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            )}

            {/* Alert Error jika AI gagal */}
            {aiErrorMessage && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                    <span className="flex-1">{aiErrorMessage}</span>
                    <button
                        type="button"
                        onClick={() => setAiErrorMessage(null)}
                        className="font-bold underline ml-2"
                    >
                        Tutup
                    </button>
                </div>
            )}

            {/* Main Interactive Grid */}
            <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Visual Poster Preview Column (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Eye className="h-3.5 w-3.5 text-amber-600" />
                            <span>Pratinjau Poster Komersial: {currentProductName}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Kualitas Cetak HD
                        </span>
                    </div>

                    {/* LIVE 3D COMMERCIAL POSTER PREVIEW */}
                    <div
                        className="relative w-full max-w-[360px] rounded-3xl p-4 text-white shadow-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 select-none border-4 border-amber-200/50 aspect-[3/4]"
                        style={{
                            background: `radial-gradient(circle at 50% 45%, ${activeTheme.radialCenter} 0%, ${activeTheme.bgGradientTop} 50%, ${activeTheme.bgGradientBottom} 100%)`,
                        }}
                    >
                        {/* Sauce Drips at Top */}
                        <div
                            className="absolute top-0 left-0 right-0 h-8 pointer-events-none rounded-b-2xl shadow-sm"
                            style={{ backgroundColor: activeTheme.dripColor }}
                        />

                        {/* Top Curved Tagline Pill */}
                        <div className="relative mt-2 text-center">
                            <span
                                className="inline-block rounded-full px-3 py-1 text-[10px] font-bold shadow-md truncate max-w-[90%]"
                                style={{
                                    backgroundColor: activeTheme.subBannerBg,
                                    color: activeTheme.subBannerText,
                                }}
                            >
                                {subHeadline}
                            </span>
                        </div>

                        {/* Store & Big 3D Commercial Product Headline */}
                        <div className="relative text-center my-1">
                            <p
                                className="text-[10px] font-black uppercase tracking-wider"
                                style={{ color: activeTheme.accentColor }}
                            >
                                {businessName}
                            </p>
                            <h2
                                className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-none drop-shadow-md"
                                style={{
                                    color: activeTheme.headlineColor,
                                    textShadow: `2px 2px 0px ${activeTheme.headlineStroke}, -2px -2px 0px ${activeTheme.headlineStroke}`,
                                }}
                            >
                                {currentProductName}
                            </h2>
                        </div>

                        {/* Center Stage: Hero Product Photo on 3D Dish */}
                        <div className="relative my-auto w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white bg-white/90 aspect-[4/3] group">
                            {aiGeneratedImageUrl ? (
                                <img
                                    src={aiGeneratedImageUrl}
                                    alt={currentProductName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={activePhoto}
                                    alt={currentProductName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />
                            )}

                            {/* Dripping sauce accent on dish */}
                            <div
                                className="absolute bottom-0 left-4 right-4 h-2.5 rounded-t-lg opacity-90 shadow-sm"
                                style={{ backgroundColor: activeTheme.dripColor }}
                            />
                        </div>

                        {/* Middle Info: Left (Variant) & Right (Starburst Price Badge) */}
                        <div className="relative flex items-center justify-between gap-2 mt-2">
                            {/* Variant Chip */}
                            <div className="rounded-xl bg-white/95 px-2.5 py-1.5 shadow-md text-slate-800 text-[10px] max-w-[170px]">
                                <p className="font-extrabold text-[9px] uppercase tracking-wide text-amber-900">
                                    Varian Pilihan
                                </p>
                                <p className="font-bold truncate text-slate-700">{variantText}</p>
                            </div>

                            {/* Circular Starburst Price Badge */}
                            <div
                                className="flex flex-col items-center justify-center rounded-full h-20 w-20 shadow-xl border-2 border-dashed border-amber-200 text-center p-1 shrink-0"
                                style={{
                                    backgroundColor: activeTheme.starburstBg,
                                    color: activeTheme.starburstText,
                                }}
                            >
                                <span className="text-[8px] font-bold tracking-tighter uppercase text-white">
                                    Promo
                                </span>
                                <span className="text-xs font-black leading-tight">
                                    {promoPriceText}
                                </span>
                                <span className="text-[7px] text-white/80">Borong!</span>
                            </div>
                        </div>

                        {/* Mascot & Speech Bubble */}
                        <div className="relative flex items-center gap-2 mt-2">
                            <div className="text-3xl shrink-0 drop-shadow-md select-none">
                                {activeMascotObj.emoji}
                            </div>
                            <div className="flex-1 rounded-xl bg-white px-2.5 py-1.5 shadow-md text-slate-800 text-[11px] font-black truncate">
                                💬 {callToAction}
                            </div>
                        </div>

                        {/* Bottom WhatsApp Order CTA */}
                        <div className="relative mt-2">
                            <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-[#22c55e] px-3 py-1.5 text-center text-white shadow-lg">
                                <MessageCircle className="h-3.5 w-3.5 shrink-0" />
                                <span className="text-[11px] font-black tracking-wide truncate">
                                    WA: {contact}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons: Unduh HD & Generate AI */}
                    <div className="w-full max-w-[360px] mt-4 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={handleDownloadPoster}
                            disabled={isDownloading}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3 text-xs font-extrabold text-white shadow-lg shadow-orange-100 transition hover:from-amber-700 hover:to-orange-700 active:scale-[0.98] disabled:opacity-50"
                        >
                            <Download className="h-4 w-4" />
                            <span>
                                {isDownloading
                                    ? 'Menyiapkan Gambar HD...'
                                    : `Unduh Poster HD (${currentProductName})`}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={handleGenerateGeminiImage}
                            disabled={isGeneratingAi}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-purple-400 bg-purple-50 px-4 py-2.5 text-xs font-extrabold text-purple-900 shadow-xs transition hover:bg-purple-100 active:scale-[0.98] disabled:opacity-50"
                        >
                            {isGeneratingAi ? (
                                <RefreshCw className="h-4 w-4 animate-spin text-purple-600" />
                            ) : (
                                <Sparkles className="h-4 w-4 text-purple-600" />
                            )}
                            <span>
                                {isGeneratingAi
                                    ? 'Gemini Sedang Menggambar...'
                                    : '✨ Buat Ilustrasi Baru dengan Gemini Imagen AI'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Customizer Controls Column (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                    {/* 1. Nama Produk & Foto Produk */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                                <Tag className="h-4 w-4 text-amber-600" />
                                <span>1. Sesuaikan Nama Produk & Foto</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                            >
                                <Upload className="h-3 w-3" />
                                <span>Ganti Foto Produk</span>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                value={currentProductName}
                                onChange={(e) => setCurrentProductName(e.target.value)}
                                placeholder="Contoh: Sambal Bawang Spesial, Nasi Ayam Madu, Es Kopi Susu"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-800 bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>

                        {/* Quick Presets Kategori Makanan */}
                        <div className="space-y-1.5">
                            <p className="text-[11px] font-bold text-slate-500">
                                Atau pilih cepat kategori kuliner:
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {PRODUCT_PRESETS.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            setCurrentProductName(p.label);
                                            setActivePhoto(p.url);
                                            setSelectedMascot(p.suggestedMascot);
                                            setThemeId(p.suggestedTheme);
                                            setAiGeneratedImageUrl(null);
                                        }}
                                        className={`flex items-center gap-2 p-1.5 rounded-xl border text-left transition ${
                                            currentProductName === p.label
                                                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-100'
                                                : 'border-slate-200 bg-white hover:bg-slate-50'
                                        }`}
                                    >
                                        <img
                                            src={p.url}
                                            alt={p.label}
                                            className="h-8 w-8 rounded-lg object-cover shrink-0"
                                        />
                                        <span className="text-[10px] font-bold text-slate-700 truncate">
                                            {p.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. Teks Promosi & Tagline */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                2. Slogan Atas (Curved Ribbon)
                            </label>
                            <input
                                type="text"
                                value={subHeadline}
                                onChange={(e) => setSubHeadline(e.target.value)}
                                placeholder="Temukan sensasi lezat istimewa..."
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                3. Kalimat Aksi (Bubble Chat)
                            </label>
                            <input
                                type="text"
                                value={callToAction}
                                onChange={(e) => setCallToAction(e.target.value)}
                                placeholder="Yuk borong sekarang juga!"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* 3. Badge Harga & Varian Produk */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                4. Badge Harga Promo (Lingkaran)
                            </label>
                            <input
                                type="text"
                                value={promoPriceText}
                                onChange={(e) => setPromoPriceText(e.target.value)}
                                placeholder="Start from 15k atau Diskon 30%"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-rose-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                5. Varian / Keunggulan Produk
                            </label>
                            <input
                                type="text"
                                value={variantText}
                                onChange={(e) => setVariantText(e.target.value)}
                                placeholder="Varian: Original • Pedas • Spesial"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* 4. WhatsApp Kontak */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            6. Nomor WhatsApp Pemesanan
                        </label>
                        <input
                            type="text"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="0812-3456-7890"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                        />
                    </div>

                    {/* 5. Pilihan Maskot Karakter 3D */}
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                            <Smile className="h-4 w-4 text-amber-600" />
                            <span>7. Pilih Maskot Karakter 3D</span>
                        </label>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                            {MASCOTS.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setSelectedMascot(m.id)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                                        selectedMascot === m.id
                                            ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-100 shadow-xs'
                                            : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <span className="text-2xl mb-1">{m.emoji}</span>
                                    <span className="text-[10px] font-bold text-slate-700 leading-tight">
                                        {m.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 6. Tema Warna & Lelehan Saus */}
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                            <Palette className="h-4 w-4 text-amber-600" />
                            <span>8. Tema Warna & Lelehan Topping</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {THEME_STYLES.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setThemeId(t.id)}
                                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition ${
                                        themeId === t.id
                                            ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-100'
                                            : 'border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <div
                                        className="h-6 w-6 rounded-lg shrink-0 border border-white/50 shadow-xs"
                                        style={{ backgroundColor: t.bgGradientTop }}
                                    />
                                    <span className="text-[11px] font-bold text-slate-700 truncate">
                                        {t.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
