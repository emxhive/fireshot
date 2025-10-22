// Unified Fireshots type definitions

export type Granularity = 'day' | 'week' | 'month';
export type KpiField = 'Balance' | 'Change' | 'Transactions';

export interface SummaryRow {
    period: string;
    usd: number;
    ngn: number;
    net_asset_value: number;
    transactions: number;
    flow_adjusted_value: number;
    valuation_delta: number;
}

export interface SummaryResponse {
    status: 'success' | 'error';
    granularity: Granularity;
    count: number;
    data: SummaryRow[];
}

export interface RecordValue {
    value: number;
    date?: string;
    period?: string;
}

export interface RecordMetric {
    high?: RecordValue;
    low?: RecordValue;
}

export interface RecordData {
    net_asset_value: RecordMetric;
    valuation_delta: {
        month: RecordMetric;
        week: RecordMetric;
    };
    transactions: {
        month: RecordMetric;
    };
}

export interface RecordResponse {
    status: 'success' | 'error';
    count: number;
    data: RecordData;
}

/* ---------------------------------------------------------------------------
   Component Prop Types
--------------------------------------------------------------------------- */
export interface KpiCardDataSet {
    value: number;
    spark: { date: string; value: number }[];
}

export interface KpiCardProps {
    field: KpiField;
    data: KpiCardDataSet;
    records: RecordData;
}

export interface SnapshotTableProps {
    data: SummaryRow[];
    loading?: boolean;
    onSnapshotRun?: () => void;
}

export interface CompositionChartProps {
    weekly: SummaryRow[];
    monthly: SummaryRow[];
    loading?: boolean;
}
