<?php

namespace App\Actions\Teacher;

use App\Models\Exam;
use App\Models\ExamChoice;
use App\Models\ExamTask;
use App\Models\User;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaveExam
{
    /** @param array<string, mixed> $data */
    public function handle(User $teacher, array $data, ?Exam $exam = null): Exam
    {
        return DB::transaction(function () use ($teacher, $data, $exam): Exam {
            if ($exam !== null) {
                $this->assertChildOwnership($exam, $data['parts'] ?? []);
                $exam->parts()->delete();
                $exam->update([
                    'title' => $data['title'],
                    'level' => $data['level'] ?? $exam->level,
                    'status' => $data['status'],
                    'module_order' => $data['module_order'] ?? $exam->module_order,
                ]);
            } else {
                $exam = $teacher->exams()->create([
                    'title' => $data['title'],
                    'level' => $data['level'] ?? 'A1',
                    'status' => $data['status'],
                    'module_order' => $data['module_order'] ?? ['lesen', 'hoeren', 'schreiben', 'sprechen'],
                ]);
            }

            $moduleOrder = array_flip($data['module_order'] ?? ['lesen', 'hoeren', 'schreiben', 'sprechen']);
            foreach ($data['parts'] ?? [] as $partData) {
                $module = $partData['module'] ?? 'lesen';
                $part = $exam->parts()->create([
                    ...Arr::only($partData, ['module', 'module_position', 'part_number', 'instructions']),
                    'module' => $module,
                    'module_position' => $moduleOrder[$module] ?? 999,
                ]);
                $materials = [];
                $materialsByPosition = [];
                $firstMaterial = null;
                foreach ($partData['reading_materials'] ?? [] as $materialData) {
                    $material = $part->readingMaterials()->create(Arr::only($materialData, ['source', 'title', 'body', 'media_type', 'media_url', 'position']));
                    $firstMaterial ??= $material;
                    $materials[$material->id] = $material;
                    $materialsByPosition[$materialData['position']] = $material;
                    if (! empty($materialData['id'])) {
                        $materials[$materialData['id']] = $material;
                    }
                }
                foreach ($partData['tasks'] ?? [] as $taskData) {
                    $materialId = $taskData['reading_material_id'] ?? null;
                    $materialPosition = $taskData['reading_material_position'] ?? null;
                    if ($materialId === null && $materialPosition !== null) {
                        if (! isset($materialsByPosition[$materialPosition])) {
                            throw ValidationException::withMessages(['parts' => 'Le texte associé à une question est introuvable.']);
                        }
                        $materialId = $materialsByPosition[$materialPosition]->id;
                    }
                    if ($materialId === null && count($partData['reading_materials'] ?? []) === 1) {
                        $materialId = $firstMaterial?->id;
                    }
                    if ($materialId !== null && ! isset($materials[$materialId])) {
                        throw ValidationException::withMessages(['parts' => 'Le support choisi ne fait pas partie de ce Teil.']);
                    }
                    $task = $part->tasks()->create([
                        'reading_material_id' => $materialId === null ? null : $materials[$materialId]->id,
                        'prompt' => $taskData['prompt'],
                        'response_type' => $taskData['response_type'] ?? 'choice',
                        'position' => $taskData['position'],
                    ]);
                    foreach ($taskData['choices'] ?? [] as $choiceData) {
                        $task->choices()->create(Arr::only($choiceData, ['label', 'body', 'is_correct', 'position']));
                    }
                }
            }

            return $exam->refresh();
        });
    }

    /** @param array<int, array<string, mixed>> $parts */
    private function assertChildOwnership(Exam $exam, array $parts): void
    {
        $submitted = [];
        foreach ($parts as $part) {
            foreach (['id'] as $key) {
                if (! empty($part[$key])) {
                    $submitted[] = $part[$key];
                }
            }
            foreach ($part['reading_materials'] ?? [] as $item) {
                if (! empty($item['id'])) {
                    $submitted[] = $item['id'];
                }
            }
            foreach ($part['tasks'] ?? [] as $task) {
                if (! empty($task['id'])) {
                    $submitted[] = $task['id'];
                }
                foreach ($task['choices'] ?? [] as $choice) {
                    if (! empty($choice['id'])) {
                        $submitted[] = $choice['id'];
                    }
                }
            }
        }
        if ($submitted === []) {
            return;
        }

        $owned = $exam->parts()->pluck('id')->all();
        $owned = [...$owned, ...$exam->parts()->with('readingMaterials')->get()->flatMap->readingMaterials->pluck('id')->all()];
        $ownedTasks = ExamTask::query()->whereIn('part_id', $exam->parts()->select('id'))->get();
        $owned = [...$owned, ...$ownedTasks->pluck('id')->all(), ...ExamChoice::query()->whereIn('task_id', $ownedTasks->pluck('id'))->pluck('id')->all()];
        if (array_diff($submitted, $owned) !== []) {
            throw ValidationException::withMessages(['parts' => 'Un élément ne fait pas partie de cet examen.']);
        }
    }
}
