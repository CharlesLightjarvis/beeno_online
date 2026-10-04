<?php

namespace App\Actions\Teacher;

use App\Enums\ExamSessionStatus;
use App\Models\ExamSession;
use Illuminate\Validation\ValidationException;

class CloseExamSession
{
    public function handle(ExamSession $session): ExamSession
    {
        if ($session->status === ExamSessionStatus::Closed) {
            return $session;
        }

        if ($session->status !== ExamSessionStatus::Open) {
            throw ValidationException::withMessages(['session' => 'Seule une session ouverte peut être clôturée.']);
        }

        $session->update(['status' => ExamSessionStatus::Closed, 'closed_at' => now()]);

        return $session->refresh();
    }
}
