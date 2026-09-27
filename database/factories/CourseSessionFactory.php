<?php

namespace Database\Factories;

use App\Enums\CourseSessionStatus;
use App\Models\CourseLevel;
use App\Models\CourseSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CourseSession> */
class CourseSessionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'teacher_id' => User::factory(),
            'course_level_id' => CourseLevel::factory(),
            'previous_session_id' => null,
            'label' => fake()->words(3, true),
            'target_minutes' => 1800,
            'hourly_rate_millimes' => 20_000,
            'starts_on' => fake()->date(),
            'completed_at' => null,
            'status' => CourseSessionStatus::Active,
        ];
    }
}
