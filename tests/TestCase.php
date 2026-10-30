<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected ?User $defaultTestUser = null;

    protected function setUp(): void
    {
        parent::setUp();

        $user = User::first() ?? User::factory()->create();
        $this->actingAs($user);
        $this->defaultTestUser = $user;
    }
}
