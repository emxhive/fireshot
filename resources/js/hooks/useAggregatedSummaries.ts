import { useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';

import { useApiQuery } from '@/hooks/useApiQuery';
import { aggregateSummariesByGranularity } from '@/lib/aggregate';
import { getSummaries } from '@/lib/api';

type AggregatedSummaries = { summaries: SummaryRow[]; latestMeta?: LatestMeta };

type SummaryPayload = { summaries: SummaryRow[]; latest_meta?: LatestMeta };

export function useAggregatedSummaries(granularity: 'day' | 'week' | 'month', limit?: number) {
    const { data, isLoading } = useApiQuery<SummaryPayload, AggregatedSummaries>({
        key: ['summaries', limit],
        apiFn: () => getSummaries(limit),
        select: (payload) => ({
            summaries: payload?.summaries ?? [],
            latestMeta: payload?.latest_meta,
        }),
        placeholderData: keepPreviousData,
    });

    const rawSummaries = data?.summaries ?? [];

    const summaries = useMemo(
        () => aggregateSummariesByGranularity(rawSummaries, granularity),
        [rawSummaries, granularity],
    );

    return { summaries, isLoading, latestMeta: data?.latestMeta };
}
