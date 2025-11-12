import { useMemo } from 'react';

import { useFireshotsSummariesQuery } from '@/hooks/useFireshotsSummariesQuery';
import { aggregateSummariesByGranularity } from '@/lib/aggregate';

export function useAggregatedSummaries(granularity: 'day' | 'week' | 'month', limit?: number) {
    const { data: rawSummaries = [], isLoading } = useFireshotsSummariesQuery(limit);

    const summaries = useMemo(
        () => aggregateSummariesByGranularity(rawSummaries, granularity),
        [rawSummaries, granularity],
    );

    return { summaries, isLoading };
}
