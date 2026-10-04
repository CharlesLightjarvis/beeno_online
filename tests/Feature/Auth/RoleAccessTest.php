<?php

namespace Tests\Feature\Auth;

use App\Enums\RoleEnum;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
        Http::fake();
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
        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://ntfy.sh/mypersonalalert'
            && $request->header('Title') === ['Connexion administrateur']
            && $request->header('Priority') === ['high']
            && $request->header('Tags') === ['warning,lock']
            && $request->body() === "{$admin->name} vient de se connecter sur ".config('app.name').'.');
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
        Http::assertNothingSent();
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

    public function test_student_dashboard_is_available_without_email_verification(): void
    {
        $student = User::factory()->create(['email_verified_at' => null]);
        $student->assignRole('student');

        $this->actingAs($student)
            ->get(route('student.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('student/dashboard'));
    }

    public function test_public_registration_is_disabled(): void
    {
        $this->get('/register')
            ->assertNotFound()
            ->assertInertia(fn (Assert $page) => $page
                ->component('error-page')
                ->where('status', 404));

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
