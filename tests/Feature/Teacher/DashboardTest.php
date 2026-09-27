<?php

namespace Tests\Feature\Teacher;

use App\Enums\CourseSessionStatus;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Models\Lesson;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('teacher.dashboard'))->assertRedirect(route('login'));
    }

    public function test_non_teacher_users_are_forbidden(): void
    {
        $admin = $this->userWithRole('admin');
        $student = $this->userWithRole('student');

        $this->actingAs($admin)->get(route('teacher.dashboard'))->assertForbidden();
        $this->actingAs($student)->get(route('teacher.dashboard'))->assertForbidden();
    }

    public function test_dashboard_exposes_exact_metrics_active_sessions_and_recent_lessons(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $active = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'label' => 'A1.1 — Matin',
                'target_minutes' => 1800,
                'hourly_rate_millimes' => 20_000,
                'status' => CourseSessionStatus::Active,
            ]);
        $completed = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'label' => 'A1.1 — Soir',
                'status' => CourseSessionStatus::Completed,
                'completed_at' => now(),
            ]);
        Lesson::factory()->for($active, 'session')->create(['held_on' => '2026-09-20', 'duration_minutes' => 120]);
        Lesson::factory()->for($active, 'session')->create(['held_on' => '2026-09-22', 'duration_minutes' => 60]);
        Lesson::factory()->for($completed, 'session')->create(['held_on' => '2026-09-25', 'duration_minutes' => 60]);

        $this->actingAs($teacher)
            ->get(route('teacher.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/dashboard')
                ->where('summary.active_sessions', 1)
                ->where('summary.completed_sessions', 1)
                ->where('summary.lessons_count', 3)
                ->where('summary.total_minutes', 240)
                ->where('summary.remuneration_millimes', 80_000)
                ->has('activeSessions', 1)
                ->where('activeSessions.0.id', $active->id)
                ->where('activeSessions.0.total_minutes', 180)
                ->where('activeSessions.0.progress_percent', 10)
                ->where('activeSessions.0.remuneration_millimes', 60_000)
                ->has('recentLessons', 3)
                ->where('recentLessons.0.session_label', 'A1.1 — Soir'));
    }

    public function test_dashboard_only_shows_the_authenticated_teacher_data(): void
    {
        $teacher = $this->userWithRole('teacher');
        $otherTeacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $otherSession = CourseSession::factory()
            ->for($otherTeacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Active]);
        Lesson::factory()->for($otherSession, 'session')->create(['duration_minutes' => 300]);

        $this->actingAs($teacher)
            ->get(route('teacher.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.active_sessions', 0)
                ->where('summary.lessons_count', 0)
                ->where('summary.total_minutes', 0)
                ->where('summary.remuneration_millimes', 0)
                ->has('activeSessions', 0)
                ->has('recentLessons', 0));
    }

    public function test_dashboard_handles_an_empty_database(): void
    {
        $teacher = $this->userWithRole('teacher');

        $this->actingAs($teacher)
            ->get(route('teacher.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/dashboard')
                ->where('summary.active_sessions', 0)
                ->where('summary.completed_sessions', 0)
                ->where('summary.lessons_count', 0)
                ->where('summary.total_minutes', 0)
                ->where('summary.remuneration_millimes', 0)
                ->has('activeSessions', 0)
                ->has('recentLessons', 0));
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
