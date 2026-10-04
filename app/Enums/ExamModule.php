<?php

namespace App\Enums;

enum ExamModule: string
{
    case Lesen = 'lesen';
    case Hoeren = 'hoeren';
    case Schreiben = 'schreiben';
    case Sprechen = 'sprechen';

    public function label(): string
    {
        return match ($this) {
            self::Lesen => 'Lesen',
            self::Hoeren => 'Hören',
            self::Schreiben => 'Schreiben',
            self::Sprechen => 'Sprechen',
        };
    }
}
