import { useQuery } from '@tanstack/react-query'
import type { RecordData, RecordResponse } from '@/types/fireshots'

export function useFireshotsRecords() {
    return useQuery<RecordData | null, Error>({
        queryKey: ['fireshots', 'records'],
        queryFn: async () => {
            const res = await fetch('/api/shots/records')
            if (!res.ok) throw new Error(await res.text())
            const json: RecordResponse = await res.json()
            return json.data ?? null
        },
        staleTime: 1000 * 60 * 10, // 10 minutes cache
        refetchOnWindowFocus: false,
    })
}
