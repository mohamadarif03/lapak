import { Form, Head } from '@inertiajs/react';
import { Mail, RefreshCw } from 'lucide-react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <div className="space-y-6">
            <Head title="Verifikasi Email - LAPAK" />

            {status === 'verification-link-sent' && (
                <div className="rounded-xl border border-[#A8BFA8] bg-[#E4F3E8] p-3 text-center text-sm font-medium text-[#216E45]">
                    Tautan verifikasi baru telah dikirim ke alamat email yang kamu daftarkan.
                </div>
            )}

            <Form {...send.form()} className="space-y-5 text-center">
                {({ processing }) => (
                    <>
                        <Button
                            disabled={processing}
                            className="w-full text-base font-semibold"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Mail className="size-5" />
                            )}
                            Kirim Ulang Email Verifikasi
                        </Button>

                        <TextLink
                            href={logout()}
                            className="mx-auto block text-sm font-bold text-muted-foreground hover:text-foreground"
                        >
                            Keluar Akun
                        </TextLink>
                    </>
                )}
            </Form>
        </div>
    );
}

VerifyEmail.layout = {
    title: 'Verifikasi Alamat Email',
    description:
        'Cek kotak masuk email tokomu dan klik tautan verifikasi untuk mengaktifkan akun LAPAK.',
};
