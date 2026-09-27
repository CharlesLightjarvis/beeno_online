<?php

namespace Tests\Feature\Teacher;

use App\Actions\Teacher\RecordLesson;
use App\Enums\AttendanceStatus;
use App\Enums\CourseSessionStatus;
use App\Enums\RoleEnum;
use App\Http\Requests\Teacher\StoreLessonRequest;
use App\Models\Attendance;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Models\Lesson;
use App\Models\User;
use App\Support\SessionMetrics;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LessonAttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_lesson_and_attendance_schema_enforce_one_status_per_student(): void
    {
        $this->assertTrue(Schema::hasColumns('lessons', [
            'id', 'course_session_id', 'held_on', 'starts_at', 'duration_minutes',
        ]));
        $this->assertTrue(Schema::hasColumns('attendances', [
            'id', 'lesson_id', 'student_id', 'status',
        ]));

        $session = CourseSession::factory()->create();
        $student = User::factory()->student($session->teacher)->create();
        $lesson = Lesson::factory()->for($session, 'session')->create();
        Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $student->id,
            'status' => AttendanceStatus::Present,
        ]);

        $this->expectException(QueryException::class);
        Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $student->id,
            'status' => AttendanceStatus::Absent,
        ]);
    }

    public function test_lesson_and_attendance_relations_are_available(): void
    {
        $session = CourseSession::factory()->create();
        $student = User::factory()->student($session->teacher)->create();
        $lesson = Lesson::factory()->for($session, 'session')->create();
        $attendance = Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $student->id,
            'status' => AttendanceStatus::Present,
        ]);

        $this->assertTrue($lesson->session->is($session));
        $this->assertTrue($session->lessons->contains($lesson));
        $this->assertTrue($lesson->attendances->contains($attendance));
        $this->assertTrue($attendance->lesson->is($lesson));
        $this->assertTrue($attendance->student->is($student));
        $this->assertTrue($student->attendances->contains($attendance));
        $this->assertSame(AttendanceStatus::Present, $attendance->status);
    }

    public function test_action_records_lesson_and_complete_attendance_atomically(): void
    {
        $teacher = $this->teacher();
        $students = User::factory()->count(2)->student($teacher)->create();
        $session = CourseSession::factory()->for($teacher, 'teacher')->create();
        $session->students()->attach($students->modelKeys(), ['enrolled_at' => now()]);

        $lesson = app(RecordLesson::class)->handle(
            $session,
            Carbon::parse('2026-10-10'),
            '18:30',
            120,
            [
                $students[0]->id => AttendanceStatus::Present->value,
                $students[1]->id => AttendanceStatus::Absent->value,
            ],
        );

        $this->assertSame('2026-10-10', $lesson->held_on->toDateString());
        $this->assertSame('18:30', substr((string) $lesson->starts_at, 0, 5));
        $this->assertSame(120, $lesson->duration_minutes);
        $this->assertCount(2, $lesson->attendances);
        $this->assertDatabaseHas('attendances', [
            'lesson_id' => $lesson->id,
            'student_id' => $students[0]->id,
            'status' => AttendanceStatus::Present->value,
        ]);
    }

    public function test_action_rejects_incomplete_or_foreign_rosters_without_partial_writes(): void
    {
        $teacher = $this->teacher();
        $student = User::factory()->student($teacher)->create();
        $foreign = User::factory()->student($teacher)->create();
        $session = CourseSession::factory()->for($teacher, 'teacher')->create();
        $session->students()->attach($student, ['enrolled_at' => now()]);

        foreach ([[], [$student->id => 'present', $foreign->id => 'absent']] as $roster) {
            try {
                app(RecordLesson::class)->handle(
                    $session,
                    Carbon::parse('2026-10-10'),
                    null,
                    90,
                    $roster,
                );
                $this->fail('La feuille de présence devait être refusée.');
            } catch (ValidationException $exception) {
                $this->assertArrayHasKey('attendances', $exception->errors());
            }
        }

        $this->assertDatabaseCount('lessons', 0);
        $this->assertDatabaseCount('attendances', 0);
    }

    public function test_action_rejects_lessons_for_completed_sessions(): void
    {
        $session = CourseSession::factory()->create([
            'status' => CourseSessionStatus::Completed,
            'completed_at' => now(),
        ]);

        $this->expectException(ValidationException::class);
        app(RecordLesson::class)->handle(
            $session,
            Carbon::parse('2026-10-10'),
            null,
            60,
            [],
        );
    }

    public function test_store_lesson_request_validates_date_time_duration_and_statuses(): void
    {
        Route::post('/_test/lessons', fn (StoreLessonRequest $request) => $request->validated())
            ->middleware('web');
        $teacher = $this->teacher();

        $this->actingAs($teacher)->post('/_test/lessons', [
            'held_on' => 'non-date',
            'starts_at' => '25:99',
            'duration_hours' => 0.3,
            'attendances' => ['invalid-id' => 'late'],
        ])->assertSessionHasErrors([
            'held_on', 'starts_at', 'duration_hours', 'attendances.invalid-id',
        ]);
    }

    public function test_session_metrics_handle_zero_and_progress_above_one_hundred_percent(): void
    {
        $empty = CourseSession::factory()->create([
            'target_minutes' => 100,
            'hourly_rate_millimes' => 20_000,
        ]);
        $this->assertSame([
            'total_minutes' => 0,
            'progress_percent' => 0.0,
            'remuneration_millimes' => 0,
        ], SessionMetrics::from($empty));

        Lesson::factory()->for($empty, 'session')->count(2)->create(['duration_minutes' => 60]);
        $this->assertSame([
            'total_minutes' => 120,
            'progress_percent' => 120.0,
            'remuneration_millimes' => 40_000,
        ], SessionMetrics::from($empty));
    }

    public function test_teacher_can_view_owned_session_details_with_lessons_and_counts(): void
    {
        $teacher = $this->teacher();
        $level = CourseLevel::factory()->create(['code' => 'A1.1']);
        $students = User::factory()->count(2)->student($teacher)->create();
        $session = CourseSession::factory()->for($teacher, 'teacher')->for($level, 'level')->create();
        $session->students()->attach($students->modelKeys(), ['enrolled_at' => now()]);
        $lesson = Lesson::factory()->for($session, 'session')->create(['duration_minutes' => 120]);
        Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $students[0]->id,
            'status' => AttendanceStatus::Present,
        ]);
        Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $students[1]->id,
            'status' => AttendanceStatus::Absent,
        ]);

        $this->actingAs($teacher)
            ->get(route('teacher.sessions.show', $session))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/sessions/show')
                ->where('session.id', $session->id)
                ->where('session.level.code', 'A1.1')
                ->has('students', 2)
                ->has('lessons', 1)
                ->where('lessons.0.present_count', 1)
                ->where('lessons.0.absent_count', 1)
                ->where('metrics.total_minutes', 120));
    }

    public function test_teacher_can_open_the_attendance_form_for_an_owned_session(): void
    {
        $teacher = $this->teacher();
        $student = User::factory()->student($teacher)->create(['name' => 'Amina Ben Salah']);
        $session = CourseSession::factory()->for($teacher, 'teacher')->create();
        $session->students()->attach($student, ['enrolled_at' => now()]);

        $this->actingAs($teacher)
            ->get(route('teacher.sessions.attendances.create', $session))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/sessions/attendances/create')
                ->where('session.id', $session->id)
                ->where('session.students.0.name', 'Amina Ben Salah'));
    }

    public function test_teacher_can_store_session_attendance_and_intruder_is_forbidden(): void
    {
        $teacher = $this->teacher();
        $intruder = $this->teacher();
        $student = User::factory()->student($teacher)->create();
        $session = CourseSession::factory()->for($teacher, 'teacher')->create();
        $session->students()->attach($student, ['enrolled_at' => now()]);
        $payload = [
            'held_on' => '2026-10-12',
            'starts_at' => null,
            'duration_hours' => '1,5',
            'attendances' => [$student->id => 'present'],
        ];

        $this->actingAs($teacher)
            ->post(route('teacher.sessions.attendances.store', $session), $payload)
            ->assertRedirect(route('teacher.sessions.show', $session));
        $this->assertDatabaseHas('lessons', [
            'course_session_id' => $session->id,
            'duration_minutes' => 90,
        ]);

        $this->actingAs($intruder)
            ->get(route('teacher.sessions.show', $session))
            ->assertForbidden();
        $this->actingAs($intruder)
            ->post(route('teacher.sessions.attendances.store', $session), $payload)
            ->assertForbidden();
    }

    public function test_session_details_expose_named_attendance_statuses_for_expandable_rows(): void
    {
        $teacher = $this->teacher();
        $student = User::factory()->student($teacher)->create(['name' => 'Amina Ben Salah']);
        $session = CourseSession::factory()->for($teacher, 'teacher')->create(['label' => 'A1.1 Matin']);
        $lesson = Lesson::factory()->for($session, 'session')->create();
        Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $student->id,
            'status' => AttendanceStatus::Absent,
        ]);

        $this->actingAs($teacher)->get(route('teacher.sessions.show', $session))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('teacher/sessions/show')
                ->where('lessons.0.attendances.0.student.name', 'Amina Ben Salah')
                ->where('lessons.0.attendances.0.status', 'absent'));

        $this->assertFalse(Route::has('teacher.attendances.index'));
        $this->assertFalse(Route::has('teacher.attendances.show'));
    }

    public function test_teacher_can_open_the_edit_form_for_a_specific_lesson(): void
    {
        $teacher = $this->teacher();
        $student = User::factory()->student($teacher)->create(['name' => 'Amina Ben Salah']);
        $session = CourseSession::factory()->for($teacher, 'teacher')->create(['label' => 'A1.1 Matin']);
        $session->students()->attach($student, ['enrolled_at' => now()]);
        $lesson = Lesson::factory()->for($session, 'session')->create([
            'held_on' => '2026-10-12',
            'starts_at' => '18:30',
            'duration_minutes' => 90,
        ]);
        Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $student->id,
            'status' => AttendanceStatus::Absent,
        ]);

        $this->actingAs($teacher)
            ->get(route('teacher.sessions.attendances.edit', [$session, $lesson]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/sessions/attendances/edit')
                ->where('session.id', $session->id)
                ->where('lesson.id', $lesson->id)
                ->where('lesson.held_on', '2026-10-12')
                ->where('lesson.starts_at', '18:30')
                ->where('lesson.duration_hours', 1.5)
                ->where('lesson.attendances.0.student.name', 'Amina Ben Salah')
                ->where('lesson.attendances.0.status', 'absent'));
    }

    public function test_teacher_can_update_attendance_for_a_specific_lesson(): void
    {
        $teacher = $this->teacher();
        $student = User::factory()->student($teacher)->create();
        $session = CourseSession::factory()->for($teacher, 'teacher')->create();
        $session->students()->attach($student, ['enrolled_at' => now()]);
        $lesson = Lesson::factory()->for($session, 'session')->create();
        $attendance = Attendance::query()->create([
            'lesson_id' => $lesson->id,
            'student_id' => $student->id,
            'status' => AttendanceStatus::Present,
        ]);

        $this->actingAs($teacher)
            ->put(route('teacher.sessions.attendances.update', [$session, $lesson]), [
                'held_on' => '2026-10-15',
                'starts_at' => '19:15',
                'duration_hours' => '2,25',
                'attendances' => [$student->id => 'absent'],
            ])
            ->assertRedirect(route('teacher.sessions.show', $session));

        $lesson->refresh();
        $this->assertSame('2026-10-15', $lesson->held_on->toDateString());
        $this->assertSame('19:15', substr((string) $lesson->starts_at, 0, 5));
        $this->assertSame(135, $lesson->duration_minutes);
        $this->assertSame(AttendanceStatus::Absent, $attendance->fresh()->status);
    }

    public function test_teacher_cannot_edit_a_lesson_through_another_session(): void
    {
        $teacher = $this->teacher();
        $session = CourseSession::factory()->for($teacher, 'teacher')->create();
        $otherSession = CourseSession::factory()->for($teacher, 'teacher')->create();
        $lesson = Lesson::factory()->for($session, 'session')->create();

        $this->actingAs($teacher)
            ->get(route('teacher.sessions.attendances.edit', [$otherSession, $lesson]))
            ->assertNotFound();
    }

    private function teacher(): User
    {
        $teacher = User::factory()->create();
        $teacher->assignRole(RoleEnum::Teacher->value);

        return $teacher;
    }
}
