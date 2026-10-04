<?php

namespace App\Models;

use Database\Factories\ExamSessionTaskFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['part_id', 'reading_material_id', 'source_task_id', 'prompt', 'position'])]
class ExamSessionTask extends Model
{
    /** @use HasFactory<ExamSessionTaskFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<ExamSessionPart, $this> */
    public function part(): BelongsTo
    {
        return $this->belongsTo(ExamSessionPart::class, 'part_id');
    }

    /** @return BelongsTo<ExamSessionReadingMaterial, $this> */
    public function readingMaterial(): BelongsTo
    {
        return $this->belongsTo(ExamSessionReadingMaterial::class, 'reading_material_id');
    }

    /** @return HasMany<ExamSessionChoice, $this> */
    public function choices(): HasMany
    {
        return $this->hasMany(ExamSessionChoice::class, 'task_id')->orderBy('position');
    }

    /** @return HasMany<ExamResponse, $this> */
    public function responses(): HasMany
    {
        return $this->hasMany(ExamResponse::class, 'task_id');
    }
}
