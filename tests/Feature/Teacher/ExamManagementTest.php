<?php

namespace Tests\Feature\Teacher;

use App\Models\Exam;
use App\Models\ExamChoice;
use App\Models\ExamPart;
use App\Models\ExamReadingMaterial;
use App\Models\ExamSession;
use App\Models\ExamTask;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExamManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->seed(RolesAndPermissionsSeeder::class);
    }

    public function test_exam_loads_ordered_parts_and_their_nested_reading_content(): void
    {
        $teacher = User::factory()->create();
        $exam = Exam::factory()->for($teacher, 'teacher')->create();

        $secondPart = ExamPart::factory()->for($exam)->create([
            'part_number' => 2,
            'instructions' => 'Choose A or B.',
        ]);
        $firstPart = ExamPart::factory()->for($exam)->create([
            'part_number' => 1,
            'instructions' => 'Choose richtig or falsch.',
        ]);

        $material = ExamReadingMaterial::factory()->for($firstPart, 'part')->create([
            'source' => 'Notice board',
            'title' => 'Opening hours',
            'body' => 'Monday to Friday, 8:00–18:00.',
            'position' => 1,
        ]);
        $task = ExamTask::factory()
            ->for($firstPart, 'part')
            ->for($material, 'readingMaterial')
            ->create([
                'prompt' => 'The office is open on Saturday.',
                'position' => 1,
            ]);
        ExamChoice::factory()->for($task, 'task')->create([
            'label' => 'richtig',
            'position' => 1,
        ]);
        ExamChoice::factory()->for($task, 'task')->create([
            'label' => 'falsch',
            'position' => 2,
        ]);

        $exam->load('parts.readingMaterials', 'parts.tasks.readingMaterial', 'parts.tasks.choices');

        $this->assertSame([1, 2], $exam->parts->pluck('part_number')->all());
        $this->assertSame('Opening hours', $exam->parts[0]->readingMaterials[0]->title);
        $this->assertSame($material->id, $exam->parts[0]->tasks[0]->readingMaterial->id);
        $this->assertSame(['richtig', 'falsch'], $exam->parts[0]->tasks[0]->choices->pluck('label')->all());
    }

    public function test_part_number_is_unique_within_an_exam(): void
    {
        $exam = Exam::factory()->create();

        ExamPart::factory()->for($exam)->create(['part_number' => 1]);

        $this->expectException(QueryException::class);

        ExamPart::factory()->for($exam)->create(['part_number' => 1]);
    }

    public function test_task_and_choice_order_is_preserved_by_their_parent_relations(): void
    {
        $exam = Exam::factory()->create();
        $part = ExamPart::factory()->for($exam)->create(['part_number' => 1]);
        $secondTask = ExamTask::factory()->for($part, 'part')->create(['position' => 2]);
        $firstTask = ExamTask::factory()->for($part, 'part')->create(['position' => 1]);

        ExamChoice::factory()->for($firstTask, 'task')->create(['label' => 'falsch', 'position' => 2]);
        ExamChoice::factory()->for($firstTask, 'task')->create(['label' => 'richtig', 'position' => 1]);

        $this->assertSame([$firstTask->id, $secondTask->id], $part->tasks()->pluck('id')->all());
        $this->assertSame(['richtig', 'falsch'], $firstTask->choices()->pluck('label')->all());
    }

    public function test_task_order_is_unique_within_a_part(): void
    {
        $exam = Exam::factory()->create();
        $part = ExamPart::factory()->for($exam)->create(['part_number' => 1]);
        ExamTask::factory()->for($part, 'part')->create(['position' => 1]);

        $this->expectException(QueryException::class);

        ExamTask::factory()->for($part, 'part')->create(['position' => 1]);
    }

    public function test_choice_order_is_unique_within_a_task(): void
    {
        $exam = Exam::factory()->create();
        $part = ExamPart::factory()->for($exam)->create(['part_number' => 1]);
        $task = ExamTask::factory()->for($part, 'part')->create(['position' => 1]);
        ExamChoice::factory()->for($task, 'task')->create(['position' => 1]);

        $this->expectException(QueryException::class);

        ExamChoice::factory()->for($task, 'task')->create(['position' => 1]);
    }

    public function test_complete_exam_factory_builds_the_telc_a1_lesen_shape(): void
    {
        $exam = Exam::factory()->complete()->create();
        $exam->load('parts.tasks.choices');

        $this->assertSame([1, 2, 3], $exam->parts->pluck('part_number')->all());
        $this->assertSame([5, 5, 5], $exam->parts->map(fn (ExamPart $part): int => $part->tasks->count())->all());
        $this->assertSame(
            ['richtig', 'falsch'],
            $exam->parts[0]->tasks[0]->choices->pluck('label')->all(),
        );
        $this->assertSame(['A', 'B'], $exam->parts[1]->tasks[0]->choices->pluck('label')->all());
        $this->assertTrue($exam->parts->flatMap->tasks->every(
            fn (ExamTask $task): bool => $task->choices->where('is_correct', true)->count() === 1,
        ));
    }

    public function test_teacher_can_create_and_list_a_private_draft(): void
    {
        $teacher = User::factory()->teacher()->create();
        $otherTeacher = User::factory()->teacher()->create();

        $this->actingAs($teacher)->post(route('teacher.exams.store'), [
            'title' => 'Mon examen A1',
            'status' => 'draft',
            'teacher_id' => $otherTeacher->id,
            'parts' => [],
        ])->assertRedirect(route('teacher.exams.index'));

        $exam = Exam::query()->where('title', 'Mon examen A1')->firstOrFail();
        $this->assertSame($teacher->id, $exam->teacher_id);
        $this->assertSame('A1', $exam->level);

        $this->actingAs($teacher)->get(route('teacher.exams.index'))
            ->assertInertia(fn (Assert $page) => $page->component('teacher/exams/index')->has('exams.data', 1));
        $this->actingAs($otherTeacher)->get(route('teacher.exams.index'))
            ->assertInertia(fn (Assert $page) => $page->component('teacher/exams/index')->has('exams.data', 0));
    }

    public function test_teacher_cannot_view_update_or_delete_another_teachers_exam(): void
    {
        $owner = User::factory()->teacher()->create();
        $stranger = User::factory()->teacher()->create();
        $exam = Exam::factory()->for($owner, 'teacher')->create();

        $this->actingAs($stranger)->get(route('teacher.exams.edit', $exam))->assertForbidden();
        $this->actingAs($stranger)->put(route('teacher.exams.update', $exam), [
            'title' => 'Intrusion', 'status' => 'draft', 'parts' => [],
        ])->assertForbidden();
        $this->actingAs($stranger)->delete(route('teacher.exams.destroy', $exam))->assertForbidden();
        $this->assertDatabaseHas('exams', ['id' => $exam->id, 'teacher_id' => $owner->id]);
    }

    public function test_owner_can_edit_and_delete_an_exam(): void
    {
        $teacher = User::factory()->teacher()->create();
        $exam = Exam::factory()->for($teacher, 'teacher')->create();

        $this->actingAs($teacher)->get(route('teacher.exams.edit', $exam))
            ->assertInertia(fn (Assert $page) => $page->component('teacher/exams/edit')->where('exam.id', $exam->id));
        $this->actingAs($teacher)->put(route('teacher.exams.update', $exam), [
            'title' => 'Titre modifié', 'status' => 'draft', 'parts' => [],
        ])->assertRedirect(route('teacher.exams.index'));
        $this->assertDatabaseHas('exams', ['id' => $exam->id, 'title' => 'Titre modifié']);
        $this->actingAs($teacher)->delete(route('teacher.exams.destroy', $exam))->assertRedirect(route('teacher.exams.index'));
        $this->assertDatabaseMissing('exams', ['id' => $exam->id]);
    }

    public function test_deleting_an_exam_used_by_a_session_archives_it_and_preserves_the_session(): void
    {
        $teacher = User::factory()->teacher()->create();
        $exam = Exam::factory()->for($teacher, 'teacher')->create();
        $session = ExamSession::factory()->for($teacher, 'teacher')->for($exam)->create();

        $this->actingAs($teacher)->delete(route('teacher.exams.destroy', $exam))
            ->assertRedirect(route('teacher.exams.index'));

        $this->assertSoftDeleted('exams', ['id' => $exam->id]);
        $this->assertDatabaseHas('exam_sessions', ['id' => $session->id, 'exam_id' => $exam->id]);
        $this->assertSame($teacher->id, $session->fresh()->teacher_id);
    }

    public function test_student_cannot_manage_exams(): void
    {
        $teacher = User::factory()->teacher()->create();
        $student = User::factory()->student($teacher)->create();

        $this->actingAs($student)->get(route('teacher.exams.index'))->assertForbidden();
    }

    public function test_published_exam_requires_three_parts_with_five_tasks_each(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->actingAs($teacher)->from(route('teacher.exams.create'))->post(route('teacher.exams.store'), [
            'title' => 'Incomplet', 'status' => 'published', 'parts' => [],
        ])->assertSessionHasErrors('parts');
        $this->assertDatabaseMissing('exams', ['title' => 'Incomplet']);
    }

    public function test_publishing_incomplete_part_reports_readable_field_errors(): void
    {
        $teacher = User::factory()->teacher()->create();
        $parts = [];

        foreach ([1, 2, 3] as $number) {
            $parts[] = [
                'part_number' => $number,
                'instructions' => 'Consigne',
                'reading_materials' => $number === 2 ? [] : [['body' => $number === 3 ? '' : 'Texte', 'position' => 1]],
                'tasks' => array_map(fn (int $position): array => [
                    'prompt' => $number === 3 ? '' : 'Question '.$position,
                    'position' => $position,
                    'choices' => array_map(fn (string $label, int $choicePosition): array => [
                        'label' => $label,
                        'body' => null,
                        'is_correct' => $choicePosition === 1,
                        'position' => $choicePosition,
                    ], $number === 2 ? ['A', 'B'] : ['richtig', 'falsch'], [1, 2]),
                ], range(1, 5)),
            ];
        }

        $response = $this->actingAs($teacher)->from(route('teacher.exams.create'))->post(route('teacher.exams.store'), [
            'title' => 'Examen incomplet', 'status' => 'published', 'parts' => $parts,
        ]);

        $response->assertSessionHasErrors([
            'parts.2.reading_materials.0.body',
            'parts.2.tasks.0.prompt',
            'parts.2.tasks.4.prompt',
        ]);

        $errors = session('errors')->getBag('default')->messages();
        $this->assertSame('Ajoutez le contenu de ce texte avant de publier.', $errors['parts.2.reading_materials.0.body'][0]);
        $this->assertSame('Saisissez la question ou l’affirmation avant de publier.', $errors['parts.2.tasks.0.prompt'][0]);
        $this->assertSame('Ajoutez au moins un texte de lecture.', $errors['parts.2.reading_materials'][0]);
    }

    public function test_nested_choice_labels_and_correct_answer_count_are_enforced(): void
    {
        $teacher = User::factory()->teacher()->create();
        $payload = [
            'title' => 'Draft', 'status' => 'draft',
            'parts' => [[
                'part_number' => 2, 'instructions' => 'Select A or B.', 'tasks' => [[
                    'prompt' => 'Question', 'position' => 1,
                    'choices' => [
                        ['label' => 'X', 'is_correct' => true, 'position' => 1],
                        ['label' => 'Y', 'is_correct' => true, 'position' => 2],
                    ],
                ]],
            ]],
        ];

        $this->actingAs($teacher)->from(route('teacher.exams.create'))->post(route('teacher.exams.store'), $payload)
            ->assertSessionHasErrors('parts.0.tasks.0.choices');
        $this->assertDatabaseMissing('exams', ['title' => 'Draft']);
    }

    public function test_nested_positions_are_unique_only_within_their_parent(): void
    {
        $teacher = User::factory()->teacher()->create();
        $parts = [];

        foreach ([1, 2, 3] as $partNumber) {
            $labels = $partNumber === 2 ? ['A', 'B'] : ['richtig', 'falsch'];
            $taskCount = $partNumber === 1 ? 2 : 1;

            $parts[] = [
                'part_number' => $partNumber,
                'instructions' => 'Anweisung',
                'reading_materials' => $partNumber === 2 ? [] : [[
                    'source' => '', 'title' => null, 'body' => 'Text', 'position' => 1,
                ]],
                'tasks' => array_map(fn (int $position): array => [
                    'prompt' => 'Frage '.$position,
                    'position' => $position,
                    'choices' => array_map(fn (string $label, int $choicePosition): array => [
                        'label' => $label,
                        'is_correct' => $choicePosition === 1,
                        'position' => $choicePosition,
                    ], $labels, [1, 2]),
                ], range(1, $taskCount)),
            ];
        }

        $this->actingAs($teacher)->post(route('teacher.exams.store'), [
            'title' => 'Positions propres à chaque parent',
            'status' => 'draft',
            'parts' => $parts,
        ])->assertRedirect(route('teacher.exams.index'));

        $this->assertDatabaseHas('exams', ['title' => 'Positions propres à chaque parent']);
    }

    public function test_incomplete_draft_content_can_be_saved_without_being_published(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->actingAs($teacher)->post(route('teacher.exams.store'), [
            'title' => 'Brouillon en cours',
            'status' => 'draft',
            'parts' => [[
                'part_number' => 1,
                'instructions' => '',
                'reading_materials' => [['source' => '', 'title' => '', 'body' => '', 'position' => 1]],
                'tasks' => [['prompt' => '', 'position' => 1]],
            ]],
        ])->assertRedirect(route('teacher.exams.index'));

        $exam = Exam::query()->where('title', 'Brouillon en cours')->firstOrFail();
        $this->assertSame(1, $exam->parts()->count());
        $this->assertSame(1, $exam->parts()->firstOrFail()->tasks()->count());
    }

    public function test_draft_questions_can_be_linked_to_a_reading_text_by_position(): void
    {
        $teacher = User::factory()->teacher()->create();

        $this->actingAs($teacher)->post(route('teacher.exams.store'), [
            'title' => 'Teil 1 avec deux textes',
            'status' => 'draft',
            'parts' => [[
                'part_number' => 1,
                'instructions' => 'Richtig oder falsch?',
                'reading_materials' => [
                    ['source' => 'E-Mail Karin', 'title' => 'Hallo Li', 'body' => 'Texte un', 'position' => 1],
                    ['source' => 'Einladung Ralf', 'title' => 'Liebe Carmen', 'body' => 'Texte deux', 'position' => 2],
                ],
                'tasks' => [[
                    'reading_material_id' => null,
                    'reading_material_position' => 2,
                    'prompt' => 'Ralf feiert draußen.',
                    'position' => 1,
                    'choices' => [
                        ['label' => 'richtig', 'is_correct' => true, 'position' => 1],
                        ['label' => 'falsch', 'is_correct' => false, 'position' => 2],
                    ],
                ]],
            ]],
        ])->assertRedirect(route('teacher.exams.index'));

        $exam = Exam::query()->where('title', 'Teil 1 avec deux textes')->with('parts.readingMaterials', 'parts.tasks')->firstOrFail();
        $this->assertSame($exam->parts[0]->readingMaterials[1]->id, $exam->parts[0]->tasks[0]->reading_material_id);
    }

    public function test_update_rejects_child_ids_owned_by_another_exam(): void
    {
        $teacher = User::factory()->teacher()->create();
        $exam = Exam::factory()->for($teacher, 'teacher')->create();
        $foreignExam = Exam::factory()->for($teacher, 'teacher')->create();
        $foreignPart = ExamPart::factory()->for($foreignExam)->create(['part_number' => 1]);

        $this->actingAs($teacher)->from(route('teacher.exams.edit', $exam))->put(route('teacher.exams.update', $exam), [
            'title' => 'Modification',
            'status' => 'draft',
            'parts' => [['id' => $foreignPart->id, 'part_number' => 1, 'instructions' => '']],
        ])->assertSessionHasErrors('parts');

        $this->assertDatabaseHas('exam_parts', ['id' => $foreignPart->id, 'exam_id' => $foreignExam->id]);
        $this->assertDatabaseHas('exams', ['id' => $exam->id, 'title' => $exam->title]);
    }

    public function test_five_published_task_prompts_without_choices_are_rejected(): void
    {
        $teacher = User::factory()->teacher()->create();
        $parts = [];
        foreach ([1, 2, 3] as $number) {
            $parts[] = [
                'part_number' => $number,
                'instructions' => 'Lesen Sie den Text.',
                'reading_materials' => $number === 2 ? [] : [['source' => 'Aushang', 'body' => 'Öffnungszeiten', 'position' => 1]],
                'tasks' => array_map(fn (int $position): array => [
                    'prompt' => 'Frage '.$position,
                    'position' => $position,
                ], range(1, 5)),
            ];
        }

        $this->actingAs($teacher)->from(route('teacher.exams.create'))->post(route('teacher.exams.store'), [
            'title' => 'Ohne Antworten',
            'status' => 'published',
            'parts' => $parts,
        ])->assertSessionHasErrors();
        $this->assertDatabaseMissing('exams', ['title' => 'Ohne Antworten']);
    }

    public function test_nested_update_keeps_one_copy_of_each_child_and_relinks_its_support(): void
    {
        $teacher = User::factory()->teacher()->create();
        $exam = Exam::factory()->for($teacher, 'teacher')->create();
        $part = ExamPart::factory()->for($exam)->create(['part_number' => 1]);
        $material = ExamReadingMaterial::factory()->for($part, 'part')->create(['position' => 1]);
        $task = ExamTask::factory()->for($part, 'part')->for($material, 'readingMaterial')->create(['position' => 1]);
        $correct = ExamChoice::factory()->for($task, 'task')->create(['label' => 'richtig', 'is_correct' => true, 'position' => 1]);
        $incorrect = ExamChoice::factory()->for($task, 'task')->create(['label' => 'falsch', 'position' => 2]);

        $this->actingAs($teacher)->put(route('teacher.exams.update', $exam), [
            'title' => 'Examen révisé',
            'status' => 'draft',
            'parts' => [[
                'id' => $part->id,
                'part_number' => 1,
                'instructions' => 'Neue Anweisung',
                'reading_materials' => [[
                    'id' => $material->id, 'source' => 'Aushang', 'title' => null, 'body' => 'Text', 'position' => 1,
                ]],
                'tasks' => [[
                    'id' => $task->id,
                    'reading_material_id' => $material->id,
                    'prompt' => 'Neue Frage?',
                    'position' => 1,
                    'choices' => [
                        ['id' => $correct->id, 'label' => 'richtig', 'is_correct' => true, 'position' => 1],
                        ['id' => $incorrect->id, 'label' => 'falsch', 'is_correct' => false, 'position' => 2],
                    ],
                ]],
            ]],
        ])->assertRedirect(route('teacher.exams.index'));

        $exam->refresh()->load('parts.readingMaterials', 'parts.tasks.readingMaterial', 'parts.tasks.choices');
        $this->assertSame('Examen révisé', $exam->title);
        $this->assertCount(1, $exam->parts);
        $this->assertCount(1, $exam->parts[0]->tasks);
        $this->assertCount(2, $exam->parts[0]->tasks[0]->choices);
        $this->assertSame($exam->parts[0]->readingMaterials[0]->id, $exam->parts[0]->tasks[0]->readingMaterial->id);
    }
}
