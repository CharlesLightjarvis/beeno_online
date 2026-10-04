<?php

namespace App\Actions\Student;

use App\Enums\ExamParticipationStatus;
use App\Enums\ExamSessionStatus;
use App\Models\ExamParticipation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class FinishExamParticipation
{
    public function handle(ExamParticipation $participation): ExamParticipation
    {
        return DB::transaction(function () use ($participation): ExamParticipation {
            $locked = ExamParticipation::query()
                ->whereKey($participation->id)
                ->lockForUpdate()
                ->with('examSession')
                ->firstOrFail();

            if ($locked->status === ExamParticipationStatus::Completed) {
                return $locked;
            }

            if ($locked->examSession->started_at === null || $locked->examSession->status !== ExamSessionStatus::Open) {
                throw ValidationException::withMessages(['participation' => 'La session est clôturée.']);
            }

            $locked->update([
                'status' => ExamParticipationStatus::Completed,
                'completed_at' => now(),
            ]);

            return $locked->refresh();
        });
    }
}
