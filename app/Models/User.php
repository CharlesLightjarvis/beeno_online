<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\RoleEnum;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

/**
 * @property string $id
 * @property string $name
 * @property string|null $email
 * @property Carbon|null $email_verified_at
 * @property string|null $password
 * @property string|null $teacher_id
 * @property Carbon|null $archived_at
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'teacher_id', 'archived_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, HasUuids, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->hasRole(RoleEnum::Admin->value);
    }

    public function isTeacher(): bool
    {
        return $this->hasRole(RoleEnum::Teacher->value);
    }

    public function isStudent(): bool
    {
        return $this->hasRole(RoleEnum::Student->value);
    }

    /** @return HasMany<User, $this> */
    public function students(): HasMany
    {
        return $this->hasMany(self::class, 'teacher_id');
    }

    /** @return BelongsTo<User, $this> */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(self::class, 'teacher_id');
    }

    /** @return HasMany<CourseSession, $this> */
    public function courseSessions(): HasMany
    {
        return $this->hasMany(CourseSession::class, 'teacher_id');
    }

    /** @return BelongsToMany<CourseSession, $this> */
    public function enrolledCourseSessions(): BelongsToMany
    {
        return $this->belongsToMany(CourseSession::class, 'course_session_student', 'student_id', 'course_session_id')
            ->withPivot(['enrolled_at', 'left_at'])
            ->withTimestamps();
    }

    /** @return HasMany<Attendance, $this> */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'student_id');
    }
}
