import { useQueryClient } from '@tanstack/react-query';

// Central, type-safe list of allowed React Query cache keys
export type QueryKeyName = 'accounts' | 'summaries' | 'transactions';

/**
 * useInvalidateData
 * -----------------
 * Returns an async function that invalidates one or more cache keys in a
 * type-safe manner. To introduce a new key, add it to QueryKeyName above.
 */
export function useInvalidateData() {
    const qc = useQueryClient();

    return async (...keys: QueryKeyName[]) => {
        await Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k] })));
    };
}
