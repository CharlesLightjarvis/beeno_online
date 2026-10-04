<?php

namespace Tests\Feature\Seeders;

use App\Models\Exam;
use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Database\Seeders\TelcA1LesenSeeder;
use Database\Seeders\UsersSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TelcA1LesenSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_the_given_telc_reading_questions_as_an_incomplete_draft(): void
    {
        $this->seed([RolesAndPermissionsSeeder::class, UsersSeeder::class, TelcA1LesenSeeder::class]);

        $exam = Exam::query()
            ->where('teacher_id', User::query()->where('email', 'teacher@propulsion.test')->value('id'))
            ->with('parts.readingMaterials', 'parts.tasks.choices')
            ->firstOrFail();

        $this->assertSame('draft', $exam->status->value);
        $this->assertCount(3, $exam->parts);
        $this->assertCount(2, $exam->parts[0]->readingMaterials);
        $this->assertSame(5, $exam->parts[0]->tasks->count());
        $this->assertSame('richtig', $exam->parts[0]->tasks[0]->choices->firstWhere('is_correct', true)->label);
        $this->assertSame('B', $exam->parts[1]->tasks[0]->choices->firstWhere('is_correct', true)->label);
        $this->assertCount(5, $exam->parts[1]->tasks);
        $this->assertSame(
            ['B', 'A', 'A', 'A', 'B'],
            $exam->parts[1]->tasks->map(fn ($task): string => $task->choices->firstWhere('is_correct', true)->label)->all(),
        );
        $this->assertStringContainsString('www.sprachenfuchs.de', $exam->parts[1]->tasks[1]->choices->firstWhere('label', 'A')->body);
        $this->assertSame('Sie möchten mit dem Schiff auf dem Rhein fahren. Wo bekommen Sie Informationen?', $exam->parts[1]->tasks[0]->prompt);

        $this->assertCount(2, $exam->parts[2]->readingMaterials);
        $this->assertCount(2, $exam->parts[2]->tasks);
        $this->assertSame($exam->parts[2]->readingMaterials[0]->id, $exam->parts[2]->tasks[0]->reading_material_id);
        $this->assertSame($exam->parts[2]->readingMaterials[1]->id, $exam->parts[2]->tasks[1]->reading_material_id);

        $this->seed(TelcA1LesenSeeder::class);

        $this->assertDatabaseCount('exams', 1);
        $this->assertDatabaseCount('exam_tasks', 12);
    }
}
