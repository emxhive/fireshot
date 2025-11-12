import { clearCache } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * useInvalidateFireshotsData
 * --------------------------
 * Centralized React Query invalidation for Fireshots-related data.
 * Called after cache-clear or snapshot-run actions.
 */
export function useInvalidateFireshotsData() {
    const qc = useQueryClient();

    return () => {
        qc.invalidateQueries({ queryKey: ['summaries'] });
        qc.invalidateQueries({ queryKey: ['records'] });
    };
}

/**
 * useCacheClearMutation
 * ---------------------
 * Clears backend caches for a given scope (analytics, records, transactions)
 * and refreshes dashboard data automatically.
 */
export function useCacheClearMutation(scope: string) {
    const invalidate = useInvalidateFireshotsData();

    return useMutation({
        mutationFn: async () => await clearCache(scope),
        onSuccess: (res) => {
            console.info(`[Cache] Cleared "${scope}" successfully.`);
            invalidate();
            return res;
        },
        onError: (err: any) => {
            console.error(`[Cache] Failed to clear "${scope}":`, err?.message || err);
        },
    });
}
