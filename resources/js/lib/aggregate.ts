import { parseISO, startOfMonth, startOfWeek } from 'date-fns';

type AggregationGranularity = 'day' | 'week' | 'month';

function getBucketKey(date: Date, granularity: AggregationGranularity) {
    switch (granularity) {
        case 'week':
            return startOfWeek(date, { weekStartsOn: 1 }).toISOString();
        case 'month':
            return startOfMonth(date).toISOString();
        default:
            return date.toISOString();
    }
}

function safeParseDate(value: string) {
    const parsed = parseISO(value);
    return Number.isNaN(parsed.getTime()) ? new Date(value) : parsed;
}

export function aggregateSummariesByGranularity(
    data: SummaryRow[],
    granularity: AggregationGranularity,
): SummaryRow[] {
    if (!data.length) return [];

    if (granularity === 'day') {
        return [...data];
    }

    const groups = new Map<string, SummaryRow>();
    const order: string[] = [];

    for (const row of data) {
        const fromDate = safeParseDate(row.from);
        const key = getBucketKey(fromDate, granularity);
        const existing = groups.get(key);

        if (!existing) {
            groups.set(key, { ...row });
            order.push(key);
            continue;
        }

        existing.usd += row.usd;
        existing.ngn += row.ngn;
        existing.netAssetValue += row.netAssetValue;
        existing.valuationDelta += row.valuationDelta;
        existing.transactions += row.transactions;

        if (fromDate.getTime() < safeParseDate(existing.from).getTime()) {
            existing.from = row.from;
        }

        const toDate = safeParseDate(row.to);
        if (toDate.getTime() > safeParseDate(existing.to).getTime()) {
            existing.to = row.to;
        }
    }

    return order
        .map((key) => groups.get(key))
        .filter((entry): entry is SummaryRow => Boolean(entry));
}
