<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_page_can_be_rendered(): void
    {
        $response = $this->get('/keuangan');

        $response->assertStatus(200);
    }

    public function test_catatan_kas_route_redirects_to_finance(): void
    {
        $response = $this->get('/catatan-kas');

        $response->assertRedirect('/keuangan');
    }
}
