<?php

declare(strict_types=1);

namespace App\Enums;

enum PaymentStatus: string
{
    case Unpaid = 'unpaid';
    case Paid = 'paid';
    case PartiallyPaid = 'partially_paid';

    public function label(): string
    {
        return match ($this) {
            self::Unpaid => 'Impayé',
            self::Paid => 'Payé',
            self::PartiallyPaid => 'Partiellement payé',
        };
    }
}
