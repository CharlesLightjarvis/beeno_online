<?php

namespace App\Models;

use App\Enums\CourseSessionStatus;
use App\Enums\PaymentStatus;
use Database\Factories\CourseSessionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property CourseSessionStatus $status
 * @property PaymentStatus $payment_status
 * @property int $paid_millimes
 */
#[Fillable([
    'teacher_id',
    'course_level_id',
    'previous_session_id',
    'label',
    'target_minutes',
    'hourly_rate_millimes',
    'paid_millimes',
    'starts_on',
    'completed_at',
    'status',
    'payment_status',
])]
class CourseSession extends Model
{
    /** @use HasFactory<CourseSessionFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<User, $this> */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /** @return BelongsTo<CourseLevel, $this> */
    public function level(): BelongsTo
    {
        return $this->belongsTo(CourseLevel::class, 'course_level_id');
    }

    /** @return BelongsTo<CourseSession, $this> */
    public function previousSession(): BelongsTo
    {
        return $this->belongsTo(self::class, 'previous_session_id');
    }

    /** @return HasOne<CourseSession, $this> */
    public function nextSession(): HasOne
    {
        return $this->hasOne(self::class, 'previous_session_id');
    }

    /** @return BelongsToMany<User, $this> */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'course_session_student', 'course_session_id', 'student_id')
            ->withPivot(['enrolled_at', 'left_at'])
            ->withTimestamps();
    }

    /** @return HasMany<Lesson, $this> */
    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    /** @return HasMany<CourseSessionPayment, $this> */
    public function payments(): HasMany
    {
        return $this->hasMany(CourseSessionPayment::class)
            ->orderBy('paid_on')
            ->orderBy('created_at');
    }

    protected function casts(): array
    {
        return [
            'target_minutes' => 'integer',
            'hourly_rate_millimes' => 'integer',
            'paid_millimes' => 'integer',
            'starts_on' => 'date:Y-m-d',
            'completed_at' => 'datetime',
            'status' => CourseSessionStatus::class,
            'payment_status' => PaymentStatus::class,
        ];
    }
}
