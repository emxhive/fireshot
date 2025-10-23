import { useQuery } from '@tanstack/react-query'
import type { Granularity, SummaryResponse, SummaryRow } from '@/types/fireshots'

export function useFireshotsSummaries(granularity: Granularity = 'day', limit?: number) {
    return useQuery<SummaryRow[], Error>({
        queryKey: ['fireshots', 'summaries', granularity, limit],
        queryFn: async () => {
            const params = new URLSearchParams({ granularity })
            if (limit) params.append('limit', String(limit))
            const res = await fetch(`/api/shots/summaries?${params}`)
            if (!res.ok) throw new Error(await res.text())
            const json: SummaryResponse = await res.json()
            return json.data ?? []
        },
        staleTime: 1000 * 60 * 5, // 5 minutes (adjust as needed)
        refetchOnWindowFocus: false,
    })
}
