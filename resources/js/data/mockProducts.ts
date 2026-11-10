import { ProductItem, StoreProfile } from '../types/product';

export const initialStoreProfile: StoreProfile = {
    name: 'Dapur Bu Siti',
    tagline: 'Masakan Rumahan & Aneka Sambal Khas Nusantara',
    description:
        'Menyajikan olahan masakan rumahan higienis tanpa bahan pengawet kimia. Terbuat dari bumbu pilihan segar langsung dari pasar lokal.',
    whatsappNumber: '6281234567890',
    whatsappTemplate:
        'Halo Dapur Bu Siti, saya mau pesan {nama_produk} sebanyak {jumlah}. Apakah masih tersedia?',
    address: 'Jl. Sawo Manila No. 14, Pasar Minggu, Jakarta Selatan',
    openingHours: 'Setiap Hari: 08.00 - 20.00 WIB',
    instagram: '@dapurbusiti.official',
    logoUrl:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    bannerUrl:
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
};

export const initialCategories: string[] = [
    'Semua',
    'Makanan Berat',
    'Sambal & Bumbu',
    'Camilan / Snack',
    'Minuman',
];

export const initialProducts: ProductItem[] = [
    {
        id: 1,
        name: 'Sambal Bawang Spesial 150g',
        category: 'Sambal & Bumbu',
        price: 25000,
        originalPrice: 28000,
        unit: 'botol',
        stock: 28,
        lowStockThreshold: 5,
        description:
            'Sambal bawang pedas nampol dengan aroma minyak kelapa asli dan potongan bawang gurih. Tanpa bahan pengawet, tahan 1 bulan di kulkas.',
        images: [
            'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
        ],
        isActive: true,
        variants: [
            { id: 'v1', name: 'Level Sedang (Pedas Manis)' },
            { id: 'v2', name: 'Level Ekstra Pedas', priceOffset: 2000 },
        ],
        soldCount: 142,
        createdAt: '2026-10-15',
    },
    {
        id: 2,
        name: 'Keripik Tempe Renyah Daun Jeruk',
        category: 'Camilan / Snack',
        price: 18000,
        unit: 'bungkus',
        stock: 4, // Menipis
        lowStockThreshold: 5,
        description:
            'Irisan tempe kedelai lokal pilihan digoreng tipis renyah dengan taburan bumbu rempah dan aroma wangi daun jeruk segar.',
        images: [
            'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
        ],
        isActive: true,
        soldCount: 98,
        createdAt: '2026-10-18',
    },
    {
        id: 3,
        name: 'Rendang Daging Sapi Suwir 200g',
        category: 'Makanan Berat',
        price: 48000,
        originalPrice: 55000,
        unit: 'porsi',
        stock: 15,
        lowStockThreshold: 5,
        description:
            'Daging sapi suwir empuk dimasak perlahan 6 jam dengan santan kental dan rempah Minang otentik. Siap santap dengan nasi hangat.',
        images: [
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
        ],
        isActive: true,
        soldCount: 84,
        createdAt: '2026-10-19',
    },
    {
        id: 4,
        name: 'Peyek Kacang Gurih Renyah',
        category: 'Camilan / Snack',
        price: 15000,
        unit: 'toples',
        stock: 0, // Habis
        lowStockThreshold: 5,
        description:
            'Peyek kacang tanah dengan adonan tepung beras renyah gurih tidak keras. Cocok untuk teman makan nasi pecel atau camilan sore.',
        images: [
            'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&auto=format&fit=crop&q=80',
        ],
        isActive: true,
        soldCount: 67,
        createdAt: '2026-10-20',
    },
    {
        id: 5,
        name: 'Dendeng Balado Basah 250g',
        category: 'Makanan Berat',
        price: 55000,
        unit: 'porsi',
        stock: 12,
        lowStockThreshold: 5,
        description:
            'Irisan daging sapi pipih empuk berpadu dengan ulekan cabai merah keriting dan bawang merah yang dimasak gurih berminyak.',
        images: [
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
        ],
        isActive: true,
        soldCount: 53,
        createdAt: '2026-10-21',
    },
    {
        id: 6,
        name: 'Es Cendol Nangka Gula Aren',
        category: 'Minuman',
        price: 12000,
        unit: 'cup',
        stock: 30,
        lowStockThreshold: 5,
        description:
            'Cendol pandan alami kenyal disajikan dengan santan gurih, sirup gula aren murni, dan potongan nangka manis segar.',
        images: [
            'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
        ],
        isActive: true,
        soldCount: 41,
        createdAt: '2026-10-22',
    },
    {
        id: 7,
        name: 'Teri Crispy Sambal Matah',
        category: 'Sambal & Bumbu',
        price: 22000,
        unit: 'botol',
        stock: 10,
        lowStockThreshold: 5,
        description: '', // Sengaja kosong agar berstatus "Belum Lengkap" untuk pengujian UI
        images: [
            'https://images.unsplash.com/photo-1505253758473-96b468138b18?w=600&auto=format&fit=crop&q=80',
        ],
        isActive: false, // Nonaktif
        soldCount: 12,
        createdAt: '2026-10-23',
    },
];

export const formatRupiah = (val: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);
};

export const isProductComplete = (p: ProductItem): boolean => {
    return (
        p.name.trim().length > 0 &&
        p.category.trim().length > 0 &&
        p.price > 0 &&
        p.description.trim().length >= 15 &&
        p.images.length > 0
    );
};

export const generateWhatsAppLink = (
    phone: string,
    template: string,
    productName: string,
    quantity: number = 1,
): string => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = template
        .replace('{nama_produk}', productName)
        .replace('{jumlah}', quantity.toString());
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
