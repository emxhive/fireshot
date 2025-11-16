import { useInvalidateData } from '@/hooks/useInvalidateData';
import { runSnapshot } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

/**
 * useRunSnapshotMutation
 * ----------------------
 * Runs a new snapshot on the backend and refreshes dashboard data automatically.
 * (Previously defined separately — now unified under this module.)
 */
export function useRunSnapshotMutation() {
    const invalidate = useInvalidateData();

    return useMutation({
        mutationFn: runSnapshot,
        onSuccess: async (res) => {
            console.info('[Snapshot] Run completed successfully.');
            await invalidate('summaries');
            return res;
        },
        onError: (err: any) => {
            console.error('[Snapshot] Run failed:', err?.message || err);
        },
    });
}
