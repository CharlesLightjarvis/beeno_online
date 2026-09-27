<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function view(User $user, User $student): bool
    {
        return $this->ownsStudent($user, $student);
    }

    public function update(User $user, User $student): bool
    {
        return $this->ownsStudent($user, $student);
    }

    public function delete(User $user, User $student): bool
    {
        return $this->ownsStudent($user, $student);
    }

    private function ownsStudent(User $user, User $student): bool
    {
        return $user->isTeacher()
            && $student->isStudent()
            && $student->teacher_id === $user->id;
    }
}
