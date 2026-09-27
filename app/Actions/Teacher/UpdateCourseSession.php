<?php

namespace App\Actions\Teacher;

use App\Enums\RoleEnum;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateCourseSession
{
    /** @param array<int, string> $studentIds */
    public function handle(CourseSession $session, CourseLevel $level, string $label, string $startsOn, array $studentIds): CourseSession
    {
        return DB::transaction(function () use ($session, $level, $label, $startsOn, $studentIds): CourseSession {
            $studentIds = array_values(array_unique($studentIds));
            $validIds = $session->teacher->students()->whereNull('archived_at')
                ->role(RoleEnum::Student->value)->whereIn('id', $studentIds)->pluck('id')->all();
            if (count($validIds) !== count($studentIds)) {
                throw ValidationException::withMessages(['student_ids' => 'Sélection d’étudiants invalide.']);
            }

            $session->update([
                'course_level_id' => $level->id,
                'label' => trim($label),
                'starts_on' => $startsOn,
                'target_minutes' => $level->target_minutes,
            ]);

            $activeIds = $session->students()->wherePivotNull('left_at')->pluck('users.id')->all();
            foreach (array_diff($activeIds, $validIds) as $removedId) {
                $hasHistory = $session->lessons()->whereHas('attendances', fn ($query) => $query->where('student_id', $removedId))->exists();
                $hasHistory
                    ? $session->students()->updateExistingPivot($removedId, ['left_at' => now()])
                    : $session->students()->detach($removedId);
            }
            foreach ($validIds as $studentId) {
                $session->students()->syncWithoutDetaching([$studentId => ['enrolled_at' => now(), 'left_at' => null]]);
            }

            return $session->refresh();
        });
    }
}
