import clsx, { type ClassValue } from 'clsx';
import { parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...args: ClassValue[]) {
    return twMerge(clsx(...args));
}

export function timeAgo(dateInput: string | Date): string {
    console.log(dateInput, 'BeFORE ');
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    console.log(date, now, 'AFTER ');
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

    if (diff < 0) return 'In the future';

    const units: [number, string][] = [
        [60, 'second'],
        [60, 'minute'],
        [24, 'hour'],
        [7, 'day'],
        [4.34524, 'week'],
        [12, 'month'],
        [Number.POSITIVE_INFINITY, 'year'],
    ];

    let unitIndex = 0;
    let value = diff;

    for (; unitIndex < units.length - 1 && value >= units[unitIndex][0]; unitIndex++) {
        value /= units[unitIndex][0];
    }

    const rounded = Math.floor(value);
    const label = units[unitIndex][1];
    return `${rounded} ${label}${rounded !== 1 ? 's' : ''} ago`;
}

export function formatDate(dateInput: string | number | Date) {
    const date = new Date(dateInput);
    return date.toLocaleString('en-NG', {
        hour12: false,
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
export function safeParseDate(value: string) {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;
}

/**
 * Formats a numeric value with thousand separators.
 * Example: 744854.5 → "744,854.5"
 */
export function formatNumberInput(value: number | string | null): string {
    if (value === null || value === undefined || value === '') return '';

    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(num);
}

/**
 * Parses numeric input text from various locales.
 *
 * Handles:
 *  - "45 554,54"  → 45554.54
 *  - "544545"     → 544545
 *  - "81 343.45"  → 81343.45
 *  - "1,23" (European comma) → 1.23
 *
 * @param input - user-typed text value
 * @returns float number or NaN if invalid
 */
export function parseNumberInput(input: string): number {
    if (!input) return NaN;

    const raw = input.trim();

    let normalized = raw;

    // Case A: contains comma but no dot — European decimal style
    if (/,/.test(raw) && !/\./.test(raw)) {
        normalized = raw.replace(/\s+/g, '').replace(',', '.');
    }
    // Case B: standard digits/dot input
    else {
        normalized = raw.replace(/\s+/g, '');
    }

    return parseFloat(normalized);
}
