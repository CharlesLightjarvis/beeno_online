<?php

namespace App\Actions\Teacher;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateStudent
{
    public function handle(User $teacher, string $name): User
    {
        return DB::transaction(function () use ($teacher, $name): User {
            $student = User::query()->create([
                'name' => trim($name),
                'email' => null,
                'password' => null,
                'teacher_id' => $teacher->id,
            ]);

            $student->syncRoles([RoleEnum::Student->value]);

            return $student;
        });
    }
}
