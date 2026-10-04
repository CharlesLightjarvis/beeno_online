<?php

namespace App\Enums;

enum ExamSessionStatus: string
{
    case Scheduled = 'scheduled';
    case Open = 'open';
    case Closed = 'closed';
}
