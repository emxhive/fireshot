import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...args: ClassValue[]) {
    return twMerge(clsx(...args));
}
// Tremor focusInput [v0.0.1]

export const focusInput = [
    // base
    'focus:ring-2',
    // ring color
    'focus:ring-blue-200 focus:dark:ring-blue-700/30',
    // border color
    'focus:border-blue-500 focus:dark:border-blue-700',
];

// Tremor focusRing [v0.0.1]

export const focusRing = [
    // base
    'outline outline-offset-2 outline-0 focus-visible:outline-2',
    // outline color
    'outline-blue-500 dark:outline-blue-500',
];

// Tremor hasErrorInput [v0.0.1]

export const hasErrorInput = [
    // base
    'ring-2',
    // border color
    'border-red-500 dark:border-red-700',
    // ring color
    'ring-red-200 dark:ring-red-700/30',
];

export function timeAgo(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
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
    return date.toLocaleString('en-GB', {
        hour12: false,
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
