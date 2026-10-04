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
    public function handle(ExamParticipation $participation, string $taskId, ?string $choiceId = null, ?string $answerText = null): ExamResponse
    {
        return DB::transaction(function () use ($participation, $taskId, $choiceId, $answerText): ExamResponse {
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
            if (! $task) {
                throw ValidationException::withMessages(['task_id' => 'Cette question ne correspond pas à cette session.']);
            }

            if ($task->response_type === 'text') {
                if ($answerText === null || trim($answerText) === '') {
                    throw ValidationException::withMessages(['answer_text' => 'Saisissez une réponse.']);
                }
            } else {
                $choice = ExamSessionChoice::query()->whereKey($choiceId)->where('task_id', $taskId)->first();
                if (! $choice) {
                    throw ValidationException::withMessages(['choice_id' => 'Ce choix ne correspond pas à cette question.']);
                }
            }

            if ($task->response_type !== 'text' && ! $choiceId) {
                throw ValidationException::withMessages(['choice_id' => 'Ce choix ne correspond pas à cette question.']);
            }

            $response = ExamResponse::query()->updateOrCreate(
                ['participation_id' => $lockedParticipation->id, 'task_id' => $task->id],
                ['choice_id' => $choiceId, 'answer_text' => $answerText, 'answered_at' => now()],
            );
            $lockedParticipation->update([
                'status' => ExamParticipationStatus::InProgress,
                'last_seen_at' => now(),
            ]);

            return $response->refresh();
        });
    }
}
