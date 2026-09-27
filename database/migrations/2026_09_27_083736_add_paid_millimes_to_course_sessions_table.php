<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('course_sessions', function (Blueprint $table): void {
            $table->unsignedInteger('paid_millimes')
                ->default(0)
                ->after('hourly_rate_millimes')
                ->comment('Cumulative amount already paid to the teacher, in millimes.');
        });
    }

    public function down(): void
    {
        Schema::table('course_sessions', function (Blueprint $table): void {
            $table->dropColumn('paid_millimes');
        });
    }
};
