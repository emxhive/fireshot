import { getSummaries } from '@/lib/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

type SummarySuccessResponse = SummaryResponse & { status: 'success' };
type SummaryErrorResponse = { status: 'error'; message: string };

export function useFireshotsSummariesQuery(
    granularity: Granularity,
    limit?: number,
) {
    return useQuery<SummaryRow[]>({
        queryKey: ['summaries', granularity, limit],
        queryFn: async () => {
            const res = (await getSummaries(
                granularity,
                limit,
            )) as SummarySuccessResponse | SummaryErrorResponse;

            if (res.status !== 'success') throw new Error(res.message);
            return res.data;
        },
        placeholderData: keepPreviousData,
    });
}
