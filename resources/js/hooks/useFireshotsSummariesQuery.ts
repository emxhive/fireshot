import { getSummaries } from '@/lib/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

export function useFireshotsSummariesQuery(
    granularity: Granularity,
    limit?: number,
) {
    return useQuery<SummaryRow[]>({
        queryKey: ['summaries', granularity, limit],
        queryFn: async () => {
            const res = await getSummaries(granularity, limit);
            if (res.status !== 'success') throw new Error(res.message);
            return res.data as SummaryRow[];
        },
        placeholderData: keepPreviousData,
    });
}
