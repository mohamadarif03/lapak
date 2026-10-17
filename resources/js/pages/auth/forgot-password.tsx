import { Form, Head } from '@inertiajs/react';
import { ArrowLeft, Mail, RefreshCw, Send } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <div className="space-y-6">
            <Head title="Lupa Kata Sandi - LAPAK" />

            {status && (
                <div className="rounded-xl border border-[#A8BFA8] bg-[#E4F3E8] p-3 text-center text-sm font-medium text-[#216E45]">
                    {status}
                </div>
            )}

            <Form {...email.form()} className="space-y-5">
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                                Alamat Email Terdaftar
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                placeholder="nama@warung.id"
                                required
                                className="h-12"
                            />
                            <InputError message={errors.email} />
                        </div>

                        <Button
                            type="submit"
                            className="w-full text-base font-semibold"
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing ? (
                                <RefreshCw className="size-5 animate-spin" />
                            ) : (
                                <Send className="size-5" />
                            )}
                            Kirim Tautan Pemulihan Sandi
                        </Button>
                    </>
                )}
            </Form>

            <div className="text-center text-sm text-muted-foreground">
                <TextLink
                    href={login()}
                    className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-primary/80"
                >
                    <ArrowLeft className="size-4" />
                    Kembali ke Halaman Masuk
                </TextLink>
            </div>
        </div>
    );
}

ForgotPassword.layout = {
    title: 'Lupa Kata Sandi?',
    description: 'Masukkan alamat email tokomu untuk menerima tautan atur ulang kata sandi.',
};
