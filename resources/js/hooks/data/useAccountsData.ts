import { useApiMutation } from '@/hooks/useApiMutation';
import { useApiQuery } from '@/hooks/useApiQuery';
import { createAccount, fetchAccounts, updateAccount } from '@/lib/api';

/**
 * Handles Firefly/Fireshots account API I/O and data normalization.
 * Pure data layer — no UI or drawer logic.
 */
export function useAccountsData() {
    const accountsQuery = useApiQuery<Account[]>({
        key: ['accounts'],
        apiFn: fetchAccounts,
    });

    const create = useApiMutation<Record<string, unknown>, Record<string, unknown>>({
        apiFn: createAccount,
        invalidate: ['accounts'],
    });

    const update = useApiMutation<Record<string, unknown>, { id: number; payload: Record<string, unknown> }>({
        apiFn: ({ id, payload }) => updateAccount(id, payload),
        invalidate: ['accounts'],
    });

    const accounts = accountsQuery.data ?? [];

    return {
        accounts,
        isFetching: accountsQuery.isFetching,
        create,
        update,
        refetch: accountsQuery.refetch,
    };
}
