import { useState } from 'react';
import type { Account } from '../types';

export type EditorMode = 'create' | 'edit';

export function useEditorState() {
    const [isOpen, setIsOpen] = useState(false);
    const [current, setCurrent] = useState<Account | null>(null);
    const [mode, setMode] = useState<EditorMode>('create');

    function openForCreate(account: Account) {
        setMode('create');
        setCurrent(account);
        setIsOpen(true);
    }

    function openForEdit(account: Account) {
        setMode('edit');
        setCurrent(account);
        setIsOpen(true);
    }

    function close() {
        setIsOpen(false);
        setCurrent(null);
    }

    return {
        isOpen,
        mode,
        current,
        openForCreate,
        openForEdit,
        close,
    };
}
