<?php

namespace App\Models;

use Database\Factories\ExamPartFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['exam_id', 'module', 'module_position', 'part_number', 'instructions'])]
class ExamPart extends Model
{
    /** @use HasFactory<ExamPartFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<Exam, $this> */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    /** @return HasMany<ExamReadingMaterial, $this> */
    public function readingMaterials(): HasMany
    {
        return $this->hasMany(ExamReadingMaterial::class, 'part_id')->orderBy('position');
    }

    /** @return HasMany<ExamTask, $this> */
    public function tasks(): HasMany
    {
        return $this->hasMany(ExamTask::class, 'part_id')->orderBy('position');
    }
}
