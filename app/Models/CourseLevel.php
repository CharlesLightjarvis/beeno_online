<?php

namespace App\Models;

use Database\Factories\CourseLevelFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name', 'position', 'target_minutes', 'is_active'])]
class CourseLevel extends Model
{
    /** @use HasFactory<CourseLevelFactory> */
    use HasFactory, HasUuids;

    /** @param Builder<CourseLevel> $query */
    public function scopeOrdered(Builder $query): void
    {
        $query->orderBy('position');
    }

    /** @return HasMany<CourseSession, $this> */
    public function courseSessions(): HasMany
    {
        return $this->hasMany(CourseSession::class);
    }

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'target_minutes' => 'integer',
            'is_active' => 'boolean',
        ];
    }
}
