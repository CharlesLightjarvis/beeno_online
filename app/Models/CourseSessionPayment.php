<?php

namespace App\Models;

use Database\Factories\CourseSessionPaymentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $amount_millimes
 */
#[Fillable(['course_session_id', 'teacher_id', 'amount_millimes', 'paid_on'])]
class CourseSessionPayment extends Model
{
    /** @use HasFactory<CourseSessionPaymentFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<CourseSession, $this> */
    public function session(): BelongsTo
    {
        return $this->belongsTo(CourseSession::class, 'course_session_id');
    }

    /** @return BelongsTo<User, $this> */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    protected function casts(): array
    {
        return [
            'amount_millimes' => 'integer',
            'paid_on' => 'date:Y-m-d',
        ];
    }
}
