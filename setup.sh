#!/bin/bash
# setup.sh — Creates Fireshots type + hook scaffolding

set -e

ROOT="resources/js"
HOOKS_DIR="$ROOT/hooks"
TYPES_DIR="$ROOT/types"

echo "🔧 Setting up Fireshots TypeScript structure..."

mkdir -p "$HOOKS_DIR" "$TYPES_DIR"

# 1️⃣ Types
cat > "$TYPES_DIR/fireshots.d.ts" <<'EOF'
// resources/js/types/fireshots.d.ts

export type Granularity = 'day' | 'week' | 'month'

export interface SummaryRow {
  from: string
  to: string
  usd: number
  ngn: number
  netAssetValue: number
  valuationDelta: number
  transactions: number
}

export interface SummaryResponse {
  status: 'success' | 'error'
  granularity: Granularity
  count: number
  data: SummaryRow[]
}

export interface RecordValue {
  value: number
  date?: string
  period?: string
}

export interface RecordMetric {
  high?: RecordValue
  low?: RecordValue
}

export interface RecordData {
  net_asset_value: RecordMetric
  valuation_delta: {
    week: RecordMetric
    month: RecordMetric
  }
  transactions: {
    month: RecordMetric
  }
}

export interface RecordResponse {
  status: 'success' | 'error'
  count: number
  data: RecordData
}
EOF

# 2️⃣ Hooks — Summaries
cat > "$HOOKS_DIR/useFireshotsSummaries.ts" <<'EOF'
// resources/js/hooks/useFireshotsSummaries.ts
import { useEffect, useState } from 'react'
import type { Granularity, SummaryResponse, SummaryRow } from '@/types/fireshots'

export function useFireshotsSummaries(granularity: Granularity = 'day') {
  const [data, setData] = useState<SummaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetch(`/api/shots/summaries?granularity=${granularity}`, { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text())
        return res.json() as Promise<SummaryResponse>
      })
      .then(json => setData(json.data || []))
      .catch(err => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [granularity])

  return { data, loading, error }
}
EOF

# 3️⃣ Hooks — Records
cat > "$HOOKS_DIR/useFireshotsRecords.ts" <<'EOF'
// resources/js/hooks/useFireshotsRecords.ts
import { useEffect, useState } from 'react'
import type { RecordResponse, RecordData } from '@/types/fireshots'

export function useFireshotsRecords() {
  const [data, setData] = useState<RecordData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetch('/api/shots/records', { signal: controller.signal })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text())
        return res.json() as Promise<RecordResponse>
      })
      .then(json => setData(json.data || null))
      .catch(err => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return { data, loading, error }
}
EOF

# 4️⃣ Hooks Index
cat > "$HOOKS_DIR/index.ts" <<'EOF'
export * from './useFireshotsSummaries'
export * from './useFireshotsRecords'
EOF

echo "✅ Fireshots type definitions and hooks successfully created."
EOF
