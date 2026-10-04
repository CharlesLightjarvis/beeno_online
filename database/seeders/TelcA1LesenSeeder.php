<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ExamStatus;
use App\Models\Exam;
use App\Models\ExamPart;
use App\Models\ExamTask;
use App\Models\User;
use Illuminate\Database\Seeder;

final class TelcA1LesenSeeder extends Seeder
{
    public function run(): void
    {
        $teacher = User::query()->where('email', 'teacher@propulsion.test')->first();

        if ($teacher === null) {
            return;
        }

        $exam = Exam::query()->updateOrCreate(
            ['teacher_id' => $teacher->id, 'title' => 'TELC Deutsch A1 – Lesen'],
            ['level' => 'A1', 'status' => ExamStatus::Draft],
        );

        $part1 = $exam->parts()->updateOrCreate(
            ['part_number' => 1],
            ['instructions' => 'Sind die Aussagen 1–5 richtig (+) oder falsch (−)? Kreuzen Sie an.'],
        );

        $texts = [
            [
                'position' => 1,
                'source' => null,
                'title' => null,
                'body' => "Hallo Li,\n\ndanke für deine Mail. Dein Zug kommt hier in Hannover um 12.36 Uhr an. Ich bin ab 12.15 Uhr im Hauptbahnhof und warte auf dich vor der Auskunft.\n\nDu kannst mich den ganzen Vormittag auf meinem Handy (+49 173 62 205 59) erreichen.\n\nDeine Karin",
                'tasks' => [
                    ['prompt' => 'Lis Zug kommt nach halb eins an.', 'answer' => 'richtig'],
                    ['prompt' => 'Karin wartet den ganzen Vormittag vor der Auskunft.', 'answer' => 'falsch'],
                ],
            ],
            [
                'position' => 2,
                'source' => null,
                'title' => null,
                'body' => "Liebe Carmen, lieber José,\n\nam kommenden Sonntag habe ich Geburtstag. Ich möchte gerne mit euch feiern und lade euch herzlich zu meiner Party am Samstagabend ein. Wir fangen um 21 Uhr an. Ist das okay für euch? Es werden eine ganze Menge Leute da sein, die ihr auch kennt. Könntet ihr vielleicht einen Salat mitbringen? Und vergesst bitte nicht einen Pullover oder eine Jacke! Wir wollen nämlich draußen im Garten feiern. Ich freue mich sehr auf euch!\n\nBis zum Wochenende\nRalf",
                'tasks' => [
                    ['prompt' => 'Ralf hatte am letzten Wochenende Geburtstag.', 'answer' => 'falsch'],
                    ['prompt' => 'Ralf hat nur zwei oder drei Leute eingeladen.', 'answer' => 'falsch'],
                    ['prompt' => 'Die Party findet draußen statt.', 'answer' => 'richtig'],
                ],
            ],
        ];

        $position = 1;
        foreach ($texts as $textData) {
            $material = $part1->readingMaterials()->updateOrCreate(
                ['position' => $textData['position']],
                ['source' => $textData['source'], 'title' => $textData['title'], 'body' => $textData['body']],
            );

            foreach ($textData['tasks'] as $taskData) {
                $task = $part1->tasks()->updateOrCreate(
                    ['position' => $position],
                    ['reading_material_id' => $material->id, 'prompt' => $taskData['prompt']],
                );
                $this->saveChoices($task, [
                    ['label' => 'richtig', 'is_correct' => $taskData['answer'] === 'richtig'],
                    ['label' => 'falsch', 'is_correct' => $taskData['answer'] === 'falsch'],
                ]);
                $position++;
            }
        }

        $part2 = $exam->parts()->updateOrCreate(
            ['part_number' => 2],
            ['instructions' => 'Welche Anzeige ist interessant für Sie? Kreuzen Sie an: a oder b.'],
        );
        $this->seedTeil2Questions($part2);

        $part3 = $exam->parts()->updateOrCreate(
            ['part_number' => 3],
            ['instructions' => 'Lesen Sie die Texte und die Aufgaben 11–15. Kreuzen Sie an: Richtig (+) oder falsch (−)?'],
        );
        $this->seedTeil3Questions($part3);
    }

    private function seedTeil3Questions(ExamPart $part): void
    {
        $questions = [
            [
                'text' => "An der Tür der Sprachschule\n\nSprachenzentrum\n\nDas Sprachenzentrum ist umgezogen.\nSie finden uns jetzt in der Beethovenstraße 23.",
                'prompt' => 'Zum Deutschlernen gehen Sie in die Beethovenstraße 23.',
                'answer' => 'richtig',
            ],
            [
                'text' => "In der 10-Uhr-Pause bekommen Sie an der Rezeption ein Frühstückspaket:\n\nbelegte Brötchen und Getränke\n\nfür 2 Euro.",
                'prompt' => 'In der Sprachschule können Sie etwas zu essen kaufen.',
                'answer' => 'richtig',
            ],
        ];

        foreach ($questions as $index => $questionData) {
            $position = $index + 1;
            $material = $part->readingMaterials()->updateOrCreate(
                ['position' => $position],
                ['source' => null, 'title' => null, 'body' => $questionData['text']],
            );
            $task = $part->tasks()->updateOrCreate(
                ['position' => $position],
                ['reading_material_id' => $material->id, 'prompt' => $questionData['prompt']],
            );
            $this->saveChoices($task, [
                ['label' => 'richtig', 'is_correct' => $questionData['answer'] === 'richtig'],
                ['label' => 'falsch', 'is_correct' => $questionData['answer'] === 'falsch'],
            ]);
        }
    }

