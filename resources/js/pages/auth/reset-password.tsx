import { Form, Head } from '@inertiajs/react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

export default function ResetPassword({ token, email, passwordRules }: Props) {
    return (
        <div className="space-y-6">
            <Head title="Atur Ulang Kata Sandi - LAPAK" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="space-y-4"
            >
                {({ processing, errors }) => (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                                Alamat Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={email}
                                className="h-12 bg-muted/50 cursor-not-allowed"
                                readOnly
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                                Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                autoComplete="new-password"
                                autoFocus
                                placeholder="Masukkan kata sandi baru"
                                passwordrules={passwordRules}
                                className="h-12"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-sm font-semibold text-foreground">
                                Konfirmasi Kata Sandi Baru
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                autoComplete="new-password"
                                placeholder="Ulangi kata sandi baru"
                                passwordrules={passwordRules}
                                className="h-12"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <Button
                            type="submit"
                            className="mt-2 w-full text-base font-semibold"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <KeyRound className="size-5" />
                            )}
                            Simpan Kata Sandi Baru
                        </Button>
                    </div>
                )}
            </Form>
        </div>
    );
}

ResetPassword.layout = {
    title: 'Buat Kata Sandi Baru',
    description: 'Silakan masukkan kata sandi baru yang aman untuk akun usahamu.',
};
