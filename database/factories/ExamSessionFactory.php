<?php

namespace Database\Factories;

use App\Enums\ExamSessionStatus;
use App\Models\Exam;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<ExamSession> */
class ExamSessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'exam_id' => Exam::factory(),
            'teacher_id' => User::factory()->teacher(),
            'title' => fake()->sentence(3),
            'access_code' => Str::upper(Str::random(8)),
            'status' => ExamSessionStatus::Scheduled,
            'displayed_material_id' => null,
            'opened_at' => null,
            'closed_at' => null,
        ];
    }
}
