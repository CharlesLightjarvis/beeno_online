<?php

namespace Tests\Feature\Admin;

use App\Enums\CourseSessionStatus;
use App\Enums\PaymentStatus;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Models\Lesson;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminSalaryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_non_admin_users_cannot_access_admin_salaries(): void
    {
        $teacher = $this->userWithRole('teacher');
        $student = $this->userWithRole('student');

        $this->get('/admin/salaries')->assertRedirect(route('login'));
        $this->actingAs($teacher)->get('/admin/salaries')->assertForbidden();
        $this->actingAs($student)->get('/admin/salaries')->assertForbidden();
    }

    public function test_admin_sees_all_completed_sessions_with_salary_and_teacher(): void
    {
        $admin = $this->userWithRole('admin');
        $teacher = $this->userWithRole('teacher');
        $teacher->update(['name' => 'Leïla Trabelsi']);
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $completed = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'completed_at' => now(),
                'hourly_rate_millimes' => 20_000,
            ]);
        $unpaid = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'completed_at' => now()->subDay(),
                'hourly_rate_millimes' => 25_000,
            ]);
        Lesson::factory()->for($completed, 'session')->create(['duration_minutes' => 120]);
        Lesson::factory()->for($unpaid, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($admin)
            ->get(route('admin.salaries.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/salaries/index')
                ->has('salaries', 2)
                ->where('salaries.0.id', $unpaid->id)
                ->where('salaries.0.teacher_name', 'Leïla Trabelsi')
                ->where('salaries.0.total_minutes', 60)
                ->where('salaries.0.salary_millimes', 25_000)
                ->where('salaries.0.payment_status', PaymentStatus::Unpaid->value)
                ->where('salaries.1.id', $completed->id)
                ->where('salaries.1.salary_millimes', 40_000)
                ->where('filter', null));
    }

    public function test_admin_can_filter_salaries_by_payment_status(): void
    {
        $admin = $this->userWithRole('admin');
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'payment_status' => PaymentStatus::Paid,
            ]);
        $unpaid = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Completed]);

        $this->actingAs($admin)
            ->get(route('admin.salaries.index', ['payment' => 'unpaid']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('salaries', 1)
                ->where('salaries.0.id', $unpaid->id)
                ->where('filter', 'unpaid'));
    }

    public function test_admin_sees_summary_with_paid_and_remaining_amounts(): void
    {
        $admin = $this->userWithRole('admin');
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $paid = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
                'payment_status' => PaymentStatus::Paid,
            ]);
        $partial = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
                'payment_status' => PaymentStatus::PartiallyPaid,
            ]);
        $unpaid = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
            ]);
        Lesson::factory()->for($paid, 'session')->create(['duration_minutes' => 120]);
        Lesson::factory()->for($partial, 'session')->create(['duration_minutes' => 60]);
        Lesson::factory()->for($unpaid, 'session')->create(['duration_minutes' => 30]);
        $paid->payments()->create([
            'teacher_id' => $teacher->id,
            'amount_millimes' => 40_000,
            'paid_on' => today()->toDateString(),
        ]);
        $partial->payments()->create([
            'teacher_id' => $teacher->id,
            'amount_millimes' => 10_000,
            'paid_on' => today()->toDateString(),
        ]);

        $this->actingAs($admin)
            ->get(route('admin.salaries.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/salaries/index')
                ->has('salaries', 3)
                ->where('summary.total_millimes', 70_000)
                ->where('summary.paid_millimes', 50_000)
                ->where('summary.remaining_millimes', 20_000)
                ->where('salaries.1.payment_status', PaymentStatus::PartiallyPaid->value)
                ->where('salaries.1.paid_millimes', 10_000)
                ->where('salaries.1.remaining_millimes', 10_000));
    }

    public function test_admin_sees_the_payment_history_of_each_session(): void
    {
        $admin = $this->userWithRole('admin');
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
                'payment_status' => PaymentStatus::PartiallyPaid,
                'paid_millimes' => 10_000,
            ]);
        $session->payments()->createMany([
            [
                'teacher_id' => $teacher->id,
                'amount_millimes' => 4_000,
                'paid_on' => '2026-09-01',
            ],
            [
                'teacher_id' => $teacher->id,
                'amount_millimes' => 6_000,
                'paid_on' => '2026-09-15',
            ],
        ]);
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($admin)
            ->get(route('admin.salaries.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('salaries.0.payments', 2)
                ->where('salaries.0.payments.0.amount_millimes', 4_000)
                ->where('salaries.0.payments.1.amount_millimes', 6_000)
                ->where('salaries.0.paid_millimes', 10_000)
                ->where('salaries.0.remaining_millimes', 10_000));
    }

    public function test_admin_salary_route_has_no_mutation_for_payment_status(): void
    {
        $this->actingAs($this->userWithRole('admin'))
            ->post('/admin/salaries/any/paid')
            ->assertNotFound();
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
