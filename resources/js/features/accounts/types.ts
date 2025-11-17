export interface Account {
    id: number;
    name: string;
    currency: string;
    balance: number;
    fee: number;
    updatedAt: string;
}

export interface AccountPayload {
    name: string;
    currency: string;
    balance: number;
    fee: number;
}

export interface AccountStoreState {
    accounts: Account[];
}

export interface AccountStoreActions {
    hydrate: (list: Account[]) => void;
    updateLocal: (id: number, changes: Partial<Account>) => void;
    addLocal: (account: Account) => void;
    removeLocal: (id: number) => void;
}

export type AccountStore = AccountStoreState & AccountStoreActions;
