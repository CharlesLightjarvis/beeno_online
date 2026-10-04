<?php

namespace App\Actions\Teacher;

use App\Enums\ExamSessionStatus;
use App\Models\ExamSession;
use Illuminate\Validation\ValidationException;

class SetExamSessionDisplayMaterial
{
    public function handle(ExamSession $session, string $materialId): ExamSession
    {
        if ($session->status === ExamSessionStatus::Closed) {
            throw ValidationException::withMessages([
                'displayed_material_id' => 'Une session clôturée ne peut plus changer de texte.',
            ]);
        }

        $materialBelongsToSession = $session->parts()
            ->whereHas('readingMaterials', fn ($query) => $query->whereKey($materialId))
            ->exists();

        if (! $materialBelongsToSession) {
            throw ValidationException::withMessages([
                'displayed_material_id' => 'Ce texte ne fait pas partie de cette session.',
            ]);
        }

        $session->update(['displayed_material_id' => $materialId]);

        return $session->refresh();
    }
}
