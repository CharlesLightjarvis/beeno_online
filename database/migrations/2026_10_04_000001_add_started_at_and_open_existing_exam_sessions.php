<?php

use App\Enums\ExamSessionStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table): void {
            $table->timestamp('started_at')->nullable()->after('opened_at');
        });

        DB::table('exam_sessions')
            ->where('status', ExamSessionStatus::Scheduled->value)
            ->update([
                'status' => ExamSessionStatus::Open->value,
                'opened_at' => DB::raw('COALESCE(opened_at, created_at)'),
            ]);
    }

    public function down(): void
    {
        Schema::table('exam_sessions', function (Blueprint $table): void {
            $table->dropColumn('started_at');
        });
    }
};
