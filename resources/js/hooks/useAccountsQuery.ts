// resources/js/hooks/useAccountsQuery.ts
import { createAccount, fetchAccounts, updateAccount } from '@/lib/api';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useInvalidateData } from '@/hooks/useInvalidateData';

export function useAccountsQuery() {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: async () => {
            const res: any = await fetchAccounts();
            if (res.status !== 'success') throw new Error(res.message);
            return res.data;
        },
    });
}

export function useCreateAccountMutation() {
    const invalidate = useInvalidateData();
    return useMutation({
        mutationFn: async (payload: Record<string, any>) => {
            const res: any = await createAccount(payload);
            if (res?.status === 'error') throw new Error(res.message || 'Create failed');
            return res;
        },
        onSuccess: async () => {
            await invalidate('accounts');
        },
    });
}

export function useUpdateAccountMutation() {
    const invalidate = useInvalidateData();
    return useMutation({
        mutationFn: async ({ id, payload }: { id: number; payload: Record<string, any> }) => {
            const res: any = await updateAccount(id, payload);
            if (res?.status === 'error') throw new Error(res.message || 'Update failed');
            return res;
        },
        onSuccess: async () => {
            await invalidate('accounts');
        },
    });
}
