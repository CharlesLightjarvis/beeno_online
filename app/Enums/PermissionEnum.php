<?php

declare(strict_types=1);

namespace App\Enums;

enum PermissionEnum: string
{
    // Administration
    case ViewAdminDashboard = 'view.admin-dashboard';
    case ViewAdminSessions = 'view.admin-sessions';
    case ViewAdminTeachers = 'view.admin-teachers';
    case ViewTrainingDashboard = 'view.training-dashboard';

    // Professeur
    case ViewTeacherDashboard = 'view.teacher-dashboard';
    case ManageOwnStudents = 'manage.own-students';
    case ManageOwnSessions = 'manage.own-sessions';
}
