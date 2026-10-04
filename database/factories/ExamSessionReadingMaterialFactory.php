<?php

namespace Database\Factories;

use App\Models\ExamSessionPart;
use App\Models\ExamSessionReadingMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamSessionReadingMaterial> */
class ExamSessionReadingMaterialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'part_id' => ExamSessionPart::factory(),
            'source_material_id' => null,
            'source' => null,
            'title' => null,
            'body' => fake()->paragraph(),
            'position' => 1,
        ];
    }
}
