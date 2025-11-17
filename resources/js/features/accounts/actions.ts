import { callApi } from '@/lib/api';
import { create, update } from '@/routes/shots/accounts';
import { useAccountsStore } from './store';
import type { Account, AccountPayload } from './types';

export async function updateAccount(id: number, payload: AccountPayload, handlers?: { onSuccess?: () => void; onError?: (err?: any) => void }) {
    const { updateLocal } = useAccountsStore.getState();

    try {
        const updated: Account = await callApi(update(id), payload);
        console.log(updated, 'UPDATED');
        updateLocal(id, updated);

        handlers?.onSuccess?.();
    } catch (err) {
        handlers?.onError?.(err);
        throw err;
    }
}

export async function createAccount(payload: AccountPayload, handlers?: { onSuccess?: () => void; onError?: (err?: any) => void }) {
    const { addLocal } = useAccountsStore.getState();

    try {
        const created: Account = await callApi(create(), payload);

        addLocal(created);

        handlers?.onSuccess?.();
        return created;
    } catch (err) {
        handlers?.onError?.(err);
        throw err;
    }
}
