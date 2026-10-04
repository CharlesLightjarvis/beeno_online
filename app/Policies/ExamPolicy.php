<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ManageOwnExams->value);
    }

    public function create(User $user): bool
    {
        return $this->viewAny($user);
    }

    public function view(User $user, Exam $exam): bool
    {
        return $user->isTeacher() && $exam->teacher_id === $user->id;
    }

    public function update(User $user, Exam $exam): bool
    {
        return $this->view($user, $exam);
    }

    public function delete(User $user, Exam $exam): bool
    {
        return $this->update($user, $exam);
    }
}
