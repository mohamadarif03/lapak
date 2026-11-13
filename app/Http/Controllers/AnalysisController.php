<?php

namespace App\Http\Controllers;

use App\Services\AnalysisService;
use App\Support\AuthHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalysisController extends Controller
{
    public function __construct(
        protected AnalysisService $analysisService
    ) {}

    /**
     * Display the Analisis page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return $auth;
        }

        $business = $auth['business'];

        // Determine radius (500, 1000, 3000; default 1000)
        $rawRadius = $request->query('radius', '1000');
        $radiusM = in_array((int) $rawRadius, [500, 1000, 3000], true) ? (int) $rawRadius : 1000;

        // Fetch the 3 insights independently
        $sales = $this->analysisService->getSalesInsight($business);
        $geo = $this->analysisService->getGeoInsight($business, $radiusM);
        $trends = $this->analysisService->getTrendsInsight($business);

        // Mark analysis_viewed_at on first successful render if currently null
        if (is_null($business->analysis_viewed_at)) {
            $business->update(['analysis_viewed_at' => now()]);
        }

        return Inertia::render('Analisis/Index', [
            'business' => [
                'id' => $business->id,
                'business_name' => $business->business_name,
                'business_type' => $business->business_type,
                'address' => $business->address,
                'lat' => $business->lat,
                'lng' => $business->lng,
            ],
            'selectedRadius' => $radiusM,
            'sales' => [
                'stats' => $sales['stats'],
                'insight' => $sales['insight'] ? [
                    'id' => $sales['insight']->id,
                    'type' => $sales['insight']->type,
                    'title' => $sales['insight']->title,
                    'recommendation' => $sales['insight']->recommendation,
                    'source' => $sales['insight']->source,
                    'data_date' => $sales['insight']->data_date?->format('d M Y') ?? (string) $sales['insight']->data_date,
                    'generated_by' => $sales['insight']->generated_by,
                ] : null,
                'error' => $sales['error'],
            ],
            'geo' => [
                'data' => $geo['geo'],
                'insight' => $geo['insight'] ? [
                    'id' => $geo['insight']->id,
                    'type' => $geo['insight']->type,
                    'title' => $geo['insight']->title,
                    'recommendation' => $geo['insight']->recommendation,
                    'source' => $geo['insight']->source,
                    'data_date' => $geo['insight']->data_date?->format('d M Y') ?? (string) $geo['insight']->data_date,
                    'radius_m' => $geo['insight']->radius_m,
                    'generated_by' => $geo['insight']->generated_by,
                ] : null,
                'error' => $geo['error'],
            ],
            'trends' => [
                'data' => $trends['trends'],
                'insight' => $trends['insight'] ? [
                    'id' => $trends['insight']->id,
                    'type' => $trends['insight']->type,
                    'title' => $trends['insight']->title,
                    'recommendation' => $trends['insight']->recommendation,
                    'source' => $trends['insight']->source,
                    'data_date' => $trends['insight']->data_date?->format('d M Y') ?? (string) $trends['insight']->data_date,
                    'generated_by' => $trends['insight']->generated_by,
                ] : null,
                'error' => $trends['error'],
            ],
        ]);
    }

    /**
     * Async endpoint for geodemographics radius switching.
     */
    public function geo(Request $request): JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['message' => 'Unauthorized or business profile required.'], 401);
        }

        $business = $auth['business'];

        $rawRadius = $request->query('radius', '1000');
        $radiusM = in_array((int) $rawRadius, [500, 1000, 3000], true) ? (int) $rawRadius : 1000;

        $geo = $this->analysisService->getGeoInsight($business, $radiusM);

        return response()->json([
            'radius' => $radiusM,
            'data' => $geo['geo'],
            'insight' => $geo['insight'] ? [
                'id' => $geo['insight']->id,
                'type' => $geo['insight']->type,
                'title' => $geo['insight']->title,
                'recommendation' => $geo['insight']->recommendation,
                'source' => $geo['insight']->source,
                'data_date' => $geo['insight']->data_date?->format('d M Y') ?? (string) $geo['insight']->data_date,
                'radius_m' => $geo['insight']->radius_m,
                'generated_by' => $geo['insight']->generated_by,
            ] : null,
            'error' => $geo['error'],
        ]);
    }
}
