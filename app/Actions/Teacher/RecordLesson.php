<?php

namespace App\Actions\Teacher;

use App\Enums\AttendanceStatus;
use App\Enums\CourseSessionStatus;
use App\Models\CourseSession;
use App\Models\Lesson;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordLesson
{
    /** @param array<string, string> $attendanceByStudent */
    public function handle(
        CourseSession $session,
        CarbonInterface $heldOn,
        ?string $startsAt,
        int $durationMinutes,
        array $attendanceByStudent,
    ): Lesson {
        return DB::transaction(function () use ($session, $heldOn, $startsAt, $durationMinutes, $attendanceByStudent): Lesson {
            if ($session->status !== CourseSessionStatus::Active) {
                throw ValidationException::withMessages([
                    'session' => 'Cette session est terminée.',
                ]);
            }

            $enrolledIds = $session->students()
                ->wherePivotNull('left_at')
                ->pluck('users.id')
                ->sort()
                ->values()
                ->all();
            $submittedIds = collect(array_keys($attendanceByStudent))->sort()->values()->all();

            if ($enrolledIds !== $submittedIds) {
                throw ValidationException::withMessages([
                    'attendances' => 'La présence doit être renseignée pour tous les étudiants inscrits.',
                ]);
            }

            $lesson = $session->lessons()->create([
                'held_on' => $heldOn,
                'starts_at' => $startsAt,
                'duration_minutes' => $durationMinutes,
            ]);

            $lesson->attendances()->createMany(collect($attendanceByStudent)
                ->map(fn (string $status, string $studentId): array => [
                    'student_id' => $studentId,
                    'status' => AttendanceStatus::from($status),
                ])
                ->values()
                ->all());

            return $lesson->load('attendances');
        });
    }
}
