<?php

namespace App\Http\Controllers;

use App\Services\ConsultationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConsultationController extends Controller
{
    public function __construct(
        protected ConsultationService $consultationService
    ) {}

    /**
     * Display the Help and Mentor Consultation page.
     */
    public function index(): Response
    {
        return Inertia::render('Consultation/Index', [
            'mentor' => $this->consultationService->getAssignedMentor(),
            'other_mentors' => $this->consultationService->getOtherMentors(),
            'bookings' => $this->consultationService->getBookings(),
            'mentor_tasks' => $this->consultationService->getMentorTasks(),
            'chat_messages' => $this->consultationService->getChatMessages(),
            'forum_posts' => $this->consultationService->getForumPosts(),
            'permissions' => $this->consultationService->getDataSharingPermissions(),
            'faqs' => $this->consultationService->getFaqs(),
            'quick_suggestions' => $this->consultationService->getQuickSuggestions(),
        ]);
    }

    /**
     * Submit a new consultation request.
     */
    public function bookConsultation(Request $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'mentor_id' => 'nullable|string',
            'mentor_name' => 'nullable|string',
            'mentor_title' => 'nullable|string',
            'mentor_avatar' => 'nullable|string',
            'topic' => 'required|string|max:100',
            'description' => 'required|string|min:5|max:1000',
            'preferred_dates' => 'required|array|min:1|max:3',
            'preferred_dates.*' => 'string|max:100',
            'format' => 'required|in:chat,video,tatap_muka',
            'attachment_name' => 'nullable|string|max:150',
            'consent_share_data' => 'nullable|boolean',
        ]);

        $booking = $this->consultationService->createBooking($validated);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Pengajuan konsultasi berhasil dikirim! Menunggu konfirmasi jadwal dari mentor.',
                'booking' => $booking,
            ]);
        }

        return redirect()->back()->with('success', 'Pengajuan konsultasi berhasil dikirim.');
    }

    /**
     * Rate and review a completed consultation session.
     */
    public function rateConsultation(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        $updated = $this->consultationService->rateBooking($id, $validated['rating'], $validated['review'] ?? null);

        return response()->json([
            'success' => $updated,
            'message' => 'Terima kasih atas ulasan dan penilaian Anda!',
        ]);
    }

    /**
     * Toggle completion of a mentor follow-up task.
     */
    public function toggleTask(string $id): JsonResponse
    {
        $result = $this->consultationService->toggleTask($id);

        return response()->json($result);
    }

    /**
     * Send a message to the mentor.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|min:1|max:2000',
            'image_url' => 'nullable|string|max:500',
        ]);

        $result = $this->consultationService->sendMessage($validated['text'], $validated['image_url'] ?? null);

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Create a new forum discussion thread.
     */
    public function createForumPost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|min:5|max:200',
            'content' => 'required|string|min:10|max:3000',
            'category' => 'required|string|max:50',
        ]);

        $post = $this->consultationService->createForumPost(
            $validated['title'],
            $validated['content'],
            $validated['category']
        );

        return response()->json([
            'success' => true,
            'message' => 'Diskusi berhasil dipublikasikan di komunitas UMKM!',
            'post' => $post,
        ]);
    }

    /**
     * Add a reply to a forum post.
     */
    public function replyForumPost(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|min:2|max:2000',
        ]);

        $result = $this->consultationService->replyForumPost($id, $validated['text']);

        return response()->json([
            'success' => true,
            'message' => 'Balasan berhasil dikirim!',
            'reply' => $result['reply'],
            'posts' => $result['posts'],
        ]);
    }

    /**
     * Mark or unmark a reply as best answer.
     */
    public function markBestAnswer(Request $request, string $postId, string $replyId): JsonResponse
    {
        $success = $this->consultationService->markBestAnswer($postId, $replyId);

        return response()->json([
            'success' => $success,
            'message' => $success ? 'Jawaban terbaik berhasil diperbarui.' : 'Gagal memperbarui jawaban terbaik.',
        ]);
    }

    /**
     * Toggle like on post or reply.
     */
    public function toggleLike(Request $request, string $postId): JsonResponse
    {
        $replyId = $request->input('reply_id');
        $result = $this->consultationService->toggleLike($postId, $replyId);

        return response()->json($result);
    }

    /**
     * Report an inappropriate forum post or reply.
     */
    public function reportForumPost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'post_id' => 'required|string',
            'reply_id' => 'nullable|string',
            'reason' => 'required|in:spam,penipuan,tidak_pantas,data_pribadi',
            'notes' => 'nullable|string|max:300',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan Anda telah diterima dan akan ditinjau tim moderator dalam 1x24 jam. Terima kasih telah menjaga keamanan komunitas.',
        ]);
    }

    /**
     * Update data sharing permissions.
     */
    public function updatePermissions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'share_profile' => 'nullable|boolean',
            'share_products' => 'nullable|boolean',
            'share_finance' => 'nullable|boolean',
            'share_learning' => 'nullable|boolean',
        ]);

        $permissions = $this->consultationService->updatePermissions($validated);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan izin berbagi data berhasil disimpan.',
            'permissions' => $permissions,
        ]);
    }

    /**
     * Revoke all data sharing permissions.
     */
    public function revokeAllPermissions(): JsonResponse
    {
        $permissions = $this->consultationService->revokeAllPermissions();

        return response()->json([
            'success' => true,
            'message' => 'Semua izin akses data mentor telah dinonaktifkan.',
            'permissions' => $permissions,
        ]);
    }

    /**
     * Submit platform feedback.
     */
    public function submitFeedback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|max:50',
            'feedback' => 'required|string|min:5|max:1000',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Masukan Anda sangat berharga untuk kemajuan aplikasi UMKM ini. Terima kasih!',
        ]);
    }
}
