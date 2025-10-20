import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cx(...args: ClassValue[]) {
    return twMerge(clsx(...args));
}
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


// timeAgoFromString.ts
export function timeAgo(input: string): string {
    // Match common datetime formats: YYYY-MM-DD HH:MM(:SS)?
    const match = input.match(
        /\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\b/
    );
    if (!match) return "No valid date found";

    const [_, y, m, d, h, min, s] = match;
    const parsedDate = new Date(
        Number(y),
        Number(m) - 1,
        Number(d),
        Number(h),
        Number(min),
        Number(s || 0)
    );

    const now = new Date();
    const diffMs = now.getTime() - parsedDate.getTime();
    if (diffMs < 0) return "In the future";

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    const pluralize = (n: number, unit: string) =>
        `${n} ${unit}${n !== 1 ? "s" : ""} ago`;

    if (seconds < 60) return pluralize(seconds, "second");
    if (minutes < 60) return pluralize(minutes, "minute");
    if (hours < 24) return pluralize(hours, "hour");
    if (days < 7) return pluralize(days, "day");
    if (weeks < 5) return pluralize(weeks, "week");
    if (months < 12) return pluralize(months, "month");
    return pluralize(years, "year");
}
// --- Mock dataset ---
export const initialAccounts = [
    {
        id: 1,
        name: 'Kuda NGN',
        currency: 'NGN',
        fee: 0.5,
        balance: 120000,
        lastUpdated: '2025-10-10 10:00',
    },
    {
        id: 2,
        name: 'USDT Wallet',
        currency: 'USD',
        fee: 0.25,
        balance: 350,
        lastUpdated: '2025-10-12 14:32',
    },
    {
        id: 3,
        name: 'Wise USD',
        currency: 'USD',
        fee: 1.0,
        balance: 1500,
        lastUpdated: '2025-10-13 08:10',
    },
];
