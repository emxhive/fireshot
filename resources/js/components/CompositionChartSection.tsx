import { formatNGN } from '@/lib/format';
import { Card, LineChart, Select, SelectItem, Text } from '@tremor/react';
import { useMemo, useState } from 'react';

export default function CompositionChartSection({
    weekly,
    monthly,
    loading,
}: CompositionChartProps) {
    const [granularity, setGranularity] = useState<'months' | 'weeks'>(
        'months',
    );
    const [portfolioField, setPortfolioField] = useState<
        'Balance' | 'Change' | 'Transactions'
    >('Change');

    const series = useMemo(() => {
        const base = granularity === 'months' ? monthly : weekly;
        return base.map((p) => ({
            period: `${p.from} → ${p.to}`,
            Balance: p.netAssetValue,
            Change: p.valuationDelta,
            Transactions: p.transactions,
        }));
    }, [granularity, weekly, monthly]);

    const values = series.map((p) => p[portfolioField]);
    const avg = values.length
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;

    return (
        <Card className="mt-4 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Text className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
                    Portfolio: {portfolioField}
                </Text>
                <div className="flex gap-2">
                    <Select
                        className="w-40 [&>button]:rounded-tremor-small"
                        enableClear={false}
                        value={granularity}
                        onValueChange={(v) =>
                            setGranularity((v as any) ?? 'months')
                        }
                    >
                        <SelectItem value="months">Last 12 months</SelectItem>
                        <SelectItem value="weeks">Last 12 weeks</SelectItem>
                    </Select>
                    <Select
                        className="w-44 [&>button]:rounded-tremor-small"
                        enableClear={false}
                        value={portfolioField}
                        onValueChange={(v) =>
                            setPortfolioField((v as any) ?? 'Change')
                        }
                    >
                        <SelectItem value="Change">
                            Portfolio: Change
                        </SelectItem>
                        <SelectItem value="Transactions">
                            Portfolio: Transactions
                        </SelectItem>
                        <SelectItem value="Balance">
                            Portfolio: Balance
                        </SelectItem>
                    </Select>
                </div>
            </div>

            {loading ? (
                <Text className="mt-6 text-tremor-content">Loading...</Text>
            ) : series.length === 0 ? (
                <Text className="mt-6 text-tremor-content">No data.</Text>
            ) : (
                <>
                    <div className="mt-3">
                        <Text className="text-tremor-default">
                            Avg {formatNGN(avg)} · Low {formatNGN(min)} · High{' '}
                            {formatNGN(max)}
                        </Text>
                    </div>

                    <LineChart
                        className="mt-6 h-96"
                        data={series}
                        index="period"
                        categories={['Balance', 'Change', 'Transactions']}
                        valueFormatter={formatNGN}
                        yAxisWidth={68}
                    />
                </>
            )}
        </Card>
    );
}
