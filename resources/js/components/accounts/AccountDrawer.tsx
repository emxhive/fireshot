import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { timeAgo } from '@/lib/utils';
import { Button } from '@tremor/react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import AccountForm from './AccountForm';

interface Props {
    isOpen: boolean;
    onOpenChange: (v: boolean) => void;
    data: Partial<Account> | null;
    isSaving: boolean;
    onSave: () => void;
    onSkip: () => void;
    onChange: (key: keyof Account, value: any) => void;
    queueIndex: number;
    totalQueued: number;
    editingAccount: Account | null;
    saveStatus: 'success' | 'error' | 'idle';
}

const AccountDrawer: React.FC<Props> = ({
    isOpen,
    onOpenChange,
    saveStatus,
    data,
    isSaving,
    onSave,
    onSkip,
    onChange,
    queueIndex,
    totalQueued,
    editingAccount,
}) => (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="dark:bg-gray-925 overflow-x-hidden sm:max-w-lg">
            <DrawerHeader>
                <DrawerTitle>
                    <div>
                        {editingAccount?.id && editingAccount.id !== 0 ? 'Edit Account' : 'Add Account'}
                        {totalQueued > 1 ? ` (${queueIndex + 1}/${totalQueued})` : ''}
                    </div>

                    <span className="text-xs text-zinc-400">
                        {editingAccount?.id && editingAccount.id !== 0 ? `Last Edited ${timeAgo(editingAccount?.updatedAt)}` : ''}
                    </span>
                </DrawerTitle>
            </DrawerHeader>

            <DrawerBody className="-mx-6 px-6 pb-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={data?.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        <AccountForm data={data} onChange={onChange} />
                    </motion.div>
                </AnimatePresence>
            </DrawerBody>

            <DrawerFooter className="dark:bg-gray-925 -mx-6 -mb-2 flex flex-col gap-3 bg-white px-6">
                <div className="flex w-full justify-between gap-2">
                    {totalQueued > 1 && (
                        <Button variant="secondary" className="w-32" onClick={onSkip} disabled={isSaving}>
                            Skip
                        </Button>
                    )}
                    <Button className="w-32" disabled={isSaving || !data?.name} onClick={onSave}>
                        {isSaving ? 'Saving…' : 'Save'}
                    </Button>
                </div>

                {/* ✅ Animated save-status footer */}
                <AnimatePresence mode="wait">
                    {saveStatus !== 'idle' && (
                        <motion.div
                            key={saveStatus}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.25 }}
                            className={`text-center text-sm ${
                                saveStatus === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}
                        >
                            {saveStatus === 'success' ? '✓ Saved successfully' : '✕ Failed to save, please try again'}
                        </motion.div>
                    )}
                </AnimatePresence>
            </DrawerFooter>
        </DrawerContent>
    </Drawer>
);

export default AccountDrawer;
