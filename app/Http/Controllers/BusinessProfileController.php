<?php

namespace App\Http\Controllers;

use App\Models\Business;
use App\Models\User;
use App\Services\LocationService;
use App\Support\AuthHelper;
use App\Support\BusinessProfileHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class BusinessProfileController extends Controller
{
    public function __construct(
        protected LocationService $locationService
    ) {}

    /**
     * Show the business profile setup / edit page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $auth = AuthHelper::requireUser($request);
        if ($auth instanceof RedirectResponse) {
            return $auth;
        }

        /** @var User $user */
        $user = $auth;
        $business = $user->business;
        $isEditParam = $request->query('ubah') === '1' || $request->boolean('ubah');

        // Mode routing rules:
        // - If user already has business and ?ubah=1 is NOT present -> redirect to /dashboard
        if ($business && ! $isEditParam) {
            return redirect()->route('dashboard');
        }

        $mode = ($business && $isEditParam) ? 'edit' : 'create';

        $businessData = null;
        if ($business && $mode === 'edit') {
            $businessData = [
                'id' => $business->id,
                'owner_name' => $business->owner_name,
                'business_name' => $business->business_name,
                'business_type' => $business->business_type,
                'address' => $business->address,
                'lat' => $business->lat,
                'lng' => $business->lng,
            ];
        }

        $cancelUrl = Route::has('pengaturan') ? route('pengaturan') : route('dashboard');

        // Use compatible view name
        $view = class_exists('\Laravel\Fortify\Fortify') ? 'onboarding' : 'BusinessProfile/Index';

        return Inertia::render($view, [
            'mode' => $mode,
            'business' => $businessData,
            'userPhone' => $user->phone,
            'cancelUrl' => $cancelUrl,
        ]);
    }

    /**
     * Store or update the user's business profile.
     */
    public function store(Request $request): JsonResponse|RedirectResponse
    {
        $auth = AuthHelper::requireUser($request);
        if ($auth instanceof RedirectResponse) {
            return $auth;
        }

        /** @var User $user */
        $user = $auth;

        // Perform server-side validation using BusinessProfileHelper
        $errors = BusinessProfileHelper::validateBusinessProfile($request->all());

        if (count($errors) > 0) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => reset($errors),
                    'errors' => $errors,
                ], 422);
            }

            return back()->withErrors($errors)->withInput();
        }

        $ownerName = BusinessProfileHelper::normalizeName($request->input('owner_name'));
        $bizName = BusinessProfileHelper::normalizeName($request->input('business_name'));
        $bizType = (string) $request->input('business_type');
        $address = $request->filled('address') ? BusinessProfileHelper::normalizeName($request->input('address')) : null;
        $lat = round((float) $request->input('lat'), 7);
        $lng = round((float) $request->input('lng'), 7);

        // Safe upsert by user_id to prevent duplicates across double-clicks or multiple tabs
        $business = Business::updateOrCreate(
            ['user_id' => $user->id],
            [
                'owner_name' => $ownerName,
                'business_name' => $bizName,
                'business_type' => $bizType,
                'address' => $address,
                'lat' => $lat,
                'lng' => $lng,
            ]
        );

        // Always touch updated_at so analysis / other modules recognize timestamp change
        $business->touch();

        // Also sync business_profiles table if present in the app
        if (method_exists($user, 'businessProfile')) {
            $user->businessProfile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $bizName,
                    'category' => $bizType,
                    'address' => $address,
                    'phone' => $user->phone,
                ]
            );
        }

        $isEdit = $request->query('ubah') === '1' || $request->input('mode') === 'edit';
        $redirectUrl = ($isEdit && Route::has('pengaturan'))
            ? route('pengaturan', ['pesan' => 'profil-tersimpan'])
            : route('dashboard');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Profil usaha berhasil disimpan.',
                'redirect' => $redirectUrl,
                'business' => [
                    'id' => $business->id,
                    'owner_name' => $business->owner_name,
                    'business_name' => $business->business_name,
                    'business_type' => $business->business_type,
                    'address' => $business->address,
                    'lat' => $business->lat,
                    'lng' => $business->lng,
                ],
            ]);
        }

        return redirect()->to($redirectUrl)->with('success', 'Profil usaha berhasil disimpan!');
    }

    /**
     * Search address suggestions in Indonesia via server proxy.
     */
    public function searchAddress(Request $request): JsonResponse
    {
        $q = (string) $request->query('q', '');
        $results = $this->locationService->searchAddress($q);

        return response()->json([
            'success' => true,
            'suggestions' => $results,
        ]);
    }

    /**
     * Reverse geocode coordinates to an address string.
     */
    public function reverseGeocode(Request $request): JsonResponse
    {
        $lat = (float) $request->query('lat', 0);
        $lng = (float) $request->query('lng', 0);

        $address = $this->locationService->reverseGeocode($lat, $lng);

        return response()->json([
            'success' => true,
            'address' => $address,
        ]);
    }
}
