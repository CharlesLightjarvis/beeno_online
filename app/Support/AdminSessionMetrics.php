<?php

namespace App\Support;

use App\Models\CourseSession;
use Illuminate\Database\Eloquent\Builder;

class AdminSessionMetrics
{
    /**
     * @param  Builder<CourseSession>  $query
     * @return Builder<CourseSession>
     */
    public static function query(Builder $query): Builder
    {
        return $query->withSum('lessons as total_minutes', 'duration_minutes');
    }

    /** @return array{total_minutes: int, progress_percent: float, remuneration_millimes: int} */
    public static function fromLoaded(CourseSession $session): array
    {
        $totalMinutes = (int) ($session->getAttribute('total_minutes') ?? 0);
        $progress = $session->target_minutes > 0
            ? round($totalMinutes * 100 / $session->target_minutes, 1)
            : 0.0;

        return [
            'total_minutes' => $totalMinutes,
            'progress_percent' => $progress,
            'remuneration_millimes' => intdiv(
                $totalMinutes * $session->hourly_rate_millimes + 30,
                60,
            ),
        ];
    }
}
