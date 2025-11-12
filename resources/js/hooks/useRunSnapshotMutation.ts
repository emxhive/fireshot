import { useInvalidateFireshotsData } from '@/hooks/useCacheMaintenance';
import { runSnapshot } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

/**
 * useRunSnapshotMutation
 * ----------------------
 * Runs a new snapshot on the backend and refreshes dashboard data automatically.
 * (Previously defined separately — now unified under this module.)
 */
export function useRunSnapshotMutation() {
    const invalidate = useInvalidateFireshotsData();

    return useMutation({
        mutationFn: runSnapshot,
        onSuccess: (res) => {
            console.info('[Snapshot] Run completed successfully.');
            invalidate();
            return res;
        },
        onError: (err: any) => {
            console.error('[Snapshot] Run failed:', err?.message || err);
        },
    });
}
