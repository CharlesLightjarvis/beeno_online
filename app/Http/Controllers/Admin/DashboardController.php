<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CourseSessionStatus;
use App\Http\Controllers\Controller;
use App\Models\CourseSession;
use App\Support\AdminSessionMetrics;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $sessions = AdminSessionMetrics::query(CourseSession::query())
            ->get(['id', 'status', 'target_minutes', 'hourly_rate_millimes']);
        $recentSessions = AdminSessionMetrics::query(CourseSession::query())
            ->with(['teacher:id,name', 'level:id,code,name'])
            ->latest('updated_at')
            ->limit(5)
            ->get([
                'id', 'teacher_id', 'course_level_id', 'label', 'status',
                'target_minutes', 'hourly_rate_millimes', 'updated_at',
            ])
            ->map(fn (CourseSession $session): array => [
                ...$session->only(['id', 'label', 'status', 'updated_at']),
                'teacher' => $session->teacher->only(['id', 'name']),
                'level' => $session->level->only(['id', 'code', 'name']),
                ...AdminSessionMetrics::fromLoaded($session),
            ]);

        return Inertia::render('admin/dashboard', [
            'summary' => [
                'active_sessions' => $sessions->where('status', CourseSessionStatus::Active)->count(),
                'completed_sessions' => $sessions->where('status', CourseSessionStatus::Completed)->count(),
                'total_minutes' => $sessions->sum(
                    fn (CourseSession $session): int => AdminSessionMetrics::fromLoaded($session)['total_minutes'],
                ),
                'remuneration_millimes' => $sessions->sum(
                    fn (CourseSession $session): int => AdminSessionMetrics::fromLoaded($session)['remuneration_millimes'],
                ),
            ],
            'recentSessions' => $recentSessions,
        ]);
    }
}
