<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ExamStatus;
use App\Models\Exam;
use App\Models\ExamPart;
use App\Models\User;
use Illuminate\Database\Seeder;

final class TelcA1HorenSchreibenSeeder extends Seeder
{
    private const AUDIO_URL = 'https://www.goethe.de/prj/dlp/dlapi/v1/index.cfm?endpoint=%2Ftlm%2Fdownload&file_ID=11785&tlm_ID=3364';

    public function run(): void
    {
        $teacher = User::query()->where('email', 'teacher@propulsion.test')->first();

        if ($teacher === null) {
            return;
        }

        $exam = Exam::query()->firstOrCreate(
            ['teacher_id' => $teacher->id, 'title' => 'TELC Deutsch A1 – Lesen'],
            ['level' => 'A1', 'status' => ExamStatus::Draft, 'module_order' => ['lesen', 'hoeren', 'schreiben']],
        );

        $exam->update([
            'level' => 'A1',
            'status' => ExamStatus::Published,
            'module_order' => ['lesen', 'hoeren', 'schreiben'],
        ]);

        $this->markExistingPartsAsLesen($exam);
        $this->seedHoren($exam);
        $this->seedSchreiben($exam);
    }

    private function markExistingPartsAsLesen(Exam $exam): void
    {
        $exam->parts()->whereNull('module')->get()->each(function (ExamPart $part): void {
            $part->update(['module' => 'lesen', 'module_position' => 0]);
        });
    }

    private function seedHoren(Exam $exam): void
    {
        $parts = [
            1 => [
                ['prompt' => 'In welche Klasse geht Frau Hegers Sohn?', 'correct' => 'a', 'choices' => ['a' => 'In die neunte Klasse', 'b' => 'In die dritte Klasse', 'c' => 'In die vierte Klasse']],
                ['prompt' => 'Wann beginnt der Deutschkurs?', 'correct' => 'b', 'choices' => ['a' => 'Um acht Uhr', 'b' => 'Um neun Uhr', 'c' => 'Um zehn Uhr']],
                ['prompt' => 'Wo treffen sich die Freunde?', 'correct' => 'c', 'choices' => ['a' => 'Vor dem Kino', 'b' => 'Im Restaurant', 'c' => 'Am Bahnhof']],
                ['prompt' => 'Was möchte die Kundin kaufen?', 'correct' => 'a', 'choices' => ['a' => 'Ein Kleid', 'b' => 'Eine Tasche', 'c' => 'Schuhe']],
                ['prompt' => 'Wie fährt Herr Klein zur Arbeit?', 'correct' => 'b', 'choices' => ['a' => 'Mit dem Auto', 'b' => 'Mit dem Bus', 'c' => 'Mit dem Fahrrad']],
            ],
            2 => [
                ['prompt' => 'Die Kunden sollen die Weihnachtsfeier besuchen.', 'correct' => 'richtig'],
                ['prompt' => 'Die Fahrgäste sollen sich im Restaurant treffen.', 'correct' => 'falsch'],
                ['prompt' => 'Der Termin ist am Montag.', 'correct' => 'richtig'],
                ['prompt' => 'Die Kinder dürfen im Garten spielen.', 'correct' => 'richtig'],
                ['prompt' => 'Die Besprechung beginnt um zwölf Uhr.', 'correct' => 'falsch'],
            ],
            3 => [
                ['prompt' => 'Die Telefonnummer ist 11833.', 'correct' => 'b', 'choices' => ['a' => '11833', 'b' => '11883', 'c' => '12833']],
                ['prompt' => 'Wo genau treffen sich die Männer?', 'correct' => 'c', 'choices' => ['a' => 'Am Zug', 'b' => 'Am Bahnhof', 'c' => 'An der Information']],
                ['prompt' => 'Was möchte die Frau reservieren?', 'correct' => 'a', 'choices' => ['a' => 'Ein Doppelzimmer', 'b' => 'Einen Tisch', 'c' => 'Eine Fahrkarte']],
                ['prompt' => 'Wann fährt der Zug ab?', 'correct' => 'b', 'choices' => ['a' => 'Um 8:15 Uhr', 'b' => 'Um 8:50 Uhr', 'c' => 'Um 9:15 Uhr']],
                ['prompt' => 'Welche Farbe hat das Auto?', 'correct' => 'c', 'choices' => ['a' => 'Blau', 'b' => 'Rot', 'c' => 'Grün']],
            ],
        ];

        foreach ($parts as $partNumber => $questions) {
            $part = $exam->parts()->updateOrCreate(
                ['module' => 'hoeren', 'part_number' => $partNumber],
                ['module_position' => 1, 'instructions' => null],
            );

            $audio = $part->readingMaterials()->updateOrCreate(
                ['position' => 1],
                ['source' => 'Goethe-Institut – kostenloser Demo-Audio', 'title' => 'Plauderkasse', 'body' => '', 'media_type' => 'audio', 'media_url' => self::AUDIO_URL],
            );

            foreach ($questions as $position => $question) {
                $task = $part->tasks()->updateOrCreate(
                    ['position' => $position + 1],
                    ['reading_material_id' => $audio->id, 'prompt' => $question['prompt'], 'response_type' => 'choice'],
                );

                $labels = $partNumber === 2 ? ['richtig', 'falsch'] : array_keys($question['choices']);
                $task->choices()->delete();
                foreach ($labels as $choicePosition => $label) {
                    $task->choices()->create([
                        'label' => $label,
                        'body' => $partNumber === 2 ? null : $question['choices'][$label],
                        'is_correct' => $label === $question['correct'],
                        'position' => $choicePosition + 1,
                    ]);
                }
            }
        }
    }

    private function seedSchreiben(Exam $exam): void
    {
        $part = $exam->parts()->updateOrCreate(
            ['module' => 'schreiben', 'part_number' => 1],
            ['module_position' => 2, 'instructions' => null],
        );

        $part->tasks()->updateOrCreate(
            ['position' => 1],
            [
                'reading_material_id' => null,
                'response_type' => 'text',
                'prompt' => <<<'MARKDOWN'
## Schreiben Sie an die Touristeninformation in Dresden:

- Sie kommen im August nach Dresden.
- Bitten Sie um Informationen über Film, Theater, Museen usw. (Kulturprogramm).
- Bitten Sie um Hoteladressen.

Schreiben Sie zu jedem Punkt ein bis zwei Sätze (circa 30 Wörter). Vergessen Sie nicht den passenden Anfang und Gruß am Schluss.
MARKDOWN,
            ],
        );
    }
}