    private function seedTeil2Questions(ExamPart $part): void
    {
        $questions = [
            [
                'prompt' => 'Sie möchten mit dem Schiff auf dem Rhein fahren. Wo bekommen Sie Informationen?',
                'correct' => 'B',
                'ads' => [
                    ['label' => 'A', 'body' => "**www.schiff-ruedesheim.de**\n\n**Hotel – Pension – Schiff**\n\nEinzel- und Doppelzimmer\nmit Dusche/WC\nRestaurant mit Rhein-Terrasse\n\n**Preise · über uns · Buchung**"],
                    ['label' => 'B', 'body' => "**www.bingen-ruedesheimer.de**\n\n**Bingen-Rüdesheimer Rheinschiffe**\n\nTäglich von Rüdesheim nach Koblenz\nAlle Abfahrtszeiten und Preise\n\n**hier**"],
                ],
            ],
            [
                'prompt' => 'Sie möchten Deutsch in Deutschland lernen. Wo finden Sie Informationen?',
                'correct' => 'A',
                'ads' => [
                    ['label' => 'A', 'body' => "**www.sprachenfuchs.de**\n\n**Sprachinstitut Fuchs**\nDresden, Prager Str. 4\n\n– Deutsch – Englisch\n– Französisch – Russisch\n\n> Die Schule　　 > Die Preise\n> Die Kurse　　　 > Kontakt"],
                    ['label' => 'B', 'body' => "**www.eviva.com**\n\n**Eviva-Idiomas**\nSprachkurse für Deutsche\nSpanisch auf Mallorca, Englisch auf Malta\n\n**Unsere Preise**\n**Unser Unterricht**\n**Buchungen**"],
                ],
            ],
            [
                'prompt' => 'Sie möchten ein Zugticket im Internet kaufen. Wo können Sie das?',
                'correct' => 'A',
                'ads' => [
                    ['label' => 'A', 'body' => "**www.DER.com**\n\n**Deutsches Reisebüro**\n\nTicketbestellungen und Reservierungen für Flüge weltweit, Deutsche Bahn, Eurobus\n\n**24-Stunden-Service**\n\n**E-Mail　　 Ticketbestellung**"],
                    ['label' => 'B', 'body' => "**www.RED.com**\n\n**Reisedienst GmbH**\n\nTicketservice für Theater, Konzerte und Busreisen in Deutschland und nach Polen, Tschechien und Ungarn\n\n**Konzertservice　 Theater　 Busreisen**"],
                ],
            ],
            [
                'prompt' => 'Sie möchten Informationen über den Bodensee. Wo finden Sie das?',
                'correct' => 'A',
                'ads' => [
                    ['label' => 'A', 'body' => "**www.bodensee.de**\n\n*Touristeninformation*\n\nUrlaubsorte\nHotelservice\nFerienwohnungen\nRundreisen"],
                    ['label' => 'B', 'body' => "**www.rottenmeier.de**\n\n*Hans Rottenmeier*\nFerienwohnungen am Bodensee\n\n**Häuser**\n**Preise**\n**Kontakte**"],
                ],
            ],
            [
                'prompt' => 'Sie sind in Wiesbaden und möchten mit dem Zug am Mittag in Hamburg sein. Wo finden Sie den richtigen Zug, bei Information a oder b?',
                'correct' => 'B',
                'ads' => [
                    ['label' => 'A', 'body' => "**www.reiseauskunft.bahn.de**\n\n| | Bahnhof | Datum | Zeit | Dauer | Umsteigen | Angebot |\n|:--|:--|:--|:--|:--|:--|:--|\n| ab | Hamburg | 17.02. | 12:18 | 4:34 | 1 | ICE, S |\n| an | Wiesbaden | 17.02. | 16:52 | | | |"],
                    ['label' => 'B', 'body' => "**www.reiseauskunft.bahn.de**\n\n| | Bahnhof | Datum | Zeit | Dauer | Umsteigen | Angebot |\n|:--|:--|:--|:--|:--|:--|:--|\n| ab | Wiesbaden | 17.02. | 07:34 | 4:31 | 1 | S, ICE |\n| an | Hamburg | 17.02. | 12:05 | | | |"],
                ],
            ],
        ];

        foreach ($questions as $index => $questionData) {
            $task = $part->tasks()->updateOrCreate(
                ['position' => $index + 1],
                ['reading_material_id' => null, 'prompt' => $questionData['prompt']],
            );

            $this->saveChoices($task, array_map(
                fn (array $ad): array => [...$ad, 'is_correct' => $ad['label'] === $questionData['correct']],
                $questionData['ads'],
            ));
        }
    }

    /** @param list<array{label: string, is_correct: bool, body?: string}> $choices */
    private function saveChoices(ExamTask $task, array $choices): void
    {
        foreach ($choices as $index => $choice) {
            $task->choices()->updateOrCreate(
                ['position' => $index + 1],
                [
                    'label' => $choice['label'],
                    'body' => $choice['body'] ?? null,
                    'is_correct' => $choice['is_correct'],
                ],
            );
        }
    }
}
