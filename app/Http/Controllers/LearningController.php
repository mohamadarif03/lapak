<?php

namespace App\Http\Controllers;

use App\Services\LearningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningController extends Controller
{
    public function __construct(
        protected LearningService $learningService
    ) {}

    /**
     * Tampilkan halaman utama Belajar & Modul Mikro UMKM
     */
    public function index(Request $request): Response
    {
        $modules = $this->learningService->getModules();
        $badges = $this->learningService->getBadges();
        $activities = $this->learningService->getActivities();

        // Ambil data progres dari session atau gunakan data default terstruktur
        $userProgress = $request->session()->get('user_learning_progress', $this->learningService->getInitialUserProgress());
        $recommendation = $this->learningService->getRecommendedModule($userProgress);

        // Hitung statistik keseluruhan
        $completedCount = collect($userProgress)->where('status', 'selesai')->count();
        $postScores = collect($userProgress)
            ->filter(fn ($p) => $p['status'] === 'selesai' && ! is_null($p['post_test_score']))
            ->pluck('post_test_score');

        $avgPostScore = $postScores->count() > 0 ? (int) round($postScores->avg()) : 0;

        // Hitung rata-rata kenaikan skor (post-test dikurangi pre-test)
        $gains = collect($userProgress)
            ->filter(fn ($p) => ! is_null($p['pre_test_score']) && ! is_null($p['post_test_score']))
            ->map(fn ($p) => max(0, $p['post_test_score'] - $p['pre_test_score']));

        $avgGain = $gains->count() > 0 ? (int) round($gains->avg()) : 0;

        $unlockedBadgesCount = collect($badges)->where('is_unlocked', true)->count();

        $stats = [
            'modules_completed' => $completedCount,
            'total_modules' => count($modules),
            'total_learning_hours' => 1.5, // 90 menit pembelajaran mikro
            'badges_earned' => $unlockedBadgesCount,
            'total_badges' => count($badges),
            'avg_post_test_score' => $avgPostScore,
            'avg_score_increase' => $avgGain,
            'streak_learning_days' => 3,
        ];

        return Inertia::render('Learning/Index', [
            'modules' => $modules,
            'badges' => $badges,
            'activities' => $activities,
            'initialProgress' => $userProgress,
            'recommendation' => $recommendation,
            'stats' => $stats,
        ]);
    }

    /**
     * API Penilaian Tes Terstruktur & Aman (Integritas Tes)
     */
    public function gradeTest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'module_id' => 'required|string|max:50',
            'test_type' => 'required|in:pre,post',
            'answers' => 'required|array',
            'pre_test_score' => 'nullable|integer|min:0|max:100',
        ]);

        $result = $this->learningService->gradeQuiz(
            $validated['module_id'],
            $validated['test_type'],
            $validated['answers'],
            $validated['pre_test_score'] ?? null
        );

        // Jika post test dan lulus, simpan ke session progress
        if ($validated['test_type'] === 'post') {
            $userProgress = $request->session()->get('user_learning_progress', $this->learningService->getInitialUserProgress());
            $current = $userProgress[$validated['module_id']] ?? [
                'module_id' => $validated['module_id'],
                'current_step' => 4,
                'total_steps' => 4,
                'pre_test_score' => $validated['pre_test_score'] ?? null,
                'attempts_count' => 0,
            ];

            $current['status'] = $result['passed'] ? 'selesai' : 'sedang_belajar';
            $current['post_test_score'] = $result['score'];
            $current['best_post_test_score'] = max($current['best_post_test_score'] ?? 0, $result['score']);
            $current['attempts_count'] = ($current['attempts_count'] ?? 0) + 1;
            $current['passed'] = $result['passed'];
            $current['last_accessed_at'] = now()->format('Y-m-d H:i');

            if ($result['passed'] && empty($current['completed_at'])) {
                $current['completed_at'] = now()->format('Y-m-d H:i');
            }

            $userProgress[$validated['module_id']] = $current;
            $request->session()->put('user_learning_progress', $userProgress);
        }

        return response()->json($result);
    }

    /**
     * API Menyimpan Progres Langkah Belajar Otomatis
     */
    public function saveProgress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'module_id' => 'required|string|max:50',
            'current_step' => 'required|integer|min:0',
            'status' => 'required|in:belum_dimulai,sedang_belajar,selesai',
            'pre_test_score' => 'nullable|integer|min:0|max:100',
        ]);

        $userProgress = $request->session()->get('user_learning_progress', $this->learningService->getInitialUserProgress());
        $current = $userProgress[$validated['module_id']] ?? [
            'module_id' => $validated['module_id'],
            'total_steps' => 4,
            'attempts_count' => 0,
            'passed' => false,
        ];

        $current['current_step'] = $validated['current_step'];
        $current['status'] = $validated['status'];
        if (isset($validated['pre_test_score'])) {
            $current['pre_test_score'] = $validated['pre_test_score'];
        }
        $current['last_accessed_at'] = now()->format('Y-m-d H:i');

        $userProgress[$validated['module_id']] = $current;
        $request->session()->put('user_learning_progress', $userProgress);

        return response()->json([
            'success' => true,
            'progress' => $current,
        ]);
    }
}
