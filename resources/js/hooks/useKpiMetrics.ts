import { useMemo } from 'react';

type Period = KpiPeriodOptions;

export function useKpiMetrics({ day30, week12, month12 }: { day30: SummaryRow[]; week12: SummaryRow[]; month12: SummaryRow[] }, period: Period) {
    // Decide active slice
    const slice = useMemo<SummaryRow[]>(() => {
        if (period === '30d') return day30 ?? [];
        if (period === '12w') return week12 ?? [];
        if (period === '12m') return month12 ?? [];
        return [];
    }, [period, day30, week12, month12]);

    const newest = slice[slice.length - 1];
    const prev = slice[slice.length - 2];

    const kpiData = useMemo(() => {
        const latest = newest;
        const oldest = slice[0];

        const totalTx = slice.reduce((sum, s) => sum + (s.transactions || 0), 0);

        const balanceVal = latest?.netAssetValue ?? 0;
        const txVal = totalTx;
        const changeVal = (latest?.netAssetValue ?? 0) - (oldest?.netAssetValue ?? 0) - totalTx;

        const sparkBalance = slice.map((s) => ({ date: `${s.from} → ${s.to}`, value: s.netAssetValue }));
        const sparkChange = slice.map((s) => ({ date: `${s.from} → ${s.to}`, value: s.valuationDelta }));
        const sparkTx = slice.map((s) => ({ date: `${s.from} → ${s.to}`, value: s.transactions }));

        const balanceRecent: [number, number] | undefined = newest && prev ? [prev.netAssetValue ?? 0, newest.netAssetValue ?? 0] : undefined;
        const changeRecent: [number, number] | undefined = newest && prev ? [prev.valuationDelta ?? 0, newest.valuationDelta ?? 0] : undefined;
        const txRecent: [number, number] | undefined = newest && prev ? [prev.transactions ?? 0, newest.transactions ?? 0] : undefined;

        return {
            Balance: { value: balanceVal, spark: sparkBalance, recent: balanceRecent },
            Change: { value: changeVal, spark: sparkChange, recent: changeRecent },
            Transactions: { value: txVal, spark: sparkTx, recent: txRecent },
        } as Record<KpiField, { value: number; spark: { date: string; value: number }[]; recent?: [number, number] }>;
    }, [slice, newest, prev]);

    return { kpiData, newest };
}
