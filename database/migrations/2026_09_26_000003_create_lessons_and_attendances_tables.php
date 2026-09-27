<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('course_session_id')->constrained()->cascadeOnDelete();
            $table->date('held_on');
            $table->time('starts_at')->nullable();
            $table->unsignedSmallInteger('duration_minutes');
            $table->timestamps();
        });

        Schema::create('attendances', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('lesson_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('users');
            $table->string('status');
            $table->timestamps();
            $table->unique(['lesson_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('lessons');
    }
};
