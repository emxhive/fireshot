import { ContentPlaceholder } from '@/components/ContentPlaceholder';
import { useFireshotsRecordsQuery } from '@/hooks/useFireshotsRecordsQuery';
import { useAggregatedSummaries } from '@/hooks/useAggregatedSummaries';
import { Card, Grid, Select, SelectItem } from '@tremor/react';
import { useMemo, useState } from 'react';
import CompositionChartSection from '../components/CompositionChartSection';
import KpiCard from '../components/KpiCard';
import LayoutShell from '../components/LayoutShell';
import SnapshotSummaryTable from '../components/SnapshotSummaryTable';

export default function Dashboard() {
    const [period, setPeriod] = useState<KpiPeriodOptions>('7d');

    const { summaries: day30, isLoading: dayLoading } = useAggregatedSummaries(
        'day',
        30,
    );
    const { summaries: week12, isLoading: weekLoading } = useAggregatedSummaries(
        'week',
        84,
    );
    const { summaries: month12, isLoading: monthLoading } = useAggregatedSummaries(
        'month',
        365,
    );
    const { data: records, isLoading: recLoading } = useFireshotsRecordsQuery();

    const isLoading = dayLoading || weekLoading || monthLoading || recLoading;

    // decide which slice KPI uses based on select
    const kpiSlice: SummaryRow[] = useMemo(() => {
        if (period === '7d') return day30.slice(-7);
        if (period === '4w') return week12.slice(0, 4);
        if (period === '6m') return month12.slice(0, 6);
        return [];
    }, [period, day30, week12, month12]);

    // precompute metrics once
    const latest = kpiSlice[kpiSlice.length - 1]; // ✅ latest
    const oldest = kpiSlice[0];

    const totalTx = kpiSlice.reduce((sum, s) => sum + (s.transactions || 0), 0);

    const balanceVal = latest?.netAssetValue ?? 0;
    const txVal = totalTx;
    const changeVal =
        (latest?.netAssetValue ?? 0) - (oldest?.netAssetValue ?? 0) - totalTx;

    const sparkData = {
        Balance: [...kpiSlice].map((s) => ({
            date: `${s.from} → ${s.to}`,
            value: s.netAssetValue,
        })),
        Change: [...kpiSlice].map((s) => ({
            date: `${s.from} → ${s.to}`,
            value: s.valuationDelta,
        })),
        Transactions: [...kpiSlice].map((s) => ({
            date: `${s.from} → ${s.to}`,
            value: s.transactions,
        })),
    };
    const kpiData = {
        Balance: { value: balanceVal, spark: sparkData.Balance },
        Change: { value: changeVal, spark: sparkData.Change },
        Transactions: { value: txVal, spark: sparkData.Transactions },
    };

    const newestSummary = kpiSlice[kpiSlice.length - 1];

    // handle snapshot re-fetch
    const [reloadKey, setReloadKey] = useState(0);
    const handleSnapshotRun = () => setReloadKey((k) => k + 1);

    return (
        <>
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <header>
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">Overview</h3>
                        <div className="mt-4 items-center sm:mt-0 sm:flex sm:space-x-2">
                            <Select
                                className="w-full sm:w-fit [&>button]:rounded-tremor-small"
                                enableClear={false}
                                value={period}
                                onValueChange={(v) => setPeriod((v as any) ?? '7d')}
                            >
                                <SelectItem value="7d">Last 7 Days</SelectItem>
                                <SelectItem value="4w">Last 4 Weeks</SelectItem>
                                <SelectItem value="6m">Last 6 Months</SelectItem>
                            </Select>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="space-y-20">
                    {/* KPI GRID */}
                    <Grid numItemsMd={2} numItemsLg={3} className="mt-6 gap-10">
                        {isLoading || !records || !newestSummary ? (
                            <>
                                <Card className="h-32 animate-pulse" />
                                <Card className="h-32 animate-pulse" />
                                <Card className="h-32 animate-pulse" />
                            </>
                        ) : (
                            <>
                                {Object.entries(kpiData).map(([field, data]) => (
                                    <KpiCard key={field} period={period} field={field as KpiField} data={data} records={records} />
                                ))}
                            </>
                        )}
                    </Grid>

                    {/* SNAPSHOT TABLE */}
                    <SnapshotSummaryTable data={day30} loading={dayLoading} onSnapshotRun={handleSnapshotRun} />

                    {/* COMPOSITION CHART */}
                    <CompositionChartSection weekly={week12} monthly={month12} loading={weekLoading || monthLoading} />

                    {/* Placeholder */}
                    <Card className="mt-4 h-40 rounded-tremor-small p-2">
                        <ContentPlaceholder />
                    </Card>
                </main>
            </div>
        </>
    );
}

// Persistent layout
Dashboard.layout = (page: any) => <LayoutShell children={page} />;
