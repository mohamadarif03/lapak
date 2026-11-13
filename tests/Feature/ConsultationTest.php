<?php

namespace Tests\Feature;

use Tests\TestCase;

class ConsultationTest extends TestCase
{
    public function test_consultation_page_can_be_rendered(): void
    {
        $response = $this->get('/bantuan');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Consultation/Index')
            ->has('mentor')
            ->has('other_mentors')
            ->has('bookings')
            ->has('mentor_tasks')
            ->has('chat_messages')
            ->has('forum_posts')
            ->has('permissions')
            ->has('faqs')
            ->has('quick_suggestions')
        );
    }

    public function test_tanya_mentor_redirects_to_bantuan(): void
    {
        $response = $this->get('/tanya-mentor');

        $response->assertRedirect('/bantuan');
    }

    public function test_konsultasi_redirects_to_bantuan(): void
    {
        $response = $this->get('/konsultasi');

        $response->assertRedirect('/bantuan');
    }

    public function test_can_book_consultation(): void
    {
        $response = $this->postJson('/api/consultation/book', [
            'topic' => 'Pemasaran Digital',
            'description' => 'Bagaimana cara meningkatkan penjualan sambal cumi di TikTok?',
            'preferred_dates' => ['Sabtu, 2 Nov 2026 - 10:00 WIB'],
            'format' => 'video',
            'attachment_name' => 'foto_sambal.jpg',
            'consent_share_data' => true,
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'booking' => ['id', 'topic', 'status'],
        ]);
    }

    public function test_can_toggle_mentor_task(): void
    {
        $response = $this->postJson('/api/consultation/tasks/task-3/toggle');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'task' => [
                'id' => 'task-3',
                'is_completed' => true,
            ],
        ]);
    }

    public function test_can_send_chat_message_and_receive_auto_reply(): void
    {
        $response = $this->postJson('/api/consultation/chat/send', [
            'text' => 'Halo Kak Rendy, apakah etalase saya sudah rapi?',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'data' => [
                'new_message',
                'auto_reply',
                'all_messages',
            ],
        ]);
    }

    public function test_can_create_forum_post_and_reply(): void
    {
        // 1. Create post
        $postRes = $this->postJson('/api/consultation/forum/posts', [
            'title' => 'Cara menjaga kerenyahan keripik jamur?',
            'content' => 'Halo semuanya, keripik jamur saya cepat melempem jika disimpan seminggu. Ada saran kemasan?',
            'category' => 'Produk & Kemasan',
        ]);

        $postRes->assertStatus(200);
        $postRes->assertJson([
            'success' => true,
        ]);
        $postId = $postRes->json('post.id');

        // 2. Reply to post
        $replyRes = $this->postJson("/api/consultation/forum/posts/{$postId}/reply", [
            'text' => 'Gunakan silika gel food-grade di dalam kemasan foil ya Bu.',
        ]);

        $replyRes->assertStatus(200);
        $replyRes->assertJson([
            'success' => true,
        ]);
    }

    public function test_can_update_and_revoke_data_permissions(): void
    {
        // Update
        $updateRes = $this->postJson('/api/consultation/permissions', [
            'share_profile' => true,
            'share_products' => true,
            'share_finance' => false,
            'share_learning' => true,
        ]);

        $updateRes->assertStatus(200);
        $updateRes->assertJson([
            'success' => true,
            'permissions' => [
                'share_finance' => false,
            ],
        ]);

        // Revoke all
        $revokeRes = $this->postJson('/api/consultation/permissions/revoke-all');
        $revokeRes->assertStatus(200);
        $revokeRes->assertJson([
            'success' => true,
            'permissions' => [
                'share_profile' => false,
                'share_finance' => false,
            ],
        ]);
    }

    public function test_can_submit_platform_feedback(): void
    {
        $response = $this->postJson('/api/consultation/feedback', [
            'category' => 'Saran Fitur',
            'feedback' => 'Tolong tambahkan fitur reminder jadwal konsultasi lewat notifikasi WhatsApp.',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
    }
}
