<?php

namespace App\Actions\Student;

use App\Enums\ExamSessionStatus;
use App\Models\ExamParticipation;
use App\Models\ExamSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class JoinExamSession
{
    public function handle(User $student, string $code): ExamParticipation
    {
        $normalizedCode = strtoupper(trim($code));

        return DB::transaction(function () use ($student, $normalizedCode): ExamParticipation {
            $session = ExamSession::query()
                ->where('access_code', $normalizedCode)
                ->where('status', ExamSessionStatus::Open->value)
                ->lockForUpdate()
                ->first();
            $participation = $session?->participations()->where('student_id', $student->id)->lockForUpdate()->first();

            if (! $participation) {
                throw ValidationException::withMessages(['code' => 'Ce code est invalide, la session n’est pas ouverte ou elle ne vous a pas été attribuée. Vérifiez le code auprès de votre professeur.']);
            }

            if ($participation->completed_at !== null) {
                return $participation;
            }

            $participation->update([
                'joined_at' => $participation->joined_at ?? now(),
                'last_seen_at' => now(),
            ]);

            return $participation->refresh();
        });
    }
}
