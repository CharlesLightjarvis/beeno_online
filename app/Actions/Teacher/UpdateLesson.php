<?php

namespace App\Actions\Teacher;

use App\Enums\AttendanceStatus;
use App\Models\Lesson;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateLesson
{
    /** @param array<string, string> $attendanceByStudent */
    public function handle(
        Lesson $lesson,
        CarbonInterface $heldOn,
        ?string $startsAt,
        int $durationMinutes,
        array $attendanceByStudent,
    ): Lesson {
        return DB::transaction(function () use ($lesson, $heldOn, $startsAt, $durationMinutes, $attendanceByStudent): Lesson {
            $recordedStudentIds = $lesson->attendances()
                ->pluck('student_id')
                ->sort()
                ->values()
                ->all();
            $submittedStudentIds = collect(array_keys($attendanceByStudent))
                ->sort()
                ->values()
                ->all();

            if ($recordedStudentIds !== $submittedStudentIds) {
                throw ValidationException::withMessages([
                    'attendances' => 'La présence doit être renseignée pour tous les étudiants de cette séance.',
                ]);
            }

            $lesson->update([
                'held_on' => $heldOn,
                'starts_at' => $startsAt,
                'duration_minutes' => $durationMinutes,
            ]);

            foreach ($attendanceByStudent as $studentId => $status) {
                $lesson->attendances()
                    ->where('student_id', $studentId)
                    ->update(['status' => AttendanceStatus::from($status)]);
            }

            return $lesson->refresh()->load('attendances.student:id,name');
        });
    }
}
