// 'use client';

import { Card, SparkAreaChart } from '@tremor/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function KpiCard({ field, data, period, records }: KpiCardProps) {
  // pick correct high value based on field + period
  const high =
    field === 'Balance'
      ? records?.net_asset_value?.high?.value ?? 0
      : field === 'Change'
      ? period === '7d'
        ? records?.valuation_delta?.week?.high?.value ?? 0
        : records?.valuation_delta?.month?.high?.value ?? 0
      : period === '7d'
      ? records?.transactions?.week?.high?.value ?? 0
      : records?.transactions?.month?.high?.value ?? 0;

  const value = data?.value ?? 0;
  const sparkData = data?.spark ?? [];

  const delta = high - value;
  const pct = value !== 0 ? ((delta / value) * 100).toFixed(1) + '%' : '0%';
  const changeType: 'positive' | 'negative' = delta >= 0 ? 'positive' : 'negative';

  const summary = [
    {
      name: field,
      tickerSymbol: period.toUpperCase(),
      value: value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
      change: (delta >= 0 ? '+' : '') + delta.toFixed(2),
      percentageChange: pct,
      changeType,
    },
  ];

  return (
    <>
      <dl className="grid grid-cols-1 gap-6">
        {summary.map((item) => (
          <Card key={item.name}>
            <dt className="text-tremor-default font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
              {item.name} <span className="font-normal">({item.tickerSymbol})</span>
            </dt>

            <div className="mt-1 flex items-baseline justify-between">
              <dd
                className={classNames(
                  item.changeType === 'positive'
                    ? 'text-emerald-700 dark:text-emerald-500'
                    : 'text-red-700 dark:text-red-500',
                  'text-tremor-title font-semibold',
                )}
              >
                {item.value}
              </dd>
              <dd className="flex items-center space-x-1 text-tremor-default">
                <span className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
                  {item.change}
                </span>
                <span
                  className={classNames(
                    item.changeType === 'positive'
                      ? 'text-emerald-700 dark:text-emerald-500'
                      : 'text-red-700 dark:text-red-500',
                  )}
                >
                  ({item.percentageChange})
                </span>
              </dd>
            </div>

            <SparkAreaChart
              data={sparkData}
              index="date"
              categories={['value']}
              showGradient={false}
              colors={item.changeType === 'positive' ? ['emerald'] : ['red']}
              className="mt-4 h-10 w-full"
            />
          </Card>
        ))}
      </dl>
    </>
  );
}