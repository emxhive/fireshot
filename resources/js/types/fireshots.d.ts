// Unified Fireshots type definitions

type Granularity = 'day' | 'week' | 'month';
type KpiField = 'Balance' | 'Change' | 'Transactions';
type PeriodOptions = '7d' | '4w' | '6m';

// UI-facing shape
 interface Account {
    id: number
    name: string
    currency: string
    fee: number
    balance: number
    lastUpdated: string
}

interface SummaryRow {
    period: string;
    usd: number;
    ngn: number;
    net_asset_value: number;
    transactions: number;
    flow_adjusted_value: number;
    valuation_delta: number;
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
    period : PeriodOptions;
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
