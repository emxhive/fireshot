import { ContentPlaceholder } from '@/components/ContentPlaceholder';
import { Card, Grid, Select, SelectItem } from '@tremor/react';
import CompositionChartSection from '../components/CompositionChartSection';
import KpiCard from '../components/KpiCard';
import LayoutShell from '../components/LayoutShell';
import SnapshotSummaryTable from '../components/SnapshotSummaryTable';
import { PortfolioField } from '@/types/fireshots';

export default function Dashboard() {
    return (
        <LayoutShell>
            {/* Content header (page-specific filters stay here) */}
            <div className="p-4 sm:p-6 lg:p-8">
                <header>
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            Overview
                        </h3>
                        <div className="mt-4 items-center sm:mt-0 sm:flex sm:space-x-2">
                            <Select
                                className="w-full sm:w-fit [&>button]:rounded-tremor-small"
                                enableClear={false}
                                defaultValue="7d"
                            >
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="7d">Last 7 days</SelectItem>
                                <SelectItem value="4w">Last 4 weeks</SelectItem>
                                <SelectItem value="6m">
                                    Last 6 months
                                </SelectItem>
                            </Select>
                        </div>
                    </div>
                </header>

                {/* Main grid */}
                <main className="space-y-20">
                    <Grid numItemsMd={2} numItemsLg={3} className="mt-6 gap-10">
                        {(
                            [
                                'Balance',
                                'Change',
                                'Transactions',
                            ] as PortfolioField[]
                        ).map((field) => (
                            <KpiCard key={field} field={field} />
                        ))}
                    </Grid>

                    {/* Snapshot table */}
                    <SnapshotSummaryTable />

                    {/* Composition chart + portfolio */}
                    <CompositionChartSection />

                    {/* Keep placeholder for rhythm (optional) */}
                    <Card className="mt-4 h-40 rounded-tremor-small p-2">
                        <ContentPlaceholder />
                    </Card>
                </main>
            </div>
        </LayoutShell>
    );
}
