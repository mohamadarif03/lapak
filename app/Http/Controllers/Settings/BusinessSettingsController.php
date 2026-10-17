<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\BusinessProfile;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessSettingsController extends Controller
{
    /**
     * Show the business profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $businessProfile = $user?->businessProfile;

        return Inertia::render('settings/usaha', [
            'businessProfile' => $businessProfile,
        ]);
    }

    /**
     * Update the business profile.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'open_hours' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:50'],
            'reminder_enabled' => ['boolean'],
            'reminder_time' => ['nullable', 'string', 'max:20'],
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

        return back()->with('status', 'Profil usaha berhasil diperbarui.');
    }
}
