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

            deltaTrend = delta === 0 ? 'neutral' : delta > 0 ? 'positive' : 'negative';
        }

        const chartTrend: Trend = value === 0 ? 'neutral' : value > 0 ? 'positive' : 'negative';

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
