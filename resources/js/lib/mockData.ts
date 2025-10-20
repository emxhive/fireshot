/* mockData.ts — centralized mock dataset for Fireshots UI (Updated KPI Model) */


export type SnapshotSummary = {
    date: string // 'YYYY-MM-DD' (Lagos)
    usd: number // summed USD balance (raw)
    ngn: number // summed NGN balance (raw)
    unifiedNGN: number // NGN + (USD * sell_rate_used)
    transactions: number // Σ transactions within the snapshot day
    change: number // gain_or_loss per spec (Δbalance − Σtx)
}

export type SeriesPoint = {
    period: string // e.g., '2025-01', '2025-W14'
    Transactions: number
    Change: number
    Balance: number
}

// --- Mock: Snapshot summaries (latest first) ---
export const snapshotSummaries: SnapshotSummary[] = [
    {
        date: '2025-10-13',
        usd: 1125,
        ngn: 820000,
        unifiedNGN: 2620000,
        transactions: 145000,
        change: 35000,
    },
    {
        date: '2025-10-12',
        usd: 1118,
        ngn: 805000,
        unifiedNGN: 2585000,
        transactions: 92000,
        change: -18000,
    },
    {
        date: '2025-10-11',
        usd: 1100,
        ngn: 790000,
        unifiedNGN: 2540000,
        transactions: 110000,
        change: 22000,
    },
    {
        date: '2025-10-10',
        usd: 1090,
        ngn: 780000,
        unifiedNGN: 2510000,
        transactions: 87000,
        change: -9000,
    },
    {
        date: '2025-10-09',
        usd: 1085,
        ngn: 775000,
        unifiedNGN: 2495000,
        transactions: 50000,
        change: 25000,
    },
]

// --- Mock: 12-month series (Transactions, Change, Balance) ---
export const monthlySeriesLast12: SeriesPoint[] = [
    { period: '2024-11', Transactions: 310000, Change: -50000, Balance: 1870000 },
    { period: '2024-12', Transactions: 355000, Change: 20000, Balance: 1930000 },
    { period: '2025-01', Transactions: 280000, Change: 15000, Balance: 1970000 },
    { period: '2025-02', Transactions: 265000, Change: -10000, Balance: 1945000 },
    { period: '2025-03', Transactions: 300000, Change: 40000, Balance: 2010000 },
    { period: '2025-04', Transactions: 315000, Change: 18000, Balance: 2050000 },
    { period: '2025-05', Transactions: 295000, Change: -12000, Balance: 2035000 },
    { period: '2025-06', Transactions: 340000, Change: 22000, Balance: 2080000 },
    { period: '2025-07', Transactions: 330000, Change: 30000, Balance: 2130000 },
    { period: '2025-08', Transactions: 360000, Change: -15000, Balance: 2110000 },
    { period: '2025-09', Transactions: 375000, Change: 28000, Balance: 2160000 },
    { period: '2025-10', Transactions: 390000, Change: 32000, Balance: 2210000 },
]

// --- Mock: 12-week series (optional toggle) ---
export const weeklySeriesLast12: SeriesPoint[] = [
    { period: '2025-W27', Transactions: 72000, Change: 8000, Balance: 2070000 },
    { period: '2025-W28', Transactions: 69000, Change: -2000, Balance: 2065000 },
    { period: '2025-W29', Transactions: 75000, Change: 6000, Balance: 2076000 },
    { period: '2025-W30', Transactions: 82000, Change: 9000, Balance: 2090000 },
    { period: '2025-W31', Transactions: 81000, Change: -4000, Balance: 2086000 },
    { period: '2025-W32', Transactions: 87000, Change: 7000, Balance: 2098000 },
    { period: '2025-W33', Transactions: 90000, Change: 5000, Balance: 2103000 },
    { period: '2025-W34', Transactions: 86000, Change: -3000, Balance: 2099000 },
    { period: '2025-W35', Transactions: 91000, Change: 4000, Balance: 2105000 },
    { period: '2025-W36', Transactions: 94000, Change: 6000, Balance: 2114000 },
    { period: '2025-W37', Transactions: 98000, Change: 7000, Balance: 2125000 },
    { period: '2025-W38', Transactions: 99500, Change: 6500, Balance: 2134000 },
]

// ---------------------------------------------------------
// New KPI card dataset (for Tremor-based Balance/Change/Tx Cards)
// ---------------------------------------------------------

export interface KpiCardData {
    name: PortfolioField
    value: string
    change: number
    percentageChange: string
    changeType: 'positive' | 'negative'
    chartData: { date: string; value: number }[]
    breakdown?: { name: string; value: number; percentageValue: number }[] // For Balance & Change
    categories?: string[] // For Transactions
    values?: number[] // For Transactions
    colors?: string[] // For Transactions
}

// --- Unified KPI dataset ---
export const kpiCardsData: Record<PortfolioField, KpiCardData> = {
    Balance: {
        name: 'Balance',
        value: '2,620,000',
        change: 35000,
        percentageChange: '1.4%',
        changeType: 'positive',
        chartData: [
            { date: 'Oct 09', value: 2495000 },
            { date: 'Oct 10', value: 2510000 },
            { date: 'Oct 11', value: 2540000 },
            { date: 'Oct 12', value: 2585000 },
            { date: 'Oct 13', value: 2620000 },
        ],
        breakdown: [
            { name: 'Avg', value: 2300000, percentageValue: 60 },
            { name: 'ATH', value: 2620000, percentageValue: 100 },
        ],
    },

    Change: {
        name: 'Change',
        value: '35,000',
        change: 35000,
        percentageChange: '18.3%',
        changeType: 'positive',
        chartData: [
            { date: 'Oct 09', value: 25000 },
            { date: 'Oct 10', value: -9000 },
            { date: 'Oct 11', value: 22000 },
            { date: 'Oct 12', value: -18000 },
            { date: 'Oct 13', value: 35000 },
        ],
        breakdown: [
            { name: 'Avg', value: 12000, percentageValue: 45 },
            { name: 'ATH', value: 35000, percentageValue: 100 },
        ],
    },

    Transactions: {
        name: 'Transactions',
        value: '145,000',
        change: 3260,
        percentageChange: '1.9%',
        changeType: 'positive',
        chartData: [
            { date: 'Oct 09', value: 50000 },
            { date: 'Oct 10', value: 87000 },
            { date: 'Oct 11', value: 110000 },
            { date: 'Oct 12', value: 92000 },
            { date: 'Oct 13', value: 145000 },
        ],
        categories: ['Debit', 'Credit'],
        values: [45, 55],
        colors: ['rose', 'emerald'],
    },
}

// --- Defaults ---
export const defaultPortfolioField: PortfolioField = 'Change'
export const defaultSeriesGranularity: 'months' | 'weeks' = 'months'
