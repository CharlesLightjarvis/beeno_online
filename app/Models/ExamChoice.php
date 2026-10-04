<?php

namespace App\Models;

use Database\Factories\ExamChoiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['task_id', 'label', 'body', 'is_correct', 'position'])]
class ExamChoice extends Model
{
    /** @use HasFactory<ExamChoiceFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<ExamTask, $this> */
    public function task(): BelongsTo
    {
        return $this->belongsTo(ExamTask::class, 'task_id');
    }

    protected function casts(): array
    {
        return ['is_correct' => 'boolean'];
    }
}
