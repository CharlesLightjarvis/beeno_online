<?php

namespace App\Support;

use App\Models\CourseSession;
use App\Models\CourseSessionPayment;
use Illuminate\Support\Carbon;

/**
 * Builds a salary row from a completed session. Canonical units stay minutes
 * and millimes; the rounding matches SessionMetrics and AdminSessionMetrics
 * so every reporting agrees on the same amounts.
 */
class SalaryRow
{
    public static function salaryMillimes(int $totalMinutes, int $hourlyRateMillimes): int
    {
        return intdiv($totalMinutes * $hourlyRateMillimes + 30, 60);
    }

    /**
     * @return array{
     *     id: string,
     *     label: string,
     *     completed_at: string|null,
     *     lessons_count: int,
     *     total_minutes: int,
     *     hourly_rate_millimes: int,
     *     salary_millimes: int,
     *     paid_millimes: int,
     *     remaining_millimes: int,
     *     payments: list<array{id: string, amount_millimes: int, paid_on: string}>,
     *     payment_status: string,
     * }
     */
    public static function from(CourseSession $session): array
    {
        $totalMinutes = (int) ($session->getAttribute('total_minutes') ?? 0);
        $completedAt = $session->completed_at;
        $salaryMillimes = self::salaryMillimes($totalMinutes, $session->hourly_rate_millimes);
        $paidMillimes = $session->relationLoaded('payments')
            ? (int) $session->payments->sum('amount_millimes')
            : $session->paid_millimes;

        return [
            'id' => $session->getKey(),
            'label' => $session->label,
            'completed_at' => $completedAt !== null
                ? Carbon::parse((string) $completedAt)->toDateString()
                : null,
            'lessons_count' => (int) ($session->getAttribute('lessons_count') ?? 0),
            'total_minutes' => $totalMinutes,
            'hourly_rate_millimes' => $session->hourly_rate_millimes,
            'salary_millimes' => $salaryMillimes,
            'paid_millimes' => $paidMillimes,
            'remaining_millimes' => max(0, $salaryMillimes - $paidMillimes),
            'payments' => $session->payments
                ->map(fn (CourseSessionPayment $payment) => [
                    'id' => $payment->getKey(),
                    'amount_millimes' => $payment->amount_millimes,
                    'paid_on' => $payment->paid_on->toDateString(),
                ])
                ->all(),
            'payment_status' => $session->payment_status->value,
        ];
    }
}
