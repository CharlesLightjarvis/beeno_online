<?php

namespace Database\Factories;

use App\Models\CourseSession;
use App\Models\CourseSessionPayment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CourseSessionPayment>
 */
class CourseSessionPaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'course_session_id' => CourseSession::factory(),
            'teacher_id' => fn (array $attributes) => CourseSession::query()
                ->find($attributes['course_session_id'])
                ?->teacher_id ?? User::factory(),
            'amount_millimes' => fake()->numberBetween(1_000, 50_000),
            'paid_on' => fake()->date(),
        ];
    }
}
