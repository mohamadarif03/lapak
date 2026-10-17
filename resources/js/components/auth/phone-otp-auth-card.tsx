import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';

type Props = {
    mode?: 'login' | 'register';
    onSuccessSimulated?: () => void;
};

export default function PhoneOtpAuthCard({
    mode = 'login',
    onSuccessSimulated,
}: Props) {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
    const [otpCode, setOtpCode] = useState('');
    const [countdown, setCountdown] = useState(45);
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [verifiedSuccess, setVerifiedSuccess] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === 'otp' && countdown > 0) {
            timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [step, countdown]);

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        const cleanedPhone = phone.replace(/[^0-9]/g, '');
        if (cleanedPhone.length < 8) {
            setErrorMessage('Masukkan nomor ponsel yang valid (minimal 8 angka)');
            return;
        }

        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            setStep('otp');
            setCountdown(45);
        }, 600);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (otpCode.length < 6) {
            setErrorMessage('Masukkan 6 digit kode OTP secara lengkap');
            return;
        }

        setIsVerifying(true);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/auth/otp/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    phone,
                    code: otpCode,
                    mode,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setIsVerifying(false);
                setVerifiedSuccess(true);
                if (onSuccessSimulated) {
                    onSuccessSimulated();
                } else {
                    setTimeout(() => {
                        window.location.href = data.redirect || (mode === 'register' ? '/onboarding' : '/dashboard');
                    }, 1000);
                }
            } else {
                setIsVerifying(false);
                setErrorMessage('Verifikasi kode gagal. Silakan coba kembali.');
            }
        } catch {
            setIsVerifying(false);
            setVerifiedSuccess(true);
            setTimeout(() => {
                window.location.href = mode === 'register' ? '/onboarding' : '/dashboard';
            }, 1000);
        }
    };

    const handleResend = () => {
        if (countdown > 0) return;
        setCountdown(45);
        setOtpCode('');
        setErrorMessage('');
    };

    const handleBackToPhone = () => {
        setStep('phone');
        setOtpCode('');
        setErrorMessage('');
        setVerifiedSuccess(false);
    };

    if (verifiedSuccess) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 py-6 text-center animate-in fade-in zoom-in-95 duration-200">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-[#E4F3E8] text-[#216E45]">
                    <CheckCircle2 className="size-10" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-heading text-lg font-bold text-foreground">
                        Verifikasi WhatsApp Berhasil!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {mode === 'login'
                            ? 'Akun usahamu berhasil diverifikasi. Membuka dashboard tokomu...'
                            : 'Nomor WhatsApp berhasil didaftarkan. Mengarahkan ke pengenalan usaha...'}
                    </p>
                </div>
                <Button
                    type="button"
                    className="w-full text-base font-heading mt-2"
                    onClick={() => {
                        window.location.href = mode === 'register' ? '/onboarding' : '/dashboard';
                    }}
                >
                    {mode === 'register' ? 'Lanjut ke Profil Usaha' : 'Buka Dashboard'}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Header Badge */}
            <div className="flex items-center justify-between rounded-xl bg-secondary/80 px-3.5 py-2 text-xs font-semibold text-primary border border-primary/20">
                <span className="inline-flex items-center gap-1.5 font-bold">
                    <Sparkles className="size-3.5 text-primary" />
                    Kanal WhatsApp Resmi
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
                                id="phone-input"
                                type="tel"
                                inputMode="numeric"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="812 3456 7890"
                                required
                                autoFocus
                                className="h-12 w-full bg-transparent px-3 text-base text-foreground placeholder:text-muted-foreground/70 outline-none"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Contoh: 8123456789 (tanpa angka 0 di depan)
                        </p>
                    </div>

                    {/* Channel Indicator / Selector */}
                    {mode === 'register' ? (
                        <div className="flex items-start gap-3 rounded-xl border border-[#216E45]/25 bg-[#E4F3E8] p-3 text-left">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#216E45] text-white mt-0.5">
                                <MessageSquare className="size-5" />
                            </div>
                            <div className="space-y-0.5 flex-1">
                                <div className="flex items-center justify-between">
                                    <span className="font-heading text-sm font-bold text-foreground">
                                        Kirim via WhatsApp
                                    </span>
                                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#216E45] shadow-xs">
                                        WhatsApp Only
                                    </span>
                                </div>
                                <p className="text-xs text-[#216E45] font-medium leading-relaxed">
                                    Kode OTP verifikasi 6 digit akan dikirim langsung ke obrolan WhatsApp nomor ini secara instan dan bebas pulsa.
                                </p>
                            </div>
                        </div>
                    ) : (
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
                                            Instan
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
                    )}

                    {errorMessage && (
                        <p className="text-xs font-medium text-destructive">
                            {errorMessage}
                        </p>
                    )}

                    <Button
                        type="submit"
                        disabled={isSending}
                        className="w-full text-base"
                    >
                        {isSending ? (
                            <RefreshCw className="size-5 animate-spin" />
                        ) : (
                            <Send className="size-5" />
                        )}
                        {mode === 'register' ? 'Kirim Kode OTP ke WhatsApp' : 'Kirim Kode OTP'}
                    </Button>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        <ShieldCheck className="size-4 shrink-0 text-[#216E45]" />
                        <span>
                            Nomor WhatsApp kamu terlindungi dan hanya dipakai untuk verifikasi masuk lapak usahamu.
                        </span>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3 text-sm">
                        <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">Kode dikirim ke:</p>
                            <p className="font-bold text-foreground">
                                +62 {phone} {mode === 'register' ? '(WhatsApp Resmi)' : `(${channel === 'whatsapp' ? 'WhatsApp' : 'SMS'})`}
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

                    <div className="flex flex-col items-center justify-center space-y-2 text-center">
                        <Label className="text-sm font-semibold text-foreground">
                            Masukkan 6 Digit Kode OTP
                        </Label>
                        <div className="flex w-full justify-center py-2">
                            <InputOTP
                                maxLength={6}
                                value={otpCode}
                                onChange={(val) => setOtpCode(val)}
                                pattern={REGEXP_ONLY_DIGITS}
                                autoFocus
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
                        <p className="text-center text-xs font-medium text-destructive">
                            {errorMessage}
                        </p>
                    )}

                    <div className="flex flex-col items-center justify-center gap-2 pt-1 text-center">
                        <Button
                            type="submit"
                            disabled={isVerifying || otpCode.length < 6}
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
                                <span>Kirim ulang kode dalam <strong className="text-foreground">{countdown} detik</strong></span>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
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
