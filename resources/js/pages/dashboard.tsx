import { ContentPlaceholder } from '@/components/ContentPlaceholder';
import { useDashboardData } from '@/hooks/data/useDashboardData';
import { useKpiMetrics } from '@/hooks/useKpiMetrics';
import { Card, Grid, Select, SelectItem } from '@tremor/react';
import { useState } from 'react';
import CompositionChartSection from '../components/CompositionChartSection';
import KpiCard from '../components/KpiCard';
import LayoutShell from '../components/LayoutShell';
import SnapshotSummaryTable from '../components/SnapshotSummaryTable';

export default function Dashboard() {
    const [period, setPeriod] = useState<KpiPeriodOptions>('30d');

    const { day30, week12, month12, loading } = useDashboardData();
    const { kpiData, newest } = useKpiMetrics({ day30, week12, month12 }, period);

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
                                onValueChange={(v) => setPeriod((v as any) ?? '30d')}
                            >
                                <SelectItem value="30d">Last 30 Days</SelectItem>
                                <SelectItem value="12w">Last 12 Weeks</SelectItem>
                                <SelectItem value="12m">Last 12 Months</SelectItem>
                            </Select>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="space-y-20">
                    {/* KPI GRID */}
                    <Grid numItemsMd={2} numItemsLg={3} className="mt-6 gap-10">
                        {loading || !newest ? (
                            <>
                                <Card className="h-32 animate-pulse" />
                                <Card className="h-32 animate-pulse" />
                                <Card className="h-32 animate-pulse" />
                            </>
                        ) : (
                            <>
                                {Object.entries(kpiData).map(([field, data]) => (
                                    <KpiCard key={field} period={period} field={field as KpiField} data={data} />
                                ))}
                            </>
                        )}
                    </Grid>

                    {/* SNAPSHOT TABLE */}
                    <SnapshotSummaryTable data={day30} loading={loading && day30.length === 0} onSnapshotRun={handleSnapshotRun} />

                    {/* COMPOSITION CHART */}
                    <CompositionChartSection weekly={week12} monthly={month12} loading={loading && (week12.length === 0 || month12.length === 0)} />

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
