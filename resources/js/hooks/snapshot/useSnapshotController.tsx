import { useRunSnapshotMutation } from '@/hooks/useRunSnapshotMutation';
import { useState } from 'react';

export function useSnapshotController(latestMeta?: LatestMeta) {
    const runSnapshotMutation = useRunSnapshotMutation();

    const [open, setOpen] = useState(false);

    const [fields, setFields] = useState(() => ({
        snapshotDate: new Date(),
        sellRate: (latestMeta?.sell_rate ?? '').toString(),
        buyDiff: (latestMeta?.buy_diff ?? '').toString(),
    }));

    const openDialog = () => {
        setFields({
            snapshotDate: new Date(),
            sellRate: (latestMeta?.sell_rate ?? '').toString(),
            buyDiff: (latestMeta?.buy_diff ?? '').toString(),
        });
        setOpen(true);
    };

    const closeDialog = () => {
        setOpen(false);
    };

    const update = (key: keyof typeof fields, value: any) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    const run = () => {
        runSnapshotMutation.mutate(
            {
                snapshot_date: fields.snapshotDate.toISOString().split('T')[0],
                sell_rate: parseFloat(fields.sellRate),
                buy_diff: parseFloat(fields.buyDiff) ?? 0,
            },
            {
                onSuccess: () => {
                    console.log('Snapshot run successful!... CONTROLLER');
                    closeDialog();
                },
            },
        );
    };

    return {
        open,
        fields,
        openDialog,
        closeDialog,
        update,
        run,
        loading: runSnapshotMutation.isPending,
    };
}
