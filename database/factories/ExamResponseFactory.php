<?php

namespace Database\Factories;

use App\Models\ExamParticipation;
use App\Models\ExamResponse;
use App\Models\ExamSessionChoice;
use App\Models\ExamSessionTask;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamResponse> */
class ExamResponseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'participation_id' => ExamParticipation::factory(),
            'task_id' => ExamSessionTask::factory(),
            'choice_id' => ExamSessionChoice::factory(),
            'answered_at' => now(),
        ];
    }
}
