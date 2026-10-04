<?php

namespace App\Policies;

use App\Enums\ExamSessionStatus;
use App\Enums\PermissionEnum;
use App\Models\ExamSession;
use App\Models\User;

class ExamSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ManageOwnExamSessions->value);
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function view(User $user, ExamSession $examSession): bool
    {
        return $user->isTeacher() && $examSession->teacher_id === $user->id;
    }

    public function open(User $user, ExamSession $examSession): bool
    {
        return $this->view($user, $examSession) && $examSession->status === ExamSessionStatus::Scheduled;
    }

    public function close(User $user, ExamSession $examSession): bool
    {
        return $this->view($user, $examSession) && $examSession->status === ExamSessionStatus::Open;
    }
}
