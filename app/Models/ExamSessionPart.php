<?php

namespace App\Models;

use Database\Factories\ExamSessionPartFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['exam_session_id', 'source_part_id', 'part_number', 'instructions'])]
class ExamSessionPart extends Model
{
    /** @use HasFactory<ExamSessionPartFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<ExamSession, $this> */
    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    /** @return HasMany<ExamSessionReadingMaterial, $this> */
    public function readingMaterials(): HasMany
    {
        return $this->hasMany(ExamSessionReadingMaterial::class, 'part_id')->orderBy('position');
    }

    /** @return HasMany<ExamSessionTask, $this> */
    public function tasks(): HasMany
    {
        return $this->hasMany(ExamSessionTask::class, 'part_id')->orderBy('position');
    }
}
