// Unified Fireshots type definitions

type Granularity = 'day' | 'week' | 'month';
type KpiField = 'Balance' | 'Change' | 'Transactions';
type KpiPeriodOptions = '7d' | '4w' | '6m';

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

interface SummaryResponse {
    status: 'success' | 'error';
    granularity: Granularity;
    count: number;
    data: SummaryRow[];
}

interface RecordValue {
    value: number;
    date?: string;
    period?: string;
}

interface RecordMetric {
    high?: RecordValue;
    low?: RecordValue;
}

type TimeMetrics = {
    month: RecordMetric;
    week: RecordMetric;
    day: RecordMetric;
};

interface RecordData {
    net_asset_value: RecordMetric;
    valuation_delta: TimeMetrics;
    transactions: TimeMetrics;
}

interface RecordResponse {
    status: 'success' | 'error';
    count: number;
    data: RecordData;
}

/* ---------------------------------------------------------------------------
   Component Prop Types
--------------------------------------------------------------------------- */
interface KpiCardDataSet {
    value: number;
    spark: { date: string; value: number }[];
}

interface KpiCardProps {
    field: KpiField;
    period: KpiPeriodOptions;
    data: KpiCardDataSet;
    records: RecordData;
}

interface SnapshotTableProps {
    data: SummaryRow[];
    loading?: boolean;
    onSnapshotRun?: () => void;
}

interface CompositionChartProps {
    weekly: SummaryRow[];
    monthly: SummaryRow[];
    loading?: boolean;
}
