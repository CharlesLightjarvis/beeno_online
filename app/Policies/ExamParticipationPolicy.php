<?php

namespace App\Policies;

use App\Enums\ExamSessionStatus;
use App\Models\ExamParticipation;
use App\Models\User;

class ExamParticipationPolicy
{
    public function view(User $user, ExamParticipation $participation): bool
    {
        return $user->isStudent()
            && $participation->student_id === $user->id
            && $participation->joined_at !== null;
    }

    public function update(User $user, ExamParticipation $participation): bool
    {
        return $this->view($user, $participation)
            && $participation->completed_at === null
            && $participation->examSession?->started_at !== null
            && $participation->examSession?->status === ExamSessionStatus::Open;
    }

    public function access(User $user, ExamParticipation $participation): bool
    {
        return $user->isStudent()
            && $participation->student_id === $user->id
            && $participation->examSession?->status === ExamSessionStatus::Open;
    }
}
