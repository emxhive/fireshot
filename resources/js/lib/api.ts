import { create, index, update } from '@/routes/shots/accounts';


import { callApi } from './apiFactory';

export async function fetchAccounts(): Promise<FetchAccountsResponse> {
    return callApi<undefined, FetchAccountsResponse>(index.get());
}

export async function updateAccount(
    accountId: number,
    payload: Record<string, any>,
): Promise<SaveAccountResponse> {
    const routeDef = update.post({ account: accountId });
    return callApi<typeof payload, SaveAccountResponse>(routeDef, payload);
}

export async function createAccount(
    payload: Record<string, any>,
): Promise<SaveAccountResponse> {
    return callApi<typeof payload, SaveAccountResponse>(create.post(), payload);
}



export async function runSnapshot(payload: {
    snapshot_date: string;
    sell_rate: number;
    buy_diff?: number;
}) {
    return callApi<typeof payload, any>(
        {
            url: '/api/shots/snapshots/run',
            method: 'post',
        },
        payload,
    );
}
