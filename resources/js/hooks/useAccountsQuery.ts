import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callApi } from '@/lib/apiFactory';

export interface ApiAccount {
    id: number;
    name: string;
    currency_code: string;
    fee_percent: number;
    balance: number;
    updated_at: string;
}

interface FetchAccountsResponse {
    status: 'success' | 'error';
    accounts?: ApiAccount[];
    message?: string;
}

interface SaveAccountResponse {
    status: 'success' | 'error';
    account?: ApiAccount;
    message?: string;
}

const BASE = '/api/shots/accounts';

export function useAccountsQuery() {
    return useQuery<FetchAccountsResponse>({
        queryKey: ['fireshots', 'accounts'],
        queryFn: async () =>
            await callApi<undefined, FetchAccountsResponse>({
                url: BASE,
                method: 'get',
            }),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}

export function useUpdateAccountMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            accountId: number;
            payload: Record<string, any>;
        }) =>
            callApi<typeof vars.payload, SaveAccountResponse>(
                { url: `${BASE}/${vars.accountId}`, method: 'post' },
                vars.payload,
            ),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ['fireshots', 'accounts'] }),
    });
}

export function useCreateAccountMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Record<string, any>) =>
            callApi<typeof payload, SaveAccountResponse>(
                { url: `${BASE}/create`, method: 'post' },
                payload,
            ),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ['fireshots', 'accounts'] }),
    });
}
