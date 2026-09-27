<?php

namespace Database\Factories;

use App\Models\CourseLevel;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CourseLevel> */
class CourseLevelFactory extends Factory
{
    public function definition(): array
    {
        $position = fake()->unique()->numberBetween(1, 999);

        return [
            'code' => 'TEST-'.$position,
            'name' => 'Niveau test '.$position,
            'position' => $position,
            'target_minutes' => 1800,
            'is_active' => true,
        ];
    }
}
