<?php

namespace App\Shared\Helpers;

use App\Shared\Enums\Granularity;
use DateTimeInterface;

final class DateHelper
{
    public static function periodKey(string|DateTimeInterface $date, string $granularity): string
    {
        $g = Granularity::fromString($granularity);
        return Granularity::periodKey($g, $date);
    }
}
