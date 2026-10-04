<?php

namespace Database\Factories;

use App\Enums\ExamStatus;
use App\Models\Exam;
use App\Models\ExamChoice;
use App\Models\ExamPart;
use App\Models\ExamReadingMaterial;
use App\Models\ExamTask;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Exam> */
class ExamFactory extends Factory
{
    public function definition(): array
    {
        return [
            'teacher_id' => User::factory(),
            'title' => 'TELC Deutsch A1 – Lesen',
            'level' => 'A1',
            'module_order' => ['lesen', 'hoeren', 'schreiben', 'sprechen'],
            'status' => ExamStatus::Draft,
        ];
    }

    public function complete(): static
    {
        return $this->afterCreating(function (Exam $exam): void {
            foreach ([1, 2, 3] as $partNumber) {
                $part = ExamPart::factory()->for($exam)->create([
                    'part_number' => $partNumber,
                    'instructions' => $partNumber === 2 ? 'Welche Anzeige ist interessant für Sie? Kreuzen Sie an: a oder b.' : 'Kreuzen Sie an: richtig oder falsch.',
                ]);

                $material = ExamReadingMaterial::factory()->for($part, 'part')->create(['position' => 1]);

                foreach (range(1, 5) as $position) {
                    $task = ExamTask::factory()->for($part, 'part')->for($material, 'readingMaterial')->create(['position' => $position]);
                    $labels = $partNumber === 2 ? ['A', 'B'] : ['richtig', 'falsch'];

                    foreach ($labels as $choicePosition => $label) {
                        ExamChoice::factory()->for($task, 'task')->create([
                            'label' => $label,
                            'body' => $partNumber === 2 ? "Inhalt der Anzeige {$label}" : null,
                            'is_correct' => $choicePosition === 0,
                            'position' => $choicePosition + 1,
                        ]);
                    }
                }
            }
        });
    }
}
