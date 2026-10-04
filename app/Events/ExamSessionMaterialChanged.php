<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ExamSessionMaterialChanged implements ShouldBroadcastNow, ShouldDispatchAfterCommit
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public string $sessionId, public ?string $materialId) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel("exam-sessions.{$this->sessionId}.teacher")];
    }

    public function broadcastAs(): string
    {
        return 'exam-session.material-changed';
    }

    /** @return array{session_id: string, material_id: string|null} */
    public function broadcastWith(): array
    {
        return ['session_id' => $this->sessionId, 'material_id' => $this->materialId];
    }
}
