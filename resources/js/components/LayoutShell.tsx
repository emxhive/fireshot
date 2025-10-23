import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import { cx } from '@/lib/utils';

export default function LayoutShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const { url } = usePage();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Accounts', href: '/accounts' },
        { name: 'Settings', href: '/settings' },
    ];

    const Logo = (props: React.SVGProps<SVGSVGElement>) => (
        <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path d="M10.9999 2.04938L11 5.07088C7.6077 5.55612 5 8.47352 5 12C5 15.866 8.13401 19 12 19C13.5723 19 15.0236 18.4816 16.1922 17.6064L18.3289 19.7428C16.605 21.1536 14.4014 22 12 22C6.47715 22 2 17.5228 2 12C2 6.81468 5.94662 2.55115 10.9999 2.04938ZM21.9506 13.0001C21.7509 15.0111 20.9555 16.8468 19.7433 18.3283L17.6064 16.1922C18.2926 15.2759 18.7595 14.1859 18.9291 13L21.9506 13.0001ZM13.0011 2.04948C17.725 2.51902 21.4815 6.27589 21.9506 10.9999L18.9291 10.9998C18.4905 7.93452 16.0661 5.50992 13.001 5.07103L13.0011 2.04948Z" />
        </svg>
    );

    return (
        <div className="no-scrollbar flex min-h-screen justify-center overflow-hidden bg-tremor-background-muted py-6 sm:py-8 lg:py-10 dark:bg-dark-tremor-background-muted">
            {/* Card effect only at xl and above */}
            <div className="w-full max-w-7xl bg-white xl:overflow-hidden xl:rounded-2xl xl:border xl:border-tremor-border xl:shadow-lg dark:bg-dark-tremor-background dark:xl:border-dark-tremor-border">
                {/* NAV */}
                <div className="border-b border-tremor-border bg-white dark:border-dark-tremor-border dark:bg-dark-tremor-background">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 sm:space-x-7">
                            <div className="hidden shrink-0 sm:flex sm:items-center">
                                <Link
                                    href="/dashboard"
                                    className="p-1.5"
                                    preserveScroll
                                    preserveState
                                >
                                    <Logo
                                        className="size-5 shrink-0 text-tremor-content-strong dark:text-dark-tremor-content-strong"
                                        aria-hidden={true}
                                    />
                                </Link>
                            </div>

                            <nav
                                className="-mb-px flex space-x-6"
                                aria-label="Tabs"
                            >
                                {navigation.map((item) => (
                                    <Link
                                        preserveScroll
                                        preserveState
                                        key={item.name}
                                        href={item.href}
                                        className={cx(
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
        </div>
    );
}
