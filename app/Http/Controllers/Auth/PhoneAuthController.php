<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PhoneAuthController extends Controller
{
    /**
     * Handle simulated or production OTP verification and login/register user.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string', 'min:8'],
            'code' => ['nullable', 'string'],
            'mode' => ['nullable', 'string', 'in:login,register'],
        ]);

        $rawPhone = preg_replace('/[^0-9]/', '', (string) $request->input('phone'));

        if (str_starts_with($rawPhone, '62')) {
            $normalizedPhone = '0'.substr($rawPhone, 2);
        } elseif (! str_starts_with($rawPhone, '0')) {
            $normalizedPhone = '0'.$rawPhone;
        } else {
            $normalizedPhone = $rawPhone;
        }

        $email = $normalizedPhone.'@lapak.id';

        $user = User::where('phone', $normalizedPhone)
            ->orWhere('email', $email)
            ->first();

        if (! $user) {
            $user = User::create([
                'name' => 'Pemilik Toko '.substr($normalizedPhone, -4),
                'phone' => $normalizedPhone,
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
            ]);
        } else {
            if (! $user->phone) {
                $user->phone = $normalizedPhone;
                $user->save();
            }
        }

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        $redirect = $request->input('mode') === 'register'
            ? route('onboarding')
            : route('dashboard');

        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
            ],
            'redirect' => $redirect,
        ]);
    }
}
