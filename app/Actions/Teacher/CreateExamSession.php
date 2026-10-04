<?php

namespace App\Actions\Teacher;

use App\Enums\ExamSessionStatus;
use App\Enums\ExamStatus;
use App\Enums\RoleEnum;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\ExamSessionReadingMaterial;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateExamSession
{
    /** @param array<int, string> $studentIds */
    public function handle(User $teacher, Exam $exam, array $studentIds): ExamSession
    {
        $this->assertLaunchable($teacher, $exam);

        $studentIds = array_values(array_unique($studentIds));
        $ownedStudentIds = $teacher->students()
            ->whereNull('archived_at')
            ->role(RoleEnum::Student->value)
            ->whereIn('id', $studentIds)
            ->pluck('users.id')
            ->all();

        if (count($ownedStudentIds) !== count($studentIds)) {
            throw ValidationException::withMessages([
                'student_ids' => 'Un ou plusieurs étudiants ne peuvent pas être ajoutés à cette session.',
            ]);
        }

        $exam->load('parts.readingMaterials', 'parts.tasks.choices');

        for ($attempt = 0; $attempt < 5; $attempt++) {
            try {
                return DB::transaction(function () use ($teacher, $exam, $ownedStudentIds): ExamSession {
                    $session = ExamSession::query()->create([
                        'exam_id' => $exam->id,
                        'teacher_id' => $teacher->id,
                        'title' => $exam->title,
                        'access_code' => Str::upper(Str::random(8)),
                        'status' => ExamSessionStatus::Open,
                        'opened_at' => now(),
                    ]);

                    $this->snapshotExam($exam, $session);

                    foreach ($ownedStudentIds as $studentId) {
                        $session->participations()->create(['student_id' => $studentId]);
                    }

                    return $session->load('parts.readingMaterials', 'parts.tasks.choices', 'participations.student');
                });
            } catch (UniqueConstraintViolationException $exception) {
                if ($attempt === 4) {
                    throw $exception;
                }
            }
        }

        throw new \LogicException('Unable to allocate a unique exam session code.');
    }

    private function assertLaunchable(User $teacher, Exam $exam): void
    {
        if ($exam->teacher_id !== $teacher->id || $exam->status !== ExamStatus::Published) {
            throw ValidationException::withMessages([
                'exam_id' => 'Seuls vos examens publiés peuvent être lancés.',
            ]);
        }

        $exam->loadMissing('parts.readingMaterials', 'parts.tasks.choices');
        $parts = $exam->parts;

        if ($parts->pluck('part_number')->all() !== [1, 2, 3]
            || $parts->contains(fn ($part): bool => $part->tasks->count() !== 5)) {
            throw ValidationException::withMessages([
                'exam_id' => 'Cet examen ne contient pas les trois parties complètes.',
            ]);
        }

        foreach ($parts as $part) {
            $expectedLabels = $part->part_number === 2 ? ['A', 'B'] : ['richtig', 'falsch'];

            if ($part->part_number !== 2 && $part->readingMaterials->isEmpty()) {
                throw ValidationException::withMessages(['exam_id' => 'Un passage de lecture est manquant.']);
            }

            foreach ($part->tasks as $task) {
                if ($task->choices->pluck('label')->all() !== $expectedLabels
                    || $task->choices->where('is_correct', true)->count() !== 1) {
                    throw ValidationException::withMessages([
                        'exam_id' => 'Chaque question doit avoir ses choix et une seule bonne réponse.',
                    ]);
                }

                if ($part->part_number !== 2 && ! $part->readingMaterials->contains('id', $task->reading_material_id)) {
                    throw ValidationException::withMessages(['exam_id' => 'Une question est sans passage associé.']);
                }
            }
        }
    }

    private function snapshotExam(Exam $exam, ExamSession $session): void
    {
        foreach ($exam->parts as $part) {
            $snapshotPart = $session->parts()->create([
                'source_part_id' => $part->id,
                'part_number' => $part->part_number,
                'instructions' => $part->instructions,
            ]);
            $materialMap = [];

            foreach ($part->readingMaterials as $material) {
                $snapshotMaterial = $snapshotPart->readingMaterials()->create([
                    'source_material_id' => $material->id,
                    'source' => $material->source,
                    'title' => $material->title,
                    'body' => $material->body,
                    'position' => $material->position,
                ]);
                $materialMap[$material->id] = $snapshotMaterial;
            }

            foreach ($part->tasks as $task) {
                /** @var ExamSessionReadingMaterial|null $snapshotMaterial */
                $snapshotMaterial = $task->reading_material_id ? ($materialMap[$task->reading_material_id] ?? null) : null;
                $snapshotTask = $snapshotPart->tasks()->create([
                    'reading_material_id' => $snapshotMaterial?->id,
                    'source_task_id' => $task->id,
                    'prompt' => $task->prompt,
                    'position' => $task->position,
                ]);

                foreach ($task->choices as $choice) {
                    $snapshotTask->choices()->create([
                        'source_choice_id' => $choice->id,
                        'label' => $choice->label,
                        'body' => $choice->body,
                        'is_correct' => $choice->is_correct,
                        'position' => $choice->position,
                    ]);
                }
            }
        }

        $session->update([
            'displayed_material_id' => $session->parts()->first()?->readingMaterials()->first()?->id,
        ]);
    }
}
