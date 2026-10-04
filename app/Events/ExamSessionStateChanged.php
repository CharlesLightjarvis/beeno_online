<?php

namespace App\Events;

use App\Models\ExamSession;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExamSessionStateChanged implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @param array<array-key, string> $studentIds */
    public function __construct(
        public string $sessionId,
        public string $status,
        public ?string $startedAt,
        public array $studentIds,
    ) {}

    public static function fromSession(ExamSession $session): self
    {
        return new self(
            $session->id,
            $session->status->value,
            $session->started_at?->toISOString(),
            $session->participations()->pluck('student_id')->map(fn ($id): string => (string) $id)->all(),
        );
    }

    public function broadcastOn(): array
    {
        return collect($this->studentIds)
            ->map(fn (string $studentId): PrivateChannel => new PrivateChannel("exam-sessions.{$this->sessionId}.students.{$studentId}"))
            ->all();
    }

    public function broadcastAs(): string
    {
        return 'exam-session.state-changed';
    }

    /** @return array{session_id: string, status: string, started_at: string|null} */
    public function broadcastWith(): array
    {
        return ['session_id' => $this->sessionId, 'status' => $this->status, 'started_at' => $this->startedAt];
    }
}
