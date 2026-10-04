<?php

namespace App\Models;

use Database\Factories\ExamSessionReadingMaterialFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['part_id', 'source_material_id', 'source', 'title', 'body', 'position'])]
class ExamSessionReadingMaterial extends Model
{
    /** @use HasFactory<ExamSessionReadingMaterialFactory> */
    use HasFactory, HasUuids;

    /** @return BelongsTo<ExamSessionPart, $this> */
    public function part(): BelongsTo
    {
        return $this->belongsTo(ExamSessionPart::class, 'part_id');
    }
}
