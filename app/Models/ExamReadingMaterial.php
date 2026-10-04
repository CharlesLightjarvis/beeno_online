<?php

namespace App\Models;

use Database\Factories\ExamReadingMaterialFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['part_id', 'source', 'title', 'body', 'media_type', 'media_url', 'position'])]
class ExamReadingMaterial extends Model
{
    /** @use HasFactory<ExamReadingMaterialFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<ExamPart, $this> */
    public function part(): BelongsTo
    {
        return $this->belongsTo(ExamPart::class, 'part_id');
    }
}
