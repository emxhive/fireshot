import { useSnapshotController } from '@/hooks/snapshot';
import { Button, DatePicker, Dialog, DialogPanel, Text, TextInput, Title } from '@tremor/react';

export default function SnapshotDialog({ controller }: { controller: ReturnType<typeof useSnapshotController> }) {
    const { open, closeDialog, fields, update, run, loading } = controller;

    return (
        <Dialog open={open} onClose={closeDialog} static={true}>
            <DialogPanel className="w-full max-w-3xl space-y-6 p-6">
                <div className="space-y-1">
                    <Title>Take Snapshot</Title>
                    <Text className="text-tremor-content">Choose the date and FX rates to capture today’s balances.</Text>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-2">
                        <Text className="text-sm font-medium">Snapshot Date</Text>
                        <DatePicker
                            enableYearNavigation
                            value={fields.snapshotDate}
                            onValueChange={(v) => update('snapshotDate', v as Date)}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Text className="text-sm font-medium">Sell Rate (NGN)</Text>
                        <TextInput type="number" value={fields.sellRate} onChange={(e) => update('sellRate', e.target.value)} className="w-full" />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Text className="text-sm font-medium">Buy Diff (NGN)</Text>
                        <TextInput type="number" value={fields.buyDiff} onChange={(e) => update('buyDiff', e.target.value)} className="w-full" />
                        <Text className="text-xs text-tremor-content-subtle">Optional — defaults to 25 if empty.</Text>
                    </div>
                </div>

                <div className="mt-2 flex justify-end gap-2">
                    <Button variant="secondary" onClick={closeDialog}>
                        Cancel
                    </Button>
                    <Button onClick={run} disabled={loading}>
                        {loading ? 'Running…' : 'Confirm'}
                    </Button>
                </div>
            </DialogPanel>
        </Dialog>
    );
}
