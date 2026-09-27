<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_session_payments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('course_session_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedInteger('amount_millimes');
            $table->date('paid_on');
            $table->timestamps();

            $table->index(['course_session_id', 'paid_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_session_payments');
    }
};
