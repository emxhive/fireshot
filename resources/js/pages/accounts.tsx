import LayoutShell from '@/components/LayoutShell';
import { createAccount, updateAccount } from '@/features/accounts/actions';
import AccountDrawer from '@/features/accounts/components/AccountDrawer';
import AccountsTable from '@/features/accounts/components/AccountsTable';

import { useAccountsController } from '@/features/accounts/hooks/useAccountsController';
import { useAccountsStore } from '@/features/accounts/store';
import type { Account } from '@/features/accounts/types';

import { usePage } from '@inertiajs/react';
import { RiPlayListAddLine } from '@remixicon/react';
import { Button, Card } from '@tremor/react';
import { useEffect, useState } from 'react';

export default function Accounts() {
    const { accounts: initialAccounts } = usePage<PageProps>().props;
    const [saveStates, setSaveStates] = useState<Record<number, 'idle' | 'saving' | 'success' | 'error'>>({});

    const accounts = useAccountsStore((s) => s.accounts);
    const hydrate = useAccountsStore((s) => s.hydrate);

    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const { editor, queue, form, isSaving, setIsSaving, saveStatus, setSaveStatus, openForAdd, openForEdit } = useAccountsController();

    useEffect(() => {
        if (initialAccounts?.length) hydrate(initialAccounts);
    }, [initialAccounts, hydrate]);

    // NEW handleSave — instant-next, background save, remove-from-queue on success
    async function handleSave() {
        if (!form.values.name) return;

        const acc = form.values;
        const id = acc.id as number;

        // Per-account save state
        setSaveStates((s) => ({ ...s, [id]: 'saving' }));

        const payload = {
            name: acc.name,
            currency: acc.currency,
            balance: acc.balance ?? 0,
            fee: acc.fee ?? 0,
        };

        const isNew = !id || id === 0;

        // ---- INSTANT ADVANCE TO NEXT ACCOUNT ----
        if (queue.hasNext) {
            queue.next();
            const next = queue.current;

            if (next) {
                editor.openForEdit(next);
                form.update(next);
            } else {
                editor.close();
            }
        } else {
            editor.close();
        }

        const updateHandlers = {
            onSuccess: () => {
                setSaveStates((s) => ({ ...s, [id]: 'success' }));
                queue.remove(id);
            },
            onError: () => {
                setSaveStates((s) => ({ ...s, [id]: 'error' }));
            },
        };

        if (isNew) {
            await createAccount(payload);
        } else {
            await updateAccount(id, payload, updateHandlers);
        }
    }

    return (
        <>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-tremor-title font-semibold">Accounts</h3>
                    <Button color="blue" onClick={openForAdd} icon={RiPlayListAddLine}>
                        Add Account
                    </Button>
                </div>

                <Card className="mt-4 overflow-x-auto p-0">
                    <AccountsTable
                        accounts={accounts}
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        onEdit={(account: Account) => {
                            const selectedRows = Object.keys(rowSelection);
                            const selectedAccounts = selectedRows.length ? accounts.filter((_, i) => selectedRows.includes(i.toString())) : [];

                            openForEdit(account, selectedAccounts);
                        }}
                    />
                </Card>
            </div>

            <AccountDrawer
                editor={editor}
                queue={queue}
                form={{
                    data: form.values,
                    onChange: form.setField,
                }}
                isSaving={isSaving}
                saveStatus={saveStatus}
                onSave={handleSave}
            />
        </>
    );
}

Accounts.layout = (page: any) => <LayoutShell>{page}</LayoutShell>;

interface PageProps {
    accounts: Account[];
    [x: string]: any;
}
