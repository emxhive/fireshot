import { create } from 'zustand';
import type { Account, AccountStore } from './types';

export const useAccountsStore = create<AccountStore>((set, get) => ({
    accounts: [],

    hydrate: (list: Account[]) => set({ accounts: list }),

    updateLocal: (id: any, changes: any) => {
        const { accounts } = get();
        set({
            accounts: accounts.map((a: Account) => (a.id === id ? { ...a, ...changes } : a)),
        });
    },

    addLocal: (account: Account) => {
        const { accounts } = get();
        set({ accounts: [...accounts, account] });
    },

    removeLocal: (id) => {
        const { accounts } = get();
        set({ accounts: accounts.filter((a) => a.id !== id) });
    },
}));
