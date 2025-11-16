import api from './axiosClient';
import { apiRequestFromPromise } from './apiClient';

type SummariesPayload = { summaries: SummaryRow[]; latest_meta?: LatestMeta };

type AccountListPayload = Account[];
type AccountMutationPayload = Record<string, unknown>;

type SnapshotPayload = Record<string, unknown>;

type TransactionsPayload = Record<string, unknown> & { message?: string };

/** DASHBOARD */
export async function getSummaries(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return apiRequestFromPromise<SummariesPayload>(api.get(`/api/shots/summaries${query}`));
}

export async function runSnapshot(payload: {
    snapshot_date: string;
    sell_rate: number;
    buy_diff?: number;
}) {
    return apiRequestFromPromise<SnapshotPayload>(api.post('/api/shots/run', payload));
}

/** ACCOUNTS */
export async function fetchAccounts() {
    return apiRequestFromPromise<AccountListPayload>(api.get('/api/shots/accounts'));
}

export async function createAccount(payload: Record<string, unknown>) {
    return apiRequestFromPromise<AccountMutationPayload>(api.post('/api/shots/accounts/create', payload));
}

export async function updateAccount(id: number, payload: Record<string, unknown>) {
    return apiRequestFromPromise<AccountMutationPayload>(api.put(`/api/shots/accounts/${id}`, payload));
}

export async function refreshTransactions() {
    return apiRequestFromPromise<TransactionsPayload>(api.post('/api/shots/transactions/refresh'));
}
