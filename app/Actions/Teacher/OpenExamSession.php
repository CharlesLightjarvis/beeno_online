<?php

namespace App\Actions\Teacher;

use App\Enums\ExamSessionStatus;
use App\Models\ExamSession;
use Illuminate\Validation\ValidationException;

class OpenExamSession
{
    public function handle(ExamSession $session): ExamSession
    {
        if ($session->status === ExamSessionStatus::Open) {
            return $session;
        }

        if ($session->status !== ExamSessionStatus::Scheduled) {
            throw ValidationException::withMessages(['session' => 'Une session fermée ne peut pas être rouverte.']);
        }

        $session->update(['status' => ExamSessionStatus::Open, 'opened_at' => now()]);

        return $session->refresh();
    }
}
