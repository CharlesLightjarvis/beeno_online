<?php

namespace App\Actions\Teacher;

use App\Enums\CourseSessionStatus;
use App\Enums\RoleEnum;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CreateCourseSession
{
    public const HOURLY_RATE_MILLIMES = 20_000;

    /** @param array<int, string> $studentIds */
    public function handle(
        User $teacher,
        CourseLevel $level,
        string $label,
        CarbonInterface $startsOn,
        array $studentIds,
        ?CourseSession $previousSession = null,
    ): CourseSession {
        return DB::transaction(function () use ($teacher, $level, $label, $startsOn, $studentIds, $previousSession): CourseSession {
            $studentIds = array_values(array_unique($studentIds));
            $ownedStudentIds = $teacher->students()
                ->whereNull('archived_at')
                ->role(RoleEnum::Student->value)
                ->whereIn('id', $studentIds)
                ->pluck('id')
                ->all();

            if (count($ownedStudentIds) !== count($studentIds)) {
                throw ValidationException::withMessages([
                    'student_ids' => 'Un ou plusieurs étudiants ne peuvent pas être ajoutés à cette session.',
                ]);
            }

            $session = CourseSession::query()->create([
                'teacher_id' => $teacher->id,
                'course_level_id' => $level->id,
                'previous_session_id' => $previousSession?->id,
                'label' => trim($label),
                'target_minutes' => $level->target_minutes,
                'hourly_rate_millimes' => self::HOURLY_RATE_MILLIMES,
                'starts_on' => $startsOn,
                'completed_at' => null,
                'status' => CourseSessionStatus::Active,
            ]);

            $enrolledAt = now();
            $session->students()->sync(collect($ownedStudentIds)->mapWithKeys(
                fn (string $studentId): array => [$studentId => ['enrolled_at' => $enrolledAt]]
            ));

            return $session->load('students');
        });
    }
}
