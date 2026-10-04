<?php

namespace Database\Factories;

use App\Enums\ExamParticipationStatus;
use App\Models\ExamParticipation;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamParticipation> */
class ExamParticipationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'exam_session_id' => ExamSession::factory(),
            'student_id' => User::factory(),
            'status' => ExamParticipationStatus::Pending,
            'joined_at' => null,
            'last_seen_at' => null,
            'completed_at' => null,
        ];
    }
}
