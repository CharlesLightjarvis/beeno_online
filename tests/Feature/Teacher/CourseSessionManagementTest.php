<?php

namespace Tests\Feature\Teacher;

use App\Actions\Teacher\CreateCourseSession;
use App\Enums\CourseSessionStatus;
use App\Enums\PermissionEnum;
use App\Enums\RoleEnum;
use App\Http\Requests\Teacher\StoreCourseSessionRequest;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CourseSessionManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_course_session_schema_preserves_snapshot_values(): void
    {
        $this->assertTrue(Schema::hasColumns('course_sessions', [
            'id',
            'teacher_id',
            'course_level_id',
            'previous_session_id',
            'label',
            'target_minutes',
            'hourly_rate_millimes',
            'starts_on',
            'completed_at',
            'status',
        ]));
        $this->assertTrue(Schema::hasColumns('course_session_student', [
            'course_session_id',
            'student_id',
            'enrolled_at',
            'left_at',
        ]));

        $teacher = $this->teacher();
        $student = User::factory()->student($teacher)->create();
        $session = CourseSession::factory()->for($teacher, 'teacher')->create([
            'target_minutes' => 1500,
            'hourly_rate_millimes' => 20_000,
            'status' => CourseSessionStatus::Active,
        ]);

        $session->students()->attach($student, ['enrolled_at' => now()]);

        $this->expectException(QueryException::class);
        $session->students()->attach($student, ['enrolled_at' => now()]);
    }

    public function test_course_session_relations_expose_teacher_level_and_students(): void
    {
        $teacher = $this->teacher();
        $student = User::factory()->student($teacher)->create();
        $level = CourseLevel::factory()->create();
        $previousSession = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create();
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($level, 'level')
            ->create(['previous_session_id' => $previousSession->id]);

        $session->students()->attach($student, ['enrolled_at' => now()]);

        $this->assertTrue($session->teacher->is($teacher));
        $this->assertTrue($session->level->is($level));
        $this->assertTrue($session->previousSession->is($previousSession));
        $this->assertTrue($session->students->contains($student));
        $this->assertTrue($teacher->courseSessions->contains($session));
        $this->assertTrue($level->courseSessions->contains($session));
    }

    public function test_action_creates_an_active_session_with_snapshot_values_and_students(): void
    {
        Carbon::setTestNow('2026-09-26 10:00:00');
        $teacher = $this->teacher();
        $level = CourseLevel::factory()->create(['target_minutes' => 1500]);
        $students = User::factory()->count(2)->student($teacher)->create();

        $session = app(CreateCourseSession::class)->handle(
            $teacher,
            $level,
            '  A1.1 — Matin  ',
            Carbon::parse('2026-10-01'),
            $students->modelKeys(),
        );

        $this->assertSame('A1.1 — Matin', $session->label);
        $this->assertSame($teacher->id, $session->teacher_id);
        $this->assertSame($level->id, $session->course_level_id);
        $this->assertSame(1500, $session->target_minutes);
        $this->assertSame(20_000, $session->hourly_rate_millimes);
        $this->assertSame(CourseSessionStatus::Active, $session->status);
        $this->assertSame('2026-10-01', $session->starts_on->toDateString());
        $this->assertNull($session->completed_at);
        $this->assertEqualsCanonicalizing($students->modelKeys(), $session->students->modelKeys());
        $this->assertTrue($session->students->every(
            fn (User $student): bool => $student->pivot->enrolled_at === '2026-09-26 10:00:00'
        ));
    }

    public function test_action_allows_creating_a_session_without_students(): void
    {
        $teacher = $this->teacher();
        $level = CourseLevel::factory()->create();

        $session = app(CreateCourseSession::class)->handle(
            $teacher,
            $level,
            'Groupe à compléter',
            Carbon::parse('2026-10-01'),
            [],
        );

        $this->assertCount(0, $session->students);
    }

    public function test_action_rejects_foreign_and_archived_students_atomically(): void
    {
        $teacher = $this->teacher();
        $otherTeacher = $this->teacher();
        $level = CourseLevel::factory()->create();
        $owned = User::factory()->student($teacher)->create();
        $foreign = User::factory()->student($otherTeacher)->create();
        $archived = User::factory()->student($teacher)->create(['archived_at' => now()]);

        foreach ([$foreign, $archived] as $invalidStudent) {
            try {
                app(CreateCourseSession::class)->handle(
                    $teacher,
                    $level,
                    'Session invalide',
                    Carbon::parse('2026-10-01'),
                    [$owned->id, $invalidStudent->id],
                );
                $this->fail('La création devait être refusée.');
            } catch (ValidationException $exception) {
                $this->assertArrayHasKey('student_ids', $exception->errors());
            }
        }

        $this->assertDatabaseMissing('course_sessions', ['label' => 'Session invalide']);
        $this->assertDatabaseCount('course_session_student', 0);
    }

    public function test_store_request_validates_level_date_and_distinct_student_ids(): void
    {
        Route::post('/_test/course-sessions', fn (StoreCourseSessionRequest $request) => $request->validated())
            ->middleware('web');

        $teacher = $this->teacher();
        $inactiveLevel = CourseLevel::factory()->create(['is_active' => false]);
        $student = User::factory()->student($teacher)->create();

        $this->actingAs($teacher)->post('/_test/course-sessions', [
            'label' => '  ',
            'course_level_id' => $inactiveLevel->id,
            'starts_on' => 'pas-une-date',
            'student_ids' => [$student->id, $student->id],
        ])->assertSessionHasErrors([
            'label',
            'course_level_id',
            'starts_on',
            'student_ids.0',
            'student_ids.1',
        ]);
    }

    public function test_only_teachers_receive_session_management_permission_and_ownership_access(): void
    {
        $teacher = $this->teacher();
        $otherTeacher = $this->teacher();
        $admin = User::factory()->create();
        $admin->assignRole(RoleEnum::Admin->value);
        $student = User::factory()->create();
        $student->assignRole(RoleEnum::Student->value);
        $session = CourseSession::factory()->for($teacher, 'teacher')->create();

        $this->assertTrue($teacher->hasPermissionTo(PermissionEnum::ManageOwnSessions->value));
        $this->assertFalse($admin->hasPermissionTo(PermissionEnum::ManageOwnSessions->value));
        $this->assertFalse($student->hasPermissionTo(PermissionEnum::ManageOwnSessions->value));
        $this->assertTrue($teacher->can('view', $session));
        $this->assertFalse($otherTeacher->can('view', $session));
    }

    public function test_teacher_lists_only_their_sessions_newest_first(): void
    {
        $teacher = $this->teacher();
        $otherTeacher = $this->teacher();
        $level = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        CourseLevel::factory()->create(['code' => 'A1.2', 'position' => 2]);
        $older = CourseSession::factory()->for($teacher, 'teacher')->for($level, 'level')->create([
            'label' => 'Ancienne',
            'status' => CourseSessionStatus::Completed,
            'completed_at' => now()->subDay(),
            'created_at' => now()->subDay(),
        ]);
        $newer = CourseSession::factory()->for($teacher, 'teacher')->for($level, 'level')->create([
            'label' => 'Nouvelle',
            'starts_on' => '2026-10-05',
            'created_at' => now(),
        ]);
        CourseSession::factory()->for($otherTeacher, 'teacher')->for($level, 'level')->create();
        $newer->students()->attach(User::factory()->student($teacher)->create(), ['enrolled_at' => now()]);

        $this->actingAs($teacher)
            ->get(route('teacher.sessions.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/sessions/index')
                ->has('sessions.data', 2)
                ->where('sessions.data.0.id', $newer->id)
                ->where('sessions.data.0.level.code', 'A1.1')
                ->where('sessions.data.0.starts_on', '2026-10-05')
                ->where('sessions.data.0.students_count', 1)
                ->where('sessions.data.0.can_create_next_session', false)
                ->where('sessions.data.1.id', $older->id)
                ->where('sessions.data.1.can_create_next_session', true));
    }

    public function test_session_form_lists_only_active_levels_and_owned_active_students(): void
    {
        $teacher = $this->teacher();
        $otherTeacher = $this->teacher();
        $secondLevel = CourseLevel::factory()->create(['code' => 'A1.2', 'position' => 2]);
        $firstLevel = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        CourseLevel::factory()->create(['code' => 'OLD', 'position' => 3, 'is_active' => false]);
        $visible = User::factory()->student($teacher)->create(['name' => 'Amina Active']);
        User::factory()->student($teacher)->create(['name' => 'Nour Archivée', 'archived_at' => now()]);
        User::factory()->student($otherTeacher)->create(['name' => 'Leila Autre']);

        $this->actingAs($teacher)
            ->get(route('teacher.sessions.create'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/sessions/create')
                ->has('levels', 2)
                ->where('levels.0.id', $firstLevel->id)
                ->where('levels.1.id', $secondLevel->id)
                ->has('students', 1)
                ->where('students.0.id', $visible->id));
    }

    public function test_teacher_can_store_a_session_from_the_http_form(): void
    {
        $teacher = $this->teacher();
        $level = CourseLevel::factory()->create(['target_minutes' => 1800]);
        $student = User::factory()->student($teacher)->create();

        $this->actingAs($teacher)->post(route('teacher.sessions.store'), [
            'label' => 'A1.1 — Soir',
            'course_level_id' => $level->id,
            'starts_on' => '2026-10-05',
            'student_ids' => [$student->id],
        ])->assertRedirect(route('teacher.sessions.index'));

        $session = CourseSession::query()->where('label', 'A1.1 — Soir')->firstOrFail();
        $this->assertSame($teacher->id, $session->teacher_id);
        $this->assertTrue($session->students->contains($student));
    }

    public function test_guest_admin_and_student_cannot_access_teacher_session_endpoints(): void
    {
        $admin = User::factory()->create();
        $admin->assignRole(RoleEnum::Admin->value);
        $student = User::factory()->create();
        $student->assignRole(RoleEnum::Student->value);

        $this->get('/teacher/sessions')->assertRedirect(route('login'));
        $this->actingAs($admin)->get('/teacher/sessions')->assertForbidden();
        $this->actingAs($student)->get('/teacher/sessions/create')->assertForbidden();
        $this->actingAs($admin)->post('/teacher/sessions', [])->assertForbidden();
    }

    public function test_teacher_can_edit_an_empty_session_and_add_students_later(): void
    {
        $teacher = $this->teacher();
        $level = CourseLevel::factory()->create();
        $student = User::factory()->student($teacher)->create();
        $session = CourseSession::factory()->for($teacher, 'teacher')->for($level, 'level')->create();

        $this->actingAs($teacher)->patch(route('teacher.sessions.update', $session), [
            'label' => 'Groupe modifié',
            'course_level_id' => $level->id,
            'starts_on' => '2026-11-01',
            'student_ids' => [$student->id],
        ])->assertRedirect(route('teacher.sessions.index'));

        $this->assertSame('Groupe modifié', $session->fresh()->label);
        $this->assertTrue($session->fresh()->students->contains($student));
        $this->actingAs($teacher)
            ->get(route('teacher.sessions.edit', $session))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/sessions/edit')
                ->where('session.starts_on', '2026-11-01'));
    }

    public function test_teacher_can_close_a_session_manually(): void
    {
        $teacher = $this->teacher();
        $session = CourseSession::factory()->for($teacher, 'teacher')->create();

        $this->actingAs($teacher)->delete(route('teacher.sessions.destroy', $session))
            ->assertRedirect(route('teacher.sessions.index'));

        $this->assertSame(CourseSessionStatus::Completed, $session->fresh()->status);
        $this->assertNotNull($session->fresh()->completed_at);
    }

    public function test_teacher_can_prepare_the_next_session_with_the_next_level_and_previous_students_preselected(): void
    {
        $teacher = $this->teacher();
        $currentLevel = CourseLevel::factory()->create([
            'code' => 'A1.1',
            'name' => 'A1.1',
            'position' => 1,
        ]);
        $nextLevel = CourseLevel::factory()->create([
            'code' => 'A1.2',
            'name' => 'A1.2',
            'position' => 2,
        ]);
        $amina = User::factory()->student($teacher)->create(['name' => 'Amina Ben Salah']);
        $nour = User::factory()->student($teacher)->create(['name' => 'Nour Ayari']);
        $newStudent = User::factory()->student($teacher)->create(['name' => 'Youssef Trabelsi']);
        $session = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($currentLevel, 'level')
            ->create([
                'label' => 'A1.1 — Soir',
                'status' => CourseSessionStatus::Completed,
                'completed_at' => now(),
            ]);
        $session->students()->attach([$amina->id, $nour->id], ['enrolled_at' => now()]);

        $this->actingAs($teacher)
            ->get(route('teacher.sessions.next.create', $session))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/sessions/create')
                ->where('defaults.previous_session_id', $session->id)
                ->where('defaults.course_level_id', $nextLevel->id)
                ->where('defaults.label', 'A1.2 — Soir')
                ->where('defaults.student_ids.0', $amina->id)
                ->where('defaults.student_ids.1', $nour->id)
                ->has('students', 3)
                ->where('students.2.id', $newStudent->id));
    }

    public function test_teacher_can_store_the_next_session_linked_to_the_completed_session(): void
    {
        $teacher = $this->teacher();
        $currentLevel = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        $nextLevel = CourseLevel::factory()->create([
            'code' => 'A1.2',
            'position' => 2,
            'target_minutes' => 1800,
        ]);
        $student = User::factory()->student($teacher)->create();
        $previousSession = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($currentLevel, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'completed_at' => now(),
            ]);
        $previousSession->students()->attach($student, ['enrolled_at' => now()]);

        $this->actingAs($teacher)->post(route('teacher.sessions.store'), [
            'label' => 'A1.2 — Soir',
            'course_level_id' => $nextLevel->id,
            'previous_session_id' => $previousSession->id,
            'starts_on' => '2026-11-01',
            'student_ids' => [$student->id],
        ])->assertRedirect(route('teacher.sessions.index'));

        $nextSession = CourseSession::query()->where('label', 'A1.2 — Soir')->firstOrFail();
        $this->assertSame($previousSession->id, $nextSession->previous_session_id);
        $this->assertSame($nextLevel->id, $nextSession->course_level_id);
        $this->assertSame(1800, $nextSession->target_minutes);
        $this->assertSame(CourseSessionStatus::Active, $nextSession->status);
        $this->assertNull($nextSession->completed_at);
        $this->assertTrue($nextSession->students->contains($student));
    }

    public function test_next_session_cannot_be_prepared_from_an_active_session_or_without_a_next_level(): void
    {
        $teacher = $this->teacher();
        $firstLevel = CourseLevel::factory()->create(['code' => 'A1.1', 'position' => 1]);
        CourseLevel::factory()->create(['code' => 'A1.2', 'position' => 2]);
        $activeSession = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($firstLevel, 'level')
            ->create(['status' => CourseSessionStatus::Active]);

        $this->actingAs($teacher)
            ->get(route('teacher.sessions.next.create', $activeSession))
            ->assertNotFound();

        $lastLevel = CourseLevel::factory()->create(['code' => 'C2.2', 'position' => 12]);
        $lastSession = CourseSession::factory()
            ->for($teacher, 'teacher')
            ->for($lastLevel, 'level')
            ->create([
                'status' => CourseSessionStatus::Completed,
                'completed_at' => now(),
            ]);

        $this->actingAs($teacher)
            ->get(route('teacher.sessions.next.create', $lastSession))
            ->assertNotFound();
    }

    private function teacher(): User
    {
        $teacher = User::factory()->create();
        $teacher->assignRole(RoleEnum::Teacher->value);

        return $teacher;
    }
}
