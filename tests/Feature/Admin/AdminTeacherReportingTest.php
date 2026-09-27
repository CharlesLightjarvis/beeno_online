<?php

namespace Tests\Feature\Admin;

use App\Enums\CourseSessionStatus;
use App\Enums\RoleEnum;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Models\Lesson;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminTeacherReportingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_teacher_reporting_permission_is_assigned_only_to_admins(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);
        $teacher = $this->userWithRole(RoleEnum::Teacher);
        $student = $this->userWithRole(RoleEnum::Student);

        $this->assertTrue($admin->hasPermissionTo('view.admin-teachers'));
        $this->assertFalse($teacher->hasPermissionTo('view.admin-teachers'));
        $this->assertFalse($student->hasPermissionTo('view.admin-teachers'));
    }

    public function test_non_admin_users_cannot_access_the_teacher_reporting_route(): void
    {
        $teacher = $this->userWithRole(RoleEnum::Teacher);
        $student = $this->userWithRole(RoleEnum::Student);

        $this->get('/admin/teachers')->assertRedirect(route('login'));
        $this->actingAs($teacher)->get('/admin/teachers')->assertForbidden();
        $this->actingAs($student)->get('/admin/teachers')->assertForbidden();
    }

    public function test_teacher_index_lists_teachers_with_cumulated_hours_and_remuneration(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);
        $teacher = $this->userWithRole(RoleEnum::Teacher);
        $teacher->update(['name' => 'Leïla Trabelsi']);
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $active = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Active]);
        $completed = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Completed, 'completed_at' => now()]);
        Lesson::factory()->for($active, 'session')->create(['duration_minutes' => 120]);
        Lesson::factory()->for($completed, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($admin)
            ->get(route('admin.teachers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/teachers/index')
                ->has('teachers', 1)
                ->where('teachers.0.id', $teacher->id)
                ->where('teachers.0.name', 'Leïla Trabelsi')
                ->where('teachers.0.active_sessions_count', 1)
                ->where('teachers.0.completed_sessions_count', 1)
                ->where('teachers.0.lessons_count', 2)
                ->where('teachers.0.total_minutes', 180)
                ->where('teachers.0.remuneration_millimes', 60_000)
                ->where('teachers.0.sessions_url', route('admin.sessions.index', ['teacher_id' => $teacher->id])));
    }

    public function test_remuneration_is_summed_per_session_with_the_session_hourly_rate(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);
        $teacher = $this->userWithRole(RoleEnum::Teacher);
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $standard = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['hourly_rate_millimes' => 20_000]);
        $premium = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['hourly_rate_millimes' => 25_000]);
        Lesson::factory()->for($standard, 'session')->create(['duration_minutes' => 60]);
        Lesson::factory()->for($premium, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($admin)
            ->get(route('admin.teachers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('teachers.0.total_minutes', 120)
                ->where('teachers.0.remuneration_millimes', 45_000));
    }

    public function test_teacher_index_handles_a_database_without_teachers_or_lessons(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);

        $this->actingAs($admin)
            ->get(route('admin.teachers.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/teachers/index')
                ->has('teachers', 0));
    }

    private function userWithRole(RoleEnum $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role->value);

        return $user;
    }
}
