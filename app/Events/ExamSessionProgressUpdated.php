<?php

namespace App\Events;

use App\Models\ExamParticipation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExamSessionProgressUpdated implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @param array<int, array{part_number: int, answered_task_positions: array<int, int>, total_tasks: int}> $progress */
    public function __construct(
        public string $sessionId,
        public string $participationId,
        public string $status,
        public array $progress,
    ) {}

    public static function fromParticipation(ExamParticipation $participation): self
    {
        $participation->loadMissing('examSession.parts.tasks', 'responses.task.part');
        $parts = $participation->examSession->parts;

        return new self(
            $participation->exam_session_id,
            $participation->id,
            $participation->status->value,
            $parts->map(fn ($part): array => [
                'part_number' => (int) $part->part_number,
                'answered_task_positions' => $participation->responses
                    ->filter(fn ($response): bool => $response->task?->part_id === $part->id)
                    ->map(fn ($response): ?int => $response->task?->position === null ? null : (int) $response->task->position)
                    ->filter()
                    ->sort()
                    ->values()
                    ->all(),
                'total_tasks' => $part->tasks->count(),
            ])->all(),
        );
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel("exam-sessions.{$this->sessionId}.teacher")];
    }

    public function broadcastAs(): string
    {
        return 'exam-session.progress-updated';
    }

    /** @return array{session_id: string, participation_id: string, status: string, progress: array<int, array{part_number: int, answered_task_positions: array<int, int>, total_tasks: int}>} */
    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'participation_id' => $this->participationId,
            'status' => $this->status,
            'progress' => $this->progress,
        ];
    }
}
