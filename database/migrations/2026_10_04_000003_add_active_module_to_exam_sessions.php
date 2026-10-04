<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('exam_sessions', 'active_module')) {
            Schema::table('exam_sessions', function (Blueprint $table): void {
                $table->string('active_module')->nullable()->after('started_at')->index();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('exam_sessions', 'active_module')) {
            Schema::table('exam_sessions', fn (Blueprint $table) => $table->dropColumn('active_module'));
        }
    }
};
