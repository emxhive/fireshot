import { useInvalidateData } from '@/hooks/useInvalidateData';
import { refreshTransactions } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

/**
 * useCacheClearMutation
 * ---------------------
 * Clears backend caches for a given scope (analytics, records, transactions)
 * and refreshes dashboard data automatically.
 */
export function useCacheClearMutation() {
    const invalidate = useInvalidateData();

    return useMutation({
        mutationFn: async () => await refreshTransactions(),
        onSuccess: async (res) => {
            console.info(`[Cache] Cleared successfully.`);
            await invalidate('summaries');
            return res;
        },
        onError: (err: any) => {
            console.error(`[Cache] Failed to clear`, err?.message || err);
        },
    });
}
