import { useKpiViewModel } from '@/hooks/kpi/useKpiViewModel';
import { formatNGN } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Card, SparkAreaChart } from '@tremor/react';

export default function KpiCard({ field, data, period }: KpiCardProps) {
    const vm = useKpiViewModel(data);

    const summary = [
        {
            name: field,
            tickerSymbol: period.toUpperCase(),
            value: formatNGN(vm.value),
            change: (vm.delta >= 0 ? '+' : '') + vm.delta.toFixed(2),
            percentageChange: vm.pct,
            chartTrend: vm.chartTrend,
            deltaTrend: vm.deltaTrend,
        },
    ];

    return (
        <dl className="grid grid-cols-1 gap-6">
            {summary.map((item) => (
                <Card key={item.name}>
                    <dt className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        {item.name} <span className="font-normal">({item.tickerSymbol})</span>
                    </dt>

                    <div className="mt-1 flex items-baseline justify-between">
                        <dd
                            className={cn(
                                item.chartTrend === 'positive'
                                    ? 'text-emerald-700 dark:text-emerald-500'
                                    : item.chartTrend === 'negative'
                                      ? 'text-red-700 dark:text-red-500'
                                      : 'text-gray-600 dark:text-gray-400',
                                'text-tremor-title font-semibold',
                            )}
                        >
                            {item.value}
                        </dd>
                        <dd className="flex items-center space-x-1 text-tremor-default">
                            <span
                                className={cn(
                                    item.deltaTrend === 'positive'
                                        ? 'text-emerald-700 dark:text-emerald-500'
                                        : item.deltaTrend === 'negative'
                                          ? 'text-red-700 dark:text-red-500'
                                          : 'text-gray-600 dark:text-gray-400',
                                )}
                            >
                                {item.change}
                            </span>
                            <span
                                className={cn(
                                    item.deltaTrend === 'positive'
                                        ? 'text-emerald-700 dark:text-emerald-500'
                                        : item.deltaTrend === 'negative'
                                          ? 'text-red-700 dark:text-red-500'
                                          : 'text-gray-600 dark:text-gray-400',
                                )}
                            >
                                ({item.percentageChange})
                            </span>
                        </dd>
                    </div>

                    <SparkAreaChart
                        data={vm.spark}
                        index="date"
                        categories={['value']}
                        showGradient={false}
                        colors={item.chartTrend === 'positive' ? ['emerald'] : item.chartTrend === 'negative' ? ['red'] : ['gray']}
                        className="mt-4 h-10 w-full"
                    />
                </Card>
            ))}
        </dl>
    );
}
