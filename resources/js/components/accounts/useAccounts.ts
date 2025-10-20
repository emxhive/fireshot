import { useCallback, useEffect, useState } from 'react';
import { createAccount, fetchAccounts, updateAccount } from '@/lib/api';

export interface Account {
    id: number;
    name: string;
    currency: string;
    fee: number;
    balance: number;
    lastUpdated: string;
}

export default function useAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(false);
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

    /* ---------------------------- Fetch all accounts ---------------------------- */
    const loadAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetchAccounts();
            if (res.status === 'success') {
                const data: Account[] = res.accounts.map((a: any) => ({
                    id: a.id,
                    name: a.name,
                    currency: a.currency_code || '',
                    fee: a.fee_percent ?? 0,
                    balance: a.balance ?? 0,
                    lastUpdated: a.updated_at,
                }));
                setAccounts(data);
            } else {
                setCallout({
                    type: 'error',
                    message: res.message || 'Failed to load accounts',
                });
            }
        } catch (e) {
            setCallout({ type: 'error', message: 'Could not fetch accounts.' });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccounts().then(r => console.log(r) );
    }, [loadAccounts]);

    /* -------------------------- Drawer + Queue Logic --------------------------- */
    const openForEdit = useCallback(
        (account?: Account, selectedAccounts: Account[] = []) => {
            const multiple = selectedAccounts.length > 1;
            if (multiple) {
                setEditQueue(selectedAccounts);
                setQueueIndex(0);
                setEditingAccount(selectedAccounts[0]);
                setCurrentFormData(selectedAccounts[0]); // ✅ show first account in queue
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

    /* ------------------------------ Queue control ----------------------------- */
    const moveToNextAccount = useCallback(() => {
        if (editQueue.length > 1) {
            const nextIndex = queueIndex + 1;
            if (nextIndex < editQueue.length) {
                setQueueIndex(nextIndex);
                const nextAcc = editQueue[nextIndex];
                setEditingAccount(nextAcc);
                setCurrentFormData(nextAcc); // ✅ update form
            } else {
                // finished queue
                setIsDrawerOpen(false);
                setEditQueue([]);
            }
        } else {
            setIsDrawerOpen(false);
        }
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
            let res;
            if (currentFormData.id && currentFormData.id !== 0)
                res = await updateAccount(currentFormData.id, payload);
            else res = await createAccount(payload);

            if (res.status !== 'success') throw new Error(res.message || 'Save failed');

            await loadAccounts();

            // ✅ remove the saved account from the queue
            if (editQueue.length > 0 && currentFormData.id) {
                const remaining = editQueue.filter((a) => a.id !== currentFormData.id);

                if (remaining.length > 0) {
                    const nextIndex = queueIndex >= remaining.length ? 0 : queueIndex;
                    const nextAcc = remaining[nextIndex];
                    setEditQueue(remaining);
                    setQueueIndex(nextIndex);
                    setEditingAccount(nextAcc);
                    setCurrentFormData(nextAcc);
                } else {
                    setEditQueue([]);
                    setIsDrawerOpen(false);
                }
            } else {
                // single edit or create
                setIsDrawerOpen(false);
            }
        } catch (e) {
            console.error(e);

        } finally {
            setIsSaving(false);
        }
    }, [currentFormData, editQueue, queueIndex, loadAccounts]);

    const openForAdd = useCallback(() => {
        setEditQueue([]);
        setQueueIndex(0);
        const newAcct: Account = {
            id: 0,
            name: '',
            currency: 'USD',
            fee: 0,
            balance: 0,
            lastUpdated: new Date().toISOString(),
        };
        setEditingAccount(newAcct);
        setCurrentFormData(newAcct);
        setIsDrawerOpen(true);
    }, []);

    const updateFormData = useCallback((key: keyof Account, value: any) => {
        setCurrentFormData((prev) => ({ ...(prev as Account), [key]: value }));
    }, []);

    return {
        accounts,
        rowSelection,
        setRowSelection,
        isLoading,
        isSaving,
        callout,
        setCallout,
        loadAccounts,
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
    };
}
