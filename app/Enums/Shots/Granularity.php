<?php

namespace App\Enums\Shots;

enum Granularity: string
{
    case Day = 'day';
    case Week = 'week';
    case Month = 'month';

    public static function defaultLimit(self $g): int
    {
        return match ($g) {
            self::Day   => 30,
            self::Week  => 6,
            self::Month => 6,
        };
    }

    public static function fromString(string $value): self
    {
        return match (strtolower($value)) {
            'day'   => self::Day,
            'week'  => self::Week,
            'month' => self::Month,
            default => self::Day,
        };
    }

    public static function periodKey(self $g, string|\DateTimeInterface $date): string
    {
        $ts = is_string($date) ? strtotime($date) : $date->getTimestamp();
        return match ($g) {
            self::Day   => date('Y-m-d', $ts),
            self::Week  => date('o-\WW', $ts),
            self::Month => date('Y-m', $ts),
        };
    }
}
