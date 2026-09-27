<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CourseLevel;
use Illuminate\Database\Seeder;

final class CourseLevelSeeder extends Seeder
{
    public function run(): void
    {
        $codes = [
            'A1.1', 'A1.2',
            'A2.1', 'A2.2',
            'B1.1', 'B1.2',
            'B2.1', 'B2.2',
            'C1.1', 'C1.2',
            'C2.1', 'C2.2',
        ];

        foreach ($codes as $index => $code) {
            CourseLevel::query()->updateOrCreate(
                ['code' => $code],
                [
                    'name' => $code,
                    'position' => $index + 1,
                    'target_minutes' => 1800,
                    'is_active' => true,
                ],
            );
        }
    }
}
