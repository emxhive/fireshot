import { useEffect, useState } from 'react'
import type { RecordResponse, RecordData } from '@/types/fireshots'

/**
 * Hook: Fetch Fireshots record data (highs/lows)
 *
 * @param reloadKey optional key to trigger refetch
 */
export function useFireshotsRecords(reloadKey?: number) {
    const [data, setData] = useState<RecordData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()
        setLoading(true)

        fetch('/api/shots/records', { signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text())
                return (await res.json()) as RecordResponse
            })
            .then((json) => setData(json.data || null))
            .catch((err) => {
                if (err.name !== 'AbortError') setError(err.message)
            })
            .finally(() => setLoading(false))

        return () => controller.abort()
    }, [reloadKey])

    return { data, loading, error }
}
