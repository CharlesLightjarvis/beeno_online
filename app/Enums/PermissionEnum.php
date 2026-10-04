<?php

declare(strict_types=1);

namespace App\Enums;

enum PermissionEnum: string
{
    // Administration
    case ViewAdminDashboard = 'view.admin-dashboard';
    case ViewAdminSessions = 'view.admin-sessions';
    case ViewAdminTeachers = 'view.admin-teachers';
    case ViewAdminSalaries = 'view.admin-salaries';
    case ViewTrainingDashboard = 'view.training-dashboard';

    // Professeur
    case ViewTeacherDashboard = 'view.teacher-dashboard';
    case ViewOwnSalaries = 'view.own-salaries';
    case ManageOwnStudents = 'manage.own-students';
    case ManageOwnSessions = 'manage.own-sessions';
    case ManageOwnExams = 'manage.own-exams';
    case ManageOwnExamSessions = 'manage.own-exam-sessions';
    case ViewOwnExamSessions = 'view.own-exam-sessions';

    // Étudiant
    case ViewStudentDashboard = 'view.student-dashboard';
}
