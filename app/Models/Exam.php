<?php

namespace App\Models;

use App\Enums\ExamStatus;
use Database\Factories\ExamFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/** @property ExamStatus $status */
#[Fillable(['teacher_id', 'title', 'level', 'status'])]
class Exam extends Model
{
    /** @use HasFactory<ExamFactory> */
    use HasFactory, HasUuids, SoftDeletes;

    /** @return BelongsTo<User, $this> */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /** @return HasMany<ExamPart, $this> */
    public function parts(): HasMany
    {
        return $this->hasMany(ExamPart::class)->orderBy('part_number');
    }

    /** @return HasMany<ExamSession, $this> */
    public function sessions(): HasMany
    {
        return $this->hasMany(ExamSession::class);
    }

    protected function casts(): array
    {
        return ['status' => ExamStatus::class];
    }
}
