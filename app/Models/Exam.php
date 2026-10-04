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
#[Fillable(['teacher_id', 'title', 'level', 'status', 'module_order'])]
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
        return $this->hasMany(ExamPart::class)
            ->orderBy('module_position')
            ->orderBy('part_number');
    }

    /** @return HasMany<ExamSession, $this> */
    public function sessions(): HasMany
    {
        return $this->hasMany(ExamSession::class);
    }

    protected function casts(): array
    {
        return ['status' => ExamStatus::class, 'module_order' => 'array'];
    }

    /** @return array<int, string> */
    public function orderedModules(): array
    {
        $configured = is_array($this->module_order) ? $this->module_order : [];
        $default = ['lesen', 'hoeren', 'schreiben', 'sprechen'];
        $present = $this->relationLoaded('parts')
            ? $this->parts->pluck('module')->unique()->values()->all()
            : [];

        return collect([...$configured, ...$default, ...$present])
            ->filter(fn (mixed $module): bool => is_string($module) && in_array($module, $default, true))
            ->unique()
            ->filter(fn (string $module): bool => $present === [] || in_array($module, $present, true))
            ->values()
            ->all();
    }
}
