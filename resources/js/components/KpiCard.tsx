import { formatNGN } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Card, SparkAreaChart } from '@tremor/react';
import { useMemo } from 'react';

export default function KpiCard({ field, data, period }: KpiCardProps) {
    const value = data?.value ?? 0;
    const sparkData = data?.spark ?? [];

    const { delta, pct, changeType } = useMemo(() => {
        const recent = data?.recent;
        const [prev, curr] = recent ?? [undefined, undefined];

        // 🔹 Compute delta only if both values exist
        const d = prev !== undefined && curr !== undefined ? curr - prev : 0;

        // 🔹 Handle percentage correctly (avoid false zero when prev = 0)
        let pctStr: string;
        if (prev === undefined || curr === undefined) {
            pctStr = '—';
        } else if (prev === 0 && curr !== 0) {
            pctStr = curr > 0 ? '∞' : '-∞';
        } else if (prev === 0 && curr === 0) {
            pctStr = '0%';
        } else {
            const pctNum = (d / prev) * 100;
            pctStr = `${pctNum.toFixed(2)}%`;
        }

        // 🔹 Determine trend direction
        const type: 'positive' | 'negative' | 'neutral' = d === 0 ? 'neutral' : d > 0 ? 'positive' : 'negative';

        return { delta: d, pct: pctStr, changeType: type };
    }, [data?.recent]);

    const summary = [
        {
            name: field,
            tickerSymbol: period.toUpperCase(),
            value: formatNGN(value),
            change: (delta >= 0 ? '+' : '') + delta.toFixed(2),
            percentageChange: pct,
            changeType,
        },
    ];

    return (
        <>
            <dl className="grid grid-cols-1 gap-6">
                {summary.map((item) => (
                    <Card key={item.name}>
                        <dt className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                            {item.name} <span className="font-normal">({item.tickerSymbol})</span>
                        </dt>

                        <div className="mt-1 flex items-baseline justify-between">
                            <dd
                                className={cn(
                                    item.changeType === 'positive' ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500',
                                    'text-tremor-title font-semibold',
                                )}
                            >
                                {item.value}
                            </dd>
                            <dd className="flex items-center space-x-1 text-tremor-default">
                                <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">{item.change}</span>
                                <span
                                    className={cn(item.changeType === 'positive' ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500')}
                                >
                                    ({item.percentageChange})
                                </span>
                            </dd>
                        </div>

                        <SparkAreaChart
                            data={sparkData}
                            index="date"
                            categories={['value']}
                            showGradient={false}
                            colors={item.changeType === 'positive' ? ['emerald'] : item.changeType === 'neutral' ? ['gray'] : ['red']}
                            className="mt-4 h-10 w-full"
                        />
                    </Card>
                ))}
            </dl>
        </>
    );
}
