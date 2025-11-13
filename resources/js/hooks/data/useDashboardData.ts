import { useAggregatedSummaries } from '@/hooks/useAggregatedSummaries';

export function useDashboardData() {
    const { summaries: day30, isLoading: dayLoading } = useAggregatedSummaries('day', 30);
    const { summaries: week12, isLoading: weekLoading } = useAggregatedSummaries('week', 84);
    const { summaries: month12, isLoading: monthLoading } = useAggregatedSummaries('month', 365);

    const loading = dayLoading || weekLoading || monthLoading;

    return { day30, week12, month12, loading };
}
