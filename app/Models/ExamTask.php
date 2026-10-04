<?php

namespace App\Models;

use Database\Factories\ExamTaskFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['part_id', 'reading_material_id', 'prompt', 'position'])]
class ExamTask extends Model
{
    /** @use HasFactory<ExamTaskFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<ExamPart, $this> */
    public function part(): BelongsTo
    {
        return $this->belongsTo(ExamPart::class, 'part_id');
    }

    /** @return BelongsTo<ExamReadingMaterial, $this> */
    public function readingMaterial(): BelongsTo
    {
        return $this->belongsTo(ExamReadingMaterial::class, 'reading_material_id');
    }

    /** @return HasMany<ExamChoice, $this> */
    public function choices(): HasMany
    {
        return $this->hasMany(ExamChoice::class, 'task_id')->orderBy('position');
    }
}
