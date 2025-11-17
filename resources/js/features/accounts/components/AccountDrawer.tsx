import { Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { timeAgo } from '@/lib/utils';
import { Button } from '@tremor/react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import AccountForm from './AccountForm';

const AccountDrawer: React.FC<Props> = ({ editor, queue, form, isSaving, onSave, saveStatus }) => (
    <Drawer
        open={editor.isOpen}
        onOpenChange={(open) => {
            // We only care about closing from inside the drawer;
            // opening is controlled externally via editor.open(...)
            if (!open) {
                editor.close();
            }
        }}
    >
        <DrawerContent className="dark:bg-gray-925 overflow-x-hidden sm:max-w-lg">
            <DrawerHeader>
                <DrawerTitle>
                    <div>
                        {editor.current?.id && editor.current.id !== 0 ? 'Edit Account' : 'Add Account'}
                        {queue.hasNext ? ` (${queue.index + 1}/${queue.total})` : ''}
                    </div>

                    <span className="text-xs text-zinc-400">
                        {editor.current?.id && editor.current.id !== 0 ? `Last Edited ${timeAgo(editor.current?.updatedAt)}` : ''}
                    </span>
                </DrawerTitle>
            </DrawerHeader>

            <DrawerBody className="-mx-6 px-6 pb-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={form.data?.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        <AccountForm data={form.data} onChange={form.onChange} />
                    </motion.div>
                </AnimatePresence>
            </DrawerBody>

            <DrawerFooter className="dark:bg-gray-925 -mx-6 -mb-2 flex flex-col gap-3 bg-white px-6">
                <div className="flex w-full justify-between gap-2">
                    {queue.total > 1 && (
                        <Button variant="secondary" className="w-32" onClick={queue.next} disabled={isSaving}>
                            Skip
                        </Button>
                    )}
                    <Button className="w-32" disabled={isSaving || !form.data?.name} onClick={onSave}>
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

interface EditorStateLike {
    isOpen: boolean;
    current: Account | null;
    close: () => void;
}

interface EditQueueLike {
    index: number;
    total: number;
    next: () => void;
    hasNext: boolean;
}

interface AccountFormAdapter {
    data: Partial<Account> | null;
    onChange: (key: keyof Account, value: any) => void;
}

interface Props {
    editor: EditorStateLike;
    queue: EditQueueLike;
    form: AccountFormAdapter;
    isSaving: boolean;
    onSave: () => void;
    saveStatus: 'success' | 'error' | 'idle';
}
