<?php

namespace Database\Factories;

use App\Models\ExamSessionChoice;
use App\Models\ExamSessionTask;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamSessionChoice> */
class ExamSessionChoiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'task_id' => ExamSessionTask::factory(),
            'source_choice_id' => null,
            'label' => 'A',
            'body' => null,
            'is_correct' => false,
            'position' => 1,
        ];
    }
}
