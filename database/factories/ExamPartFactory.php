<?php

namespace Database\Factories;

use App\Models\Exam;
use App\Models\ExamPart;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamPart> */
class ExamPartFactory extends Factory
{
    public function definition(): array
    {
        return ['exam_id' => Exam::factory(), 'module' => 'lesen', 'module_position' => 0, 'part_number' => 1, 'instructions' => fake()->sentence()];
    }
}
