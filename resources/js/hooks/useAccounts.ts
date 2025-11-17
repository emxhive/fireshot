// import { update } from '@/routes/shots/accounts';

import { update } from '@/actions/App/Http/Controllers/AccountsApiController';
import { callApi } from '@/lib/api';
import { create } from '@/routes/shots/accounts';
import { useAccountEditor } from './ui/useAccountEditor';

import { useEffect } from 'react';

export default function useAccounts(accounts: Account[]) {
    const editor = useAccountEditor();

    useEffect(() => {
        if (!editor.isSaving) {
            handleQueue();
            editor.setSaveStatus('idle');
        }
    }, [accounts]);

    const handleQueue = () => {
        const { editQueue, queueIndex, data } = editor;

        // @ts-ignore
        if (editQueue.length > 0 && data.id) {
            // @ts-ignore
            const remaining = editQueue.filter((a) => a.id !== data.id);

            if (remaining.length > 0) {
                const nextIndex = queueIndex >= remaining.length ? 0 : queueIndex;
                const nextAcc = remaining[nextIndex];

                editor.setEditQueue(remaining);
                editor.setQueueIndex(nextIndex);
                editor.setEditingAccount(nextAcc);
                editor.setCurrentFormData(nextAcc);
            } else {
                editor.setEditQueue([]);
                editor.setIsDrawerOpen(false);
            }
        } else {
            editor.setIsDrawerOpen(false);
        }
    };
    const handleSave = async () => {
        const { data, setSaveStatus, setIsSaving } = editor;
        if (!data) return;

        const payload = {
            name: data.name,
            currency: data.currency,
            fee: data.fee,
            balance: data.balance,
        };

        setIsSaving(true);
        setSaveStatus('idle');

        if (data.id && data.id !== 0) {
            await callApi(update(data.id), payload);
        } else {
            await callApi(create(), payload);
        }

        setIsSaving(false);
    };

    return {
        ...editor,
        accounts,
        handleSave,
    };
}
