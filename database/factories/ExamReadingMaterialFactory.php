<?php

namespace Database\Factories;

use App\Models\ExamPart;
use App\Models\ExamReadingMaterial;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamReadingMaterial> */
class ExamReadingMaterialFactory extends Factory
{
    public function definition(): array
    {
        return ['part_id' => ExamPart::factory(), 'source' => fake()->domainName(), 'title' => fake()->sentence(3), 'body' => fake()->paragraph(), 'position' => 1];
    }
}
