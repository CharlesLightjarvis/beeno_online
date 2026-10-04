<?php

namespace Database\Factories;

use App\Models\ExamSessionPart;
use App\Models\ExamSessionTask;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamSessionTask> */
class ExamSessionTaskFactory extends Factory
{
    public function definition(): array
    {
        return [
            'part_id' => ExamSessionPart::factory(),
            'reading_material_id' => null,
            'source_task_id' => null,
            'prompt' => fake()->sentence(),
            'position' => 1,
        ];
    }
}
