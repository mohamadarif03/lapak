import { useState } from 'react';
import { Form, Head } from '@inertiajs/react';
import {
    LogIn,
    Mail,
    Smartphone,
    UserPlus,
} from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';
import PhoneOtpAuthCard from '@/components/auth/phone-otp-auth-card';

type Props = {
    status?: string;
    sessionExpiredMessage?: string;
    canResetPassword?: boolean;
    next?: string;
    initialStep?: 'phone' | 'otp';
    initialPhone?: string;
    initialMaskedPhone?: string;
    initialChannel?: 'whatsapp' | 'sms';
    initialResendWait?: number;
};

export default function Login({
    status,
    sessionExpiredMessage,
    canResetPassword = false,
    next = '/dashboard',
    initialStep = 'phone',
    initialPhone = '',
    initialMaskedPhone = '',
    initialChannel = 'whatsapp',
    initialResendWait = 0,
}: Props) {
    const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

    const displayStatus = sessionExpiredMessage || status;

    return (
        <div className="space-y-6">
            <Head title="Masuk Akun LAPAK" />

            {displayStatus && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-center text-sm font-semibold text-amber-900 shadow-xs"
                >
                    {displayStatus}
                </div>
            )}

            {/* Tab Selector: Nomor HP (ACC-01) vs Email & Sandi (AUTH-STD) */}
            <div className="grid grid-cols-2 rounded-xl bg-muted/60 p-1.5 ring-1 ring-border">
                <button
                    type="button"
                    onClick={() => setAuthMethod('phone')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        authMethod === 'phone'
                            ? 'bg-card text-foreground shadow-xs ring-1 ring-border'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Smartphone className="size-4 text-primary" />
                    <span>WhatsApp / HP</span>
                    <span className="hidden sm:inline-block rounded-full bg-[#F6EBD5] text-[#8A5700] px-2 py-0.5 text-[10px] font-bold">
                        Cepat
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => setAuthMethod('email')}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        authMethod === 'email'
                            ? 'bg-card text-foreground shadow-xs ring-1 ring-border'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    <Mail className="size-4 text-slate-500" />
                    <span>Email & Sandi</span>
                    <span className="hidden sm:inline-block rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        Standar
                    </span>
                </button>
            </div>

            {/* TAB 1: Desain ACC-01 (Nomor HP & OTP) */}
            {authMethod === 'phone' ? (
                <div className="space-y-4">
                    <PhoneOtpAuthCard
                        mode="login"
                        next={next}
                        initialStep={initialStep}
                        initialPhone={initialPhone}
                        initialMaskedPhone={initialMaskedPhone}
                        initialChannel={initialChannel}
                        initialResendWait={initialResendWait}
                    />
                    
                    <div className="pt-2 text-center text-sm text-muted-foreground">
                        Belum punya akun usaha?{' '}
                        <TextLink
                            href="/register"
                            className="font-bold text-primary hover:text-primary/80 underline underline-offset-2"
                        >
                            Masuk & Daftar Otomatis
                        </TextLink>
                    </div>
                </div>
            ) : (
                /* TAB 2: Redesign AUTH-STD (Email & Password Fortify) */
                <div className="space-y-6">
                    <PasskeyVerify />

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                                            Alamat Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="contoh@warung.id"
                                            className="h-12"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                                                Kata Sandi
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-xs font-semibold text-primary hover:text-primary/80"
                                                    tabIndex={5}
                                                >
                                                    Lupa sandi?
                                                </TextLink>
                                            )}
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Masukkan kata sandi"
                                            className="h-12"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-2.5 pt-1">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="size-4 rounded-md border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <Label
                                            htmlFor="remember"
                                            className="text-xs sm:text-sm font-medium text-muted-foreground cursor-pointer"
                                        >
                                            Ingat saya di perangkat ini
                                        </Label>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="mt-2 w-full text-base font-semibold"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing ? (
                                            <Spinner />
                                        ) : (
                                            <LogIn className="size-5" />
                                        )}
                                        Masuk ke Akun Usaha
                                    </Button>
                                </div>

                                <div className="text-center text-sm text-muted-foreground">
                                    Belum punya akun usaha?{' '}
                                    <TextLink
                                        href="/register"
                                        tabIndex={6}
                                        className="font-bold text-primary hover:text-primary/80"
                                    >
                                        Daftar Sekarang
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            )}
        </div>
    );
}

Login.layout = {
    title: 'Masuk ke Akun Usahamu',
    description: 'Bicara dan kelola catatan tokomu dengan mudah.',
};
