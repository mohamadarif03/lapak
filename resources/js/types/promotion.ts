export type Platform = 'instagram' | 'facebook' | 'tiktok' | 'whatsapp';

export type ContentGoal =
    'perkenalan' | 'promo' | 'testimoni' | 'cerita' | 'edukasi' | 'hari_besar';

export type ContentTone =
    'santai' | 'ramah' | 'profesional' | 'lucu' | 'mendesak';

export type PostStatus = 'draft' | 'terjadwal' | 'diposting';

export interface GeneratedCaption {
    headline: string;
    body: string;
    cta: string;
    hashtags: string[];
}

export interface ContentIdea {
    id: string;
    title: string;
    description: string;
    goal: ContentGoal;
    suggested_platform: Platform;
    recommended_time: string;
}

export interface ScheduledPost {
    id: string;
    product_id?: string | null;
    product_name?: string;
    platform: Platform;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    caption: string;
    hashtags?: string[];
    notes?: string;
    status: PostStatus;
    remind_before?: number; // minutes
    created_at: string;
}

export interface PromoTemplate {
    id: string;
    title: string;
    category:
        | 'diskon'
        | 'beli2gratis1'
        | 'gratis_ongkir'
        | 'weekend'
        | 'hari_raya'
        | 'paket_hemat'
        | 'pelanggan_baru'
        | 'custom';
    description: string;
    fields: {
        key: string;
        label: string;
        placeholder: string;
        defaultValue?: string;
    }[];
    caption_template: string; // contains {field_name}
    is_custom?: boolean;
}

export interface QuickReply {
    id: string;
    category:
        | 'salam'
        | 'harga'
        | 'cara_pesan'
        | 'stok'
        | 'ongkir'
        | 'pembayaran'
        | 'terima_kasih'
        | 'komplain';
    title: string;
    shortcut: string; // e.g. !ongkir
    content: string; // e.g. "Halo {nama_pelanggan}, totalnya {harga}..."
    is_custom?: boolean;
}

export interface PromotionStats {
    scheduled_this_week: number;
    posted_count: number;
    drafts_count: number;
    streak_weeks: number;
    quota_remaining: number;
    quota_limit: number;
}
