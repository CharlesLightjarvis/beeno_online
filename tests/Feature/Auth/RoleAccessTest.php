<?php

namespace Tests\Feature\Auth;

use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_is_redirected_to_the_admin_dashboard_after_login(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(RoleEnum::Admin->value);

        $response = $this->post(route('login.store'), [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_teacher_is_redirected_to_the_teacher_dashboard_after_login(): void
    {
        $teacher = User::factory()->create();
        $teacher->assignRole('teacher');

        $response = $this->post(route('login.store'), [
            'email' => $teacher->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('teacher.dashboard'));
    }

    public function test_student_cannot_access_interactive_dashboards(): void
    {
        $student = User::factory()->create();
        $student->assignRole('student');

        $this->actingAs($student)
            ->get('/teacher/dashboard')
            ->assertForbidden();

        $this->actingAs($student)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    }

    public function test_public_registration_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', [])->assertNotFound();
    }

    public function test_removed_membership_plan_crud_is_not_accessible(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(RoleEnum::Admin->value);

        $this->actingAs($admin)
            ->get('/admin/membership-plans')
            ->assertNotFound();
    }

    public function test_roles_seeder_is_idempotent_for_the_canonical_roles(): void
    {
        $this->seed(RolesAndPermissionsSeeder::class);

        $this->assertSame(1, Role::query()->where('name', 'admin')->count());
        $this->assertSame(1, Role::query()->where('name', 'teacher')->count());
        $this->assertSame(1, Role::query()->where('name', 'student')->count());
    }
}
