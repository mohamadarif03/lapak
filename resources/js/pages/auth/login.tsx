import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    Eye,
    EyeOff,
    Lock,
    Phone,
    RefreshCw,
    Sparkles,
    User as UserIcon,
    ArrowRight,
    WifiOff,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

type Props = {
    status?: string;
    sessionExpiredMessage?: string;
    next?: string;
    initialPhone?: string;
    initialMode?: 'login' | 'register';
};

export default function Login({
    status,
    sessionExpiredMessage,
    next = '/dashboard',
    initialPhone = '',
    initialMode,
}: Props) {
    const [mode, setMode] = useState<'login' | 'register'>(() => {
        if (initialMode) return initialMode;
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('mode') === 'register' || window.location.pathname.endsWith('/register')) {
                return 'register';
            }
        }
        return 'login';
    });
    const [name, setName] = useState('');
    const [phone, setPhone] = useState(initialPhone);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    const phoneInputRef = useRef<HTMLInputElement>(null);

    // Online / Offline listeners
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const getCsrfToken = () => {
        return (
            document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isOnline) {
            setErrorMessage('Kamu sedang offline. Sambungkan koneksi internet.');
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');

        const cleanedPhone = phone.replace(/[^0-9]/g, '');
        if (cleanedPhone.length < 8) {
            setErrorMessage('Nomor WhatsApp tidak valid. Contoh: 0812 3456 7890.');
            return;
        }

        if (!password || password.trim().length === 0) {
            setErrorMessage('Kata sandi wajib diisi.');
            return;
        }

        if (mode === 'register' && password.length < 6) {
            setErrorMessage('Kata sandi untuk pendaftaran minimal 6 karakter.');
            return;
        }

        setIsLoading(true);

        const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
        const payload = {
            phone,
            password,
            name: mode === 'register' ? name : undefined,
            next,
        };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccessMessage(data.message || (mode === 'login' ? 'Berhasil masuk!' : 'Pendaftaran berhasil!'));
                setTimeout(() => {
                    window.location.href = data.redirect || next || '/dashboard';
                }, 500);
            } else {
                setErrorMessage(data.message || 'Terjadi kesalahan. Silakan periksa kembali data Anda.');
            }
        } catch {
            setErrorMessage('Koneksi bermasalah. Coba lagi dalam beberapa saat.');
        } finally {
            setIsLoading(false);
        }
    };

    const displayStatus = sessionExpiredMessage || status;

    return (
        <GuestLayout>
            <Head title={mode === 'login' ? 'Masuk ke LAPAK' : 'Daftar Akun LAPAK'} />

            <div className="space-y-5">
                {displayStatus && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-center text-sm font-semibold text-amber-900 shadow-xs"
                    >
                        {displayStatus}
                    </div>
                )}

                {/* Offline Alert Banner */}
                {!isOnline && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900"
                    >
                        <WifiOff className="size-4 shrink-0 text-amber-600" />
                        <span>Kamu sedang offline. Sambungkan internet untuk melanjutkan.</span>
                    </div>
                )}

                {/* Tab Switcher: Masuk vs Daftar */}
                <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl border border-gray-200">
                    <button
                        type="button"
                        onClick={() => {
                            setMode('login');
                            setErrorMessage('');
                            setSuccessMessage('');
                            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                                window.history.replaceState(null, '', '/login');
                            }
                        }}
                        className={`py-2.5 text-sm font-bold rounded-xl transition-all ${
                            mode === 'login'
                                ? 'bg-white text-violet-700 shadow-xs ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Masuk
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode('register');
                            setErrorMessage('');
                            setSuccessMessage('');
                            if (typeof window !== 'undefined' && window.location.pathname !== '/register') {
                                window.history.replaceState(null, '', '/register');
                            }
                        }}
                        className={`py-2.5 text-sm font-bold rounded-xl transition-all ${
                            mode === 'register'
                                ? 'bg-white text-violet-700 shadow-xs ring-1 ring-black/5'
                                : 'text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        Daftar Baru
                    </button>
                </div>

                {/* Header Hint */}
                <div className="flex items-center justify-between rounded-xl bg-violet-50 px-3.5 py-2 text-xs font-semibold text-violet-700 border border-violet-200">
                    <span className="inline-flex items-center gap-1.5 font-bold">
                        <Sparkles className="size-3.5 text-violet-600" />
                        {mode === 'login' ? 'Masuk Cepat & Praktis' : 'Daftar Tanpa Verifikasi Ribet'}
                    </span>
                    <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        No WA + Password
                    </span>
                </div>

                {successMessage ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="size-10" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">
                                {successMessage}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Membuka aplikasi lapak usahamu...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nama (khusus pendaftaran) */}
                        {mode === 'register' && (
                            <div className="space-y-1.5 animate-in fade-in duration-150">
                                <label htmlFor="name-input" className="block text-sm font-semibold text-gray-900">
                                    Nama Lengkap / Nama Usaha
                                </label>
                                <div className="relative flex rounded-xl border border-gray-300 bg-white shadow-xs focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-600/20">
                                    <div className="flex items-center px-3 text-gray-400">
                                        <UserIcon className="size-4" />
                                    </div>
                                    <input
                                        id="name-input"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Contoh: Budi Santoso / Toko Berkah"
                                        className="h-12 w-full border-none bg-transparent pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Nomor WhatsApp */}
                        <div className="space-y-1.5">
                            <label htmlFor="phone-input" className="block text-sm font-semibold text-gray-900">
                                Nomor WhatsApp
                            </label>
                            <div className="relative flex rounded-xl border border-gray-300 bg-white shadow-xs focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-600/20">
                                <div className="flex items-center gap-1.5 border-r border-gray-200 bg-gray-50 px-3 text-sm font-bold text-gray-800">
                                    <Phone className="size-3.5 text-violet-600" />
                                    <span>+62</span>
                                </div>
                                <input
                                    ref={phoneInputRef}
                                    id="phone-input"
                                    type="tel"
                                    inputMode="numeric"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="812 3456 7890"
                                    required
                                    autoFocus
                                    className="h-12 w-full border-none bg-transparent px-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                Bisa diawali 08... atau 8...
                            </p>
                        </div>

                        {/* Password / Kata Sandi */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password-input" className="block text-sm font-semibold text-gray-900">
                                    Kata Sandi / Password
                                </label>
                                {mode === 'register' && (
                                    <span className="text-[11px] text-gray-400">Min. 6 karakter</span>
                                )}
                            </div>
                            <div className="relative flex items-center rounded-xl border border-gray-300 bg-white shadow-xs focus-within:border-violet-600 focus-within:ring-2 focus-within:ring-violet-600/20">
                                <div className="flex items-center pl-3 text-gray-400">
                                    <Lock className="size-4" />
                                </div>
                                <input
                                    id="password-input"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan kata sandi"
                                    required
                                    className="h-12 w-full border-none bg-transparent px-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="p-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>

                        {errorMessage && (
                            <div
                                role="alert"
                                aria-live="assertive"
                                className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700 border border-rose-200"
                            >
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || !isOnline}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-base font-bold text-white shadow-xs hover:bg-violet-700 disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            {isLoading ? (
                                <RefreshCw className="size-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{mode === 'login' ? 'Masuk Sekarang' : 'Daftar Akun Baru'}</span>
                                    <ArrowRight className="size-4" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            {mode === 'login' ? (
                                <p className="text-xs text-gray-600">
                                    Belum punya akun?{' '}
                                    <Link
                                        href="/register"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setMode('register');
                                            setErrorMessage('');
                                            if (typeof window !== 'undefined') {
                                                window.history.pushState(null, '', '/register');
                                            }
                                        }}
                                        className="font-bold text-violet-600 underline hover:text-violet-700 cursor-pointer"
                                    >
                                        Daftar gratis di sini
                                    </Link>
                                </p>
                            ) : (
                                <p className="text-xs text-gray-600">
                                    Sudah punya akun?{' '}
                                    <Link
                                        href="/login"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setMode('login');
                                            setErrorMessage('');
                                            if (typeof window !== 'undefined') {
                                                window.history.pushState(null, '', '/login');
                                            }
                                        }}
                                        className="font-bold text-violet-600 underline hover:text-violet-700 cursor-pointer"
                                    >
                                        Masuk di sini
                                    </Link>
                                </p>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </GuestLayout>
    );
}
