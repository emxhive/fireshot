// resources/js/hooks/useAccountsQuery.ts
import { createAccount, fetchAccounts, updateAccount } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useAccountsQuery() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res: any = await fetchAccounts();
            if (res.status !== 'success') throw new Error(res.message);
            return res.accounts;
        },
    });
}

export function useCreateAccountMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (payload: Record<string, any>) => {
            const res: any = await createAccount(payload);
            if (res?.status === 'error') throw new Error(res.message || 'Create failed');
            return res;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
    });
}

export function useUpdateAccountMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Record<string, any> }) => {
            const res: any = await updateAccount(id, payload);
            if (res?.status === 'error') throw new Error(res.message || 'Update failed');
            return res;
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['accounts'] }),
    });
}
