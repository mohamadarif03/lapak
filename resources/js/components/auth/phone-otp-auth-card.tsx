import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    CheckCircle2,
    MessageSquare,
    Phone,
    RefreshCw,
    Send,
    ShieldCheck,
    Smartphone,
    Sparkles,
    WifiOff,
} from 'lucide-react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';

type Props = {
    mode?: 'login' | 'register';
    next?: string;
    initialStep?: 'phone' | 'otp';
    initialPhone?: string;
    initialMaskedPhone?: string;
    initialChannel?: 'whatsapp' | 'sms';
    initialResendWait?: number;
    onSuccessSimulated?: () => void;
};

export default function PhoneOtpAuthCard({
    mode = 'login',
    next = '/dashboard',
    initialStep = 'phone',
    initialPhone = '',
    initialMaskedPhone = '',
    initialChannel = 'whatsapp',
    initialResendWait = 0,
    onSuccessSimulated,
}: Props) {
    const [step, setStep] = useState<'phone' | 'otp'>(initialStep);
    const [phone, setPhone] = useState(initialPhone);
    const [channel, setChannel] = useState<'whatsapp' | 'sms'>(initialChannel);
    const [consent, setConsent] = useState(true);
    const [maskedPhone, setMaskedPhone] = useState(initialMaskedPhone);
    const [otpCode, setOtpCode] = useState('');
    const [countdown, setCountdown] = useState(initialResendWait > 0 ? initialResendWait : (initialStep === 'otp' ? 60 : 0));
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [verifiedSuccess, setVerifiedSuccess] = useState(false);
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const phoneInputRef = useRef<HTMLInputElement>(null);
    const otpContainerRef = useRef<HTMLDivElement>(null);

    // Online / Offline detection
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

    // Synchronize browser history for back button support
    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            if (step === 'otp') {
                setStep('phone');
                setOtpCode('');
                setErrorMessage('');
                setTimeout(() => phoneInputRef.current?.focus(), 50);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [step]);

    // Resend countdown timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Auto-focus OTP input on entering step 2
    useEffect(() => {
        if (step === 'otp') {
            const firstOtpInput = otpContainerRef.current?.querySelector('input');
            firstOtpInput?.focus();
        }
    }, [step]);

    // Auto submit OTP upon typing 6th digit
    useEffect(() => {
        if (step === 'otp' && otpCode.length === 6 && !isVerifying) {
            verifyOtpCode(otpCode);
        }
    }, [otpCode, step]);

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const handleSendOtp = async (e?: React.FormEvent, isResend = false) => {
        if (e) {
            e.preventDefault();
        }

        if (!isOnline) {
            setErrorMessage('Kamu sedang offline. Sambungkan internet untuk meminta kode.');
            return;
        }

        setErrorMessage('');

        const cleanedPhone = phone.replace(/[^0-9]/g, '');
        if (cleanedPhone.length < 8) {
            setErrorMessage('Nomor HP tidak valid. Contoh: 0812 3456 7890.');
            return;
        }

        if (!consent) {
            setErrorMessage('Centang persetujuan untuk melanjutkan.');
            return;
        }

        setIsSending(true);

        try {
            const res = await fetch('/auth/otp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    phone,
                    channel,
                    consent,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMaskedPhone(data.masked_phone || `+62 ${phone}`);
                setStep('otp');
                setCountdown(data.resend_in || 60);
                setOtpCode('');
                if (window.history.pushState) {
                    window.history.pushState({ step: 'otp' }, '', window.location.href);
                }
            } else {
                setErrorMessage(data.message || 'Kode belum terkirim. Coba lagi atau kirim lewat SMS.');
                if (data.resend_in) {
                    setCountdown(data.resend_in);
                }
            }
        } catch {
            setErrorMessage('Koneksi bermasalah. Coba lagi.');
        } finally {
            setIsSending(false);
        }
    };

    const verifyOtpCode = async (codeToVerify: string) => {
        if (!isOnline) {
            setErrorMessage('Kamu sedang offline. Sambungkan internet untuk verifikasi.');
            return;
        }

        setErrorMessage('');
        setIsVerifying(true);

        try {
            const res = await fetch('/auth/otp/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    phone,
                    code: codeToVerify,
                    next,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setVerifiedSuccess(true);
                if (onSuccessSimulated) {
                    onSuccessSimulated();
                } else {
                    setTimeout(() => {
                        window.location.href = data.redirect || next || '/dashboard';
                    }, 600);
                }
            } else {
                setErrorMessage(data.message || 'Kode salah. Coba lagi.');
                setOtpCode('');
                // re-focus OTP input
                const firstInput = otpContainerRef.current?.querySelector('input');
                firstInput?.focus();
            }
        } catch {
            setErrorMessage('Koneksi bermasalah. Coba lagi.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otpCode.length < 6) {
            setErrorMessage('Masukkan 6 digit kode OTP secara lengkap.');
            return;
        }
        verifyOtpCode(otpCode);
    };

    const handleResend = () => {
        if (countdown > 0 || isSending) return;
        handleSendOtp(undefined, true);
    };

    const handleBackToPhone = async () => {
        setStep('phone');
        setOtpCode('');
        setErrorMessage('');
        setVerifiedSuccess(false);

        try {
            await fetch('/auth/otp/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
        } catch {
            // ignore
        }

        setTimeout(() => {
            phoneInputRef.current?.focus();
        }, 50);
    };

    if (verifiedSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-[#E4F3E8] text-[#216E45]">
                    <CheckCircle2 className="size-10" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-heading text-lg font-bold text-foreground">
                        Verifikasi Berhasil!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Akun usahamu berhasil diverifikasi. Membuka lapak tokomu...
                    </p>
                </div>
                <Button
                    type="button"
                    className="w-full text-base font-heading mt-2"
                    onClick={() => {
                        window.location.href = next || '/dashboard';
                    }}
                >
                    Buka Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Offline Alert Banner */}
            {!isOnline && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-semibold text-amber-900"
                >
                    <WifiOff className="size-4 shrink-0 text-amber-600" />
                    <span>Kamu sedang offline. Periksa koneksi internetmu.</span>
                </div>
            )}

            {/* Header Badge */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/80 px-3.5 py-2 text-xs font-semibold text-primary border border-primary/20">
                <span className="inline-flex items-center gap-1.5 font-bold">
                    <Sparkles className="size-3.5 text-primary" />
                    Kanal WhatsApp & SMS Resmi
                </span>
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    Tanpa Password
                </span>
            </div>

            {step === 'phone' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone-input" className="text-sm font-semibold text-foreground">
                            Nomor WhatsApp / Ponsel
                        </Label>
                        <div className="relative flex rounded-xl border border-border bg-card shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                            <div className="flex items-center gap-1.5 border-r border-border bg-muted/50 px-3 text-sm font-bold text-foreground">
                                <Phone className="size-3.5 text-primary" />
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
                                aria-invalid={errorMessage ? 'true' : 'false'}
                                aria-describedby={errorMessage ? 'phone-error' : 'phone-hint'}
                                className="h-12 w-full bg-transparent px-3 text-base text-foreground placeholder:text-muted-foreground/70 outline-none"
                            />
                        </div>
                        <p id="phone-hint" className="text-xs text-muted-foreground">
                            Contoh: 0812 3456 7890 atau 812 3456 7890
                        </p>
                    </div>

                    {/* Channel Selector */}
                    <div className="space-y-2 pt-1">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Kirim Kode Lewat:
                        </Label>
                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => setChannel('whatsapp')}
                                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                                    channel === 'whatsapp'
                                        ? 'border-[#216E45] bg-[#E4F3E8] ring-1 ring-[#216E45]/30'
                                        : 'border-border bg-card hover:bg-muted/40'
                                }`}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                                        <MessageSquare className="size-4 text-[#216E45]" />
                                        <span>WhatsApp</span>
                                    </div>
                                    <span className="rounded-full bg-[#E4F3E8] px-1.5 py-0.5 text-[9px] font-bold text-[#216E45]">
                                        Utama
                                    </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                                    Kode dikirim ke obrolan WA
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setChannel('sms')}
                                className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all cursor-pointer ${
                                    channel === 'sms'
                                        ? 'border-primary bg-secondary ring-1 ring-primary/30'
                                        : 'border-border bg-card hover:bg-muted/40'
                                }`}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                                        <Smartphone className="size-4 text-primary" />
                                        <span>SMS Biasa</span>
                                    </div>
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                                    Kode dikirim via pesan SMS
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Mandatory Consent Checkbox */}
                    <div className="flex items-start gap-2.5 pt-1">
                        <input
                            id="consent-checkbox"
                            type="checkbox"
                            checked={consent}
                            onChange={(e) => setConsent(e.target.checked)}
                            className="mt-0.5 size-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                        <label htmlFor="consent-checkbox" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                            Saya menyetujui{' '}
                            <a
                                href="/syarat"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                            >
                                Syarat Penggunaan
                            </a>{' '}
                            dan{' '}
                            <a
                                href="/privasi"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
                            >
                                Kebijakan Privasi
                            </a>{' '}
                            LAPAK.
                        </label>
                    </div>

                    {errorMessage && (
                        <div
                            id="phone-error"
                            role="alert"
                            aria-live="assertive"
                            className="text-xs font-medium text-destructive"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSending || !isOnline}
                        className="w-full text-base"
                    >
                        {isSending ? (
                            <RefreshCw className="size-5 animate-spin" />
                        ) : (
                            <Send className="size-5" />
                        )}
                        Kirim Kode OTP
                    </Button>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        <ShieldCheck className="size-4 shrink-0 text-[#216E45]" />
                        <span>
                            Nomor WhatsApp kamu terlindungi dan hanya dipakai untuk verifikasi masuk lapak usahamu.
                        </span>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifySubmit} className="space-y-5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3 text-sm">
                        <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">
                                Kode dikirim ke {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'}:
                            </p>
                            <p className="font-bold text-foreground">
                                {maskedPhone || `+62 ${phone}`}
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToPhone}
                            className="h-8 text-xs text-primary hover:text-primary/80"
                        >
                            <ArrowLeft className="size-3.5" />
                            Ganti Nomor
                        </Button>
                    </div>

                    <div ref={otpContainerRef} className="flex flex-col items-center justify-center space-y-2 text-center">
                        <Label htmlFor="otp-input-field" className="text-sm font-semibold text-foreground">
                            Masukkan 6 Digit Kode OTP
                        </Label>
                        <div className="flex w-full justify-center py-2">
                            <InputOTP
                                id="otp-input-field"
                                maxLength={6}
                                value={otpCode}
                                onChange={(val) => setOtpCode(val)}
                                pattern={REGEXP_ONLY_DIGITS}
                                autoFocus
                                aria-invalid={errorMessage ? 'true' : 'false'}
                                aria-describedby={errorMessage ? 'otp-error' : undefined}
                            >
                                <InputOTPGroup className="gap-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <InputOTPSlot
                                            key={i}
                                            index={i}
                                            className="h-12 w-10 sm:w-12 rounded-xl border border-border text-lg font-bold font-heading text-foreground shadow-xs first:rounded-xl last:rounded-xl"
                                        />
                                    ))}
                                </InputOTPGroup>
                            </InputOTP>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Ketik 6 digit angka yang baru saja kamu terima.
                        </p>
                    </div>

                    {errorMessage && (
                        <div
                            id="otp-error"
                            role="alert"
                            aria-live="assertive"
                            className="text-center text-xs font-medium text-destructive"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center gap-2 pt-1 text-center">
                        <Button
                            type="submit"
                            disabled={isVerifying || otpCode.length < 6 || !isOnline}
                            className="w-full text-base"
                        >
                            {isVerifying ? (
                                <RefreshCw className="size-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="size-5" />
                            )}
                            Verifikasi & Masuk
                        </Button>

                        <div className="pt-2 text-xs text-muted-foreground">
                            {countdown > 0 ? (
                                <span>
                                    Kirim ulang kode ({countdown} dtk)
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isSending || !isOnline}
                                    className="font-bold text-primary underline underline-offset-4 hover:text-primary/80 cursor-pointer"
                                >
                                    Kirim Ulang Kode Sekarang
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
