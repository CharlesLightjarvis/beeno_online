<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseSessionStatus;
use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\TeacherRemuneration;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(): Response
    {
        $teachers = User::query()
            ->role(RoleEnum::Teacher->value)
            ->withCount([
                'courseSessions as active_sessions_count' => fn ($query) => $query->where('status', CourseSessionStatus::Active),
                'courseSessions as completed_sessions_count' => fn ($query) => $query->where('status', CourseSessionStatus::Completed),
            ])
            ->orderBy('name')
            ->get(['id', 'name']);

        $remunerations = TeacherRemuneration::groupedByTeacher($teachers->modelKeys());

        $rows = $teachers->map(fn (User $teacher): array => [
            ...$teacher->only(['id', 'name']),
            'active_sessions_count' => (int) $teacher->getAttribute('active_sessions_count'),
            'completed_sessions_count' => (int) $teacher->getAttribute('completed_sessions_count'),
            'sessions_url' => route('admin.sessions.index', ['teacher_id' => $teacher->id]),
            'lessons_count' => $remunerations->get($teacher->getKey())['lessons_count'] ?? 0,
            'total_minutes' => $remunerations->get($teacher->getKey())['total_minutes'] ?? 0,
            'remuneration_millimes' => $remunerations->get($teacher->getKey())['remuneration_millimes'] ?? 0,
        ]);

        return Inertia::render('admin/teachers/index', [
            'teachers' => $rows,
        ]);
    }
}
