<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('teacher_id')->constrained('users');
            $table->string('title');
            $table->string('level')->default('A1');
            $table->string('status')->default('draft');
            $table->timestamps();
        });

        Schema::create('exam_parts', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('part_number');
            $table->text('instructions')->nullable();
            $table->timestamps();
            $table->unique(['exam_id', 'part_number']);
        });

        Schema::create('exam_reading_materials', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('part_id')->constrained('exam_parts')->cascadeOnDelete();
            $table->string('source')->nullable();
            $table->string('title')->nullable();
            $table->longText('body')->nullable();
            $table->unsignedSmallInteger('position');
            $table->timestamps();
            $table->unique(['part_id', 'position']);
        });

        Schema::create('exam_tasks', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('part_id')->constrained('exam_parts')->cascadeOnDelete();
            $table->foreignUuid('reading_material_id')->nullable()->constrained('exam_reading_materials')->nullOnDelete();
            $table->text('prompt')->nullable();
            $table->unsignedSmallInteger('position');
            $table->timestamps();
            $table->unique(['part_id', 'position']);
        });

        Schema::create('exam_choices', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_id')->constrained('exam_tasks')->cascadeOnDelete();
            $table->string('label');
            $table->longText('body')->nullable();
            $table->boolean('is_correct')->default(false);
            $table->unsignedSmallInteger('position');
            $table->timestamps();
            $table->unique(['task_id', 'position']);
            $table->unique(['task_id', 'label']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_choices');
        Schema::dropIfExists('exam_tasks');
        Schema::dropIfExists('exam_reading_materials');
        Schema::dropIfExists('exam_parts');
        Schema::dropIfExists('exams');
    }
};
