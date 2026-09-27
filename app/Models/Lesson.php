<?php

namespace App\Models;

use Database\Factories\LessonFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['course_session_id', 'held_on', 'starts_at', 'duration_minutes'])]
class Lesson extends Model
{
    /** @use HasFactory<LessonFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<CourseSession, $this> */
    public function session(): BelongsTo
    {
        return $this->belongsTo(CourseSession::class, 'course_session_id');
    }

    /** @return HasMany<Attendance, $this> */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    protected function casts(): array
    {
        return ['held_on' => 'date:Y-m-d', 'duration_minutes' => 'integer'];
    }
}
