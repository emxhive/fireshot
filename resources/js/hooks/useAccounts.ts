import { useAccountsData } from './data/useAccountsData';
import { useAccountEditor } from './ui/useAccountEditor';

/**
 * Combines data + UI layers into a unified interface
 * consumed by the Accounts page and drawer components.
 */
export default function useAccounts() {
  const data = useAccountsData();
  const editor = useAccountEditor();

  const handleSave = async () => {
    const { currentFormData, editQueue, queueIndex } = editor;
    if (!currentFormData) return;

    const payload = {
      name: currentFormData.name,
      currency: currentFormData.currency,
      fee: currentFormData.fee,
      balance: currentFormData.balance,
    };

    editor.setIsSaving(true);
    editor.setSaveStatus('idle');

    try {
      if (currentFormData.id && currentFormData.id !== 0) {
        await data.update.mutateAsync({ id: currentFormData.id, payload });
      } else {
        await data.create.mutateAsync(payload);
      }

      editor.setSaveStatus('success');
      setTimeout(() => editor.setSaveStatus('idle'), 2500);

      await data.refetch?.();

      // Queue progression logic
      if (editQueue.length > 0 && currentFormData.id) {
        const remaining = editQueue.filter((a) => a.id !== currentFormData.id);
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
    } catch (e) {
      console.error(e);
      editor.setSaveStatus('error');
      setTimeout(() => editor.setSaveStatus('idle'), 2500);
    } finally {
      editor.setIsSaving(false);
    }
  };

  return {
    ...data,
    ...editor,
    handleSave,
  };
}

