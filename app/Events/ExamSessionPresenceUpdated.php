<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExamSessionPresenceUpdated implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $sessionId,
        public string $studentId,
        public string $lastSeenAt,
    ) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("exam-sessions.{$this->sessionId}.teacher")];
    }

    public function broadcastAs(): string
    {
        return 'exam-session.presence-updated';
    }

    /** @return array{session_id: string, student_id: string, last_seen_at: string} */
    public function broadcastWith(): array
    {
        return [
            'session_id' => $this->sessionId,
            'student_id' => $this->studentId,
            'last_seen_at' => $this->lastSeenAt,
        ];
    }
}
