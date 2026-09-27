<?php

namespace Tests\Feature;

use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LegacyDomainRemovalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_legacy_member_and_billing_routes_are_removed(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(RoleEnum::Admin->value);

        $this->actingAs($admin)->get('/member/dashboard')->assertNotFound();
        $this->actingAs($admin)->get('/member/resources')->assertNotFound();
        $this->actingAs($admin)->get('/member/masterclasses')->assertNotFound();
        $this->actingAs($admin)->post('/billing/checkout')->assertNotFound();
        $this->actingAs($admin)->get('/admin/members')->assertNotFound();
        $this->actingAs($admin)->get('/admin/member-resources')->assertNotFound();
        $this->actingAs($admin)->get('/admin/masterclass-sessions')->assertNotFound();
    }

    public function test_all_legacy_membership_and_billing_tables_are_removed(): void
    {
        $this->assertFalse(Schema::hasTable('membership_periods'));
        $this->assertFalse(Schema::hasTable('billing_orders'));
        $this->assertFalse(Schema::hasTable('payments'));
        $this->assertFalse(Schema::hasTable('payment_attempts'));
        $this->assertFalse(Schema::hasTable('provider_webhook_events'));
        $this->assertFalse(Schema::hasTable('member_resources'));
        $this->assertFalse(Schema::hasTable('masterclass_sessions'));
        $this->assertFalse(Schema::hasTable('subscriptions'));
        $this->assertFalse(Schema::hasTable('membership_plans'));
        $this->assertFalse(Schema::hasTable('membership_plan_prices'));
        $this->assertFalse(Schema::hasTable('gateway_resources'));
    }

    public function test_shared_auth_props_no_longer_expose_membership_state(): void
    {
        $teacher = User::factory()->create();
        $teacher->assignRole(RoleEnum::Teacher->value);

        $this->actingAs($teacher)
            ->get(route('teacher.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/dashboard')
                ->missing('auth.hasActiveMembership'));
    }

    public function test_home_redirects_to_login(): void
    {
        $this->get('/')->assertRedirect(route('login'));
    }
}
