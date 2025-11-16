import { useQuery } from '@tanstack/react-query';
import type { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';

import type { ApiError, ApiResponse } from '@/lib/apiClient';

export type UseApiQueryOptions<TData, TSelected = TData> = Omit<
    UseQueryOptions<TData, ApiError, TSelected>,
    'queryKey' | 'queryFn'
> & {
    key: QueryKey;
    apiFn: () => Promise<ApiResponse<TData>>;
};

export function useApiQuery<TData, TSelected = TData>(options: UseApiQueryOptions<TData, TSelected>) {
    const { key, apiFn, ...rest } = options;

    const query = useQuery<TData, ApiError, TSelected>({
        queryKey: key,
        queryFn: async () => {
            const result = await apiFn();
            if (!result.ok) {
                throw result;
            }
            return result.data;
        },
        ...rest,
    });

    return {
        ...query,
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,
    } as UseQueryResult<TSelected, ApiError>;
}
