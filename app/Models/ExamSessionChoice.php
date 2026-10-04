<?php

namespace App\Models;

use Database\Factories\ExamSessionChoiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['task_id', 'source_choice_id', 'label', 'body', 'is_correct', 'position'])]
class ExamSessionChoice extends Model
{
    /** @use HasFactory<ExamSessionChoiceFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<ExamSessionTask, $this> */
    public function task(): BelongsTo
    {
        return $this->belongsTo(ExamSessionTask::class, 'task_id');
    }

    /** @return HasMany<ExamResponse, $this> */
    public function responses(): HasMany
    {
        return $this->hasMany(ExamResponse::class, 'choice_id');
    }

    protected function casts(): array
    {
        return ['is_correct' => 'boolean'];
    }
}
