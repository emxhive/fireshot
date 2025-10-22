import type { Granularity, SummaryResponse, SummaryRow } from '@/types/fireshots';
import { useEffect, useState } from 'react';

/**
 * Hook: Fetch Fireshots summaries (time-series data)
 *
 * @param granularity 'day' | 'week' | 'month'
 * @param limit number of items (optional)
 * @param reloadKey optional key to trigger refetch
 */
export function useFireshotsSummaries(
    granularity: Granularity = 'day',
    limit?: number,
    reloadKey?: number,
) {
    const [data, setData] = useState<SummaryRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        const params = new URLSearchParams({ granularity });
        if (limit) params.append('limit', String(limit));

        fetch(`/api/shots/summaries?${params.toString()}`, {
            signal: controller.signal,
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return (await res.json()) as SummaryResponse;
            })
            .then((json) => setData(json.data || []))
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [granularity, limit, reloadKey]);

    return { data, loading, error };
}
