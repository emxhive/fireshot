import { useCallback, useState } from 'react';

/**
 * Manages drawer, queue, and form state for account editing.
 * Purely UI-related state — no network or Firefly calls.
 */
export function useAccountEditor() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [rowSelection, setRowSelection] = useState({});
    const [editQueue, setEditQueue] = useState<Account[]>([]);
    const [queueIndex, setQueueIndex] = useState(0);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [currentFormData, setCurrentFormData] = useState<Partial<Account> | null>(null);

    /* ------------------------ Drawer + Queue Logic ------------------------ */
    const openForEdit = useCallback((account?: Account, selectedAccounts: Account[] = []) => {
        const multiple = selectedAccounts.length > 1;
        if (multiple) {
            setEditQueue(selectedAccounts);
            setQueueIndex(0);
            setEditingAccount(selectedAccounts[0]);
            setCurrentFormData(selectedAccounts[0]);
        } else if (account || selectedAccounts.length === 1) {
            const target = account ?? selectedAccounts[0];
            setEditQueue([]);
            setQueueIndex(0);
            setEditingAccount(target);
            setCurrentFormData(target);
        } else return;

        setIsDrawerOpen(true);
    }, []);

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
        } else {
            setIsDrawerOpen(false);
        }
    }, [editQueue, queueIndex]);

    const openForAdd = useCallback(() => {
        setEditQueue([]);
        setQueueIndex(0);
        const newAcct: Account = {
            id: 0,
            name: '',
            currency: 'USD',
            fee: 0,
            balance: 0,
            updatedAt: new Date().toISOString(),
        };
        setEditingAccount(newAcct);
        setCurrentFormData(newAcct);
        setIsDrawerOpen(true);
    }, []);

    const updateFormData = useCallback((key: keyof Account, value: any) => {
        setCurrentFormData((prev) => ({ ...(prev as Account), [key]: value }));
    }, []);

    return {
        // core state
        isDrawerOpen,
        setIsDrawerOpen,
        isSaving,
        setIsSaving,
        saveStatus,
        setSaveStatus,
        rowSelection,
        setRowSelection,
        editQueue,
        setEditQueue,
        queueIndex,
        setQueueIndex,
        editingAccount,
        setEditingAccount,
        data: currentFormData,
        setCurrentFormData,
        // actions
        openForEdit,
        moveToNextAccount,
        openForAdd,
        updateFormData,
    };
}
