<?php

namespace Tests\Feature\Student;

use App\Actions\Student\FinishExamParticipation;
use App\Actions\Student\JoinExamSession;
use App\Actions\Teacher\CreateExamSession;
use App\Actions\Teacher\OpenExamSession;
use App\Models\Exam;
use App\Models\ExamResponse;
use App\Models\ExamSession;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExamSessionParticipationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_student_lists_only_their_assigned_exam_sessions(): void
    {
        [$teacher, $student, $session] = $this->createOpenSession();
        $otherStudent = User::factory()->student($teacher)->create();
        $this->createSessionFor($teacher, $otherStudent);

        $this->actingAs($student)->get(route('student.exam-sessions.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('student/exam-sessions/index')
                ->has('participations', 1)
                ->where('participations.0.id', $session->participations()->firstOrFail()->id)
                ->missing('participations.0.access_code'));
    }

    public function test_assigned_student_must_enter_the_correct_code_to_join_an_open_session(): void
    {
        [, $student, $session] = $this->createOpenSession();

        $this->actingAs($student)->from(route('student.exam-sessions.index'))
            ->post(route('student.exam-sessions.join'), ['code' => 'WRONG123'])
            ->assertSessionHasErrors('code');
        $this->assertNull($session->participations()->firstOrFail()->joined_at);

        $this->actingAs($student)->post(route('student.exam-sessions.join'), ['code' => $session->access_code])
            ->assertRedirect(route('student.exam-sessions.show', $session->participations()->firstOrFail()));
        $this->assertNotNull($session->participations()->firstOrFail()->refresh()->joined_at);
    }

    public function test_assigned_student_can_reenter_their_open_session_with_the_code_without_an_error(): void
    {
        [, $student, $session] = $this->createOpenSession();
        $participation = $session->participations()->firstOrFail();

        $this->actingAs($student)->post(route('student.exam-sessions.join'), ['code' => $session->access_code])
            ->assertRedirect(route('student.exam-sessions.show', $participation));
        $joinedAt = $participation->refresh()->joined_at;

        $this->actingAs($student)->from(route('student.exam-sessions.index'))
            ->post(route('student.exam-sessions.join'), ['code' => $session->access_code])
            ->assertRedirect(route('student.exam-sessions.show', $participation))
            ->assertSessionHasNoErrors();

        $this->assertTrue($participation->refresh()->joined_at->equalTo($joinedAt));
    }

    public function test_unassigned_student_cannot_join_even_with_the_correct_code(): void
    {
        [$teacher, , $session] = $this->createOpenSession();
        $unassigned = User::factory()->student($teacher)->create();

        $this->actingAs($unassigned)->from(route('student.exam-sessions.index'))
            ->post(route('student.exam-sessions.join'), ['code' => $session->access_code])
            ->assertSessionHasErrors('code');

        $this->actingAs($unassigned)
            ->post(route('student.exam-sessions.access', $session->participations()->firstOrFail()), [
                'code' => $session->access_code,
            ])
            ->assertForbidden();
    }

    public function test_student_must_enter_the_access_code_for_the_selected_session_before_opening_it(): void
    {
        [, $student, $session] = $this->createOpenSession();
        $participation = $session->participations()->firstOrFail();
        $url = route('student.exam-sessions.access', $participation);

        $this->actingAs($student)->from(route('student.exam-sessions.index'))
            ->post($url)
            ->assertSessionHasErrors('code');
        $this->assertNull($participation->refresh()->joined_at);

        $this->actingAs($student)->from(route('student.exam-sessions.index'))
            ->post($url, ['code' => 'WRONG123'])
            ->assertSessionHasErrors('code');
        $this->assertNull($participation->refresh()->joined_at);

        $this->actingAs($student)->post($url, ['code' => $session->access_code])
            ->assertRedirect(route('student.exam-sessions.show', $participation))
            ->assertSessionHasNoErrors();
        $this->assertNotNull($participation->refresh()->joined_at);
    }

    public function test_student_delivery_contains_questions_and_choices_but_never_the_answer_key(): void
    {
        [, $student, $session] = $this->createOpenSession();
        $participation = $session->participations()->firstOrFail();

        $this->actingAs($student)->get(route('student.exam-sessions.show', $participation))->assertForbidden();
        $this->actingAs($student)->post(route('student.exam-sessions.access', $participation), [
            'code' => $session->access_code,
        ])->assertRedirect();

        $this->actingAs($student)->get(route('student.exam-sessions.show', $participation))
            ->assertInertia(fn (Assert $page) => $page
                ->component('student/exam-sessions/show')
                ->where('participation.started_at', null)
                ->has('exam.parts', 0)
                ->missing('exam.parts.0.tasks.0.prompt')
                ->where('responses', []));
        $this->assertNotNull($participation->refresh()->joined_at);

        $this->actingAs($student)->get(route('student.exam-sessions.state', $participation))
            ->assertOk()
            ->assertJsonPath('started_at', null)
            ->assertJsonPath('tasks_by_part', [])
            ->assertJsonPath('responses', []);
        $task = $session->parts()->firstOrFail()->tasks()->firstOrFail();
        $this->actingAs($student)->post(route('student.exam-sessions.responses.store', $participation), [
            'task_id' => $task->id,
            'choice_id' => $task->choices()->firstOrFail()->id,
        ])->assertForbidden();
        $this->actingAs($student)->post(route('student.exam-sessions.finish', $participation))->assertForbidden();

        $this->actingAs($session->teacher)->post(route('teacher.exam-sessions.start', $session))->assertRedirect();
        $this->actingAs($student)->get(route('student.exam-sessions.show', $participation))
            ->assertInertia(fn (Assert $page) => $page
                ->whereNot('participation.started_at', null)
                ->has('exam.parts.0.tasks.0.prompt')
                ->has('exam.parts.0.tasks.0.choices.0.label')
                ->missing('exam.parts.1.tasks.0.choices.0.body')
                ->missing('exam.parts.0.tasks.0.choices.0.is_correct'));

        $this->actingAs(User::factory()->teacher()->create())
            ->get(route('student.exam-sessions.show', $participation))
            ->assertForbidden();
    }

    public function test_student_response_is_saved_once_and_cannot_be_changed_after_finishing(): void
    {
        [, $student, $session] = $this->createOpenSession();
        $participation = $session->participations()->firstOrFail();
        $task = $session->parts()->where('part_number', 1)->firstOrFail()->tasks()->firstOrFail();
        $choices = $task->choices()->orderBy('position')->get();
        $this->actingAs($student)->post(route('student.exam-sessions.join'), ['code' => $session->access_code]);
        $this->actingAs($session->teacher)->post(route('teacher.exam-sessions.start', $session));

        $url = route('student.exam-sessions.responses.store', $participation);
        $this->actingAs($student)->postJson($url, ['task_id' => $task->id, 'choice_id' => $choices[0]->id])
            ->assertOk()
            ->assertJson(['saved' => true]);
        $this->actingAs($student)->post($url, ['task_id' => $task->id, 'choice_id' => $choices[1]->id])->assertRedirect();

        $this->assertSame(1, ExamResponse::query()->where('participation_id', $participation->id)->count());
        $this->assertDatabaseHas('exam_responses', [
            'participation_id' => $participation->id,
            'task_id' => $task->id,
            'choice_id' => $choices[1]->id,
        ]);
        $this->assertSame('in_progress', $participation->refresh()->status->value);

        $this->actingAs($student)->post(route('student.exam-sessions.finish', $participation))->assertRedirect();
        $this->assertSame('completed', $participation->refresh()->status->value);
        $this->actingAs($student)->post($url, ['task_id' => $task->id, 'choice_id' => $choices[0]->id])->assertForbidden();
    }

    public function test_only_a_joined_student_can_send_a_presence_heartbeat(): void
    {
        [$teacher, $student, $session] = $this->createOpenSession();
        $participation = $session->participations()->firstOrFail();
        $url = route('student.exam-sessions.heartbeat', $participation);

        $this->actingAs($student)->postJson($url)->assertForbidden();
        app(JoinExamSession::class)->handle($student, $session->access_code);
        $this->actingAs(User::factory()->student($teacher)->create())->postJson($url)->assertForbidden();

        $this->actingAs($student)->postJson($url)->assertOk()->assertJsonStructure(['last_seen_at']);
        $this->assertNotNull($participation->refresh()->last_seen_at);
    }

    public function test_completed_student_heartbeat_does_not_refresh_presence(): void
    {
        [, $student, $session] = $this->createOpenSession();
        $participation = app(JoinExamSession::class)->handle($student, $session->access_code);
        $session->update(['started_at' => now()]);
        $participation = app(FinishExamParticipation::class)->handle($participation);
        $lastSeenAt = $participation->last_seen_at?->toISOString();

        $this->actingAs($student)
            ->postJson(route('student.exam-sessions.heartbeat', $participation))
            ->assertOk()
            ->assertJson(['last_seen_at' => $lastSeenAt]);

        $this->assertSame($lastSeenAt, $participation->refresh()->last_seen_at?->toISOString());
    }

    public function test_teacher_student_exam_workflow_tracks_completion_without_exposing_answers_to_teacher(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();
        $exam = Exam::factory()->complete()->for($teacher, 'teacher')->create(['status' => 'published']);

        $this->actingAs($teacher)->post(route('teacher.exam-sessions.store'), [
            'exam_id' => $exam->id,
            'student_ids' => [$student->id],
        ])->assertRedirect();

        $session = ExamSession::query()->where('exam_id', $exam->id)->firstOrFail();
        $this->assertSame('open', $session->status->value);

        $this->actingAs($student)->post(route('student.exam-sessions.join'), ['code' => $session->access_code])
            ->assertRedirect();
        $participation = $session->participations()->firstOrFail();
        $this->actingAs($teacher)->post(route('teacher.exam-sessions.start', $session))->assertRedirect();
        $task = $session->parts()->where('part_number', 1)->firstOrFail()->tasks()->firstOrFail();
        $choice = $task->choices()->firstOrFail();

        $this->actingAs($student)->post(route('student.exam-sessions.responses.store', $participation), [
            'task_id' => $task->id,
            'choice_id' => $choice->id,
        ])->assertRedirect();
        $this->actingAs($student)->get(route('student.exam-sessions.state', $participation))
            ->assertOk()
            ->assertJsonPath("responses.{$task->id}", $choice->id);

        $this->actingAs($teacher)->get(route('teacher.exam-sessions.run', $session))
            ->assertInertia(fn (Assert $page) => $page
                ->component('teacher/exam-sessions/run')
                ->where('session.participations.0.progress.0.answered_task_positions', [1])
                ->missing('session.participations.0.responses')
                ->missing('session.participations.0.choice_id')
                ->missing('parts.0.tasks.0.choices.0.is_correct'));

        $this->actingAs($student)->post(route('student.exam-sessions.finish', $participation))->assertRedirect();
        $this->actingAs($teacher)->get(route('teacher.exam-sessions.show', $session))
            ->assertInertia(fn (Assert $page) => $page
                ->where('session.participations.0.status', 'completed')
                ->missing('session.participations.0.responses'));
    }

    /** @return array{User, User, ExamSession} */
    private function createOpenSession(): array
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();

        return [$teacher, $student, $this->createSessionFor($teacher, $student)];
    }

    private function createSessionFor(User $teacher, User $student): ExamSession
    {
        $exam = Exam::factory()->complete()->for($teacher, 'teacher')->create(['status' => 'published']);
        $session = app(CreateExamSession::class)->handle($teacher, $exam, [$student->id]);

        return app(OpenExamSession::class)->handle($session);
    }
}
