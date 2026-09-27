<?php

namespace Tests\Feature\Seeders;

use App\Models\CourseLevel;
use Database\Seeders\CourseLevelSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseLevelSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_installs_the_ordered_course_catalogue(): void
    {
        $this->seed(CourseLevelSeeder::class);

        $this->assertSame(
            ['A1.1', 'A1.2', 'A2.1', 'A2.2', 'B1.1', 'B1.2', 'B2.1', 'B2.2', 'C1.1', 'C1.2', 'C2.1', 'C2.2'],
            CourseLevel::query()->ordered()->pluck('code')->all(),
        );
        $this->assertSame(12, CourseLevel::query()->count());
        $this->assertSame(0, CourseLevel::query()->where('target_minutes', '!=', 1800)->count());
    }

    public function test_it_is_idempotent_and_restores_canonical_values(): void
    {
        $this->seed(CourseLevelSeeder::class);
        CourseLevel::query()->where('code', 'A1.1')->update(['target_minutes' => 900]);

        $this->seed(CourseLevelSeeder::class);

        $this->assertSame(12, CourseLevel::query()->count());
        $this->assertSame(1800, CourseLevel::query()->where('code', 'A1.1')->value('target_minutes'));
    }
}
