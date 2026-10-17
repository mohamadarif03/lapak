<?php

namespace App\Http\Controllers;

use App\Models\BusinessProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnboardingController extends Controller
{
    /**
     * Show the business profile setup page (onboarding).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $businessProfile = $user?->businessProfile;

        return Inertia::render('onboarding', [
            'businessProfile' => $businessProfile,
            'userPhone' => $user?->phone,
        ]);
    }

    /**
     * Store the business profile and redirect to dashboard.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'price_range' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'open_hours' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();

        if ($user) {
            $user->businessProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $validated
            );

            $user->business()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'owner_name' => $user->name ?? 'Pemilik Lapak',
                    'business_name' => $validated['name'],
                    'business_type' => $validated['category'],
                    'address' => $validated['address'] ?? null,
                ]
            );
        } else {
            $fallbackUser = User::first();
            if ($fallbackUser) {
                $fallbackUser->businessProfile()->updateOrCreate(
                    ['user_id' => $fallbackUser->id],
                    $validated
                );

                $fallbackUser->business()->updateOrCreate(
                    ['user_id' => $fallbackUser->id],
                    [
                        'owner_name' => $fallbackUser->name ?? 'Pemilik Lapak',
                        'business_name' => $validated['name'],
                        'business_type' => $validated['category'],
                        'address' => $validated['address'] ?? null,
                    ]
                );
            } else {
                BusinessProfile::create($validated);
            }
        }

        return to_route('dashboard')->with('success', 'Profil usahamu berhasil disimpan!');
    }
}
