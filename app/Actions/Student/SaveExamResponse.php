<?php

namespace App\Actions\Student;

use App\Enums\ExamParticipationStatus;
use App\Enums\ExamSessionStatus;
use App\Models\ExamParticipation;
use App\Models\ExamResponse;
use App\Models\ExamSessionChoice;
use App\Models\ExamSessionTask;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaveExamResponse
{
    public function handle(ExamParticipation $participation, string $taskId, string $choiceId): ExamResponse
    {
        return DB::transaction(function () use ($participation, $taskId, $choiceId): ExamResponse {
            $lockedParticipation = ExamParticipation::query()
                ->whereKey($participation->id)
                ->lockForUpdate()
                ->with('examSession')
                ->firstOrFail();

            if ($lockedParticipation->status === ExamParticipationStatus::Completed
                || $lockedParticipation->completed_at !== null
                || $lockedParticipation->examSession->started_at === null
                || $lockedParticipation->examSession->status !== ExamSessionStatus::Open) {
                throw ValidationException::withMessages(['response' => 'Cette session n’accepte plus de réponses.']);
            }

            $task = ExamSessionTask::query()
                ->whereKey($taskId)
                ->whereHas('part', fn ($query) => $query->where('exam_session_id', $lockedParticipation->exam_session_id))
                ->first();
            $choice = ExamSessionChoice::query()->whereKey($choiceId)->where('task_id', $taskId)->first();

            if (! $task || ! $choice) {
                throw ValidationException::withMessages(['choice_id' => 'Ce choix ne correspond pas à cette question.']);
            }

            $response = ExamResponse::query()->updateOrCreate(
                ['participation_id' => $lockedParticipation->id, 'task_id' => $task->id],
                ['choice_id' => $choice->id, 'answered_at' => now()],
            );
            $lockedParticipation->update([
                'status' => ExamParticipationStatus::InProgress,
                'last_seen_at' => now(),
            ]);

            return $response->refresh();
        });
    }
}
