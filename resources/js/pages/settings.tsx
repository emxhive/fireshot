import LayoutShell from '@/components/LayoutShell';
import useToast from '@/hooks/useToast';
import { runTransactionRefresh } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';
import { Button, Callout, Card, Text, Title } from '@tremor/react';

export default function Settings() {
    const { toast, show } = useToast();

    const mutation = useMutation(runTransactionRefresh);

    const cacheBlocks = [
        {
            title: 'Transactions Cache',
            desc: 'Clears cached Firefly KW transaction data. Use if backend transactions were recently updated.',
            scope: 'transactions',
            hook: transactions,
        },
        { title: 'Records Cache', desc: 'Resets high/low record tracker used for KPI cards.', scope: 'records', hook: records },
    ];

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <header>
                <Title className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">Settings</Title>
                <Text className="mt-1 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                    Manage Fireshots maintenance and caching layers safely.
                </Text>
            </header>

            {cacheBlocks.map(({ title, desc, hook, scope }) => (
                <Card key={scope} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Text className="text-tremor-default text-tremor-content-strong dark:text-dark-tremor-content-strong">{title}</Text>
                        <Text className="text-tremor-default text-tremor-content-subtle dark:text-dark-tremor-content-subtle">{desc}</Text>
                    </div>
                    <Button
                        onClick={() =>
                            hook.mutate(undefined, {
                                onSuccess: (res: any) => show('success', res?.message ?? `Cleared ${scope} cache.`),
                                onError: (err: any) => show('error', err?.message ?? `Failed to clear ${scope} cache.`),
                            })
                        }
                        disabled={hook.isPending}
                        className="w-full sm:w-auto"
                    >
                        {hook.isPending ? 'Clearing…' : 'Clear Cache'}
                    </Button>
                </Card>
            ))}

            {toast && (
                <Callout title={toast.kind === 'success' ? 'Done' : 'Error'} color={toast.kind === 'success' ? 'teal' : 'rose'}>
                    {toast.text}
                </Callout>
            )}
        </div>
    );
}

// Persistent layout
Settings.layout = (page: any) => <LayoutShell children={page} />;
