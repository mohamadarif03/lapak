<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Display the main dashboard view with access protection.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        if (! Auth::check()) {
            return redirect('/masuk')
                ->with('status', 'Sesi berakhir, silakan masuk lagi.')
                ->with('message', 'Sesi berakhir, silakan masuk lagi.');
        }

        $user = $request->user();
        $business = $user->business;

        if (! $business) {
            return redirect('/profil-usaha');
        }

        $periode = (string) $request->query('periode', 'hari');
        $dashboardData = $this->dashboardService->getDashboardData($business->id, $periode);

        return Inertia::render('dashboard', [
            'dashboard' => $dashboardData,
        ]);
    }

    /**
     * Fast JSON endpoint for tab switching or client revalidation without full page reload.
     */
    public function data(Request $request): JsonResponse
    {
        if (! Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = $request->user();
        $business = $user->business;

        if (! $business) {
            return response()->json(['message' => 'Business profile not found.'], 404);
        }

        $periode = (string) $request->query('periode', 'hari');
        $dashboardData = $this->dashboardService->getDashboardData($business->id, $periode);

        return response()->json($dashboardData);
    }
}
