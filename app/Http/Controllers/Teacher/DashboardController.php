<?php

namespace App\Http\Controllers\Teacher;

use App\Enums\CourseSessionStatus;
use App\Http\Controllers\Controller;
use App\Models\CourseSession;
use App\Support\SessionMetrics;
use App\Support\TeacherDashboardMetrics;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $teacher = auth()->user();

        $activeSessions = $teacher->courseSessions()
            ->with('level:id,code,name')
            ->withCount(['students' => fn ($query) => $query->whereNull('course_session_student.left_at')])
            ->withSum('lessons as total_minutes', 'duration_minutes')
            ->where('status', CourseSessionStatus::Active)
            ->latest('starts_on')
            ->limit(5)
            ->get()
            ->map(fn (CourseSession $session): array => [
                ...$session->only(['id', 'label', 'target_minutes', 'starts_on']),
                'level' => $session->level->only(['id', 'code', 'name']),
                'students_count' => (int) $session->getAttribute('students_count'),
                ...SessionMetrics::fromTotals(
                    (int) $session->getAttribute('total_minutes'),
                    $session->target_minutes,
                    $session->hourly_rate_millimes,
                ),
            ]);

        return Inertia::render('teacher/dashboard', [
            'summary' => TeacherDashboardMetrics::summarize($teacher),
            'activeSessions' => $activeSessions,
            'recentLessons' => TeacherDashboardMetrics::recentLessons($teacher),
        ]);
    }
}
