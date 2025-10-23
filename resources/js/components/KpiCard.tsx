import { formatCompactNumber } from '@/lib/format';
import type { KpiCardProps } from '@/types/fireshots';
import { Card, Metric, ProgressBar, SparkAreaChart, Text } from '@tremor/react';

export default function KpiCard({ field, data, records }: KpiCardProps) {
    const metricVal = data?.value ?? 0;
    const sparkData = data?.spark ?? [];
    const recPath =
        field === 'Balance'
            ? records?.net_asset_value
            : field === 'Change'
              ? records?.valuation_delta?.month
              : records?.transactions?.month;

    const high = recPath?.high?.value ?? 0;
    const low = recPath?.low?.value ?? 0;
    const { highPct, lowPct } = toProgress(high, low);
    const changeType: 'positive' | 'negative' =
        metricVal >= 0 ? 'positive' : 'negative';

    return (
        <Card className="overflow-hidden">
            <Text className="text-[0.9rem] font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                {field}
            </Text>

            <div className="mt-1 flex items-baseline justify-between overflow-hidden">
                <Metric className="flex-shrink-0 truncate text-[1.5rem] font-bold text-tremor-content-strong sm:text-[1.75rem] dark:text-dark-tremor-content-strong">
                    {formatCompactNumber(metricVal)}
                </Metric>
            </div>
            <div className="flex min-w-0 flex-1 items-center space-x-2">
                <SparkAreaChart
                    data={sparkData}
                    index="date"
                    categories={['value']}
                    showGradient
                    colors={changeType === 'positive' ? ['emerald'] : ['rose']}
                    className="h-8 w-20 flex-shrink sm:h-10 sm:w-32"
                />
            </div>
            {/* progress bar */}
            <ProgressBar value={highPct} color="emerald" />
        </Card>
    );
}

function toProgress(high: number, low: number) {
    if (!high || high <= 0) return { highPct: 0, lowPct: 0 };
    return {
        highPct: 100,
        lowPct: Math.max(0, Math.min(100, (low / high) * 100)),
    };
}
