<?php

namespace App\Actions\Teacher;

use App\Enums\ExamSessionStatus;
use App\Models\ExamSession;
use Illuminate\Validation\ValidationException;

class AdvanceExamSessionModule
{
    public function handle(ExamSession $session): ExamSession
    {
        if ($session->status !== ExamSessionStatus::Open || $session->started_at === null) {
            throw ValidationException::withMessages(['session' => 'La session doit être démarrée avant de changer de module.']);
        }

        $session->load('parts');
        $modules = $session->parts->sortBy('module_position')->unique('module')->values();
        $current = $session->active_module ?? $modules->first()?->module;
        $currentIndex = $modules->search(fn ($part): bool => $part->module === $current);
        $next = $currentIndex === false ? null : $modules->get($currentIndex + 1);

        if ($next !== null) {
            $session->update(['active_module' => $next->module]);
        }

        return $session->refresh();
    }
}
