// // Path: C:\Users\USER\Herd\fireshot\resources\js\types\api.d.ts
// // @types/api.d.ts
//
// type APIErrorResponse = {
//     status: 'error';
//     message: string;
// };
//
// interface RawAccount {
//     id: number;
//     name: string;
//     currency_code: string;
//     fee_percent: number;
//     balance: number;
//     updated_at: string;
// }
//
// type FetchAccountsSuccessResponse = {
//     status: 'success';
//     accounts: RawAccount[];
// };
//
// type SaveAccountSuccessResponse = {
//     status: 'success';
//     account?: RawAccount;
// };
//
// type FetchAccountsResponse = FetchAccountsSuccessResponse | APIErrorResponse;
//
// type SaveAccountResponse = SaveAccountSuccessResponse | APIErrorResponse;
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\wayfinder\index.ts
// // EXCLUDED from a consolidated file per issue requirement.
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\lib\axiosClient.ts
// import axios from 'axios';
//
// const api = axios.create({
//     baseURL: '/',
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//     },
//     timeout: 8000,
// });
//
//
// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         console.error('API Error:', error.response?.data || error.message);
//         return Promise.reject(error);
//     }
// );
//
// export default api;
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\lib\apiFactory.ts
// // apiFactory.ts
//
// import type { RouteDefinition } from '@/wayfinder';
// import api from './axiosClient';
//
// export async function callApi<P, R>(
//     route: RouteDefinition<'get' | 'post'>,
//     payload?: P,
// ): Promise<R | APIErrorResponse> {
//     try {
//         const method = route.method;
//         let response;
//
//         if (method === 'get') {
//             response = await api.get<R>(route.url);
//             console.log(response, 'response');
//         } else {
//             response = await api.post<R>(route.url, payload);
//         }
//
//         return response.data as R;
//     } catch (error: any) {
//         console.error(
//             `${route.method.toUpperCase()} ${route.url} failed:`,
//             error.response?.data || error.message,
//         );
//         return {
//             status: 'error',
//             message:
//                 error.response?.data?.message ||
//                 error.message ||
//                 'API call failed',
//         };
//     }
// }
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\routes\shots\accounts\index.ts
// // EXCLUDED from consolidated file per issue requirement.
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\lib\format.ts
// export function formatCompactNumber(value: number): string {
//     if (Math.abs(value) >= 1_000_000_000)
//         return (value / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + 'B';
//     if (Math.abs(value) >= 1_000_000)
//         return (value / 1_000_000).toFixed(2).replace(/\.00$/, '') + 'M';
//     if (Math.abs(value) >= 1_000)
//         return (value / 1_000).toFixed(2).replace(/\.00$/, '') + 'K';
//     return value.toString();
// }
//
// export function formatUSD(n: number, showCurrency = false) {
//     const formatted = Intl.NumberFormat('en-US', {
//         maximumFractionDigits: 2,
//     }).format(n);
//     return showCurrency ? `$${formatted}` : formatted;
// }
//
// export function formatNGN(n: number, showCurrency = false) {
//     const formatted = Intl.NumberFormat('en-NG', {
//         maximumFractionDigits: 2,
//     }).format(n);
//     return showCurrency ? `₦${formatted}` : formatted;
// }
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\lib\utils.ts
// import clsx, { type ClassValue } from 'clsx';
// import { twMerge } from 'tailwind-merge';
//
// export function cx(...args: ClassValue[]) {
//     return twMerge(clsx(...args));
// }
// export function cn(...args: ClassValue[]) {
//     return twMerge(clsx(...args));
// }
// // Tremor focusInput [v0.0.1]
//
// export const focusInput = [
//     // base
//     'focus:ring-2',
//     // ring color
//     'focus:ring-blue-200 focus:dark:ring-blue-700/30',
//     // border color
//     'focus:border-blue-500 focus:dark:border-blue-700',
// ];
//
// // Tremor focusRing [v0.0.1]
//
// export const focusRing = [
//     // base
//     'outline outline-offset-2 outline-0 focus-visible:outline-2',
//     // outline color
//     'outline-blue-500 dark:outline-blue-500',
// ];
//
// // Tremor hasErrorInput [v0.0.1]
//
// export const hasErrorInput = [
//     // base
//     'ring-2',
//     // border color
//     'border-red-500 dark:border-red-700',
//     // ring color
//     'ring-red-200 dark:ring-red-700/30',
// ];
//
//
// // timeAgoFromString.ts
// export function timeAgo(input: string): string {
//     // Match common datetime formats: YYYY-MM-DD HH:MM(:SS)?
//     const match = input.match(
//         /\b(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})[ T](\d{1,2}):(\d{2})(?::(\d{2}))?\b/
//     );
//     if (!match) return "No valid date found";
//
//     const [_, y, m, d, h, min, s] = match;
//     const parsedDate = new Date(
//         Number(y),
//         Number(m) - 1,
//         Number(d),
//         Number(h),
//         Number(min),
//         Number(s || 0)
//     );
//
//     const now = new Date();
//     const diffMs = now.getTime() - parsedDate.getTime();
//     if (diffMs < 0) return "In the future";
//
//     const seconds = Math.floor(diffMs / 1000);
//     const minutes = Math.floor(seconds / 60);
//     const hours = Math.floor(minutes / 60);
//     const days = Math.floor(hours / 24);
//     const weeks = Math.floor(days / 7);
//     const months = Math.floor(days / 30);
//     const years = Math.floor(days / 365);
//
//     const pluralize = (n: number, unit: string) =>
//         `${n} ${unit}${n !== 1 ? "s" : ""} ago`;
//
//     if (seconds < 60) return pluralize(seconds, "second");
//     if (minutes < 60) return pluralize(minutes, "minute");
//     if (hours < 24) return pluralize(hours, "hour");
//     if (days < 7) return pluralize(days, "day");
//     if (weeks < 5) return pluralize(weeks, "week");
//     if (months < 12) return pluralize(months, "month");
//     return pluralize(years, "year");
// }
// // --- Mock dataset ---
// export const initialAccounts = [
//     {
//         id: 1,
//         name: 'Kuda NGN',
//         currency: 'NGN',
//         fee: 0.5,
//         balance: 120000,
//         lastUpdated: '2025-10-10 10:00',
//     },
//     {
//         id: 2,
//         name: 'USDT Wallet',
//         currency: 'USD',
//         fee: 0.25,
//         balance: 350,
//         lastUpdated: '2025-10-12 14:32',
//     },
//     {
//         id: 3,
//         name: 'Wise USD',
//         currency: 'USD',
//         fee: 1.0,
//         balance: 1500,
//         lastUpdated: '2025-10-13 08:10',
//     },
// ];
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\lib\mockData.ts
// /* mockData.ts — centralized mock dataset for Fireshots UI (Updated KPI Model) */
//
// export type PortfolioField = 'Change' | 'Balance' | 'Transactions'
//
// export type SnapshotSummary = {
//     date: string // 'YYYY-MM-DD' (Lagos)
//     usd: number // summed USD balance (raw)
//     ngn: number // summed NGN balance (raw)
//     unifiedNGN: number // NGN + (USD * sell_rate_used)
//     transactions: number // Σ transactions within the snapshot day
//     change: number // gain_or_loss per spec (Δbalance − Σtx)
// }
//
// export type SeriesPoint = {
//     period: string // e.g., '2025-01', '2025-W14'
//     Transactions: number
//     Change: number
//     Balance: number
// }
//
// // --- Mock: Snapshot summaries (latest first) ---
// export const snapshotSummaries: SnapshotSummary[] = [
//     {
//         date: '2025-10-13',
//         usd: 1125,
//         ngn: 820000,
//         unifiedNGN: 2620000,
//         transactions: 145000,
//         change: 35000,
//     },
//     {
//         date: '2025-10-12',
//         usd: 1118,
//         ngn: 805000,
//         unifiedNGN: 2585000,
//         transactions: 92000,
//         change: -18000,
//     },
//     {
//         date: '2025-10-11',
//         usd: 1100,
//         ngn: 790000,
//         unifiedNGN: 2540000,
//         transactions: 110000,
//         change: 22000,
//     },
//     {
//         date: '2025-10-10',
//         usd: 1090,
//         ngn: 780000,
//         unifiedNGN: 2510000,
//         transactions: 87000,
//         change: -9000,
//     },
//     {
//         date: '2025-10-09',
//         usd: 1085,
//         ngn: 775000,
//         unifiedNGN: 2495000,
//         transactions: 50000,
//         change: 25000,
//     },
// ]
//
// // --- Mock: 12-month series (Transactions, Change, Balance) ---
// export const monthlySeriesLast12: SeriesPoint[] = [
//     { period: '2024-11', Transactions: 310000, Change: -50000, Balance: 1870000 },
//     { period: '2024-12', Transactions: 355000, Change: 20000, Balance: 1930000 },
//     { period: '2025-01', Transactions: 280000, Change: 15000, Balance: 1970000 },
//     { period: '2025-02', Transactions: 265000, Change: -10000, Balance: 1945000 },
//     { period: '2025-03', Transactions: 300000, Change: 40000, Balance: 2010000 },
//     { period: '2025-04', Transactions: 315000, Change: 18000, Balance: 2050000 },
//     { period: '2025-05', Transactions: 295000, Change: -12000, Balance: 2035000 },
//     { period: '2025-06', Transactions: 340000, Change: 22000, Balance: 2080000 },
//     { period: '2025-07', Transactions: 330000, Change: 30000, Balance: 2130000 },
//     { period: '2025-08', Transactions: 360000, Change: -15000, Balance: 2110000 },
//     { period: '2025-09', Transactions: 375000, Change: 28000, Balance: 2160000 },
//     { period: '2025-10', Transactions: 390000, Change: 32000, Balance: 2210000 },
// ]
//
// // --- Mock: 12-week series (optional toggle) ---
// export const weeklySeriesLast12: SeriesPoint[] = [
//     { period: '2025-W27', Transactions: 72000, Change: 8000, Balance: 2070000 },
//     { period: '2025-W28', Transactions: 69000, Change: -2000, Balance: 2065000 },
//     { period: '2025-W29', Transactions: 75000, Change: 6000, Balance: 2076000 },
//     { period: '2025-W30', Transactions: 82000, Change: 9000, Balance: 2090000 },
//     { period: '2025-W31', Transactions: 81000, Change: -4000, Balance: 2086000 },
//     { period: '2025-W32', Transactions: 87000, Change: 7000, Balance: 2098000 },
//     { period: '2025-W33', Transactions: 90000, Change: 5000, Balance: 2103000 },
//     { period: '2025-W34', Transactions: 86000, Change: -3000, Balance: 2099000 },
//     { period: '2025-W35', Transactions: 91000, Change: 4000, Balance: 2105000 },
//     { period: '2025-W36', Transactions: 94000, Change: 6000, Balance: 2114000 },
//     { period: '2025-W37', Transactions: 98000, Change: 7000, Balance: 2125000 },
//     { period: '2025-W38', Transactions: 99500, Change: 6500, Balance: 2134000 },
// ]
//
// // ---------------------------------------------------------
// // New KPI card dataset (for Tremor-based Balance/Change/Tx Cards)
// // ---------------------------------------------------------
//
// export interface KpiCardData {
//     name: PortfolioField
//     value: string
//     change: number
//     percentageChange: string
//     changeType: 'positive' | 'negative'
//     chartData: { date: string; value: number }[]
//     breakdown?: { name: string; value: number; percentageValue: number }[] // For Balance & Change
//     categories?: string[] // For Transactions
//     values?: number[] // For Transactions
//     colors?: string[] // For Transactions
// }
//
// // --- Unified KPI dataset ---
// export const kpiCardsData: Record<PortfolioField, KpiCardData> = {
//     Balance: {
//         name: 'Balance',
//         value: '2,620,000',
//         change: 35000,
//         percentageChange: '1.4%',
//         changeType: 'positive',
//         chartData: [
//             { date: 'Oct 09', value: 2495000 },
//             { date: 'Oct 10', value: 2510000 },
//             { date: 'Oct 11', value: 2540000 },
//             { date: 'Oct 12', value: 2585000 },
//             { date: 'Oct 13', value: 2620000 },
//         ],
//         breakdown: [
//             { name: 'Avg', value: 2300000, percentageValue: 60 },
//             { name: 'ATH', value: 2620000, percentageValue: 100 },
//         ],
//     },
//
//     Change: {
//         name: 'Change',
//         value: '35,000',
//         change: 35000,
//         percentageChange: '18.3%',
//         changeType: 'positive',
//         chartData: [
//             { date: 'Oct 09', value: 25000 },
//             { date: 'Oct 10', value: -9000 },
//             { date: 'Oct 11', value: 22000 },
//             { date: 'Oct 12', value: -18000 },
//             { date: 'Oct 13', value: 35000 },
//         ],
//         breakdown: [
//             { name: 'Avg', value: 12000, percentageValue: 45 },
//             { name: 'ATH', value: 35000, percentageValue: 100 },
//         ],
//     },
//
//     Transactions: {
//         name: 'Transactions',
//         value: '145,000',
//         change: 3260,
//         percentageChange: '1.9%',
//         changeType: 'positive',
//         chartData: [
//             { date: 'Oct 09', value: 50000 },
//             { date: 'Oct 10', value: 87000 },
//             { date: 'Oct 11', value: 110000 },
//             { date: 'Oct 12', value: 92000 },
//             { date: 'Oct 13', value: 145000 },
//         ],
//         categories: ['Debit', 'Credit'],
//         values: [45, 55],
//         colors: ['rose', 'emerald'],
//     },
// }
//
// // --- Defaults ---
// export const defaultPortfolioField: PortfolioField = 'Change'
// export const defaultSeriesGranularity: 'months' | 'weeks' = 'months'
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\components\SnapshotDialog.tsx
// import {
//     Button,
//     DatePicker,
//     Dialog,
//     DialogPanel,
//     Text,
//     TextInput,
//     Title,
// } from '@tremor/react';
//
// type Props = {
//     open: boolean;
//     onClose: (open: boolean) => void;
//     snapshotDate: Date;
//     setSnapshotDate: (d: Date) => void;
//     sellRate: string;
//     setSellRate: (v: string) => void;
//     onConfirm: () => void;
// };
//
// export default function SnapshotDialog({
//     open,
//     onClose,
//     snapshotDate,
//     setSnapshotDate,
//     sellRate,
//     setSellRate,
//     onConfirm,
// }: Props) {
//     return (
//         <Dialog open={open} onClose={onClose} static={true}>
//             {/* Make it big */}
//             <DialogPanel className="w-full max-w-3xl space-y-6 p-6">
//                 <div className="space-y-1">
//                     {/* Tremor doesn’t export DialogTitle; use Title/Text */}
//                     <Title>Take Snapshot</Title>
//                     <Text className="text-tremor-content">
//                         Choose the Lagos calendar date and enter the NGN sell
//                         rate to capture today’s balances.
//                     </Text>
//                 </div>
//
//                 {/* Form layout */}
//                 <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
//                     <div className="space-y-2">
//                         <Text className="text-sm font-medium text-tremor-content">
//                             Snapshot Date
//                         </Text>
//                         <DatePicker
//                             enableYearNavigation
//                             value={snapshotDate}
//                             onValueChange={(v) => setSnapshotDate(v as Date)}
//                             className="w-full"
//                         />
//                     </div>
//
//                     <div className="space-y-2">
//                         <Text className="text-sm font-medium text-tremor-content">
//                             Sell Rate (NGN)
//                         </Text>
//                         <TextInput
//                             type="number"
//                             inputMode="decimal"
//                             placeholder="e.g. 1600"
//                             value={sellRate}
//                             onChange={(e) => setSellRate(e.target.value)}
//                             className="w-full"
//                         />
//                     </div>
//                 </div>
//
//                 {/* Actions */}
//                 <div className="mt-2 flex justify-end gap-2">
//                     <Button variant="secondary" onClick={() => onClose(false)}>
//                         Cancel
//                     </Button>
//                     <Button onClick={onConfirm}>Confirm</Button>
//                 </div>
//             </DialogPanel>
//         </Dialog>
//     );
// }
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\components\ContentPlaceholder.tsx
// export function ContentPlaceholder() {
//     return (
//         <div className="relative h-full overflow-hidden rounded bg-gray-50 dark:bg-dark-tremor-background-subtle">
//             <svg
//                 className="absolute inset-0 h-full w-full stroke-gray-200 dark:stroke-gray-700"
//                 fill="none"
//             >
//                 <defs>
//                     <pattern
//                         id="pattern-1"
//                         x="0"
//                         y="0"
//                         width="10"
//                         height="10"
//                         patternUnits="userSpaceOnUse"
//                     >
//                         <path d="M-3 13 15-5M-5 5l18-18M-1 21 17 3"></path>
//                     </pattern>
//                 </defs>
//                 <rect
//                     stroke="none"
//                     fill="url(#pattern-1)"
//                     width="100%"
//                     height="100%"
//                 ></rect>
//             </svg>
//         </div>
//     );
// }
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\components\KpiCard.tsx
// import { formatCompactNumber } from '@/lib/format';
// import { kpiCardsData, PortfolioField } from '@/lib/mockData';
// import { cx } from '@/lib/utils';
// import {
//     Card,
//     CategoryBar,
//     Legend,
//     Metric,
//     ProgressBar,
//     SparkAreaChart,
//     Text,
// } from '@tremor/react';
//
// export default function KpiCard({ field }: { field: PortfolioField }) {
//     const item = kpiCardsData[field];
//
//     const isTransactions = field === 'Transactions';
//
//     return (
//         <Card className="overflow-hidden">
//             {/* Row 1: Title */}
//             <Text className="text-[0.9rem] font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
//                 {item.name}
//             </Text>
//
//             {/* Row 2: Metric + SparkChart + Delta */}
//             <div className="mt-1 flex items-baseline justify-between overflow-hidden">
//                 <Metric className="flex-shrink-0 truncate text-[1.5rem] font-bold text-tremor-content-strong sm:text-[1.75rem] dark:text-dark-tremor-content-strong">
//                     {item.value}
//                 </Metric>
//
//                 <div className="flex min-w-0 flex-1 items-center justify-end space-x-2">
//                     <SparkAreaChart
//                         data={item.chartData}
//                         index="date"
//                         categories={['value']}
//                         showGradient
//                         colors={
//                             item.changeType === 'positive'
//                                 ? ['emerald']
//                                 : ['rose']
//                         }
//                         className="h-8 w-20 flex-shrink sm:h-10 sm:w-32"
//                     />
//                     <div
//                         className={cx(
//                             'flex items-center space-x-1 text-[0.85rem] font-semibold',
//                             item.changeType === 'positive'
//                                 ? 'text-emerald-600 dark:text-emerald-500'
//                                 : 'text-rose-500 dark:text-rose-400',
//                         )}
//                     >
//                         <span>
//                             {formatCompactNumber(Math.abs(item.change))}
//                         </span>
//                         <span>({item.percentageChange})</span>
//                     </div>
//                 </div>
//             </div>
//
//             {/* Conditional layout below */}
//             {isTransactions ? (
//                 <>
//                     {/* CategoryBar + Legend layout (Transactions) */}
//                     <CategoryBar
//                         values={item.values || []}
//                         // @ts-ignore
//                         colors={item.colors || []}
//                         showLabels={false}
//                         className="mt-5"
//                     />
//                     <Legend
//                         categories={item.categories || []}
//                         colors={item.colors || []}
//                         className="mt-4"
//                     />
//                 </>
//             ) : (
//                 <>
//                     {/* Progress breakdown layout (Balance / Change) */}
//                     <div className="mt-4 space-y-3">
//                         {item.breakdown?.map((row) => (
//                             <dd
//                                 key={row.name}
//                                 className="lg:flex lg:items-center lg:space-x-3"
//                             >
//                                 <p className="flex shrink-0 items-center justify-between space-x-2 text-tremor-default lg:w-5/12">
//                                     <span className="truncate text-tremor-content dark:text-dark-tremor-content">
//                                         {row.name}
//                                     </span>
//                                     <span className="whitespace-nowrap font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
//                                         {formatCompactNumber(row.value)}{' '}
//                                         <span className="font-normal">
//                                             ({row.percentageValue}%)
//                                         </span>
//                                     </span>
//                                 </p>
//                                 <ProgressBar
//                                     value={row.percentageValue}
//                                     color={
//                                         item.changeType === 'positive'
//                                             ? 'emerald'
//                                             : 'rose'
//                                     }
//                                     className="mt-2 lg:mt-0"
//                                 />
//                             </dd>
//                         ))}
//                     </div>
//                 </>
//             )}
//         </Card>
//     );
// }
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\components\CompositionChartSection.tsx
// import { formatNGN } from '@/lib/format';
// import {
//     defaultPortfolioField,
//     defaultSeriesGranularity,
//     monthlySeriesLast12,
//     type PortfolioField,
//     weeklySeriesLast12,
// } from '@/lib/mockData';
// import { Card, LineChart, Select, SelectItem, Text } from '@tremor/react';
// import React from 'react';
//
// function computeStats(field: PortfolioField, granularity: 'months' | 'weeks') {
//     const series =
//         granularity === 'months' ? monthlySeriesLast12 : weeklySeriesLast12;
//     const values = series.map((p) => p[field]);
//     const sum = values.reduce((a, b) => a + b, 0);
//     const avg = values.length ? sum / values.length : 0;
//     const min = values.length ? Math.min(...values) : 0;
//     const max = values.length ? Math.max(...values) : 0;
//     return { avg, min, max };
// }
//
// function PortfolioStats({
//     field,
//     granularity,
// }: {
//     field: PortfolioField;
//     granularity: 'months' | 'weeks';
// }) {
//     const { avg, min, max } = computeStats(field, granularity);
//     return (
//         <div className="flex flex-wrap items-center gap-4">
//             <Text className="text-tremor-default">
//                 Avg {formatNGN(avg)} · Low {formatNGN(min)} · High{' '}
//                 {formatNGN(max)}
//             </Text>
//         </div>
//     );
// }
//
// export default function CompositionChartSection() {
//     const [granularity, setGranularity] = React.useState<'months' | 'weeks'>(
//         defaultSeriesGranularity,
//     );
//     const [portfolioField, setPortfolioField] = React.useState<PortfolioField>(
//         defaultPortfolioField,
//     );
//
//     const data =
//         granularity === 'months' ? monthlySeriesLast12 : weeklySeriesLast12;
//     const categories: Array<PortfolioField> = [
//         'Transactions',
//         'Change',
//         'Balance',
//     ];
//
//     return (
//         <Card className="mt-4 p-4">
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                 <Text className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
//                     PortFolio : {portfolioField}
//                 </Text>
//                 <div className="flex gap-2">
//                     <Select
//                         className="w-40 [&>button]:rounded-tremor-small"
//                         enableClear={false}
//                         defaultValue={granularity}
//                         onValueChange={(v) =>
//                             setGranularity(
//                                 (v as 'months' | 'weeks') ?? 'months',
//                             )
//                         }
//                     >
//                         <SelectItem value="months">Last 12 months</SelectItem>
//                         <SelectItem value="weeks">Last 12 weeks</SelectItem>
//                     </Select>
//                     <Select
//                         className="w-44 [&>button]:rounded-tremor-small"
//                         enableClear={false}
//                         defaultValue={portfolioField}
//                         onValueChange={(v) =>
//                             setPortfolioField((v as PortfolioField) ?? 'Change')
//                         }
//                     >
//                         <SelectItem value="Change">
//                             Portfolio: Change
//                         </SelectItem>
//                         <SelectItem value="Transactions">
//                             Portfolio: Transactions
//                         </SelectItem>
//                         <SelectItem value="Balance">
//                             Portfolio: Balance
//                         </SelectItem>
//                     </Select>
//                 </div>
//             </div>
//
//             <div className="mt-3">
//                 <PortfolioStats
//                     field={portfolioField}
//                     granularity={granularity}
//                 />
//             </div>
//
//             <LineChart
//                 className="mt-6 h-96"
//                 data={data}
//                 index="period"
//                 categories={categories}
//                 valueFormatter={formatNGN}
//                 yAxisWidth={68}
//             />
//         </Card>
//     );
// }
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\components\SnapshotSummaryTable.tsx
// 'use client';
//
// import { formatNGN, formatUSD } from '@/lib/format';
// import { snapshotSummaries } from '@/lib/mockData';
// import {
//     Button,
//     Card,
//     Table,
//     TableBody,
//     TableCell,
//     TableHead,
//     TableHeaderCell,
//     TableRow,
// } from '@tremor/react';
// import { useState } from 'react';
// import SnapshotDialog from './SnapshotDialog';
//
// export default function SnapshotSummaryTable() {
//     const [open, setOpen] = useState(false);
//     const [sellRate, setSellRate] = useState('');
//     const [snapshotDate, setSnapshotDate] = useState<Date>(new Date());
//
//     const handleConfirm = () => {
//         // Placeholder for POST /api/fireshots/snapshots/run
//         console.log('Snapshot triggered', {
//             date: snapshotDate,
//             sell_rate: sellRate,
//         });
//         setOpen(false);
//     };
//
//     return (
//         <Card className="p-6">
//             {/* Header */}
//             <div className="sm:flex sm:items-center sm:justify-between sm:space-x-10">
//                 <div>
//                     <h3 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
//                         Daily Snapshots
//                     </h3>
//                     <p className="mt-1 text-tremor-default leading-6 text-tremor-content dark:text-dark-tremor-content">
//                         Overview of recent captured daily portfolio summaries.
//                     </p>
//                 </div>
//                 <Button
//                     onClick={() => setOpen(true)}
//                     className="mt-4 w-full whitespace-nowrap rounded-tremor-small bg-tremor-brand px-4 py-2.5 text-tremor-default font-medium text-tremor-brand-inverted shadow-tremor-input hover:bg-tremor-brand-emphasis sm:mt-0 sm:w-fit dark:bg-dark-tremor-brand dark:text-dark-tremor-brand-inverted dark:shadow-dark-tremor-input dark:hover:bg-dark-tremor-brand-emphasis"
//                 >
//                     Take Snapshot
//                 </Button>
//             </div>
//
//             {/* Table */}
//             <Table className="mt-8">
//                 <TableHead>
//                     <TableRow className="border-b border-tremor-border dark:border-dark-tremor-border">
//                         <TableHeaderCell>Date</TableHeaderCell>
//                         <TableHeaderCell className="text-right">
//                             USD
//                         </TableHeaderCell>
//                         <TableHeaderCell className="text-right">
//                             NGN
//                         </TableHeaderCell>
//                         <TableHeaderCell className="text-right">
//                             Unified (NGN)
//                         </TableHeaderCell>
//                         <TableHeaderCell className="text-right">
//                             Transactions
//                         </TableHeaderCell>
//                         <TableHeaderCell className="text-right">
//                             Change
//                         </TableHeaderCell>
//                     </TableRow>
//                 </TableHead>
//                 <TableBody>
//                     {snapshotSummaries.map((s) => (
//                         <TableRow key={s.date}>
//                             <TableCell className="font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong">
//                                 {s.date}
//                             </TableCell>
//                             <TableCell className="text-right">
//                                 {formatUSD(s.usd)}
//                             </TableCell>
//                             <TableCell className="text-right">
//                                 {formatNGN(s.ngn)}
//                             </TableCell>
//                             <TableCell className="text-right">
//                                 {formatNGN(s.unifiedNGN)}
//                             </TableCell>
//                             <TableCell className="text-right">
//                                 {formatNGN(s.transactions)}
//                             </TableCell>
//                             <TableCell
//                                 className={`text-right ${
//                                     s.change >= 0
//                                         ? 'text-emerald-700 dark:text-emerald-500'
//                                         : 'text-red-700 dark:text-red-500'
//                                 }`}
//                             >
//                                 {formatNGN(s.change)}
//                             </TableCell>
//                         </TableRow>
//                     ))}
//                 </TableBody>
//             </Table>
//
//             {/* Dialog (separate component) */}
//             <SnapshotDialog
//                 open={open}
//                 onClose={setOpen}
//                 snapshotDate={snapshotDate}
//                 setSnapshotDate={setSnapshotDate}
//                 sellRate={sellRate}
//                 setSellRate={setSellRate}
//                 onConfirm={handleConfirm}
//             />
//         </Card>
//     );
// }
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\components\LayoutShell.tsx
// import { Link, usePage } from '@inertiajs/react';
// import React from 'react';
// import { cx } from '@/lib/utils';
//
// export default function LayoutShell({
//                                         children,
//                                     }: {
//     children: React.ReactNode;
// }) {
//     const { url } = usePage();
//
//     const navigation = [
//         { name: 'Dashboard', href: '/dashboard' },
//         { name: 'Accounts', href: '/accounts' },
//         { name: 'Settings', href: '/settings' },
//     ];
//
//     const Logo = (props: React.SVGProps<SVGSVGElement>) => (
//         <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
//             <path d="M10.9999 2.04938L11 5.07088C7.6077 5.55612 5 8.47352 5 12C5 15.866 8.13401 19 12 19C13.5723 19 15.0236 18.4816 16.1922 17.6064L18.3289 19.7428C16.605 21.1536 14.4014 22 12 22C6.47715 22 2 17.5228 2 12C2 6.81468 5.94662 2.55115 10.9999 2.04938ZM21.9506 13.0001C21.7509 15.0111 20.9555 16.8468 19.7433 18.3283L17.6064 16.1922C18.2926 15.2759 18.7595 14.1859 18.9291 13L21.9506 13.0001ZM13.0011 2.04948C17.725 2.51902 21.4815 6.27589 21.9506 10.9999L18.9291 10.9998C18.4905 7.93452 16.0661 5.50992 13.001 5.07103L13.0011 2.04948Z" />
//         </svg>
//     );
//
//     return (
//         <div className="bg-tremor-background-muted dark:bg-dark-tremor-background-muted min-h-screen flex justify-center py-6 sm:py-8 lg:py-10 overflow-hidden no-scrollbar">
//             {/* Card effect only at xl and above */}
//             <div
//                 className="
//                     w-full
//                     max-w-7xl
//                     bg-white dark:bg-dark-tremor-background
//                     xl:rounded-2xl xl:shadow-lg xl:border xl:border-tremor-border dark:xl:border-dark-tremor-border
//                     xl:overflow-hidden
//                 "
//             >
//                 {/* NAV */}
//                 <div className="border-b border-tremor-border dark:border-dark-tremor-border bg-white dark:bg-dark-tremor-background">
//                     <div className="px-4 sm:px-6 lg:px-8">
//                         <div className="flex h-16 sm:space-x-7">
//                             <div className="hidden shrink-0 sm:flex sm:items-center">
//                                 <Link href="/dashboard" className="p-1.5">
//                                     <Logo
//                                         className="size-5 shrink-0 text-tremor-content-strong dark:text-dark-tremor-content-strong"
//                                         aria-hidden={true}
//                                     />
//                                 </Link>
//                             </div>
//
//                             <nav
//                                 className="-mb-px flex space-x-6"
//                                 aria-label="Tabs"
//                             >
//                                 {navigation.map((item) => (
//                                     <Link
//                                         key={item.name}
//                                         href={item.href}
//                                         className={cx(
//                                             url.startsWith(item.href)
//                                                 ? 'border-tremor-brand text-tremor-brand'
//                                                 : 'border-transparent text-tremor-content-emphasis hover:border-tremor-content-subtle hover:text-tremor-content-strong',
//                                             'inline-flex items-center whitespace-nowrap border-b-2 px-2 text-tremor-default font-medium',
//                                         )}
//                                     >
//                                         {item.name}
//                                     </Link>
//                                 ))}
//                             </nav>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* MAIN CONTENT */}
//                 <main className="p-4 sm:p-6 lg:p-8">{children}</main>
//             </div>
//         </div>
//     );
// }
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\lib\api.ts
// import { create, index, update } from '@/routes/shots/accounts';
// import { callApi } from './apiFactory';
//
// export async function fetchAccounts(): Promise<FetchAccountsResponse> {
//     console.log(index.get(), 'Fetch Attempt');
//     return callApi<undefined, FetchAccountsResponse>(index.get());
// }
//
// export async function updateAccount(
//     accountId: number,
//     payload: Record<string, any>,
// ): Promise<SaveAccountResponse> {
//     const routeDef = update.post({ account: accountId });
//     return callApi<typeof payload, SaveAccountResponse>(routeDef, payload);
// }
//
// export async function createAccount(
//     payload: Record<string, any>,
// ): Promise<SaveAccountResponse> {
//     return callApi<typeof payload, SaveAccountResponse>(create.post(), payload);
// }
//
//
// // Path: C:\Users\USER\Herd\fireshot\resources\js\pages\dashboard.tsx
// import { ContentPlaceholder } from '@/components/ContentPlaceholder';
// import { PortfolioField } from '@/lib/mockData';
// import { Card, Grid, Select, SelectItem } from '@tremor/react';
// import CompositionChartSection from '../components/CompositionChartSection';
// import KpiCard from '../components/KpiCard';
// import LayoutShell from '../components/LayoutShell';
// import SnapshotSummaryTable from '../components/SnapshotSummaryTable';
//
// export default function Dashboard() {
//     return (
//         <LayoutShell>
//             {/* Content header (page-specific filters stay here) */}
//             <div className="p-4 sm:p-6 lg:p-8">
//                 <header>
//                     <div className="sm:flex sm:items-center sm:justify-between">
//                         <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
//                             Overview
//                         </h3>
//                         <div className="mt-4 items-center sm:mt-0 sm:flex sm:space-x-2">
//                             <Select
//                                 className="w-full sm:w-fit [&>button]:rounded-tremor-small"
//                                 enableClear={false}
//                                 defaultValue="12m"
//                             >
//                                 <SelectItem value="today">Today</SelectItem>
//                                 <SelectItem value="7d">Last 7 days</SelectItem>
//                                 <SelectItem value="4w">Last 4 weeks</SelectItem>
//                                 <SelectItem value="12m">
//                                     Last 12 months
//                                 </SelectItem>
//                             </Select>
//                         </div>
//                     </div>
//                 </header>
//
//                 {/* Main grid */}
//                 <main className="space-y-20">
//                     <Grid numItemsMd={2} numItemsLg={3} className="mt-6 gap-10">
//                         {(
//                             [
//                                 'Balance',
//                                 'Change',
//                                 'Transactions',
//                             ] as PortfolioField[]
//                         ).map((field) => (
//                             <KpiCard key={field} field={field} />
//                         ))}
//                     </Grid>
//
//                     {/* Snapshot table */}
//                     <SnapshotSummaryTable />
//
//                     {/* Composition chart + portfolio */}
//                     <CompositionChartSection />
//
//                     {/* Keep placeholder for rhythm (optional) */}
//                     <Card className="mt-4 h-40 rounded-tremor-small p-2">
//                         <ContentPlaceholder />
//                     </Card>
//                 </main>
//             </div>
//         </LayoutShell>
//     );
// }
