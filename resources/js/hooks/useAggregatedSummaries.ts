import { keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';

import { aggregateSummariesByGranularity } from '@/lib/aggregate';

type AggregatedSummaries = { summaries: SummaryRow[]; latestMeta?: LatestMeta };

type SummaryPayload = { summaries: SummaryRow[]; latest_meta?: LatestMeta };

function useApiQuery<T, U>(param: {
    key: (string | number | undefined)[];
    apiFn: () => void;
    select: (payload: { summaries: any; latest_meta: any }) => { summaries: any; latestMeta: any };
    placeholderData: <T>(previousData: T | undefined) => T | undefined;
}) {}

export function useAggregatedSummaries(granularity: 'day' | 'week' | 'month', limit?: number) {
    function getSummaries(limit: number | undefined) {}

    // @ts-ignore
    const { data, isLoading } = useApiQuery<SummaryPayload, AggregatedSummaries>({
        key: ['summaries', limit],
        apiFn: () => getSummaries(limit),
        select: (payload: { summaries: any; latest_meta: any }) => ({
            summaries: payload?.summaries ?? [],
            latestMeta: payload?.latest_meta,
        }),
        placeholderData: keepPreviousData,
    });

    const rawSummaries = data?.summaries ?? [];

    const summaries = useMemo(() => aggregateSummariesByGranularity(rawSummaries, granularity), [rawSummaries, granularity]);

    return { summaries, isLoading, latestMeta: data?.latestMeta };
}
