<?php

namespace Database\Factories;

use App\Models\CourseSession;
use App\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Lesson> */
class LessonFactory extends Factory
{
    public function definition(): array
    {
        return [
            'course_session_id' => CourseSession::factory(),
            'held_on' => fake()->date(),
            'starts_at' => null,
            'duration_minutes' => 120,
        ];
    }
}
