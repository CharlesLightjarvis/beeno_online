<?php

namespace App\Actions\Teacher;

use App\Enums\RoleEnum;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateStudent
{
    public function handle(User $teacher, string $name, string $email): User
    {
        return DB::transaction(function () use ($teacher, $name, $email): User {
            $student = User::query()->create([
                'name' => trim($name),
                'email' => mb_strtolower(trim($email)),
                'password' => self::defaultPassword($name),
                'teacher_id' => $teacher->id,
            ]);

            $student->syncRoles([RoleEnum::Student->value]);

            return $student;
        });
    }

    public static function defaultPassword(string $name): string
    {
        $namePart = Str::of($name)->ascii()->lower()->replaceMatches('/[^a-z0-9]/', '')->value();

        return 'Beeno'.($namePart !== '' ? $namePart : 'etudiant').'1@';
    }
}
