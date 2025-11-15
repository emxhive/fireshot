import { useSnapshotController } from '@/hooks/snapshot';
import { formatNGN, formatUSD } from '@/lib/format';
import { Button, Card, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Text } from '@tremor/react';
import SnapshotDialog from './SnapshotDialog';

export default function SnapshotSummaryTable({ data, loading, latestMeta }: SnapshotTableProps) {
    const controller = useSnapshotController(latestMeta);

    return (
        <Card className="p-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-semibold">Daily Snapshots</h3>
                    <p className="mt-1 text-sm text-tremor-content">Overview of recent captured daily portfolio summaries.</p>
                </div>

                <Button onClick={controller.openDialog} className="mt-4 sm:mt-0">
                    Take Snapshot
                </Button>
            </div>

            <Table className="mt-8">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell className="text-right">USD</TableHeaderCell>
                        <TableHeaderCell className="text-right">NGN</TableHeaderCell>
                        <TableHeaderCell className="text-right">Unified</TableHeaderCell>
                        <TableHeaderCell className="text-right">Transactions</TableHeaderCell>
                        <TableHeaderCell className="text-right">Change</TableHeaderCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                <Text>Loading...</Text>
                            </TableCell>
                        </TableRow>
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                <Text>No snapshots found.</Text>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((s) => {
                            const label = `${s.from} → ${s.to}`;
                            return (
                                <TableRow key={label}>
                                    <TableCell className="font-medium">{label}</TableCell>
                                    <TableCell className="text-right">{formatUSD(s.usd)}</TableCell>
                                    <TableCell className="text-right">{formatNGN(s.ngn)}</TableCell>
                                    <TableCell className="text-right">{formatNGN(s.netAssetValue)}</TableCell>
                                    <TableCell className="text-right">{formatNGN(s.transactions)}</TableCell>
                                    <TableCell className={`text-right ${s.valuationDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {formatNGN(s.valuationDelta)}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>

            <SnapshotDialog controller={controller} />
        </Card>
    );
}
