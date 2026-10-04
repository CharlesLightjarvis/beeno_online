<?php

namespace App\Models;

use App\Enums\ExamParticipationStatus;
use Database\Factories\ExamParticipationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property ExamParticipationStatus $status
 * @property Carbon|null $last_seen_at
 */
#[Fillable(['exam_session_id', 'student_id', 'status', 'joined_at', 'last_seen_at', 'completed_at'])]
class ExamParticipation extends Model
{
    /** @use HasFactory<ExamParticipationFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<ExamSession, $this> */
    public function examSession(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class);
    }

    /** @return BelongsTo<User, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /** @return HasMany<ExamResponse, $this> */
    public function responses(): HasMany
    {
        return $this->hasMany(ExamResponse::class, 'participation_id');
    }

    protected function casts(): array
    {
        return [
            'status' => ExamParticipationStatus::class,
            'joined_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
