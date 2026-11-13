export interface ProductVariant {
    id: string;
    name: string; // e.g. "Original", "Pedas", "250g"
    priceOffset?: number; // selisih harga jika ada
}

export interface ProductItem {
    id: number;
    name: string;
    category: string;
    price: number;
    originalPrice?: number; // harga coret jika promo
    unit: string; // "pcs", "porsi", "botol", "toples", "bungkus"
    stock: number;
    lowStockThreshold: number;
    description: string;
    images: string[];
    isActive: boolean;
    variants?: ProductVariant[];
    soldCount: number;
    createdAt: string;
}

export interface StoreProfile {
    name: string;
    tagline: string;
    description: string;
    whatsappNumber: string;
    whatsappTemplate: string;
    address: string;
    openingHours: string;
    instagram: string;
    logoUrl: string;
    bannerUrl?: string;
}
