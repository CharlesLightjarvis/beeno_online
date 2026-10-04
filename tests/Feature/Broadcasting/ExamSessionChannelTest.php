<?php

namespace Tests\Feature\Broadcasting;

use App\Actions\Student\JoinExamSession;
use App\Actions\Student\SaveExamResponse;
use App\Actions\Student\FinishExamParticipation;
use App\Actions\Teacher\CreateExamSession;
use App\Actions\Teacher\OpenExamSession;
use App\Events\ExamSessionPresenceUpdated;
use App\Events\ExamSessionProgressUpdated;
use App\Events\ExamSessionStateChanged;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Broadcasting\BroadcastManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamSessionChannelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_only_the_owner_teacher_can_authorize_the_teacher_channel(): void
    {
        [$teacher, , $session] = $this->makeOpenSession();
        $otherTeacher = User::factory()->teacher()->create();
        $channels = app(BroadcastManager::class)->connection()->getChannels();
        $authorize = $channels['exam-sessions.{sessionId}.teacher'];

        $this->assertTrue($authorize($teacher, $session->id));
        $this->assertFalse($authorize($otherTeacher, $session->id));
    }

    public function test_only_a_joined_assigned_student_can_authorize_their_private_channel(): void
    {
        [, $student, $session] = $this->makeOpenSession();
        $participation = $session->participations()->firstOrFail();
        $stranger = User::factory()->student($session->teacher)->create();
        $channels = app(BroadcastManager::class)->connection()->getChannels();
        $authorize = $channels['exam-sessions.{sessionId}.students.{studentId}'];

        $this->assertFalse($authorize($student, $session->id, (string) $student->id));
        app(JoinExamSession::class)->handle($student, $session->access_code);
        $this->assertTrue($authorize($student, $session->id, (string) $student->id));
        $this->assertFalse($authorize($stranger, $session->id, (string) $stranger->id));
        $this->assertFalse($authorize($student, $session->id, (string) $stranger->id));
    }

    public function test_presence_channel_is_limited_to_the_session_teacher_and_active_participant(): void
    {
        [$teacher, $student, $session] = $this->makeOpenSession();
        $participation = $session->participations()->firstOrFail();
        $otherTeacher = User::factory()->teacher()->create();
        $stranger = User::factory()->student($teacher)->create();
        $channels = app(BroadcastManager::class)->connection()->getChannels();
        $authorize = $channels['exam-sessions.{sessionId}.participations.{participationId}.presence'];

        $this->assertSame(['id' => 'teacher'], $authorize($teacher, $session->id, $participation->id));
        $this->assertFalse($authorize($otherTeacher, $session->id, $participation->id));
        $this->assertFalse($authorize($student, $session->id, $participation->id));

        app(JoinExamSession::class)->handle($student, $session->access_code);
        $this->assertSame(['id' => 'student'], $authorize($student, $session->id, $participation->id));
        $this->assertFalse($authorize($stranger, $session->id, $participation->id));

        $session->update(['started_at' => now()]);
        app(FinishExamParticipation::class)->handle($participation->fresh());
        $this->assertFalse($authorize($student, $session->id, $participation->id));
    }

    public function test_teacher_progress_event_contains_progress_but_never_selected_choice_data(): void
    {
        [$teacher, $student, $session] = $this->makeOpenSession();
        $session->update(['started_at' => now()]);
        $participation = app(JoinExamSession::class)->handle($student, $session->access_code);
        $task = $session->parts()->where('part_number', 1)->firstOrFail()->tasks()->firstOrFail();
        $choice = $task->choices()->firstOrFail();
        app(SaveExamResponse::class)->handle($participation, $task->id, $choice->id);

        $event = ExamSessionProgressUpdated::fromParticipation($participation->fresh());
        $payload = $event->broadcastWith();

        $this->assertSame($session->id, $payload['session_id']);
        $this->assertSame($participation->id, $payload['participation_id']);
        $this->assertSame([1], $payload['progress'][0]['answered_task_positions']);
        $this->assertSame(['session_id', 'participation_id', 'status', 'progress'], array_keys($payload));
        $this->assertStringNotContainsString($choice->id, json_encode($payload, JSON_THROW_ON_ERROR));
        $this->assertStringNotContainsString('is_correct', json_encode($payload, JSON_THROW_ON_ERROR));

        $presence = new ExamSessionPresenceUpdated($session->id, (string) $student->id, now()->toISOString());
        $this->assertSame(['session_id', 'student_id', 'last_seen_at'], array_keys($presence->broadcastWith()));
        $this->assertStringNotContainsString($choice->id, json_encode($presence->broadcastWith(), JSON_THROW_ON_ERROR));

        $state = ExamSessionStateChanged::fromSession($session->refresh());
        $this->assertSame([
            'session_id' => $session->id,
            'status' => 'open',
            'started_at' => $session->started_at->toISOString(),
        ], $state->broadcastWith());
        $this->assertSame($teacher->id, $session->teacher_id);
    }

    /** @return array{User, User, ExamSession} */
    private function makeOpenSession(): array
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();
        $exam = Exam::factory()->complete()->for($teacher, 'teacher')->create(['status' => 'published']);
        $session = app(CreateExamSession::class)->handle($teacher, $exam, [$student->id]);

        return [$teacher, $student, app(OpenExamSession::class)->handle($session)];
    }
}
