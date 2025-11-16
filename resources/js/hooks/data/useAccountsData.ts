import { useAccountsQuery, useCreateAccountMutation, useUpdateAccountMutation } from '@/hooks/useAccountsQuery';

/**
 * Handles Firefly/Fireshots account API I/O and data normalization.
 * Pure data layer — no UI or drawer logic.
 */
export function useAccountsData() {
    const { data: rawAccounts = [], isFetching, refetch } = useAccountsQuery();
    const create = useCreateAccountMutation();
    const update = useUpdateAccountMutation();

    // 🔹 Normalize Firefly account data for frontend use
    const accounts = rawAccounts.map((a: any) => ({
        ...a,
    }));

    return {
        accounts,
        isFetching,
        create,
        update,
        refetch,
    };
}
