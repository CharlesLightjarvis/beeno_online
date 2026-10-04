<?php

use App\Enums\ExamParticipationStatus;
use App\Enums\ExamSessionStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_sessions', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_id')->nullable()->constrained('exams')->nullOnDelete();
            $table->foreignUuid('teacher_id')->constrained('users');
            $table->string('title');
            $table->string('access_code', 8)->unique();
            $table->string('status')->default(ExamSessionStatus::Scheduled->value)->index();
            $table->uuid('displayed_material_id')->nullable()->index();
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('exam_session_parts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_session_id')->constrained()->cascadeOnDelete();
            $table->uuid('source_part_id')->nullable()->index();
            $table->unsignedTinyInteger('part_number');
            $table->text('instructions')->nullable();
            $table->timestamps();
            $table->unique(['exam_session_id', 'part_number']);
        });

        Schema::create('exam_session_reading_materials', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('part_id')->constrained('exam_session_parts')->cascadeOnDelete();
            $table->uuid('source_material_id')->nullable()->index();
            $table->string('source')->nullable();
            $table->string('title')->nullable();
            $table->longText('body')->nullable();
            $table->unsignedSmallInteger('position');
            $table->timestamps();
            $table->unique(['part_id', 'position']);
        });

        Schema::create('exam_session_tasks', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('part_id')->constrained('exam_session_parts')->cascadeOnDelete();
            $table->foreignUuid('reading_material_id')->nullable()->constrained('exam_session_reading_materials')->nullOnDelete();
            $table->uuid('source_task_id')->nullable()->index();
            $table->text('prompt')->nullable();
            $table->unsignedSmallInteger('position');
            $table->timestamps();
            $table->unique(['part_id', 'position']);
        });

        Schema::create('exam_session_choices', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_id')->constrained('exam_session_tasks')->cascadeOnDelete();
            $table->uuid('source_choice_id')->nullable()->index();
            $table->string('label');
            $table->longText('body')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->unsignedSmallInteger('position');
            $table->timestamps();
            $table->unique(['task_id', 'position']);
            $table->unique(['task_id', 'label']);
        });

        Schema::create('exam_participations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_session_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('users');
            $table->string('status')->default(ExamParticipationStatus::Pending->value)->index();
            $table->timestamp('joined_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique(['exam_session_id', 'student_id']);
        });

        Schema::create('exam_responses', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('participation_id')->constrained('exam_participations')->cascadeOnDelete();
            $table->foreignUuid('task_id')->constrained('exam_session_tasks')->cascadeOnDelete();
            $table->foreignUuid('choice_id')->constrained('exam_session_choices')->cascadeOnDelete();
            $table->timestamp('answered_at');
            $table->timestamps();
            $table->unique(['participation_id', 'task_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_responses');
        Schema::dropIfExists('exam_participations');
        Schema::dropIfExists('exam_session_choices');
        Schema::dropIfExists('exam_session_tasks');
        Schema::dropIfExists('exam_session_reading_materials');
        Schema::dropIfExists('exam_session_parts');
        Schema::dropIfExists('exam_sessions');
    }
};
