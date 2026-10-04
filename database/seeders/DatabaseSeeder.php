<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            CourseLevelSeeder::class,
            UsersSeeder::class,
            TelcA1LesenSeeder::class,
        ]);
    }
}
