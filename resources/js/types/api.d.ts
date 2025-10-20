// @types/api.d.ts

type APIErrorResponse = {
    status: 'error';
    message: string;
};

interface RawAccount {
    id: number;
    name: string;
    currency_code: string;
    fee_percent: number;
    balance: number;
    updated_at: string;
}

type FetchAccountsSuccessResponse = {
    status: 'success';
    accounts: RawAccount[];
};

type SaveAccountSuccessResponse = {
    status: 'success';
    account?: RawAccount;
};

type FetchAccountsResponse = FetchAccountsSuccessResponse | APIErrorResponse;

type SaveAccountResponse = SaveAccountSuccessResponse | APIErrorResponse;
