<?php

use App\Models\User;

test('onboarding screen can be rendered', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('onboarding'));

    $response->assertOk();
});

test('guest can access onboarding screen', function () {
    $response = $this->get(route('onboarding'));

    $response->assertOk();
});

test('user can store business profile and is redirected directly to dashboard', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post(route('onboarding.store'), [
        'name' => 'Warung Berkah Siti',
        'category' => 'kuliner',
        'address' => 'Jl. Diponegoro No. 8, Surabaya',
        'price_range' => 'Rp5.000 - Rp25.000',
        'phone' => '081234567890',
        'open_hours' => '07:00 - 21:00 WIB',
    ]);

    $response->assertRedirect(route('dashboard'));

    $this->assertDatabaseHas('business_profiles', [
        'user_id' => $user->id,
        'name' => 'Warung Berkah Siti',
        'category' => 'kuliner',
        'address' => 'Jl. Diponegoro No. 8, Surabaya',
    ]);
});

test('phone otp verify creates user, logs in, and redirects to onboarding in register mode', function () {
    $response = $this->postJson(route('auth.otp.verify'), [
        'phone' => '081299887766',
        'code' => '123456',
        'mode' => 'register',
    ]);

    $response->assertOk();
    $response->assertJson([
        'status' => 'success',
        'redirect' => route('onboarding'),
    ]);

    $this->assertAuthenticated();
    $this->assertDatabaseHas('users', [
        'phone' => '081299887766',
    ]);
});

test('business settings can update business profile in database', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('settings.usaha.update'), [
        'name' => 'Toko Kelontong Sentosa',
        'category' => 'kelontong',
        'address' => 'Pasar Wonokromo Blok B12',
        'open_hours' => '06:00 - 20:00 WIB',
        'phone' => '081987654321',
        'reminder_enabled' => true,
        'reminder_time' => '21:00',
    ]);

    $this->assertDatabaseHas('business_profiles', [
        'user_id' => $user->id,
        'name' => 'Toko Kelontong Sentosa',
        'category' => 'kelontong',
        'address' => 'Pasar Wonokromo Blok B12',
    ]);
});
