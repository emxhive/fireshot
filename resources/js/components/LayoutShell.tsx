import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import { Logo } from './Logo';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
    const { url } = usePage();

    return (
        <div className="no-scrollbar flex min-h-screen justify-center overflow-hidden bg-tremor-background-muted py-6 sm:py-8 lg:py-10 dark:bg-dark-tremor-background-muted">
            {/* Card effect only at xl and above */}
            <div className="w-full max-w-7xl bg-white xl:overflow-hidden xl:rounded-2xl xl:border xl:border-tremor-border xl:shadow-lg dark:bg-dark-tremor-background dark:xl:border-dark-tremor-border">
                {/* NAV */}
                <div className="border-b border-tremor-border bg-white dark:border-dark-tremor-border dark:bg-dark-tremor-background">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 sm:space-x-7">
                            <div className="hidden shrink-0 sm:flex sm:items-center">
                                <Link preserveScroll preserveState href={'/dashboard'} className="p-1.5">
                                    <Logo className="size-5 shrink-0 text-tremor-content-strong dark:text-dark-tremor-content-strong" aria-hidden={true} />
                                </Link>
                            </div>

                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                {navigation.map((item) => (
                                    <Link
                                        preserveState
                                        preserveScroll
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            url.startsWith(item.href)
                                                ? 'border-tremor-brand text-tremor-brand'
                                                : 'border-transparent text-tremor-content-emphasis hover:border-tremor-content-subtle hover:text-tremor-content-strong',
                                            'inline-flex items-center whitespace-nowrap border-b-2 px-2 text-tremor-default font-medium',
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
            <Toaster />
        </div>
    );
}

const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Accounts', href: '/accounts' },
    { name: 'Settings', href: '/settings' },
];
