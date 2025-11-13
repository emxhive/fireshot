import { refreshTransactions } from '@/lib/api';
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
        qc.invalidateQueries({ queryKey: ['summaries'] }).then((r) => console.log);
    };
}

/**
 * useCacheClearMutation
 * ---------------------
 * Clears backend caches for a given scope (analytics, records, transactions)
 * and refreshes dashboard data automatically.
 */
export function useCacheClearMutation() {
    const invalidate = useInvalidateFireshotsData();

    return useMutation({
        mutationFn: async () => await refreshTransactions(),
        onSuccess: (res) => {
            console.info(`[Cache] Cleared successfully.`);
            invalidate();
            return res;
        },
        onError: (err: any) => {
            console.error(`[Cache] Failed to clear`, err?.message || err);
        },
    });
}

/**
 * Shared mutation for refreshing transaction cache.
 * Used by both SnapshotSummaryTable and Settings page.
 */
export function useRefreshTransactionsMutation() {
    const invalidate = useInvalidateFireshotsData();

    return useMutation({
        mutationFn: refreshTransactions,
        onSuccess: () => {
            console.info('[Transactions] Cache refresh successful.');
            invalidate();
        },
        onError: (err: any) => {
            console.error('[Transactions] Cache refresh failed:', err?.message || err);
        },
    });
}
