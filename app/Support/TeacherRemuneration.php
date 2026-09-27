<?php

namespace App\Support;

use App\Models\Lesson;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Aggregates the remuneration of teachers from the lessons really taught.
 *
 * Canonical units stay minutes and millimes, exactly like AdminSessionMetrics.
 * The per-session rounding matches AdminSessionMetrics::fromLoaded so both
 * reportings always agree on the same numbers.
 */
class TeacherRemuneration
{
    /**
     * @param  array<int, string>  $teacherIds
     * @return Collection<string, array{lessons_count: int, total_minutes: int, remuneration_millimes: int}>
     */
    public static function groupedByTeacher(array $teacherIds): Collection
    {
        if ($teacherIds === []) {
            return collect();
        }

        $rows = Lesson::query()
            ->join('course_sessions', 'course_sessions.id', '=', 'lessons.course_session_id')
            ->whereIn('course_sessions.teacher_id', $teacherIds)
            ->groupBy('course_sessions.teacher_id', 'lessons.course_session_id', 'course_sessions.hourly_rate_millimes')
            ->toBase()
            ->get([
                'course_sessions.teacher_id',
                'lessons.course_session_id',
                'course_sessions.hourly_rate_millimes',
                DB::raw('count(*) as lessons_count'),
                DB::raw('sum(lessons.duration_minutes) as total_minutes'),
            ]);

        return $rows
            ->groupBy('teacher_id')
            ->mapWithKeys(fn ($teacherRows, $teacherId): array => [
                (string) $teacherId => [
                    'lessons_count' => (int) $teacherRows->sum('lessons_count'),
                    'total_minutes' => (int) $teacherRows->sum('total_minutes'),
                    'remuneration_millimes' => (int) $teacherRows->sum(
                        fn (object $row): int => intdiv(
                            (int) $row->total_minutes * (int) $row->hourly_rate_millimes + 30,
                            60,
                        ),
                    ),
                ],
            ]);
    }

    /** @return array{lessons_count: int, total_minutes: int, remuneration_millimes: int} */
    public static function sums(string $teacherId): array
    {
        return static::groupedByTeacher([$teacherId])
            ->get($teacherId, ['lessons_count' => 0, 'total_minutes' => 0, 'remuneration_millimes' => 0]);
    }
}
