<?php

namespace App\Support;

use App\Enums\CourseSessionStatus;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Aggregates the dashboard figures of one teacher from their own sessions.
 *
 * Canonical units stay minutes and millimes. The per-session rounding matches
 * SessionMetrics::from and AdminSessionMetrics::fromLoaded so every reporting
 * always agrees on the same numbers.
 */
class TeacherDashboardMetrics
{
    /**
     * @return array{
     *     active_sessions: int,
     *     completed_sessions: int,
     *     lessons_count: int,
     *     total_minutes: int,
     *     remuneration_millimes: int,
     * }
     */
    public static function summarize(User $teacher): array
    {
        $sessionRows = $teacher->courseSessions()
            ->toBase()
            ->get(['id', 'status', 'hourly_rate_millimes']);

        $lessonRows = Lesson::query()
            ->whereIn('course_session_id', $sessionRows->pluck('id'))
            ->groupBy('course_session_id')
            ->toBase()
            ->get([
                'lessons.course_session_id',
                DB::raw('count(*) as lessons_count'),
                DB::raw('sum(lessons.duration_minutes) as total_minutes'),
            ]);

        $rateBySessionId = $sessionRows->pluck('hourly_rate_millimes', 'id');

        return [
            'active_sessions' => $sessionRows->where('status', CourseSessionStatus::Active->value)->count(),
            'completed_sessions' => $sessionRows->where('status', CourseSessionStatus::Completed->value)->count(),
            'lessons_count' => (int) $lessonRows->sum('lessons_count'),
            'total_minutes' => (int) $lessonRows->sum('total_minutes'),
            'remuneration_millimes' => (int) $lessonRows->sum(
                fn (object $row): int => intdiv(
                    (int) $row->total_minutes * (int) ($rateBySessionId[$row->course_session_id] ?? 0) + 30,
                    60,
                ),
            ),
        ];
    }

    /**
     * The most recent lessons across all the teacher's sessions.
     *
     * @return array<int, array{id: string, held_on: string, starts_at: string|null, duration_minutes: int, session_id: string, session_label: string}>
     */
    public static function recentLessons(User $teacher, int $limit = 5): array
    {
        $rows = Lesson::query()
            ->join('course_sessions', 'course_sessions.id', '=', 'lessons.course_session_id')
            ->where('course_sessions.teacher_id', $teacher->getKey())
            ->latest('lessons.held_on')
            ->latest('lessons.created_at')
            ->limit($limit)
            ->toBase()
            ->get([
                'lessons.id',
                'lessons.held_on',
                'lessons.starts_at',
                'lessons.duration_minutes',
                'lessons.course_session_id as session_id',
                'course_sessions.label as session_label',
            ]);

        $lessons = [];

        foreach ($rows as $row) {
            $lessons[] = self::mapLessonRow((array) $row);
        }

        return $lessons;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array{id: string, held_on: string, starts_at: string|null, duration_minutes: int, session_id: string, session_label: string}
     */
    private static function mapLessonRow(array $row): array
    {
        return [
            'id' => (string) $row['id'],
            'held_on' => Carbon::parse((string) $row['held_on'])->toDateString(),
            'starts_at' => $row['starts_at'] !== null ? (string) substr((string) $row['starts_at'], 0, 5) : null,
            'duration_minutes' => (int) $row['duration_minutes'],
            'session_id' => (string) $row['session_id'],
            'session_label' => (string) $row['session_label'],
        ];
    }
}
