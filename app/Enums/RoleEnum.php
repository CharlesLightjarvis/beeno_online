<?php

declare(strict_types=1);

namespace App\Enums;

enum RoleEnum: string
{
    case Admin = 'admin';
    case Teacher = 'teacher';
    case Student = 'student';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrateur',
            self::Teacher => 'Professeur',
            self::Student => 'Étudiant',
        };
    }

    /**
     * @return array<int, PermissionEnum>
     */
    public function permissions(): array
    {
        return match ($this) {
            self::Admin => [
                PermissionEnum::ViewAdminDashboard,
                PermissionEnum::ViewAdminSessions,
                PermissionEnum::ViewAdminTeachers,
                PermissionEnum::ViewTrainingDashboard,
            ],

            self::Teacher => [
                PermissionEnum::ViewTeacherDashboard,
                PermissionEnum::ManageOwnStudents,
                PermissionEnum::ManageOwnSessions,
            ],

            self::Student => [],
        };
    }

    /** @return array<int, self> */
    public static function activeCases(): array
    {
        return [self::Admin, self::Teacher, self::Student];
    }
}
