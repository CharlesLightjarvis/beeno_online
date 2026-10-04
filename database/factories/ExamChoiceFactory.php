<?php

namespace Database\Factories;

use App\Models\ExamChoice;
use App\Models\ExamTask;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamChoice> */
class ExamChoiceFactory extends Factory
{
    public function definition(): array
    {
        return ['task_id' => ExamTask::factory(), 'label' => 'A', 'body' => null, 'is_correct' => false, 'position' => 1];
    }
}
