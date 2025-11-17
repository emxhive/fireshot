import { useForm } from '@/hooks/useForm';
import { useEffect, useState } from 'react';
import { defaultAccount } from '../constants';
import type { Account } from '../types';
import { useEditQueue } from './useEditQueue';
import { useEditorState } from './useEditorState';

export function useAccountsController() {
    const editor = useEditorState();
    const queue = useEditQueue();
    const form = useForm<Account>(defaultAccount);

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Sync form when editor/queue switch accounts
    useEffect(() => {
        const target = queue.current ?? editor.current;

        if (!target) {
            form.reset();
            return;
        }

        form.update(target);
    }, [queue.current?.id, editor.current?.id]);

    // Expose UI helpers
    function openForAdd() {
        queue.reset();
        const fresh: Account = {
            ...defaultAccount,
            updatedAt: new Date().toISOString(),
        };
        editor.openForCreate(fresh);
        form.update(fresh);
        setSaveStatus('idle');
    }

    function openForEdit(account: Account, selected: Account[]) {
        const seen = new Set<number>();
        const list: Account[] = [];

        const push = (acc: Account) => {
            if (!seen.has(acc.id)) {
                seen.add(acc.id);
                list.push(acc);
            }
        };

        push(account);
        selected.forEach(push);

        if (list.length > 1) {
            queue.start(list);
        } else {
            queue.reset();
        }

        editor.openForEdit(account);
        form.update(account);
        setSaveStatus('idle');
    }

    return {
        editor,
        queue,
        form,
        isSaving,
        setIsSaving,
        saveStatus,
        setSaveStatus,
        openForAdd,
        openForEdit,
    };
}
