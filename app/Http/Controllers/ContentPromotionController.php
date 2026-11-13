<?php

namespace App\Http\Controllers;

use App\Services\ContentAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContentPromotionController extends Controller
{
    public function __construct(
        protected ContentAssistantService $contentAssistantService
    ) {}

    /**
     * Tampilkan halaman utama Konten dan Promosi
     */
    public function index(): Response
    {
        return Inertia::render('Promotions/Index');
    }

    /**
     * API Generator Caption AI
     */
    public function generateCaptions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => 'nullable|string|max:255',
            'goal' => 'required|string|max:100',
            'platform' => 'required|string|max:100',
            'tone' => 'required|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $result = $this->contentAssistantService->generateCaptions($validated);

        return response()->json($result);
    }

    /**
     * API Generator Ide Konten & Tips Foto/Video
     */
    public function generateIdeas(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_name' => 'nullable|string|max:255',
            'goal' => 'nullable|string|max:100',
        ]);

        $result = $this->contentAssistantService->generateIdeas($validated);

        return response()->json($result);
    }

    /**
     * API Generator Template Balasan Pelanggan Cepat
     */
    public function generateReply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic' => 'required|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $result = $this->contentAssistantService->generateReplyTemplate($validated);

        return response()->json($result);
    }
}
