'use client';

import { formatNGN } from '@/lib/format';
import type { DashboardPageProps, PortfolioField, SeriesPoint } from '@/types/fireshots.d';
import { Card, LineChart, Select, SelectItem, Text } from '@tremor/react';
import { useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';

function computeStats(series: SeriesPoint[], field: PortfolioField) {
    const values = series.map((p) => p[field]);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = values.length ? sum / values.length : 0;
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    return { avg, min, max };
}

export default function CompositionChartSection() {
    const [granularity, setGranularity] = useState<'months' | 'weeks'>('months');
    const [portfolioField, setPortfolioField] = useState<PortfolioField>('Change');
    const { props } = usePage<DashboardPageProps>();

    const series: SeriesPoint[] = useMemo(() => {
        const p = props as any as DashboardPageProps;
        return granularity === 'months' ? p.seriesMonth ?? [] : p.seriesWeek ?? [];
    }, [props, granularity]);

    const categories: Array<PortfolioField> = ['Transactions', 'Change', 'Balance'];

    const { avg, min, max } = computeStats(series, portfolioField);

    return (
        <Card className="mt-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Text className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    Portfolio: {portfolioField}
                </Text>
                <div className="flex gap-2">
                    <Select
                        className="w-40 [&>button]:rounded-tremor-small"
                        enableClear={false}
                        defaultValue={granularity}
                        onValueChange={(v) => setGranularity((v as 'months' | 'weeks') ?? 'months')}
                    >
                        <SelectItem value="months">Last 12 months</SelectItem>
                        <SelectItem value="weeks">Last 12 weeks</SelectItem>
                    </Select>
                    <Select
                        className="w-44 [&>button]:rounded-tremor-small"
                        enableClear={false}
                        defaultValue={portfolioField}
                        onValueChange={(v) => setPortfolioField((v as PortfolioField) ?? 'Change')}
                    >
                        <SelectItem value="Change">Portfolio: Change</SelectItem>
                        <SelectItem value="Transactions">Portfolio: Transactions</SelectItem>
                        <SelectItem value="Balance">Portfolio: Balance</SelectItem>
                    </Select>
                </div>
            </div>

            {series.length === 0 ? (
                <Text className="mt-6 text-tremor-content">No data.</Text>
            ) : (
                <>
                    <div className="mt-3">
                        <Text className="text-tremor-default">
                            Avg {formatNGN(avg)} · Low {formatNGN(min)} · High {formatNGN(max)}
                        </Text>
                    </div>

                    <LineChart
                        className="mt-6 h-96"
                        data={series}
                        index="period"
                        categories={categories}
                        valueFormatter={formatNGN}
                        yAxisWidth={68}
                    />
                </>
            )}
        </Card>
    );
}
