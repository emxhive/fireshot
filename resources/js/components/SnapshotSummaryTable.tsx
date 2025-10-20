import { runSnapshot } from '@/lib/api';
import { formatNGN, formatUSD } from '@/lib/format';
import type { DashboardPageProps, SnapshotSummary } from '@/types/fireshots.d';
import { router, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
} from '@tremor/react';
import { useMemo, useState } from 'react';
import SnapshotDialog from './SnapshotDialog';

export default function SnapshotSummaryTable() {
    const [open, setOpen] = useState(false);
    const [sellRate, setSellRate] = useState('');
    const [buyDiff, setBuyDiff] = useState('25');
    const [snapshotDate, setSnapshotDate] = useState<Date>(new Date());

    const { props } = usePage<DashboardPageProps>();
    const data = useMemo<SnapshotSummary[]>(() => {
        const p = props as any as DashboardPageProps;
        return p.summaries ?? [];
    }, [props]);

    const loading = false;

    // --- Handle snapshot trigger ---
    const handleConfirm = async () => {
        const payload = {
            snapshot_date: snapshotDate.toISOString().split('T')[0],
            sell_rate: parseFloat(sellRate),
            buy_diff: buyDiff ? parseFloat(buyDiff) : 25,
        };

        await runSnapshot(payload);
        // Refresh only relevant props on the page
        router.reload({
            only: ['summaries', 'seriesMonth', 'seriesWeek', 'records'],
        });
        setOpen(false);
    };

    return (
        <Card className="p-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between sm:space-x-10">
                <div>
                    <h3 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        Daily Snapshots
                    </h3>
                    <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
                        Overview of recent captured daily portfolio summaries.
                    </p>
                </div>
                <Button
                    onClick={() => setOpen(true)}
                    className="mt-4 w-full whitespace-nowrap rounded-tremor-small bg-tremor-brand px-4 py-2.5 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis sm:mt-0 sm:w-fit dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
                >
                    Take Snapshot
                </Button>
            </div>

            {/* Table */}
            <Table className="mt-8">
                <TableHead>
                    <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell className="text-right">
                            USD
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                            NGN
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                            Unified (NGN)
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                            Transactions
                        </TableHeaderCell>
                        <TableHeaderCell className="text-right">
                            Change
                        </TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                <Text>No snapshots found.</Text>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((s) => (
                            <TableRow key={s.date}>
                                <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    {s.date}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatUSD(s.usd)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNGN(s.ngn)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNGN(s.unifiedNGN)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatNGN(s.transactions)}
                                </TableCell>
                                <TableCell
                                    className={`text-right ${s.change >= 0 ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500'}`}
                                >
                                    {formatNGN(s.change)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {/* Dialog */}
            <SnapshotDialog
                open={open}
                onClose={setOpen}
                snapshotDate={snapshotDate}
                setSnapshotDate={setSnapshotDate}
                sellRate={sellRate}
                setSellRate={setSellRate}
                buyDiff={buyDiff}
                setBuyDiff={setBuyDiff}
                onConfirm={handleConfirm}
            />
        </Card>
    );
}
