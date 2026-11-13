<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearningTest extends TestCase
{
    use RefreshDatabase;

    public function test_learning_page_can_be_rendered(): void
    {
        $response = $this->get('/belajar');

        $response->assertStatus(200);
    }

    public function test_modul_belajar_redirects_to_belajar(): void
    {
        $response = $this->get('/modul-belajar');

        $response->assertRedirect('/belajar');
    }

    public function test_grade_pre_test_api_returns_score_and_breakdown(): void
    {
        $response = $this->postJson('/api/learning/grade-test', [
            'module_id' => 'modul-1',
            'test_type' => 'pre',
            'answers' => [
                'q1_1' => 'B',
                'q1_2' => 'C',
                'q1_3' => 'A',
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'score' => 100,
                'correct_count' => 3,
                'total_questions' => 3,
                'passed' => true,
            ])
            ->assertJsonStructure([
                'score',
                'correct_count',
                'total_questions',
                'passed',
                'breakdown' => [
                    '*' => [
                        'question_id',
                        'user_answer',
                        'correct_answer',
                        'is_correct',
                        'explanation',
                    ],
                ],
            ]);
    }

    public function test_grade_post_test_evaluates_gain_and_passing(): void
    {
        $response = $this->postJson('/api/learning/grade-test', [
            'module_id' => 'modul-2',
            'test_type' => 'post',
            'answers' => [
                'q2_p1' => 'B',
                'q2_p2' => 'A',
                'q2_p3' => 'C',
            ],
            'pre_test_score' => 33,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'score' => 100,
                'passed' => true,
                'score_gain' => 67,
            ]);
    }

    public function test_save_progress_api_updates_module_step(): void
    {
        $response = $this->postJson('/api/learning/save-progress', [
            'module_id' => 'modul-4',
            'current_step' => 3,
            'status' => 'sedang_belajar',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'progress' => [
                    'module_id' => 'modul-4',
                    'current_step' => 3,
                    'status' => 'sedang_belajar',
                ],
            ]);
    }
}
