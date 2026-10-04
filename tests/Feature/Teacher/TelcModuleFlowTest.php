<?php

namespace Tests\Feature\Teacher;

use App\Actions\Student\JoinExamSession;
use App\Actions\Teacher\CreateExamSession;
use App\Models\Exam;
use App\Models\ExamChoice;
use App\Models\ExamPart;
use App\Models\ExamReadingMaterial;
use App\Models\ExamSession;
use App\Models\ExamTask;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TelcModuleFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_session_snapshots_modules_in_configured_telc_order(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();
        $exam = Exam::factory()->complete()->for($teacher, 'teacher')->create([
            'status' => 'published',
            'module_order' => ['lesen', 'hoeren', 'schreiben', 'sprechen'],
        ]);

        $this->addChoiceModule($exam, 'hoeren');
        $this->addTextModule($exam, 'schreiben');

        $session = app(CreateExamSession::class)->handle($teacher, $exam, [$student->id]);

        $this->assertSame(
            ['lesen', 'hoeren', 'schreiben'],
            $session->parts()->pluck('module')->all(),
        );
        $this->assertSame('text', $session->parts()->where('module', 'schreiben')->firstOrFail()->tasks()->firstOrFail()->response_type);
    }

    public function test_student_can_save_a_text_response_without_a_choice(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();
        $exam = Exam::factory()->complete()->for($teacher, 'teacher')->create(['status' => 'published']);
        $this->addTextModule($exam, 'schreiben');
        $session = app(CreateExamSession::class)->handle($teacher, $exam, [$student->id]);
        $participation = app(JoinExamSession::class)->handle($student, $session->access_code);
        $session->update(['started_at' => now()]);
        $task = $session->parts()->where('module', 'schreiben')->firstOrFail()->tasks()->firstOrFail();

        $this->actingAs($student)->postJson(
            route('student.exam-sessions.responses.store', $participation),
            ['task_id' => $task->id, 'answer_text' => 'Eine kurze Antwort.'],
        )->assertOk()->assertJson(['saved' => true]);

        $this->assertDatabaseHas('exam_responses', [
            'participation_id' => $participation->id,
            'task_id' => $task->id,
            'choice_id' => null,
            'answer_text' => 'Eine kurze Antwort.',
        ]);

        $this->actingAs($student)->get(route('student.exam-sessions.show', $participation))
            ->assertInertia(fn (Assert $page) => $page
                ->where('exam.parts.4.module', 'schreiben')
                ->where("responses.{$task->id}", 'Eine kurze Antwort.'));
    }

    private function addChoiceModule(Exam $exam, string $module): void
    {
        $part = ExamPart::factory()->for($exam)->create([
            'module' => $module,
            'part_number' => 1,
            'instructions' => 'Choisissez la bonne réponse.',
        ]);
        $material = ExamReadingMaterial::factory()->for($part, 'part')->create(['position' => 1]);

        foreach (range(1, 5) as $position) {
            $task = ExamTask::factory()->for($part, 'part')->for($material, 'readingMaterial')->create([
                'position' => $position,
                'response_type' => 'choice',
            ]);
            foreach (['A', 'B'] as $choicePosition => $label) {
                ExamChoice::factory()->for($task, 'task')->create([
                    'label' => $label,
                    'position' => $choicePosition + 1,
                    'is_correct' => $choicePosition === 0,
                ]);
            }
        }
    }

    private function addTextModule(Exam $exam, string $module): void
    {
        $part = ExamPart::factory()->for($exam)->create([
            'module' => $module,
            'part_number' => 1,
            'instructions' => 'Rédigez votre réponse.',
        ]);

        foreach (range(1, 5) as $position) {
            ExamTask::factory()->for($part, 'part')->create([
                'position' => $position,
                'response_type' => 'text',
            ]);
        }
    }
}
