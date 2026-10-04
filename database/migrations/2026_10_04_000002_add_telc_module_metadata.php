<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('exams', 'module_order')) {
            Schema::table('exams', function (Blueprint $table): void {
                $table->json('module_order')->nullable()->after('level');
            });
        }

        if (! Schema::hasColumn('exam_parts', 'module')) {
            Schema::table('exam_parts', fn (Blueprint $table) => $table->string('module')->default('lesen')->after('exam_id'));
        }
        if (! Schema::hasColumn('exam_parts', 'module_position')) {
            Schema::table('exam_parts', fn (Blueprint $table) => $table->unsignedSmallInteger('module_position')->default(0)->after('module'));
        }
        $this->dropForeignIfPresent('exam_reading_materials', 'exam_reading_materials_part_id_foreign');
        $this->dropForeignIfPresent('exam_tasks', 'exam_tasks_part_id_foreign');
        if (! $this->hasIndex('exam_parts', 'exam_parts_exam_id_index')) {
            Schema::table('exam_parts', fn (Blueprint $table) => $table->index('exam_id', 'exam_parts_exam_id_index'));
        }
        if ($this->hasIndex('exam_parts', 'exam_parts_exam_id_part_number_unique')) {
            Schema::table('exam_parts', fn (Blueprint $table) => $table->dropUnique('exam_parts_exam_id_part_number_unique'));
        }
        if (! $this->hasIndex('exam_parts', 'exam_parts_exam_id_module_part_number_unique')) {
            Schema::table('exam_parts', fn (Blueprint $table) => $table->unique(['exam_id', 'module', 'part_number']));
        }
        $this->addForeignIfMissing('exam_reading_materials', 'part_id', 'exam_parts');
        $this->addForeignIfMissing('exam_tasks', 'part_id', 'exam_parts');

        if (! Schema::hasColumn('exam_reading_materials', 'media_type')) {
            Schema::table('exam_reading_materials', function (Blueprint $table): void {
                $table->string('media_type')->default('text')->after('body');
                $table->string('media_url')->nullable()->after('media_type');
            });
        }

        if (! Schema::hasColumn('exam_tasks', 'response_type')) {
            Schema::table('exam_tasks', function (Blueprint $table): void {
                $table->string('response_type')->default('choice')->after('prompt');
            });
        }

        if (! Schema::hasColumn('exam_session_parts', 'module')) {
            Schema::table('exam_session_parts', fn (Blueprint $table) => $table->string('module')->default('lesen')->after('exam_session_id'));
        }
        if (! Schema::hasColumn('exam_session_parts', 'module_position')) {
            Schema::table('exam_session_parts', fn (Blueprint $table) => $table->unsignedSmallInteger('module_position')->default(0)->after('module'));
        }
        $this->dropForeignIfPresent('exam_session_reading_materials', 'exam_session_reading_materials_part_id_foreign');
        $this->dropForeignIfPresent('exam_session_tasks', 'exam_session_tasks_part_id_foreign');
        if (! $this->hasIndex('exam_session_parts', 'exam_session_parts_exam_session_id_index')) {
            Schema::table('exam_session_parts', fn (Blueprint $table) => $table->index('exam_session_id', 'exam_session_parts_exam_session_id_index'));
        }
        if ($this->hasIndex('exam_session_parts', 'exam_session_parts_exam_session_id_part_number_unique')) {
            Schema::table('exam_session_parts', fn (Blueprint $table) => $table->dropUnique('exam_session_parts_exam_session_id_part_number_unique'));
        }
        if (! $this->hasIndex('exam_session_parts', 'exam_session_parts_exam_session_id_module_part_number_unique')) {
            Schema::table('exam_session_parts', fn (Blueprint $table) => $table->unique(['exam_session_id', 'module', 'part_number']));
        }
        $this->addForeignIfMissing('exam_session_reading_materials', 'part_id', 'exam_session_parts');
        $this->addForeignIfMissing('exam_session_tasks', 'part_id', 'exam_session_parts');

        if (! Schema::hasColumn('exam_session_reading_materials', 'media_type')) {
            Schema::table('exam_session_reading_materials', function (Blueprint $table): void {
                $table->string('media_type')->default('text')->after('body');
                $table->string('media_url')->nullable()->after('media_type');
            });
        }

        if (! Schema::hasColumn('exam_session_tasks', 'response_type')) {
            Schema::table('exam_session_tasks', function (Blueprint $table): void {
                $table->string('response_type')->default('choice')->after('prompt');
            });
        }

        if (! Schema::hasColumn('exam_responses', 'answer_text')) {
            Schema::table('exam_responses', function (Blueprint $table): void {
                $table->dropForeign(['choice_id']);
                $table->foreignUuid('choice_id')->nullable()->change();
                $table->longText('answer_text')->nullable()->after('choice_id');
                $table->foreign('choice_id')->references('id')->on('exam_session_choices')->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('exam_responses', function (Blueprint $table): void {
            $table->dropForeign(['choice_id']);
            $table->dropColumn('answer_text');
            $table->foreignUuid('choice_id')->nullable(false)->change();
            $table->foreign('choice_id')->references('id')->on('exam_session_choices')->cascadeOnDelete();
        });
        Schema::table('exam_session_tasks', fn (Blueprint $table) => $table->dropColumn('response_type'));
        Schema::table('exam_session_reading_materials', fn (Blueprint $table) => $table->dropColumn(['media_type', 'media_url']));
        Schema::table('exam_session_parts', function (Blueprint $table): void {
            $table->dropUnique('exam_session_parts_exam_session_id_module_part_number_unique');
            $table->unique(['exam_session_id', 'part_number']);
            $table->dropColumn(['module', 'module_position']);
        });
        Schema::table('exam_tasks', fn (Blueprint $table) => $table->dropColumn('response_type'));
        Schema::table('exam_reading_materials', fn (Blueprint $table) => $table->dropColumn(['media_type', 'media_url']));
        Schema::table('exam_parts', function (Blueprint $table): void {
            $table->dropUnique('exam_parts_exam_id_module_part_number_unique');
            $table->unique(['exam_id', 'part_number']);
            $table->dropColumn(['module', 'module_position']);
        });
        Schema::table('exams', fn (Blueprint $table) => $table->dropColumn('module_order'));
    }

    private function hasIndex(string $table, string $index): bool
    {
        return collect(Schema::getIndexes($table))->contains(fn (array $item): bool => ($item['name'] ?? null) === $index);
    }

    private function dropForeignIfPresent(string $table, string $constraint): void
    {
        if (collect(Schema::getForeignKeys($table))->contains(fn (array $item): bool => ($item['name'] ?? null) === $constraint)) {
            Schema::table($table, fn (Blueprint $blueprint) => $blueprint->dropForeign($constraint));
        }
    }

    private function addForeignIfMissing(string $table, string $column, string $referenceTable): void
    {
        if (! collect(Schema::getForeignKeys($table))->contains(fn (array $item): bool => ($item['columns'] ?? []) === [$column])) {
            Schema::table($table, fn (Blueprint $blueprint) => $blueprint->foreign($column)->references('id')->on($referenceTable)->cascadeOnDelete());
        }
    }
};
