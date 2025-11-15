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
 * Formats a numeric value with a thousand separators.
 * Example: 744854.5 → "744,854.5"
 */
export function formatNumberInput(value: number | null): string {
    if (value === null || isNaN(value)) return '';

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: true,
    }).format(value);
}

export function parseNumberInput(input: string): number {
    if (!input) return NaN;

    let clean = input
        .replace(/[^\d.,\-]/g, '') // keep digits . , -
        .replace(/\s+/g, '') // remove spaces entirely
        .replace(/'/g, ''); // remove apostrophes (Swiss format)

    // If comma is used as a decimal marker
    const commaCount = (clean.match(/,/g) || []).length;
    const dotCount = (clean.match(/\./g) || []).length;

    // Case A: European-style decimal (1.234,56 OR 1234,56)
    if (commaCount === 1 && dotCount <= 1 && clean.indexOf(',') > clean.indexOf('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
    }
    // Case B: simple European (1234,56)
    else if (commaCount === 1 && dotCount === 0) {
        clean = clean.replace(',', '.');
    }
    // Case C: treat all remaining thousands separators as noise
    else {
        clean = clean.replace(/,/g, '');
    }

    return parseFloat(clean);
}
