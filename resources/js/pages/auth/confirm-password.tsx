import { Form, Head } from '@inertiajs/react';
import { Lock, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import PasskeyVerify from '@/components/passkey-verify';

export default function ConfirmPassword() {
    return (
        <div className="space-y-6">
            <Head title="Konfirmasi Keamanan - LAPAK" />

            <PasskeyVerify
                routes={{
                    options: confirmOptions(),
                    submit: confirmStore(),
                }}
                label="Konfirmasi dengan Passkey"
                loadingLabel="Memproses..."
                separator="Atau konfirmasi dengan kata sandi"
            />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }) => (
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                                Kata Sandi
                            </Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Masukkan kata sandi akun tokomu"
                                autoComplete="current-password"
                                autoFocus
                                className="h-12"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <Button
                            className="w-full text-base font-semibold"
                            disabled={processing}
                            data-test="confirm-password-button"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Lock className="size-5" />
                            )}
                            Konfirmasi Akses
                        </Button>
                    </div>
                )}
            </Form>
        </div>
    );
}

ConfirmPassword.layout = {
    title: 'Konfirmasi Kata Sandi',
    description:
        'Halaman ini terlindungi untuk keamanan data usaha. Masukkan kata sandi sebelum melanjutkan.',
};
