<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentPromotionTest extends TestCase
{
    use RefreshDatabase;

    public function test_promotions_page_can_be_rendered(): void
    {
        $user = User::factory()->create();
        Business::create([
            'user_id' => $user->id,
            'owner_name' => 'Budi',
            'business_name' => 'Kopi Budi',
            'business_type' => 'Kuliner',
            'address' => 'Jl. Test No. 1',
        ]);

        $response = $this->actingAs($user)->get('/promosi');

        $response->assertStatus(200);
    }

    public function test_generate_captions_api_returns_structured_json(): void
    {
        $response = $this->postJson('/api/content-assistant/generate-captions', [
            'product_name' => 'Keripik Singkong Balado',
            'goal' => 'promo',
            'platform' => 'instagram',
            'tone' => 'santai',
            'notes' => 'Diskon 20%',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'captions' => [
                    '*' => [
                        'headline',
                        'body',
                        'cta',
                        'hashtags',
                    ],
                ],
                'recommended_time',
                'photo_tips',
                'quota_remaining',
            ]);
    }

    public function test_generate_ideas_api_returns_suggestions(): void
    {
        $response = $this->postJson('/api/content-assistant/generate-ideas', [
            'product_name' => 'Kopi Robusta',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'ideas',
            ]);
    }

    public function test_generate_reply_api_returns_formatted_text(): void
    {
        $response = $this->postJson('/api/content-assistant/generate-reply', [
            'topic' => 'Menanyakan ongkos kirim ke Surabaya',
            'category' => 'ongkir',
            'tone' => 'ramah',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'reply_text',
            ]);
    }
}
