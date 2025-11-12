import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    },
});

export const ReactQueryProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

export { queryClient };
