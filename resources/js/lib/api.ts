import api from './axiosClient';

const MIN_DELAY_MS = 1000; // 👈 global minimum delay (tweak as you wish)
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function handle<R>(promise: Promise<R>): Promise<R | { status: 'error'; message: string }> {
    try {
        const [res] = await Promise.all([
            promise,
            wait(MIN_DELAY_MS), // ✅ ensures every API call respects min delay
        ]);
        return res;
    } catch (error: any) {
        const msg = error?.response?.data?.message ?? error?.message ?? 'API call failed';
        return { status: 'error', message: msg };
    }
}

/** DASHBOARD */
export async function getSummaries(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return handle(api.get(`/api/shots/summaries${query}`).then((r) => r.data));
}

export async function runSnapshot(payload: { snapshot_date: string; sell_rate: number; buy_diff?: number }) {
    return handle(api.post('/api/shots/run', payload).then((r) => r.data));
}

/** ACCOUNTS */
export async function fetchAccounts() {
    return handle(api.get('/api/shots/accounts').then((r) => r.data));
}

export async function createAccount(payload: Record<string, any>) {
    return handle(api.post('/api/shots/accounts/create', payload).then((r) => r.data));
}

export async function updateAccount(id: number, payload: Record<string, any>) {
    return handle(api.post(`/api/shots/accounts/${id}`, payload).then((r) => r.data));
}

export async function refreshTransactions(): Promise<{ status: string; message?: string }> {
    return handle(api.post('/api/shots/transactions/refresh').then((r) => r.data));
}
