import { formatCompactNumber } from '@/lib/format';
import { cx } from '@/lib/utils';
import type { DashboardPageProps, KpiCardData, PortfolioField } from '@/types/fireshots.d';
import {
    Card,
    CategoryBar,
    Legend,
    Metric,
    ProgressBar,
    SparkAreaChart,
    Text,
} from '@tremor/react';
import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

export default function KpiCard({ field }: { field: PortfolioField }) {
    const { props } = usePage<DashboardPageProps>();

    const item = useMemo<KpiCardData | null>(() => {
        const recs = (props as any).records as DashboardPageProps['records'] | undefined;
        if (!recs) return null;
        const key = field.toLowerCase() as 'balance' | 'change' | 'transactions';
        const record: any = (recs as any)[key];
        if (!record) return null;

        const high =
            record?.month?.high?.value ??
            record?.week?.high?.value ??
            record?.high?.value ??
            0;
        const low =
            record?.month?.low?.value ??
            record?.week?.low?.value ??
            record?.low?.value ??
            0;

        const change = (Number(high) || 0) - (Number(low) || 0);
        const changeType: 'positive' | 'negative' = change >= 0 ? 'positive' : 'negative';

        const chartData = [
            { date: 'Low', value: Number(low) || 0 },
            { date: 'High', value: Number(high) || 0 },
        ];

        return {
            name: field,
            value: formatCompactNumber(Number(high) || 0),
            change,
            percentageChange:
                (Number(low) || 0) !== 0
                    ? `${(((change / Math.abs(Number(low))) * 100) || 0).toFixed(1)}%`
                    : '0%',
            changeType,
            chartData,
            breakdown: [
                { name: 'Low', value: Number(low) || 0, percentageValue: 0 },
                { name: 'High', value: Number(high) || 0, percentageValue: 100 },
            ],
        } as KpiCardData;
    }, [(props as any).records, field]);

    if (!item) {
        return (
            <Card className="overflow-hidden">
                <Text>No data for {field}</Text>
            </Card>
        );
    }

    const isTransactions = field === 'Transactions';

    return (
        <Card className="overflow-hidden">
            {/* Row 1: Title */}
            <Text className="text-[0.9rem] font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {item.name}
            </Text>

            {/* Row 2: Metric + SparkChart + Delta */}
            <div className="mt-1 flex items-baseline justify-between overflow-hidden">
                <Metric className="flex-shrink-0 truncate text-[1.5rem] font-bold text-tremor-content-strong sm:text-[1.75rem] dark:text-dark-tremor-content-strong">
                    {item.value}
                </Metric>

                <div className="flex min-w-0 flex-1 items-center justify-end space-x-2">
                    <SparkAreaChart
                        data={item.chartData}
                        index="date"
                        categories={['value']}
                        showGradient
                        colors={item.changeType === 'positive' ? ['emerald'] : ['rose']}
                        className="h-8 w-20 flex-shrink sm:h-10 sm:w-32"
                    />
                    <div
                        className={cx(
                            'flex items-center space-x-1 text-[0.85rem] font-semibold',
                            item.changeType === 'positive'
                                ? 'text-emerald-600 dark:text-emerald-500'
                                : 'text-rose-500 dark:text-rose-400',
                        )}
                    >
                        <span>{formatCompactNumber(Math.abs(item.change))}</span>
                        <span>({item.percentageChange})</span>
                    </div>
                </div>
            </div>

            {/* Conditional layout below */}
            {isTransactions ? (
                <>
                    <CategoryBar
                        values={[45, 55]}
                        colors={['rose', 'emerald']}
                        showLabels={false}
                        className="mt-5"
                    />
                    <Legend categories={['Debit', 'Credit']} colors={['rose', 'emerald']} className="mt-4" />
                </>
            ) : (
                <div className="mt-4 space-y-3">
                    {item.breakdown?.map((row) => (
                        <dd key={row.name} className="lg:flex lg:items-center lg:space-x-3">
                            <p className="flex shrink-0 items-center justify-between space-x-2 text-tremor-default lg:w-5/12">
                                <span className="truncate text-tremor-content dark:text-dark-tremor-content">{row.name}</span>
                                <span className="whitespace-nowrap font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                                    {formatCompactNumber(row.value)}{' '}
                                    <span className="font-normal">({row.percentageValue}%)</span>
                                </span>
                            </p>
                            <ProgressBar
                                value={row.percentageValue}
                                color={item.changeType === 'positive' ? 'emerald' : 'rose'}
                                className="mt-2 lg:mt-0"
                            />
                        </dd>
                    ))}
                </div>
            )}
        </Card>
    );
}
