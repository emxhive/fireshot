// apiFactory.ts

import type { RouteDefinition } from '@/wayfinder';
import api from './axiosClient';

export async function callApi<P, R>(
    route: RouteDefinition<'get' | 'post'>,
    payload?: P,
): Promise<R | APIErrorResponse> {
    try {
        const method = route.method;
        let response;

        if (method === 'get') {
            response = await api.get<R>(route.url);
            console.log(response, 'response');
        } else {
            response = await api.post<R>(route.url, payload);
        }

        return response.data as R;
    } catch (error: any) {
        console.error(
            `${route.method.toUpperCase()} ${route.url} failed:`,
            error.response?.data || error.message,
        );
        return {
            status: 'error',
            message:
                error.response?.data?.message ||
                error.message ||
                'API call failed',
        };
    }
}
