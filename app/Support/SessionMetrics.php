<?php

namespace App\Support;

use App\Models\CourseSession;

class SessionMetrics
{
    /** @return array{total_minutes: int, progress_percent: float, remuneration_millimes: int} */
    public static function from(CourseSession $session): array
    {
        return self::fromTotals(
            (int) $session->lessons()->sum('duration_minutes'),
            $session->target_minutes,
            $session->hourly_rate_millimes,
        );
    }

    /**
     * Computes the metrics from pre-fetched totals, so callers aggregating
     * several sessions in one query avoid a query per session.
     *
     * @return array{total_minutes: int, progress_percent: float, remuneration_millimes: int}
     */
    public static function fromTotals(int $totalMinutes, int $targetMinutes, int $hourlyRateMillimes): array
    {
        $progress = $targetMinutes > 0
            ? round($totalMinutes * 100 / $targetMinutes, 1)
            : 0.0;

        return [
            'total_minutes' => $totalMinutes,
            'progress_percent' => $progress,
            'remuneration_millimes' => intdiv($totalMinutes * $hourlyRateMillimes + 30, 60),
        ];
    }
}
