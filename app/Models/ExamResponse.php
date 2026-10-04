<?php

namespace App\Models;

use Database\Factories\ExamResponseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['participation_id', 'task_id', 'choice_id', 'answered_at'])]
class ExamResponse extends Model
{
    /** @use HasFactory<ExamResponseFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<ExamParticipation, $this> */
    public function participation(): BelongsTo
    {
        return $this->belongsTo(ExamParticipation::class, 'participation_id');
    }

    /** @return BelongsTo<ExamSessionTask, $this> */
    public function task(): BelongsTo
    {
        return $this->belongsTo(ExamSessionTask::class, 'task_id');
    }

    /** @return BelongsTo<ExamSessionChoice, $this> */
    public function choice(): BelongsTo
    {
        return $this->belongsTo(ExamSessionChoice::class, 'choice_id');
    }

    protected function casts(): array
    {
        return ['answered_at' => 'datetime'];
    }
}
