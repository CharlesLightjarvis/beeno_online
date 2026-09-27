<?php

namespace Tests\Feature\Teacher;

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

class SalaryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_salaries_permission_is_assigned_only_to_teachers_and_admins(): void
    {
        $admin = $this->userWithRole('admin');
        $teacher = $this->userWithRole('teacher');
        $student = $this->userWithRole('student');

        $this->assertTrue($teacher->hasPermissionTo('view.own-salaries'));
        $this->assertTrue($admin->hasPermissionTo('view.admin-salaries'));
        $this->assertFalse($student->hasPermissionTo('view.own-salaries'));
    }

    public function test_teacher_sees_only_own_completed_sessions_with_computed_salary(): void
    {
        $teacher = $this->userWithRole('teacher');
        $otherTeacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $completed = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'completed_at' => now(),
                'hourly_rate_millimes' => 20_000,
            ]);
        $active = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Active]);
        $foreign = CourseSession::factory()
            ->for($otherTeacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Completed]);
        Lesson::factory()->for($completed, 'session')->create(['duration_minutes' => 90]);
        Lesson::factory()->for($active, 'session')->create(['duration_minutes' => 60]);
        Lesson::factory()->for($foreign, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($teacher)
            ->get(route('teacher.salaries.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/salaries/index')
                ->has('salaries', 1)
                ->where('salaries.0.id', $completed->id)
                ->where('salaries.0.lessons_count', 1)
                ->where('salaries.0.total_minutes', 90)
                ->where('salaries.0.salary_millimes', 30_000)
                ->where('salaries.0.payment_status', PaymentStatus::Unpaid->value));
    }

    public function test_teacher_can_mark_their_completed_session_as_paid(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Completed]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-paid', $session))
            ->assertRedirect();

        $this->assertSame(PaymentStatus::Paid->value, $session->fresh()->payment_status->value);
    }

    public function test_teacher_can_mark_their_session_as_unpaid_again(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'payment_status' => PaymentStatus::Paid,
            ]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-unpaid', $session))
            ->assertRedirect();

        $this->assertSame(PaymentStatus::Unpaid->value, $session->fresh()->payment_status->value);
    }

    public function test_teacher_can_mark_their_completed_session_as_partially_paid(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
            ]);
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-partially-paid', $session), [
                'amount_millimes' => 10_000,
            ])
            ->assertRedirect();

        $fresh = $session->fresh();
        $this->assertSame(PaymentStatus::PartiallyPaid->value, $fresh->payment_status->value);
        $this->assertSame(10_000, $fresh->paid_millimes);
    }

    public function test_partial_payments_are_cumulative(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
                'payment_status' => PaymentStatus::PartiallyPaid,
            ]);
        $session->payments()->create([
            'teacher_id' => $teacher->id,
            'amount_millimes' => 10_000,
            'paid_on' => today()->toDateString(),
        ]);
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 120]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-partially-paid', $session), [
                'amount_millimes' => 15_000,
            ])
            ->assertRedirect();

        $fresh = $session->fresh();
        $this->assertSame(PaymentStatus::PartiallyPaid->value, $fresh->payment_status->value);
        $this->assertSame(25_000, $fresh->paid_millimes);
    }

    public function test_partial_payment_cannot_exceed_the_remaining_salary(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
                'payment_status' => PaymentStatus::PartiallyPaid,
            ]);
        $session->payments()->create([
            'teacher_id' => $teacher->id,
            'amount_millimes' => 25_000,
            'paid_on' => today()->toDateString(),
        ]);
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($teacher)
            ->from(route('teacher.salaries.index'))
            ->post(route('teacher.salaries.mark-partially-paid', $session), [
                'amount_millimes' => 10_000,
            ])
            ->assertSessionHasErrors('amount_millimes');

        $this->assertSame(25_000, $session->payments()->sum('amount_millimes'));
    }

    public function test_partial_payment_requires_a_positive_amount(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Completed]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-partially-paid', $session), [
                'amount_millimes' => 0,
            ])
            ->assertSessionHasErrors('amount_millimes');

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-partially-paid', $session), [])
            ->assertSessionHasErrors('amount_millimes');

        $this->assertSame(0, $session->fresh()->paid_millimes);
    }

    public function test_marking_a_partially_paid_session_as_paid_pays_the_remaining_salary(): void
    {
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
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-paid', $session))
            ->assertRedirect();

        $fresh = $session->fresh();
        $this->assertSame(PaymentStatus::Paid->value, $fresh->payment_status->value);
        $this->assertSame(20_000, $fresh->paid_millimes);
    }

    public function test_partial_payment_creates_a_persisted_payment_record(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
            ]);
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 120]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-partially-paid', $session), [
                'amount_millimes' => 10_000,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('course_session_payments', [
            'course_session_id' => $session->id,
            'teacher_id' => $teacher->id,
            'amount_millimes' => 10_000,
        ]);

        $this->actingAs($teacher)
            ->get(route('teacher.salaries.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('salaries.0.payments', 1)
                ->where('salaries.0.payments.0.amount_millimes', 10_000));
    }

    public function test_marking_paid_creates_a_payment_record_for_the_missing_amount(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
                'payment_status' => PaymentStatus::PartiallyPaid,
            ]);
        $session->payments()->create([
            'teacher_id' => $teacher->id,
            'amount_millimes' => 5_000,
            'paid_on' => today()->toDateString(),
        ]);
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-paid', $session))
            ->assertRedirect();

        // Salary is 20_000 (60 min at 20_000/h); 5_000 was already paid, so 15_000 is added.
        $this->assertDatabaseHas('course_session_payments', [
            'course_session_id' => $session->id,
            'amount_millimes' => 15_000,
        ]);
        $this->assertSame(20_000, $session->fresh()->paid_millimes);
    }

    public function test_marking_unpaid_deletes_all_payment_records(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'payment_status' => PaymentStatus::PartiallyPaid,
                'paid_millimes' => 12_345,
            ]);
        $session->payments()->create([
            'teacher_id' => $teacher->id,
            'amount_millimes' => 12_345,
            'paid_on' => today()->toDateString(),
        ]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-unpaid', $session))
            ->assertRedirect();

        $this->assertDatabaseMissing('course_session_payments', [
            'course_session_id' => $session->id,
        ]);
        $fresh = $session->fresh();
        $this->assertSame(PaymentStatus::Unpaid->value, $fresh->payment_status->value);
        $this->assertSame(0, $fresh->paid_millimes);
    }

    public function test_teacher_can_delete_a_single_payment_and_status_is_recomputed(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'hourly_rate_millimes' => 20_000,
                'payment_status' => PaymentStatus::PartiallyPaid,
            ]);
        $payment = $session->payments()->create([
            'teacher_id' => $teacher->id,
            'amount_millimes' => 4_000,
            'paid_on' => '2026-09-01',
        ]);
        $session->payments()->create([
            'teacher_id' => $teacher->id,
            'amount_millimes' => 6_000,
            'paid_on' => '2026-09-15',
        ]);
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($teacher)
            ->delete(route('teacher.salaries.delete-payment', [$session, $payment]))
            ->assertRedirect();

        $this->assertDatabaseMissing('course_session_payments', ['id' => $payment->id]);
        $fresh = $session->fresh();
        $this->assertSame(PaymentStatus::PartiallyPaid->value, $fresh->payment_status->value);
        $this->assertSame(6_000, $fresh->paid_millimes);
    }

    public function test_deleting_the_last_payment_resets_the_session_to_unpaid(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'payment_status' => PaymentStatus::Paid,
                'paid_millimes' => 20_000,
            ]);
        $payment = $session->payments()->create([
            'teacher_id' => $teacher->id,
            'amount_millimes' => 20_000,
            'paid_on' => today()->toDateString(),
        ]);
        Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 60]);

        $this->actingAs($teacher)
            ->delete(route('teacher.salaries.delete-payment', [$session, $payment]))
            ->assertRedirect();

        $fresh = $session->fresh();
        $this->assertSame(PaymentStatus::Unpaid->value, $fresh->payment_status->value);
        $this->assertSame(0, $fresh->paid_millimes);
    }

    public function test_teacher_cannot_delete_a_payment_of_another_session(): void
    {
        $teacher = $this->userWithRole('teacher');
        $otherTeacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Completed]);
        $foreignSession = CourseSession::factory()
            ->for($otherTeacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'payment_status' => PaymentStatus::PartiallyPaid,
            ]);
        $foreignPayment = $foreignSession->payments()->create([
            'teacher_id' => $otherTeacher->id,
            'amount_millimes' => 5_000,
            'paid_on' => today()->toDateString(),
        ]);

        $this->actingAs($teacher)
            ->delete(route('teacher.salaries.delete-payment', [$session, $foreignPayment]))
            ->assertNotFound();

        $this->assertDatabaseHas('course_session_payments', ['id' => $foreignPayment->id]);
    }

    public function test_marking_a_session_as_unpaid_resets_the_paid_amount(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'payment_status' => PaymentStatus::PartiallyPaid,
                'paid_millimes' => 12_345,
            ]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-unpaid', $session))
            ->assertRedirect();

        $fresh = $session->fresh();
        $this->assertSame(PaymentStatus::Unpaid->value, $fresh->payment_status->value);
        $this->assertSame(0, $fresh->paid_millimes);
    }

    public function test_teacher_cannot_mark_another_teacher_session(): void
    {
        $teacher = $this->userWithRole('teacher');
        $otherTeacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($otherTeacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Completed]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-paid', $session))
            ->assertNotFound();

        $this->assertSame(PaymentStatus::Unpaid->value, $session->fresh()->payment_status->value);
    }

    public function test_teacher_cannot_mark_an_active_session(): void
    {
        $teacher = $this->userWithRole('teacher');
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['status' => CourseSessionStatus::Active]);

        $this->actingAs($teacher)
            ->post(route('teacher.salaries.mark-paid', $session))
            ->assertNotFound();

        $this->assertSame(PaymentStatus::Unpaid->value, $session->fresh()->payment_status->value);
    }

    public function test_students_cannot_access_teacher_salaries(): void
    {
        $student = $this->userWithRole('student');

        $this->actingAs($student)
            ->get(route('teacher.salaries.index'))
            ->assertForbidden();
    }

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }
}
