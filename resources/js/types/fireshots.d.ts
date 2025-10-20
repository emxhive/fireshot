// resources/js/types/fireshots.d.ts
export type PortfolioField = 'Change' | 'Balance' | 'Transactions';

export interface SnapshotSummary {
    date: string;
    usd: number;
    ngn: number;
    unifiedNGN: number;
    transactions: number;
    change: number;
}

export interface SeriesPoint {
    period: string;
    Transactions: number;
    Change: number;
    Balance: number;
}

// Shape coming from RecordService::get()
export interface ShotsRecords {
    balance: {
        high: { value: number | null; date: string | null };
        low: { value: number | null; date: string | null };
    };
    change: {
        week: {
            high: { value: number | null; period: string | null };
            low: { value: number | null; period: string | null };
        };
        month: {
            high: { value: number | null; period: string | null };
            low: { value: number | null; period: string | null };
        };
    };
    transactions: {
        week: {
            high: { value: number | null; period: string | null };
            low: { value: number | null; period: string | null };
        };
        month: {
            high: { value: number | null; period: string | null };
            low: { value: number | null; period: string | null };
        };
    };
}

export interface DashboardPageProps {
    summaries: SnapshotSummary[];
    seriesMonth: SeriesPoint[];
    seriesWeek: SeriesPoint[];
    records: ShotsRecords;
    [key: string]: any;
}

export interface KpiCardData {
    name: PortfolioField;
    value: string;
    change: number;
    percentageChange: string;
    changeType: 'positive' | 'negative';
    chartData: { date: string; value: number }[];
    breakdown?: { name: string; value: number; percentageValue: number }[];
    categories?: string[];
    values?: number[];
    colors?: string[];
}
