<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Models\Insight;
use App\Models\SocialConnection;
use App\Services\PromotionService;
use App\Support\AuthHelper;
use App\Support\PromotionHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PromotionController extends Controller
{
    public function __construct(
        protected PromotionService $promotionService
    ) {}

    /**
     * Display the Promosi page.
     */
    public function index(Request $request): Response|RedirectResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return $auth;
        }

        $business = $auth['business'];

        $warning = null;
        $activeInsight = null;
        $activeCampaign = null;

        // 1. Handle ?insight={id}
        $insightId = $request->query('insight');
        if ($insightId) {
            $insight = Insight::where('id', $insightId)
                ->where('business_id', $business->id)
                ->first();

            if (! $insight) {
                $warning = 'Insight tidak ditemukan.';
            } else {
                $activeInsight = [
                    'id' => $insight->id,
                    'title' => mb_substr($insight->title, 0, 60, 'UTF-8'),
                    'recommendation' => $insight->recommendation,
                    'source' => $insight->source,
                    'data_date' => $insight->data_date?->format('d M Y') ?? (string) $insight->data_date,
                ];
            }
        }

        // 2. Handle ?campaign={id}
        $campaignId = $request->query('campaign');
        if ($campaignId) {
            $campaign = Campaign::with('versions')
                ->where('id', $campaignId)
                ->where('business_id', $business->id)
                ->first();

            if (! $campaign) {
                $warning = 'Promosi tidak ditemukan.';
            } else {
                $activeCampaign = $this->formatCampaignData($campaign);
            }
        }

        // 3. Fetch recent 10 campaigns
        $recentCampaigns = Campaign::where('business_id', $business->id)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'promo_name' => $c->promo_name,
                'status' => $c->status,
                'created_at' => $c->created_at->format('d M Y, H:i'),
            ]);

        // 4. Social connection status
        $connections = SocialConnection::where('business_id', $business->id)
            ->get()
            ->keyBy('platform')
            ->map(fn ($conn) => [
                'platform' => $conn->platform,
                'display_name' => $conn->display_name,
                'is_connected' => true,
            ]);

        $isDemoMode = env('PROMO_DEMO_MODE', false) || app()->environment('local', 'testing');
        $view = class_exists('\Laravel\Fortify\Fortify') ? 'promosi/index' : 'Promotions/Index';

        return Inertia::render($view, [
            'business' => [
                'id' => $business->id,
                'business_name' => $business->business_name,
                'business_type' => $business->business_type,
                'address' => $business->address,
            ],
            'warning' => $warning,
            'activeInsight' => $activeInsight,
            'activeCampaign' => $activeCampaign,
            'recentCampaigns' => $recentCampaigns,
            'connections' => $connections,
            'isDemoMode' => $isDemoMode,
            'colorSchemes' => PromotionHelper::COLOR_SCHEMES,
        ]);
    }

    /**
     * Store new promotion draft.
     */
    public function store(Request $request): JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $business = $auth['business'];
        $user = $auth['user'];

        if ($user && $user->is_demo) {
            $demoKey = 'demo_ai_stt:'.$user->id;
            if (RateLimiter::tooManyAttempts($demoKey, 20)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batas demo tercapai. Daftar untuk memakai penuh.',
                ], 429);
            }
            RateLimiter::hit($demoKey, 3600);
        }

        $validated = $request->validate([
            'promo_name' => 'required|string|min:3|max:60',
            'offer_details' => 'required|string|min:5|max:300',
            'valid_period' => 'nullable|string|max:60',
            'contact' => 'nullable|string|max:80',
            'style' => 'nullable|string|in:Hangat,Segar,Elegan,Ceria',
            'color_scheme' => 'nullable|string',
            'format' => 'nullable|string|in:feed,story,1:1,9:16',
            'use_emoji' => 'nullable|boolean',
            'idempotency_key' => 'nullable|string',
            'insight_id' => 'nullable|integer',
        ], [
            'promo_name.required' => 'Nama promo belum diisi.',
            'promo_name.min' => 'Nama promo minimal 3 karakter.',
            'offer_details.required' => 'Tulis penawaranmu, contoh: Diskon 20% es kopi.',
            'offer_details.min' => 'Detail penawaran minimal 5 karakter.',
        ]);

        $campaign = $this->promotionService->createCampaign(
            $business,
            $validated,
            $validated['idempotency_key'] ?? null,
            $validated['insight_id'] ?? null
        );

        return response()->json([
            'success' => true,
            'campaign' => $this->formatCampaignData($campaign),
            'campaign_id' => $campaign->id,
            'redirect_url' => "/promosi?campaign={$campaign->id}",
        ]);
    }

    /**
     * Update campaign draft (auto-save with debounce).
     */
    public function update(Request $request, Campaign $campaign): JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $business = $auth['business'];
        if ($campaign->business_id !== $business->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $updated = $this->promotionService->updateCampaignDraft($campaign, $request->all());

        return response()->json([
            'success' => true,
            'campaign' => $this->formatCampaignData($updated),
        ]);
    }

    /**
     * Re-generate copy and poster ("Buat Ulang").
     */
    public function regenerate(Request $request, Campaign $campaign): JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $business = $auth['business'];
        $user = $auth['user'];

        if ($campaign->business_id !== $business->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($user && $user->is_demo) {
            $demoKey = 'demo_ai_stt:'.$user->id;
            if (RateLimiter::tooManyAttempts($demoKey, 20)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batas demo tercapai. Daftar untuk memakai penuh.',
                ], 429);
            }
            RateLimiter::hit($demoKey, 3600);
        }

        $updated = $this->promotionService->regenerateCampaign($campaign);

        return response()->json([
            'success' => true,
            'campaign' => $this->formatCampaignData($updated),
        ]);
    }

    /**
     * Publish campaign post to social media.
     */
    public function publish(Request $request, Campaign $campaign): JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $business = $auth['business'];
        $user = $auth['user'];

        if ($campaign->business_id !== $business->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'platform' => 'required|string|in:instagram,facebook,whatsapp,tiktok',
            'idempotency_key' => 'nullable|string',
            'content_hash' => 'nullable|string',
        ]);

        if ($user && $user->is_demo) {
            $campaign->update([
                'status' => 'terposting',
                'post_platform' => $validated['platform'],
                'posted_at' => now(),
                'post_external_id' => 'demo_post_'.uniqid(),
            ]);

            return response()->json([
                'success' => true,
                'simulated' => true,
                'message' => 'Konten berhasil dipublikasikan (simulasi mode demo).',
                'campaign' => $this->formatCampaignData($campaign->fresh()),
            ]);
        }

        $result = $this->promotionService->publishPost(
            $campaign,
            $validated['platform'],
            $validated['idempotency_key'] ?? null,
            $validated['content_hash'] ?? null
        );

        return response()->json($result, $result['success'] ? 200 : 422);
    }

    /**
     * Download campaign poster PNG.
     */
    public function download(Request $request, Campaign $campaign): BinaryFileResponse|JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $business = $auth['business'];
        if ($campaign->business_id !== $business->id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $slug = PromotionHelper::slugify($campaign->promo_name ?: $campaign->title ?: 'promo');
        $format = $campaign->format ?: 'feed';
        $downloadName = "promosi-{$slug}-{$format}.png";

        $fullPath = storage_path("app/private/{$campaign->poster_path}");
        if (! file_exists($fullPath)) {
            // Re-render if missing
            $this->promotionService->renderPosterForCampaign($campaign);
            $fullPath = storage_path("app/private/{$campaign->poster_path}");
        }

        return response()->download($fullPath, $downloadName, [
            'Content-Type' => 'image/png',
        ]);
    }

    /**
     * Transcribe speech-to-text audio per form field.
     */
    public function transcribe(Request $request): JsonResponse
    {
        $auth = AuthHelper::requireBusiness($request);
        if ($auth instanceof RedirectResponse) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $user = $auth['user'];
        if ($user && $user->is_demo) {
            $demoKey = 'demo_ai_stt:'.$user->id;
            if (RateLimiter::tooManyAttempts($demoKey, 20)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Batas demo tercapai. Daftar untuk memakai penuh.',
                ], 429);
            }
            RateLimiter::hit($demoKey, 3600);
        }

        $request->validate([
            'audio' => 'required|file|max:5120',
        ]);

        $file = $request->file('audio');
        $result = $this->promotionService->transcribeAudio($file);

        return response()->json($result);
    }

    /**
     * Generate an AI-created commercial advertising poster via Gemini API / Imagen 3.
     */
    public function generatePosterAi(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => 'nullable|string|max:150',
            'headline' => 'nullable|string|max:200',
            'offer_details' => 'nullable|string|max:500',
            'business_name' => 'nullable|string|max:100',
            'aspect_ratio' => 'nullable|string|in:feed,story',
            'gemini_api_key' => 'nullable|string|max:200',
        ]);

        $result = $this->promotionService->generateAiPoster($validated);

        return response()->json($result);
    }

    /**
     * Format campaign object for frontend representation.
     *
     * @return array<string, mixed>
     */
    protected function formatCampaignData(Campaign $c): array
    {
        $contentHash = hash('sha256', json_encode($c->copy, JSON_UNESCAPED_UNICODE));

        return [
            'id' => $c->id,
            'title' => $c->title,
            'promo_name' => $c->promo_name,
            'offer_details' => $c->offer_details,
            'valid_period' => $c->valid_period,
            'contact' => $c->contact,
            'style' => $c->style,
            'color_scheme' => $c->color_scheme,
            'format' => $c->format,
            'copy' => $c->copy,
            'poster_url' => "/api/promosi/{$c->id}/download",
            'poster_path' => $c->poster_path,
            'generated_by' => $c->generated_by,
            'status' => $c->status,
            'approved_at' => $c->approved_at?->format('d M Y, H:i'),
            'posted_at' => $c->posted_at?->format('d M Y, H:i'),
            'post_platform' => $c->post_platform,
            'post_external_id' => $c->post_external_id,
            'content_hash' => $contentHash,
        ];
    }
}
