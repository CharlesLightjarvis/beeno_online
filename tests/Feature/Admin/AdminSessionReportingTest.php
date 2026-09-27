<?php

namespace Tests\Feature\Admin;

use App\Enums\AttendanceStatus;
use App\Enums\CourseSessionStatus;
use App\Enums\RoleEnum;
use App\Models\Attendance;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Models\Lesson;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSessionReportingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_admin_reporting_permissions_are_assigned_only_to_admins(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);
        $teacher = $this->userWithRole(RoleEnum::Teacher);
        $student = $this->userWithRole(RoleEnum::Student);

        $this->assertTrue($admin->hasPermissionTo('view.admin-sessions'));
        $this->assertFalse($teacher->hasPermissionTo('view.admin-sessions'));
        $this->assertFalse($student->hasPermissionTo('view.admin-sessions'));
    }

    public function test_non_admin_users_cannot_access_admin_session_routes(): void
    {
        $teacher = $this->userWithRole(RoleEnum::Teacher);
        $student = $this->userWithRole(RoleEnum::Student);
        $session = CourseSession::factory()->create();

        $this->get('/admin/sessions')->assertRedirect(route('login'));
        $this->actingAs($teacher)->get('/admin/sessions')->assertForbidden();
        $this->actingAs($student)->get("/admin/sessions/{$session->id}")->assertForbidden();
    }

    public function test_admin_dashboard_exposes_exact_global_metrics_and_recent_sessions(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);
        $teacher = $this->userWithRole(RoleEnum::Teacher);
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $active = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'label' => 'A1.1 — Matin',
                'target_minutes' => 1800,
                'hourly_rate_millimes' => 20_000,
                'status' => CourseSessionStatus::Active,
                'updated_at' => now(),
            ]);
        $completed = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'label' => 'A1.1 — Soir',
                'target_minutes' => 1800,
                'hourly_rate_millimes' => 20_000,
                'status' => CourseSessionStatus::Completed,
                'completed_at' => now(),
                'updated_at' => now()->subDay(),
            ]);
        Lesson::factory()->for($active, 'session')->create(['duration_minutes' => 120]);
        Lesson::factory()->for($active, 'session')->create(['duration_minutes' => 60]);
        Lesson::factory()->for($completed, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/dashboard')
                ->where('summary.active_sessions', 1)
                ->where('summary.completed_sessions', 1)
                ->where('summary.total_minutes', 240)
                ->where('summary.remuneration_millimes', 80_000)
                ->has('recentSessions', 2)
                ->where('recentSessions.0.id', $active->id)
                ->where('recentSessions.0.total_minutes', 180)
                ->where('recentSessions.0.progress_percent', 10)
                ->where('recentSessions.0.remuneration_millimes', 60_000)
                ->where('recentSessions.1.id', $completed->id));
    }

    public function test_admin_dashboard_handles_an_empty_database(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);

        $this->actingAs($admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/dashboard')
                ->where('summary.active_sessions', 0)
                ->where('summary.completed_sessions', 0)
                ->where('summary.total_minutes', 0)
                ->where('summary.remuneration_millimes', 0)
                ->has('recentSessions', 0));
    }

    public function test_admin_lists_all_sessions_with_teacher_progress_hours_and_remuneration(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);
        $teacher = $this->userWithRole(RoleEnum::Teacher);
        $teacher->update(['name' => 'Leïla Trabelsi']);
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $student = User::factory()->student($teacher)->create();
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'label' => 'A1.1 — Matin',
                'target_minutes' => 1800,
                'hourly_rate_millimes' => 20_000,
                'status' => CourseSessionStatus::Active,
            ]);
        $session->students()->attach($student, ['enrolled_at' => now()]);
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 120]);

        $this->actingAs($admin)
            ->get(route('admin.sessions.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/sessions/index')
                ->has('sessions.data', 1)
                ->where('sessions.data.0.id', $session->id)
                ->where('sessions.data.0.teacher.name', 'Leïla Trabelsi')
                ->where('sessions.data.0.level.code', 'A1.1')
                ->where('sessions.data.0.students_count', 1)
                ->where('sessions.data.0.total_minutes', 120)
                ->where('sessions.data.0.progress_percent', 6.7)
                ->where('sessions.data.0.remuneration_millimes', 40_000)
                ->has('teachers', 1)
                ->has('levels', 1));
    }

    public function test_admin_sessions_index_serves_filter_options_for_the_data_table_facets(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);
        $firstTeacher = $this->userWithRole(RoleEnum::Teacher);
        $firstTeacher->update(['name' => 'Amine Gharbi']);
        $secondTeacher = $this->userWithRole(RoleEnum::Teacher);
        $secondTeacher->update(['name' => 'Zohra Ben Ammar']);
        $firstLevel = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $secondLevel = CourseLevel::factory()->create(['code' => 'A1.2', 'position' => 2]);
        CourseSession::factory()->for($firstTeacher, 'teacher')->for($firstLevel, 'level')->create();

        $this->actingAs($admin)
            ->get(route('admin.sessions.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('teachers', 2)
                ->where('teachers.0.name', 'Amine Gharbi')
                ->where('teachers.1.name', 'Zohra Ben Ammar')
                ->has('levels', 2)
                ->where('levels.0.code', 'A1.1'));
    }

    public function test_admin_views_session_lessons_and_named_attendance_statuses_read_only(): void
    {
        $admin = $this->userWithRole(RoleEnum::Admin);
        $teacher = $this->userWithRole(RoleEnum::Teacher);
        $teacher->update(['name' => 'Sami Ben Ali']);
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $amina = User::factory()->student($teacher)->create(['name' => 'Amina Ben Salah']);
        $nour = User::factory()->student($teacher)->create(['name' => 'Nour Ayari']);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'label' => 'A1.1 — Matin',
                'target_minutes' => 1800,
                'hourly_rate_millimes' => 20_000,
            ]);
        $session->students()->attach([$amina->id, $nour->id], ['enrolled_at' => now()]);
        $lesson = Lesson::factory()->for($session, 'session')->create([
            'held_on' => '2026-09-26',
            'starts_at' => '10:30:00',
            'duration_minutes' => 120,
        ]);
        Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $amina->id,
            'status' => AttendanceStatus::Present,
        ]);
        Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $nour->id,
            'status' => AttendanceStatus::Absent,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.sessions.show', $session))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/sessions/show')
                ->where('session.id', $session->id)
                ->where('session.teacher.name', 'Sami Ben Ali')
                ->where('metrics.total_minutes', 120)
                ->where('metrics.progress_percent', 6.7)
                ->where('metrics.remuneration_millimes', 40_000)
                ->has('students', 2)
                ->has('lessons', 1)
                ->where('lessons.0.present_count', 1)
                ->where('lessons.0.absent_count', 1)
                ->where('lessons.0.attendances.0.student.name', 'Amina Ben Salah')
                ->where('lessons.0.attendances.0.status', AttendanceStatus::Present->value)
                ->where('lessons.0.attendances.1.student.name', 'Nour Ayari')
                ->where('lessons.0.attendances.1.status', AttendanceStatus::Absent->value));

        $this->assertFalse(Route::has('admin.sessions.edit'));
        $this->assertFalse(Route::has('admin.sessions.update'));
        $this->assertFalse(Route::has('admin.sessions.destroy'));
        $this->assertFalse(Route::has('admin.sessions.attendances.create'));
    }

    private function userWithRole(RoleEnum $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role->value);

        return $user;
    }
}
