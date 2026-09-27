<?php

use App\Enums\CourseSessionStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_sessions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('teacher_id')->constrained('users');
            $table->foreignUuid('course_level_id')->constrained('course_levels');
            $table->uuid('previous_session_id')->nullable()->index();
            $table->string('label');
            $table->unsignedSmallInteger('target_minutes');
            $table->unsignedInteger('hourly_rate_millimes');
            $table->date('starts_on');
            $table->timestamp('completed_at')->nullable();
            $table->string('status')->default(CourseSessionStatus::Active->value);
            $table->timestamps();
        });

        Schema::create('course_session_student', function (Blueprint $table): void {
            $table->id();
            $table->foreignUuid('course_session_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('users');
            $table->timestamp('enrolled_at');
            $table->timestamp('left_at')->nullable();
            $table->timestamps();

            $table->unique(['course_session_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_session_student');
        Schema::dropIfExists('course_sessions');
    }
};
