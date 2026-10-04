<?php

namespace App\Models;

use App\Enums\ExamSessionStatus;
use Database\Factories\ExamSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** @property ExamSessionStatus $status */
#[Fillable(['exam_id', 'teacher_id', 'title', 'access_code', 'status', 'displayed_material_id', 'opened_at', 'started_at', 'closed_at'])]
class ExamSession extends Model
{
    /** @use HasFactory<ExamSessionFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<Exam, $this> */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    /** @return BelongsTo<User, $this> */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /** @return HasMany<ExamSessionPart, $this> */
    public function parts(): HasMany
    {
        return $this->hasMany(ExamSessionPart::class)->orderBy('part_number');
    }

    /** @return HasMany<ExamParticipation, $this> */
    public function participations(): HasMany
    {
        return $this->hasMany(ExamParticipation::class);
    }

    protected function casts(): array
    {
        return [
            'status' => ExamSessionStatus::class,
            'opened_at' => 'datetime',
            'started_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }
}
