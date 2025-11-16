import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

import { useInvalidateData, type QueryKeyName } from '@/hooks/useInvalidateData';
import type { ApiError, ApiResponse } from '@/lib/apiClient';

export type UseApiMutationOptions<TData, TVariables = void, TContext = unknown> = Omit<
    UseMutationOptions<TData, ApiError, TVariables, TContext>,
    'mutationFn' | 'onSuccess' | 'onError'
> & {
    apiFn: (variables: TVariables) => Promise<ApiResponse<TData>>;
    invalidate?: QueryKeyName[];
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void | Promise<void>;
    onError?: (error: ApiError, variables: TVariables, context: TContext | undefined) => void | Promise<void>;
};

export function useApiMutation<TData, TVariables = void, TContext = unknown>(
    options: UseApiMutationOptions<TData, TVariables, TContext>,
) {
    const { apiFn, invalidate, onSuccess, onError, ...rest } = options;
    const invalidateData = useInvalidateData();

    const mutation = useMutation<TData, ApiError, TVariables, TContext>({
        mutationFn: async (variables) => {
            const result = await apiFn(variables);
            if (!result.ok) {
                throw result;
            }
            return result.data;
        },
        onSuccess: async (data, variables, context) => {
            if (invalidate && invalidate.length > 0) {
                await invalidateData(...invalidate);
            }
            if (onSuccess) {
                await onSuccess(data, variables, context);
            }
        },
        onError: async (error, variables, context) => {
            if (onError) {
                await onError(error, variables, context);
            }
        },
        ...rest,
    });

    return mutation as UseMutationResult<TData, ApiError, TVariables, TContext>;
}
