import LayoutShell from '@/components/LayoutShell';
import AccountDrawer from '@/components/accounts/AccountDrawer';
import AccountsTable from '@/components/accounts/AccountsTable';
import useAccounts from '@/hooks/useAccounts';
import { RiPlayListAddLine } from '@remixicon/react';
import { Button, Card } from '@tremor/react';

export default function Accounts() {
    const {
        accounts,
        rowSelection,
        setRowSelection,
        openForAdd,
        openForEdit,
        moveToNextAccount,
        updateFormData,
        handleSave,
        saveStatus,
        editingAccount,
        currentFormData,
        isDrawerOpen,
        setIsDrawerOpen,
        isSaving,
        queueIndex,
        editQueue,
    } = useAccounts();

    return (
        <>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">Accounts</h3>
                    <Button color="blue" variant="primary" onClick={openForAdd} icon={RiPlayListAddLine}>
                        Add Account
                    </Button>
                </div>

                <Card className="mt-4 overflow-x-auto p-0">
                    <AccountsTable
                        accounts={accounts}
                        rowSelection={rowSelection}
                        setRowSelection={setRowSelection}
                        onEdit={(account) => {
                            const selectedRows = Object.keys(rowSelection);
                            const selectedAccounts = selectedRows.length ? accounts.filter((_: any, i: any) => selectedRows.includes(i.toString())) : [];
                            openForEdit(account, selectedAccounts);
                        }}
                    />
                </Card>
            </div>

            <AccountDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                data={currentFormData}
                isSaving={isSaving}
                onSave={handleSave}
                onSkip={moveToNextAccount}
                onChange={updateFormData}
                queueIndex={queueIndex}
                totalQueued={editQueue.length}
                editingAccount={editingAccount}
                saveStatus={saveStatus} // ✅ new prop
            />
        </>
    );
}

// Persistent layout
Accounts.layout = (page: any) => <LayoutShell children={page} />;
