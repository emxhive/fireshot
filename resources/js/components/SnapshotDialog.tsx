import {
    Button,
    DatePicker,
    Dialog,
    DialogPanel,
    Text,
    TextInput,
    Title,
} from '@tremor/react';

type Props = {
    open: boolean;
    onClose: (open: boolean) => void;
    snapshotDate: Date;
    setSnapshotDate: (d: Date) => void;
    sellRate: string;
    setSellRate: (v: string) => void;
    buyDiff: string;
    setBuyDiff: (v: string) => void;
    onConfirm: () => void;
};

export default function SnapshotDialog({
    open,
    onClose,
    snapshotDate,
    setSnapshotDate,
    sellRate,
    setSellRate,
    buyDiff,
    setBuyDiff,
    onConfirm,
}: Props) {
    return (
        <Dialog open={open} onClose={onClose} static={true}>
            <DialogPanel className="w-full max-w-3xl space-y-6 p-6">
                <div className="space-y-1">
                    <Title>Take Snapshot</Title>
                    <Text className="text-tremor-content">
                        Choose the Lagos calendar date and enter the FX sell
                        rate (and optional buy-diff) to capture today’s
                        balances.
                    </Text>
                </div>

                {/* Form layout */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div className="space-y-2">
                        <Text className="text-sm font-medium text-tremor-content">
                            Snapshot Date
                        </Text>
                        <DatePicker
                            enableYearNavigation
                            value={snapshotDate}
                            onValueChange={(v) => setSnapshotDate(v as Date)}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Text className="text-sm font-medium text-tremor-content">
                            Sell Rate (NGN)
                        </Text>
                        <TextInput
                            type="number"
                            inputMode="decimal"
                            placeholder="e.g. 1620"
                            value={sellRate}
                            onChange={(e) => setSellRate(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Text className="text-sm font-medium text-tremor-content">
                            Buy Diff (NGN)
                        </Text>
                        <TextInput
                            type="number"
                            inputMode="decimal"
                            placeholder="e.g. 25"
                            value={buyDiff}
                            onChange={(e) => setBuyDiff(e.target.value)}
                            className="w-full"
                        />
                        <Text className="text-xs text-tremor-content-subtle">
                            Optional: difference between sell and buy rates. If
                            left blank, buy rate = sell rate.
                        </Text>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-2 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => onClose(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm}>Confirm</Button>
                </div>
            </DialogPanel>
        </Dialog>
    );
}
