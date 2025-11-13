import { safeParseDate } from '@/lib/utils';
import { startOfDay, startOfMonth, startOfWeek } from 'date-fns';

type AggregationGranularity = 'day' | 'week' | 'month';

function getBucketKey(date: Date, granularity: AggregationGranularity) {
    // Use local-time bucket starts and return numeric timestamp as the grouping key
    switch (granularity) {
        case 'week':
            return startOfWeek(date, { weekStartsOn: 1 }).getTime();
        case 'month':
            return startOfMonth(date).getTime();
        default:
            return startOfDay(date).getTime();
    }
}

export function aggregateSummariesByGranularity(data: SummaryRow[], granularity: AggregationGranularity): SummaryRow[] {
    if (!data.length) return [];

    // Always ensure chronological ascending order
    const sorted = [...data].sort(
        (a, b) => safeParseDate(a.from).getTime() - safeParseDate(b.from).getTime(),
    );

    if (granularity === 'day') {
        return sorted;
    }

    type Bucket = {
        row: SummaryRow; // accumulator row
        bucketKey: number;
        latestToTs: number; // for stock fields
        earliestFromTs: number;
        latestToStr: string;
    };

    const groups = new Map<number, Bucket>();

    for (const row of sorted) {
        const fromDate = safeParseDate(row.from);
        const toDate = safeParseDate(row.to);
        const key = getBucketKey(fromDate, granularity) as number;

        const existing = groups.get(key);
        if (!existing) {
            // Initialize bucket with current row values
            groups.set(key, {
                row: { ...row },
                bucketKey: key,
                latestToTs: toDate.getTime(),
                earliestFromTs: fromDate.getTime(),
                latestToStr: row.to,
            });
            continue;
        }

        // Flows: sum
        existing.row.valuationDelta += row.valuationDelta;
        existing.row.transactions += row.transactions;

        // From/To bounds: earliest from, latest to
        if (fromDate.getTime() < existing.earliestFromTs) {
            existing.earliestFromTs = fromDate.getTime();
            existing.row.from = row.from;
        }
        if (toDate.getTime() > existing.latestToTs) {
            existing.latestToTs = toDate.getTime();
            existing.latestToStr = row.to;
            existing.row.to = row.to;

            // Stocks: take latest in bucket
            existing.row.usd = row.usd;
            existing.row.ngn = row.ngn;
            existing.row.netAssetValue = row.netAssetValue;
        }
    }

    const buckets = Array.from(groups.values())
        .sort((a, b) => a.bucketKey - b.bucketKey)
        .map((b) => b.row);

    return buckets;
}
