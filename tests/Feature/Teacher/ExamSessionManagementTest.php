<?php

namespace Tests\Feature\Teacher;

use App\Actions\Student\JoinExamSession;
use App\Actions\Student\SaveExamResponse;
use App\Actions\Teacher\CreateExamSession;
use App\Actions\Teacher\OpenExamSession;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\ExamSessionChoice;
use App\Models\ExamSessionPart;
use App\Models\ExamSessionReadingMaterial;
use App\Models\ExamSessionTask;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExamSessionManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_session_snapshot_loads_parts_and_nested_content_in_order(): void
    {
        $teacher = User::factory()->teacher()->create();
        $exam = Exam::factory()->for($teacher, 'teacher')->create();
        $session = ExamSession::factory()->for($teacher, 'teacher')->for($exam)->create([
            'access_code' => 'AB12CD34',
        ]);
        $laterPart = ExamSessionPart::factory()->for($session)->create(['part_number' => 2]);
        $firstPart = ExamSessionPart::factory()->for($session)->create(['part_number' => 1]);
        $material = ExamSessionReadingMaterial::factory()->for($firstPart, 'part')->create([
            'body' => '# Hallo Li',
            'position' => 1,
        ]);
        $task = ExamSessionTask::factory()->for($firstPart, 'part')->for($material, 'readingMaterial')->create([
            'position' => 1,
        ]);
        ExamSessionChoice::factory()->for($task, 'task')->create([
            'label' => 'richtig',
            'is_correct' => true,
            'position' => 1,
        ]);
        ExamSessionChoice::factory()->for($task, 'task')->create([
            'label' => 'falsch',
            'position' => 2,
        ]);

        $session->load('parts.readingMaterials', 'parts.tasks.readingMaterial', 'parts.tasks.choices');

        $this->assertSame([1, 2], $session->parts->pluck('part_number')->all());
        $this->assertSame('# Hallo Li', $session->parts[0]->readingMaterials[0]->body);
        $this->assertSame($material->id, $session->parts[0]->tasks[0]->readingMaterial->id);
        $this->assertSame(['richtig', 'falsch'], $session->parts[0]->tasks[0]->choices->pluck('label')->all());
        $this->assertTrue($session->parts[0]->tasks[0]->choices[0]->is_correct);
    }

    public function test_only_one_session_can_use_an_access_code(): void
    {
        $teacher = User::factory()->teacher()->create();
        $firstExam = Exam::factory()->for($teacher, 'teacher')->create();
        $secondExam = Exam::factory()->for($teacher, 'teacher')->create();
        ExamSession::factory()->for($teacher, 'teacher')->for($firstExam)->create(['access_code' => 'AB12CD34']);

        $this->expectException(QueryException::class);

        ExamSession::factory()->for($teacher, 'teacher')->for($secondExam)->create(['access_code' => 'AB12CD34']);
    }

    public function test_participation_and_response_are_unique_per_student_and_task(): void
    {
        $teacher = User::factory()->teacher()->create();
        $exam = Exam::factory()->for($teacher, 'teacher')->create();
        $student = User::factory()->student($teacher)->create();
        $session = ExamSession::factory()->for($teacher, 'teacher')->for($exam)->create();
        $part = ExamSessionPart::factory()->for($session)->create(['part_number' => 1]);
        $task = ExamSessionTask::factory()->for($part, 'part')->create(['position' => 1]);
        $choice = ExamSessionChoice::factory()->for($task, 'task')->create(['position' => 1]);
        $participation = $session->participations()->create(['student_id' => $student->id]);
        $participation->responses()->create(['task_id' => $task->id, 'choice_id' => $choice->id, 'answered_at' => now()]);

        $this->assertSame(1, $session->participations()->count());
        $this->assertSame(1, $participation->responses()->count());
        $this->assertSame($student->id, $participation->student->id);
    }

    public function test_session_cannot_assign_the_same_student_twice(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();
        $session = ExamSession::factory()->for($teacher, 'teacher')->create();
        $session->participations()->create(['student_id' => $student->id]);

        $this->expectException(QueryException::class);

        $session->participations()->create(['student_id' => $student->id]);
    }

    public function test_participation_cannot_answer_the_same_task_twice(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();
        $session = ExamSession::factory()->for($teacher, 'teacher')->create();
        $part = ExamSessionPart::factory()->for($session)->create();
        $task = ExamSessionTask::factory()->for($part, 'part')->create();
        $choice = ExamSessionChoice::factory()->for($task, 'task')->create();
        $participation = $session->participations()->create(['student_id' => $student->id]);
        $participation->responses()->create(['task_id' => $task->id, 'choice_id' => $choice->id, 'answered_at' => now()]);

        $this->expectException(QueryException::class);

        $participation->responses()->create(['task_id' => $task->id, 'choice_id' => $choice->id, 'answered_at' => now()]);
    }

    public function test_teacher_can_create_an_open_session_with_a_private_exam_snapshot(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();
        $exam = Exam::factory()->complete()->for($teacher, 'teacher')->create(['status' => 'published']);
        $originalPrompt = $exam->parts()->where('part_number', 1)->firstOrFail()->tasks()->firstOrFail()->prompt;

        $response = $this->actingAs($teacher)->post(route('teacher.exam-sessions.store'), [
            'exam_id' => $exam->id,
            'student_ids' => [$student->id],
        ]);

        $response->assertRedirect();
        $session = ExamSession::query()->where('exam_id', $exam->id)->firstOrFail();
        $this->assertSame('open', $session->status->value);
        $this->assertNotNull($session->opened_at);
        $this->assertMatchesRegularExpression('/^[A-Z0-9]{8}$/', $session->access_code);
        $this->assertSame(3, $session->parts()->count());
        $this->assertSame([5, 5, 5], $session->parts()->withCount('tasks')->get()->pluck('tasks_count')->all());
        $this->assertSame([$student->id], $session->participations()->pluck('student_id')->all());

        $exam->parts()->where('part_number', 1)->firstOrFail()->tasks()->firstOrFail()->update(['prompt' => 'Changed later']);
        $this->assertSame($originalPrompt, $session->parts()->where('part_number', 1)->firstOrFail()->tasks()->firstOrFail()->prompt);
    }

    public function test_teacher_cannot_create_a_session_from_another_teachers_exam_or_student(): void
    {
        $teacher = User::factory()->teacher()->create();
        $otherTeacher = User::factory()->teacher()->create();
        $exam = Exam::factory()->complete()->for($otherTeacher, 'teacher')->create(['status' => 'published']);
        $foreignStudent = User::factory()->student($otherTeacher)->create();

        $this->actingAs($teacher)->post(route('teacher.exam-sessions.store'), ['exam_id' => $exam->id])
            ->assertNotFound();

        $ownedExam = Exam::factory()->complete()->for($teacher, 'teacher')->create(['status' => 'published']);
        $this->actingAs($teacher)->from(route('teacher.exam-sessions.create'))
            ->post(route('teacher.exam-sessions.store'), ['exam_id' => $ownedExam->id, 'student_ids' => [$foreignStudent->id]])
            ->assertSessionHasErrors('student_ids');

        $this->assertDatabaseMissing('exam_sessions', ['exam_id' => $ownedExam->id]);
    }

    public function test_teacher_can_open_and_close_their_session_but_not_another_teachers_session(): void
    {
        $teacher = User::factory()->teacher()->create();
        $stranger = User::factory()->teacher()->create();
        $session = ExamSession::factory()->for($teacher, 'teacher')->create();

        $this->actingAs($stranger)->post(route('teacher.exam-sessions.open', $session))->assertForbidden();
        $this->actingAs($teacher)->get(route('teacher.exam-sessions.run', $session))->assertForbidden();
        $this->actingAs($teacher)->post(route('teacher.exam-sessions.open', $session))
            ->assertRedirect(route('teacher.exam-sessions.show', $session));
        $this->assertSame('open', $session->refresh()->status->value);
        $this->actingAs($teacher)->get(route('teacher.exam-sessions.run', $session))->assertForbidden();
        $this->actingAs($teacher)->post(route('teacher.exam-sessions.start', $session))
            ->assertRedirect(route('teacher.exam-sessions.run', $session));
        $startedAt = $session->refresh()->started_at;
        $this->assertNotNull($startedAt);
        $this->actingAs($teacher)->post(route('teacher.exam-sessions.start', $session))->assertRedirect();
        $this->assertTrue($session->refresh()->started_at->equalTo($startedAt));
        $this->actingAs($teacher)->get(route('teacher.exam-sessions.run', $session))->assertOk();
        $this->actingAs($teacher)->post(route('teacher.exam-sessions.close', $session))->assertRedirect();
        $this->assertSame('closed', $session->refresh()->status->value);
    }

    public function test_teacher_exam_room_shows_all_part_content_and_task_progress_without_answer_keys(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();
        $exam = Exam::factory()->complete()->for($teacher, 'teacher')->create(['status' => 'published']);
        $session = app(CreateExamSession::class)->handle($teacher, $exam, [$student->id]);
        $participation = app(JoinExamSession::class)->handle($student, $session->access_code);
        $this->actingAs($teacher)->post(route('teacher.exam-sessions.start', $session))->assertRedirect();
        $task = $session->parts()->where('part_number', 1)->firstOrFail()->tasks()->firstOrFail();
        $choice = $task->choices()->firstOrFail();
        app(SaveExamResponse::class)->handle($participation, $task->id, $choice->id);

        $this->actingAs($teacher)->get(route('teacher.exam-sessions.run', $session))
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/exam-sessions/run')
                ->has('parts', 3)
                ->has('parts.0.reading_materials.0.body')
                ->has('parts.1.tasks.0.choices.0.body')
                ->missing('parts.1.tasks.0.choices.0.is_correct')
                ->has('session.participations.0.progress', 3)
                ->where('session.participations.0.progress.0.answered_task_positions', [1])
                ->where('session.participations.0.progress.0.total_tasks', 5)
                ->missing('session.participations.0.answers')
                ->missing('parts.0.tasks.0.choices.0.is_correct'));

        $this->actingAs($teacher)->get(route('teacher.exam-sessions.show', $session))
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/exam-sessions/overview')
                ->has('session.participations', 1)
                ->missing('session.participations.0.progress')
                ->missing('parts'));
    }

    public function test_teacher_can_select_only_a_text_from_their_open_session(): void
    {
        $teacher = User::factory()->teacher()->create();
        $firstExam = Exam::factory()->complete()->for($teacher, 'teacher')->create(['status' => 'published']);
        $secondExam = Exam::factory()->complete()->for($teacher, 'teacher')->create(['status' => 'published']);
        $firstSession = app(CreateExamSession::class)->handle($teacher, $firstExam, []);
        $secondSession = app(CreateExamSession::class)->handle($teacher, $secondExam, []);
        $firstMaterial = $firstSession->parts()->firstOrFail()->readingMaterials()->firstOrFail();
        $foreignMaterial = $secondSession->parts()->firstOrFail()->readingMaterials()->firstOrFail();
        app(OpenExamSession::class)->handle($firstSession);

        $this->actingAs($teacher)->post(route('teacher.exam-sessions.reading-material', $firstSession), [
            'displayed_material_id' => $firstMaterial->id,
        ])->assertRedirect();
        $this->assertSame($firstMaterial->id, $firstSession->refresh()->displayed_material_id);

        $this->actingAs($teacher)->from(route('teacher.exam-sessions.show', $firstSession))
            ->post(route('teacher.exam-sessions.reading-material', $firstSession), [
                'displayed_material_id' => $foreignMaterial->id,
            ])->assertSessionHasErrors('displayed_material_id');
        $this->assertSame($firstMaterial->id, $firstSession->refresh()->displayed_material_id);

        $firstSession->update(['status' => 'closed']);
        $this->actingAs($teacher)->from(route('teacher.exam-sessions.show', $firstSession))
            ->post(route('teacher.exam-sessions.reading-material', $firstSession), [
                'displayed_material_id' => $firstMaterial->id,
            ])->assertSessionHasErrors('displayed_material_id');
    }
}
