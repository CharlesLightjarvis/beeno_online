<?php

namespace Database\Factories;

use App\Models\ExamPart;
use App\Models\ExamTask;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamTask> */
class ExamTaskFactory extends Factory
{
    public function definition(): array
    {
        return ['part_id' => ExamPart::factory(), 'reading_material_id' => null, 'prompt' => fake()->sentence(), 'response_type' => 'choice', 'position' => 1];
    }
}
