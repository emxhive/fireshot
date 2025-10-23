import {
    ApiAccount,
    useAccountsQuery,
    useCreateAccountMutation,
    useUpdateAccountMutation,
} from '@/hooks/useAccountsQuery';
import { useCallback, useEffect, useState } from 'react';

export default function useAccounts() {
    const { data, isFetching, refetch } = useAccountsQuery();
    const updateAccount = useUpdateAccountMutation();
    const createAccount = useCreateAccountMutation();

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [rowSelection, setRowSelection] = useState({});
    const [editQueue, setEditQueue] = useState<Account[]>([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [currentFormData, setCurrentFormData] =
        useState<Partial<Account> | null>(null);
    const [callout, setCallout] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    /* --------------------------- sync query data --------------------------- */
    useEffect(() => {
        if (data?.status === 'success' && Array.isArray(data.accounts)) {
            const mapped: Account[] = (data.accounts as ApiAccount[]).map(
                (a) => ({
                    id: a.id,
                    name: a.name,
                    currency: a.currency_code,
                    fee: a.fee_percent ?? 0,
                    balance: a.balance ?? 0,
                    lastUpdated: a.updated_at,
                }),
            );
            setAccounts(mapped);
        }
    }, [data]);

    /* -------------------------- Drawer + Queue Logic -------------------------- */
    const openForEdit = useCallback(
        (account?: Account, selectedAccounts: Account[] = []) => {
            const multiple = selectedAccounts.length > 1;
            if (multiple) {
                setEditQueue(selectedAccounts);
                setQueueIndex(0);
                setEditingAccount(selectedAccounts[0]);
                setCurrentFormData(selectedAccounts[0]);
            } else if (account) {
                setEditQueue([]);
                setQueueIndex(0);
                setEditingAccount(account);
                setCurrentFormData(account);
            } else if (selectedAccounts.length === 1) {
                setEditQueue([]);
                setQueueIndex(0);
                setEditingAccount(selectedAccounts[0]);
                setCurrentFormData(selectedAccounts[0]);
            } else return;
            setIsDrawerOpen(true);
        },
        [],
    );

    const moveToNextAccount = useCallback(() => {
        if (editQueue.length > 1) {
            const nextIndex = queueIndex + 1;
            if (nextIndex < editQueue.length) {
                const nextAcc = editQueue[nextIndex];
                setQueueIndex(nextIndex);
                setEditingAccount(nextAcc);
                setCurrentFormData(nextAcc);
            } else {
                setIsDrawerOpen(false);
                setEditQueue([]);
            }
        } else setIsDrawerOpen(false);
    }, [editQueue, queueIndex]);

    const handleSave = useCallback(async () => {
        if (!currentFormData) return;
        const payload = {
            name: currentFormData.name,
            currency: currentFormData.currency,
            fee: currentFormData.fee,
            balance: currentFormData.balance,
        };
        setIsSaving(true);
        try {
            if (currentFormData.id && currentFormData.id !== 0) {
                await updateAccount.mutateAsync({
                    accountId: currentFormData.id,
                    payload,
                });
            } else {
                await createAccount.mutateAsync(payload);
            }

            await refetch(); // refresh accounts after save

            // queue continuation
            if (editQueue.length > 0 && currentFormData.id) {
                const remaining = editQueue.filter(
                    (a) => a.id !== currentFormData.id,
                );
                if (remaining.length > 0) {
                    const nextIndex =
                        queueIndex >= remaining.length ? 0 : queueIndex;
                    const nextAcc = remaining[nextIndex];
                    setEditQueue(remaining);
                    setQueueIndex(nextIndex);
                    setEditingAccount(nextAcc);
                    setCurrentFormData(nextAcc);
                } else {
                    setEditQueue([]);
                    setIsDrawerOpen(false);
                }
            } else setIsDrawerOpen(false);
        } catch (e: any) {
            console.error(e);
            setCallout({ type: 'error', message: e.message || 'Save failed' });
        } finally {
            setIsSaving(false);
        }
    }, [
        currentFormData,
        editQueue,
        queueIndex,
        refetch,
        updateAccount,
        createAccount,
    ]);

    const openForAdd = useCallback(() => {
        const newAcct: Account = {
            id: 0,
            name: '',
            currency: 'USD',
            fee: 0,
            balance: 0,
            lastUpdated: new Date().toISOString(),
        };
        setEditQueue([]);
        setQueueIndex(0);
        setEditingAccount(newAcct);
        setCurrentFormData(newAcct);
        setIsDrawerOpen(true);
    }, []);

    const updateFormData = useCallback((key: keyof Account, value: any) => {
        setCurrentFormData((prev: any) => ({
            ...(prev as Account),
            [key]: value,
        }));
    }, []);

    return {
        accounts,
        isLoading: isFetching,
        isSaving,
        callout,
        setCallout,
        openForEdit,
        openForAdd,
        moveToNextAccount,
        updateFormData,
        handleSave,
        editingAccount,
        currentFormData,
        isDrawerOpen,
        setIsDrawerOpen,
        queueIndex,
        editQueue,
        rowSelection,
        setRowSelection,
    };
}
