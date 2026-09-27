<?php

namespace App\Policies;

use App\Enums\PermissionEnum;
use App\Models\CourseSession;
use App\Models\User;

class CourseSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ManageOwnSessions->value);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo(PermissionEnum::ManageOwnSessions->value);
    }

    public function view(User $user, CourseSession $session): bool
    {
        return $user->isTeacher() && $session->teacher_id === $user->id;
    }

    public function update(User $user, CourseSession $session): bool
    {
        return $this->view($user, $session);
    }
}
