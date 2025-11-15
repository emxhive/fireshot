// Unified Fireshots type definitions

type Granularity = 'day' | 'week' | 'month';
type KpiField = 'Balance' | 'Change' | 'Transactions';
type KpiPeriodOptions = '30d' | '12w' | '12m';

// UI-facing shape
interface Account {
    id: number;
    name: string;
    currency: string;
    fee: number;
    balance: number;
    updatedAt: string;
}

interface SummaryRow {
    from: string;
    to: string;
    usd: number;
    ngn: number;
    netAssetValue: number;
    valuationDelta: number;
    transactions: number;
}

interface LatestMeta {
    sell_rate?: number;
    buy_rate?: number;
    buy_diff?: number;
}

interface SummaryResponse {
    status: 'success' | 'error';
    // New API shape: summaries array + latest snapshot meta
    data: { summaries: SummaryRow[]; latest_meta?: LatestMeta };
}

/* ---------------------------------------------------------------------------
   Component Prop Types
--------------------------------------------------------------------------- */
interface KpiCardDataSet {
    value: number;
    spark: { date: string; value: number }[];
    recent?: [number, number];
}

interface KpiCardProps {
    field: KpiField;
    period: KpiPeriodOptions;
    data: KpiCardDataSet;
}

interface SnapshotTableProps {
    data: SummaryRow[];
    loading?: boolean;
    onSnapshotRun?: () => void;
    latestMeta?: LatestMeta;
}

interface CompositionChartProps {
    weekly: SummaryRow[];
    monthly: SummaryRow[];
    loading?: boolean;
}
