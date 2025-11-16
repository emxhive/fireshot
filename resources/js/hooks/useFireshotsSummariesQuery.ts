import { getSummaries } from '@/lib/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

type SummarySuccessResponse = SummaryResponse & { status: 'success' };
type SummaryErrorResponse = { status: 'error'; message: string };

export function useFireshotsSummariesQuery(limit?: number) {
    return useQuery<{ summaries: SummaryRow[]; latestMeta?: LatestMeta }>({
        queryKey: ['summaries', limit],
        queryFn: async () => {
            const res = (await getSummaries(limit)) as SummarySuccessResponse | SummaryErrorResponse;

            if (res.status !== 'success') throw new Error(res.message);
            return {
                summaries: res.data.summaries,
                latestMeta: res.data.latest_meta,
            };
        },
        placeholderData: keepPreviousData,
    });
}
