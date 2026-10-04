<?php

namespace Database\Factories;

use App\Models\ExamSession;
use App\Models\ExamSessionPart;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamSessionPart> */
class ExamSessionPartFactory extends Factory
{
    public function definition(): array
    {
        return [
            'exam_session_id' => ExamSession::factory(),
            'source_part_id' => null,
            'part_number' => 1,
            'instructions' => fake()->sentence(),
        ];
    }
}
