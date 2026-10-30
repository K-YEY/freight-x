<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_guest_is_redirected_to_login(): void
    {
        $this->app['auth']->forgetGuards();

        $response = $this->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $this->app['auth']->forgetGuards();

        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret-password-123'),
        ]);

        $this->app['auth']->forgetGuards();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'secret-password-123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard'));
    }

    public function test_users_cannot_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('secret-password-123'),
        ]);

        $this->app['auth']->forgetGuards();

        $response = $this->from('/login')->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertRedirect('/login');
        $response->assertSessionHasErrors('email');
    }

    public function test_authenticated_user_can_log_out(): void
    {
        $user = User::first() ?? User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/login');
    }
}
