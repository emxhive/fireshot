# 1) Ensure the KPI hooks folder exists
mkdir -p resources/js/hooks/kpi

# 2) Create / overwrite the useKpiViewModel hook
cat > resources/js/hooks/kpi/useKpiViewModel.ts << 'EOF'
import { useMemo } from 'react';

type Trend = 'positive' | 'negative' | 'neutral';

export interface KpiViewModel {
    value: number;
    delta: number;
    pct: string;
    chartTrend: Trend;
    deltaTrend: Trend;
    spark: { date: string; value: number }[];
}

export function useKpiViewModel(data?: KpiCardDataSet): KpiViewModel {
    return useMemo(() => {
        const value = data?.value ?? 0;
        const spark = data?.spark ?? [];
        const recent = data?.recent;

        let delta = 0;
        let pct = '—';
        let deltaTrend: Trend = 'neutral';

        if (recent && recent.length === 2) {
            const [prev, curr] = recent;

            delta = curr - prev;

            if (prev === 0) {
                pct = curr === 0 ? '0%' : curr > 0 ? '∞' : '-∞';
            } else {
                const pctNum = (delta / Math.abs(prev)) * 100;
                pct = `${pctNum.toFixed(2)}%`;
            }

            deltaTrend =
                delta === 0 ? 'neutral' :
                delta > 0 ? 'positive' :
                'negative';
        }

        const chartTrend: Trend =
            value === 0 ? 'neutral' :
            value > 0 ? 'positive' :
            'negative';

        return {
            value,
            delta,
            pct,
            chartTrend,
            deltaTrend,
            spark,
        };
    }, [data]);
}
EOF

# 3) Overwrite KpiCard.tsx with the new implementation
cat > resources/js/components/KpiCard.tsx << 'EOF'
import { formatNGN } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Card, SparkAreaChart } from '@tremor/react';
import { useKpiViewModel } from '@/hooks/kpi/useKpiViewModel';

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
                        colors={
                            item.chartTrend === 'positive'
                                ? ['emerald']
                                : item.chartTrend === 'negative'
                                ? ['red']
                                : ['gray']
                        }
                        className="mt-4 h-10 w-full"
                    />
                </Card>
            ))}
        </dl>
    );
}
EOF
