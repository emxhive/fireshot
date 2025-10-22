### Dashboard data-driven component snippets

The following snippets include only self-made components used on the dashboard and only the parts that directly rely on backend-provided data. Each snippet is large enough to understand how the data flows without including the entire file.

---

File: resources/js/components/CompositionChartSection.tsx

```tsx
import type { DashboardPageProps, PortfolioField, SeriesPoint } from '@/types/fireshots.d';
import { useMemo, useState } from 'react';
import { usePage } from '@inertiajs/react';

export default function CompositionChartSection() {
  const [granularity, setGranularity] = useState<'months' | 'weeks'>('months');
  const [portfolioField, setPortfolioField] = useState<PortfolioField>('Change');
  const { props } = usePage<DashboardPageProps>();

  // Pull time-series data from Inertia page props (backend-provided)
  const series: SeriesPoint[] = useMemo(() => {
    const p = props as any as DashboardPageProps;
    return granularity === 'months' ? p.seriesMonth ?? [] : p.seriesWeek ?? [];
  }, [props, granularity]);

  // ... chart renders using `series` (backend data)
}
```

---

File: resources/js/components/KpiCard.tsx

```tsx
import type { DashboardPageProps, KpiCardData, PortfolioField } from '@/types/fireshots.d';
import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

export default function KpiCard({ field }: { field: PortfolioField }) {
  const { props } = usePage<DashboardPageProps>();

  // Derive KPI numbers from backend-provided aggregate records
  const item = useMemo<KpiCardData | null>(() => {
    const recs = (props as any).records as DashboardPageProps['records'] | undefined;
    if (!recs) return null;

    const key = field.toLowerCase() as 'balance' | 'change' | 'transactions';
    const record: any = (recs as any)[key];
    if (!record) return null;

    const high = record?.month?.high?.value ?? record?.week?.high?.value ?? record?.high?.value ?? 0;
    const low  = record?.month?.low?.value  ?? record?.week?.low?.value  ?? record?.low?.value  ?? 0;

    // ... compute KPI fields from `high`/`low`
    return { /* KpiCardData built from backend-derived values */ } as KpiCardData;
  }, [(props as any).records, field]);

  // ... render KPI using `item`
}
```

---

File: resources/js/components/SnapshotSummaryTable.tsx

```tsx
import { runSnapshot } from '@/lib/api';
import type { DashboardPageProps, SnapshotSummary } from '@/types/fireshots.d';
import { router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function SnapshotSummaryTable() {
  const [open, setOpen] = useState(false);
  const [sellRate, setSellRate] = useState('');
  const [buyDiff, setBuyDiff] = useState('25');
  const [snapshotDate, setSnapshotDate] = useState<Date>(new Date());

  const { props } = usePage<DashboardPageProps>();
  // Read snapshot summaries from backend-provided Inertia props
  const data = useMemo<SnapshotSummary[]>(() => {
    const p = props as any as DashboardPageProps;
    return p.summaries ?? [];
  }, [props]);

  // Trigger backend snapshot and then refresh only relevant props
  const handleConfirm = async () => {
    const payload = {
      snapshot_date: snapshotDate.toISOString().split('T')[0],
      sell_rate: parseFloat(sellRate),
      buy_diff: buyDiff ? parseFloat(buyDiff) : 25,
    };

    await runSnapshot(payload);
    router.reload({ only: ['summaries', 'seriesMonth', 'seriesWeek', 'records'] });
    setOpen(false);
  };

  // ... render table rows from `data`
}
```

Notes:
- Only self-made components included (CompositionChartSection, KpiCard, SnapshotSummaryTable) that are used by the dashboard and consume backend data via Inertia props or API calls.
- Non-data UI concerns (layout, placeholders, styling components) are intentionally omitted.
