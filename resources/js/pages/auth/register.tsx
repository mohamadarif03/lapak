import { Head } from '@inertiajs/react';
import TextLink from '@/components/text-link';
import { login } from '@/routes';
import PhoneOtpAuthCard from '@/components/auth/phone-otp-auth-card';

type Props = {
    passwordRules?: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <div className="space-y-6">
            <Head title="Daftar Akun LAPAK" />

            {/* Pendaftaran WhatsApp Only (ACC-01) */}
            <div className="space-y-4">
                <PhoneOtpAuthCard mode="register" />

                <div className="pt-2 text-center text-sm text-muted-foreground">
                    Sudah punya akun usaha?{' '}
                    <TextLink
                        href={login()}
                        className="font-bold text-primary hover:text-primary/80"
                    >
                        Masuk di Sini
                    </TextLink>
                </div>
            </div>
        </div>
    );
}

Register.layout = {
    title: 'Daftar Akun Usaha Baru',
    description: 'Daftar instan via WhatsApp resmi tanpa perlu email atau kata sandi rumit.',
};
